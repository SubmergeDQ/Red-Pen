const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { analyzeContract, buildExportHTML, RULE_LIBRARY, SAMPLES } = require('../engine.js');

function byRule(analysis, ruleId) {
  return analysis.items.filter(item => item.ruleId === ruleId);
}

function sample(id) {
  const item = SAMPLES.find(s => s.id === id);
  assert.ok(item, `missing sample: ${id}`);
  return item;
}

const baseContract = `劳动合同书

甲方（用人单位）：测试公司
乙方（劳动者）：测试学生

第一条 合同期限
本合同期限自 2026 年 1 月 1 日起至 2028 年 12 月 31 日止。

第二条 劳动报酬
乙方转正后工资为每月 8000 元。

第三条 社会保险
甲方依法为乙方缴纳社会保险。`;

test('劳动合同样本仍能命中试用期、违约金、押金等核心风险', () => {
  const analysis = analyzeContract(sample('labor').text);
  assert.equal(analysis.docKey, 'labor');
  assert.ok(analysis.counts.red >= 4);
  for (const ruleId of ['R1', 'R2', 'R4', 'R11']) {
    assert.ok(byRule(analysis, ruleId).some(item => item.verdict === 'red'), `${ruleId} should be red`);
  }
  assert.ok(byRule(analysis, 'R6').some(item => item.verdict === 'gray'));
  assert.ok(analysis.oneLiner.includes('红线'));
});

test('R2 具体金额优先于百分比下限，不被 80% 字样判绿', () => {
  const text = baseContract.replace(
    '第二条 劳动报酬\n乙方转正后工资为每月 8000 元。',
    '第二条 试用期与劳动报酬\n试用期 3 个月，试用期工资为每月 3000 元，不低于转正工资的 80%；转正后工资为每月 8000 元。'
  );
  const analysis = analyzeContract(text);
  const r2 = byRule(analysis, 'R2');
  assert.equal(r2.length, 1);
  assert.equal(r2[0].verdict, 'red');
  assert.ok(r2[0].loss > 0);
  assert.ok(r2[0].consequence.includes('3,000'));
});

test('R4 排除逻辑下沉到句子级，不因同一条出现服务期而漏掉违法离职违约金', () => {
  const text = baseContract.replace(
    '第一条 合同期限\n本合同期限自 2026 年 1 月 1 日起至 2028 年 12 月 31 日止。',
    '第一条 服务期与违约金\n甲方为乙方提供专项培训并约定服务期，乙方违反服务期的，应支付违约金 10000 元。乙方提前离职的，应向甲方支付违约金 20000 元。'
  );
  const analysis = analyzeContract(text);
  const r4 = byRule(analysis, 'R4');
  assert.equal(r4.length, 1);
  assert.equal(r4[0].verdict, 'red');
  assert.ok(r4[0].consequence.includes('20,000'));
});

test('R12 只处理劳动者一侧的通知义务，不把甲方的 60 日通知误报为离职通知期', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 合同解除\n甲方提前 60 日书面通知乙方，可以解除本合同。\n\n第四条 乙方解除\n乙方解除劳动合同，应提前 60 日书面通知甲方。\n\n第五条 社会保险\n甲方依法为乙方缴纳社会保险。'
  );
  const analysis = analyzeContract(text);
  const r12 = byRule(analysis, 'R12');
  assert.equal(r12.length, 1);
  assert.ok(r12[0].range.raw.includes('乙方'));
  assert.ok(!r12[0].range.raw.includes('甲方提前'));
});

test('合法服务期和 30 日离职通知不产生 R4/R12 误报', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 服务期\n甲方为乙方提供专项培训，培训费共计 10000 元，双方约定服务期 2 年；乙方违反服务期约定的，应支付违约金 10000 元。\n\n第四条 合同解除\n乙方提前 30 日书面通知甲方，可以解除劳动合同。\n\n第五条 社会保险\n甲方依法为乙方缴纳社会保险。'
  );
  const analysis = analyzeContract(text);
  assert.equal(byRule(analysis, 'R4').length, 0);
  assert.equal(byRule(analysis, 'R12').length, 0);
});

test('三方协议样本运行三方规则，并追加文本中出现的试用期包', () => {
  const analysis = analyzeContract(sample('three-party').text);
  assert.equal(analysis.docKey, 'three-party');
  assert.equal(analysis.detectedDocKey, 'three-party');
  assert.ok(analysis.packs.includes('three-party'));
  assert.ok(analysis.packs.includes('probation'));
  assert.ok(!analysis.packs.includes('labor'));
  const r8 = byRule(analysis, 'R8');
  assert.equal(r8.length, 2);
  assert.ok(r8.every(item => item.verdict === 'yellow'));
  assert.deepEqual(r8.map(item => item.loss).sort((a, b) => a - b), [5000, 8000]);
  assert.equal(byRule(analysis, 'R4').length, 0);
});

test('手动选择文档类型可覆盖自动识别，并保留内容触发的其他规则包', () => {
  const analysis = analyzeContract(sample('labor').text, { docType: 'intern' });
  assert.equal(analysis.docKey, 'intern');
  assert.equal(analysis.forced, true);
  assert.equal(analysis.detectedDocKey, 'labor');
  assert.ok(analysis.packs.includes('intern'));
  assert.ok(analysis.packs.includes('labor'));
  assert.ok(analysis.packs.includes('probation'));
  assert.ok(analysis.extraPackLabels.includes('劳动合同'));
  assert.ok(byRule(analysis, 'R10').length > 0);
});

test('劳动合同夹带培训分期时追加培训贷规则包', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 培训与付款\n甲方为乙方提供入职培训，培训费共计 20000 元；乙方通过“优学分期”办理教育分期，分 12 期，每期还款 1800 元。\n\n第四条 社会保险\n甲方依法为乙方缴纳社会保险。'
  );
  const analysis = analyzeContract(text);
  assert.equal(analysis.docKey, 'labor');
  assert.ok(analysis.packs.includes('loan'));
  assert.ok(analysis.extraPackLabels.includes('培训贷'));
  assert.ok(byRule(analysis, 'R9').length > 0);
});

test('纯实习协议里的试用期不直接套用劳动合同试用期上限', () => {
  const text = `实习协议
甲方（实习单位）：测试公司
乙方（实习学生）：测试学生
第一条 实习期限
实习期自 2026 年 1 月 1 日起至 2026 年 6 月 30 日止，试用期 3 个月。
第二条 实习补贴
甲方每月支付实习补贴 2000 元。
第三条 安全
乙方应自行购买意外伤害保险，实习期间发生意外甲方不承担责任。`;
  const analysis = analyzeContract(text);
  assert.equal(analysis.docKey, 'intern');
  assert.ok(!analysis.packs.includes('probation'));
  assert.equal(byRule(analysis, 'R1').length, 0);
  assert.ok(byRule(analysis, 'R10').length > 0);
});

test('手动选择实习协议但正文没有试用期时，不显示试用期规则包', () => {
  const analysis = analyzeContract(baseContract, { docType: 'intern' });
  assert.equal(analysis.docKey, 'intern');
  assert.ok(analysis.packs.includes('intern'));
  assert.ok(analysis.packs.includes('labor'));
  assert.ok(!analysis.packs.includes('probation'));
});

test('实习协议同时出现劳动者与用人单位时，追加劳动与试用期规则', () => {
  const text = `实习协议
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 实习期限
实习期自 2026 年 1 月 1 日起至 2026 年 12 月 31 日止。
第二条 试用期与工资
试用期 6 个月，试用期工资为每月 2000 元，转正后工资为每月 8000 元。
第三条 社会保险
甲方依法为乙方缴纳社会保险。`;
  const analysis = analyzeContract(text);
  assert.equal(analysis.docKey, 'intern');
  assert.ok(analysis.packs.includes('labor'));
  assert.ok(analysis.packs.includes('probation'));
  assert.ok(byRule(analysis, 'R1').some(item => item.verdict === 'red'));
  assert.ok(byRule(analysis, 'R2').some(item => item.verdict === 'red'));
});

test('R1 识别续签再次约定试用期', () => {
  const text = baseContract.replace(
    '第一条 合同期限\n本合同期限自 2026 年 1 月 1 日起至 2028 年 12 月 31 日止。',
    '第一条 试用期\n试用期 3 个月。劳动合同续签时再次约定试用期 2 个月。'
  );
  const r1 = byRule(analyzeContract(text), 'R1');
  assert.ok(r1.some(item => item.verdict === 'red' && item.ruleName.includes('重复约定试用期')));
});

test('R2 识别试用期完全不发工资', () => {
  const text = baseContract.replace(
    '第二条 劳动报酬\n乙方转正后工资为每月 8000 元。',
    '第二条 试用期工资\n试用期 3 个月，试用期不发工资，转正后工资为每月 8000 元。'
  );
  const r2 = byRule(analyzeContract(text), 'R2');
  assert.ok(r2.some(item => item.verdict === 'red' && item.ruleName.includes('不支付工资')));
});

test('R3 识别考核不通过可随时辞退且无需说明理由', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 试用期解除\n试用期考核不通过或末位淘汰的，公司可随时辞退，无需说明理由。'
  );
  const r3 = byRule(analyzeContract(text), 'R3');
  assert.ok(r3.some(item => item.verdict === 'red' && item.ruleName.includes('不说明理由')));
});

test('R6 同时提示竞业补偿打包与范围过宽', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 竞业限制\n乙方离职后 2 年内不得在全国范围内从事同行业任何工作，竞业补偿已包含在工资中。'
  );
  const r6 = byRule(analyzeContract(text), 'R6');
  assert.ok(r6.some(item => item.verdict === 'gray' && item.ruleName.includes('补偿')));
  assert.ok(r6.some(item => item.verdict === 'yellow' && item.ruleName.includes('范围过宽')));
});

test('R7 识别提前放弃经济补偿或工伤待遇', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 补偿\n乙方自愿放弃经济补偿金和工伤保险待遇。'
  );
  const r7 = byRule(analyzeContract(text), 'R7');
  assert.ok(r7.some(item => item.verdict === 'red' && item.ruleName.includes('放弃法定补偿')));
});

test('R7 识别随时解除且不补偿，法定解除情形不误报', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 解除\n甲方可随时解除劳动合同，无需支付经济补偿。'
  );
  const r7 = byRule(analyzeContract(text), 'R7');
  assert.ok(r7.some(item => item.verdict === 'red' && item.ruleName.includes('随时解除')));
  assert.ok(r7.some(item => item.verdict === 'red' && item.ruleName.includes('经济补偿')));
  const fault = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 解除\n乙方严重违纪的，甲方可随时解除劳动合同，无需支付经济补偿。'
  ));
  assert.equal(byRule(fault, 'R7').length, 0);
});

test('R11 识别要求提供担保人', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 担保\n乙方入职时须提供一名本地担保人承担连带保证责任。'
  );
  const r11 = byRule(analyzeContract(text), 'R11');
  assert.ok(r11.some(item => item.verdict === 'red' && item.ruleName.includes('担保')));
});

test('R13 识别加班费打包、低基数与单休，并与 R14 去重', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 工时与加班\n公司实行单休，乙方加班费按基本工资计算，工资中已包含加班费。'
  );
  const analysis = analyzeContract(text);
  const r13 = byRule(analysis, 'R13');
  assert.ok(r13.some(item => item.verdict === 'red' && item.ruleName.includes('加班费被排除')));
  assert.ok(r13.some(item => item.verdict === 'yellow' && item.ruleName.includes('计算基数偏低')));
  assert.ok(r13.some(item => item.verdict === 'yellow' && item.ruleName.includes('工时安排')));
  assert.ok(!byRule(analysis, 'R14').some(item => item.quote.includes('加班费')));
});

test('R14 识别押工资与无依据扣基本工资', () => {
  const text = baseContract.replace(
    '第二条 劳动报酬\n乙方转正后工资为每月 8000 元。',
    '第二条 工资支付\n甲方每月押一个月工资，次次月发放；未完成业绩的，扣发当月基本工资。'
  );
  const r14 = byRule(analyzeContract(text), 'R14');
  assert.ok(r14.some(item => item.verdict === 'red' && item.ruleName.includes('押工资')));
  assert.ok(r14.some(item => item.verdict === 'red' && item.ruleName.includes('扣减基本工资')));
});

test('R14 识别押半个月工资与迟到罚款', () => {
  const text = baseContract.replace(
    '第二条 劳动报酬\n乙方转正后工资为每月 8000 元。',
    '第二条 工资\n甲方每月押半个月工资；迟到一次罚款 50 元。'
  );
  const r14 = byRule(analyzeContract(text), 'R14');
  assert.ok(r14.some(item => item.verdict === 'red' && item.ruleName.includes('押工资')));
  assert.ok(r14.some(item => item.verdict === 'yellow' && item.ruleName.includes('罚款')));
});

test('R14 识别离职后取消年终奖', () => {
  const text = baseContract.replace(
    '第二条 劳动报酬\n乙方转正后工资为每月 8000 元。',
    '第二条 奖金\n乙方离职的，当年度年终奖不予发放。'
  );
  const r14 = byRule(analyzeContract(text), 'R14');
  assert.ok(r14.some(item => item.verdict === 'yellow' && item.ruleName.includes('年终奖')));
});

test('R15 识别试用期满后才缴社保，合法社保条款不误报', () => {
  const bad = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 社会保险\n试用期满后甲方为乙方缴纳社会保险。'
  ));
  assert.ok(byRule(bad, 'R15').some(item => item.verdict === 'red' && item.ruleName.includes('用工之日起')));
  const good = analyzeContract(baseContract);
  assert.equal(byRule(good, 'R15').length, 0);
});

test('R16 识别年假作废，且不把女职工保护条款误报为限制婚育', () => {
  const bad = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 休假\n乙方年休假自动作废，未休完不支付补偿。'
  ));
  assert.ok(byRule(bad, 'R16').some(item => item.verdict === 'red' && item.ruleName.includes('年休假')));
  const good = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 女职工保护\n甲方不得因乙方怀孕、生育降低工资或辞退乙方。'
  ));
  assert.equal(byRule(good, 'R16').length, 0);
});

test('R17 识别过宽成果归属与永久保密', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 保密\n乙方在职期间及离职后所有成果归甲方所有，保密义务永久有效。'
  );
  const r17 = byRule(analyzeContract(text), 'R17');
  assert.ok(r17.some(item => item.verdict === 'gray' && item.ruleName.includes('成果归属')));
  assert.ok(r17.some(item => item.verdict === 'yellow' && item.ruleName.includes('保密期限')));
});

test('R18 识别离职审批与未交接扣工资，并避免与 R14 重复', () => {
  const text = baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 离职\n乙方辞职须经甲方批准；未办理交接的，甲方不予结算工资。'
  );
  const analysis = analyzeContract(text);
  const r18 = byRule(analysis, 'R18');
  assert.ok(r18.some(item => item.verdict === 'red' && item.ruleName.includes('公司批准')));
  assert.ok(r18.some(item => item.verdict === 'red' && item.ruleName.includes('扣工资')));
  assert.ok(!byRule(analysis, 'R14').some(item => item.quote.includes('不予结算')));
});

test('R19 识别试用期后签合同与只由公司保管，常规各执一份不误报', () => {
  const bad = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 合同签订\n试用期满后双方再签订劳动合同，合同由甲方保管。'
  ));
  assert.ok(byRule(bad, 'R19').some(item => item.verdict === 'red' && item.ruleName.includes('试用期后')));
  assert.ok(byRule(bad, 'R19').some(item => item.verdict === 'yellow' && item.ruleName.includes('合同文本')));
  const good = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 合同文本\n本合同一式两份，甲乙双方各执一份。'
  ));
  assert.equal(byRule(good, 'R19').length, 0);
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '合同文本'));
  const noContract = analyzeContract(baseContract.replace(
    '第三条 社会保险\n甲方依法为乙方缴纳社会保险。',
    '第三条 合同签订\n试用期暂不签订劳动合同，转正后再签。'
  ));
  const r19 = byRule(noContract, 'R19');
  assert.equal(r19.length, 1);
  assert.equal(r19[0].verdict, 'red');
});

test('R20 识别就业承诺、未就业仍还款与退费承诺', () => {
  const text = `培训服务协议
甲方（培训机构）：测试公司
乙方（学员）：测试学生

第一条 就业服务
甲方承诺包就业，保底月薪 6000 元。
第二条 付款
培训费 19800 元，乙方通过教育分期分 12 期还款，无论是否就业均须按月还款。
第三条 退费
未就业全额退费。`;
  const analysis = analyzeContract(text);
  assert.ok(analysis.packs.includes('loan'));
  const r20 = byRule(analysis, 'R20');
  assert.ok(r20.some(item => item.verdict === 'yellow' && item.ruleName.includes('就业')));
  assert.ok(r20.some(item => item.verdict === 'yellow' && item.ruleName.includes('未就业仍需还款')));
  assert.ok(r20.some(item => item.verdict === 'gray' && item.ruleName.includes('退费')));
});

test('R8 识别单位单方解约不承担违约责任', () => {
  const text = `三方协议
甲方（用人单位）：测试公司
乙方（毕业生）：测试学生

第一条 违约责任
乙方未按期报到的，应赔偿甲方 5000 元。
第二条 解约
甲方有权随时解除本协议，且不承担任何违约责任。`;
  const analysis = analyzeContract(text);
  assert.equal(analysis.docKey, 'three-party');
  const r8 = byRule(analysis, 'R8');
  assert.ok(r8.some(item => item.verdict === 'yellow' && item.ruleName.includes('单位单方解约')));
});

const fullContract = `劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 合同期限
本合同期限自2026年1月1日起至2028年12月31日止。
第二条 工作内容与地点
乙方担任运营专员，工作地点为杭州市西湖区。
第三条 工作时间
甲方实行标准工时制，每日工作8小时，每周工作40小时。
第四条 劳动报酬
乙方月工资8000元，每月10日发放。
第五条 社会保险
甲方依法为乙方缴纳社会保险。
第六条 劳动保护
甲方提供必要的劳动保护。`;

function withClause(extra) {
  return fullContract + '\n第七条 其他\n' + extra;
}

test('R21 识别必备条款缺失，齐全时不误报', () => {
  const bad = analyzeContract(`劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 其他
其他事项按公司制度执行。`, { scope: 'full' });
  assert.ok(byRule(bad, 'R21').some(item => item.verdict === 'red'));
  const good = analyzeContract(fullContract, { scope: 'full' });
  assert.ok(byRule(good, 'R21').some(item => item.verdict === 'green'));
});

test('R22 识别违法解除赔偿不足，合法标准不误报', () => {
  const bad = analyzeContract(withClause('甲方违法解除劳动合同的，只支付一个月工资作为赔偿。'));
  assert.ok(byRule(bad, 'R22').some(item => item.verdict === 'red' && item.ruleName.includes('违法解除')));
  const good = analyzeContract(withClause('经济补偿按乙方在本单位工作年限，每满一年支付一个月工资。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '经济补偿'));
});

test('R23 识别规避无固定期限，合法约定不误报', () => {
  const bad = analyzeContract(withClause('乙方连续订立二次固定期限劳动合同后，第三次仍签订一年期固定期限合同。'));
  assert.ok(byRule(bad, 'R23').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('乙方连续工作满十年并提出订立无固定期限合同的，甲方应订立无固定期限劳动合同。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '无固定期限'));
});

test('R24 识别特殊工时未审批且不付加班费，审批完整不误报', () => {
  const bad = analyzeContract(withClause('公司实行综合计算工时制，加班费按季度结算，超过部分不再支付。'));
  assert.ok(byRule(bad, 'R24').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('公司经人社局批准实行综合计算工时制，超过法定标准工时的部分按150%支付，法定节假日按300%支付。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '特殊工时'));
});

test('R25 识别产假低于98天，法定产假不误报', () => {
  const bad = analyzeContract(withClause('乙方产假为60天。'));
  assert.ok(byRule(bad, 'R25').some(item => item.verdict === 'yellow' && item.short.includes('60')));
  const good = analyzeContract(withClause('乙方产假98天，哺乳期内每天安排1小时哺乳时间。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '三期保护'));
});

test('R26 识别商业险替代工伤保险，依法参保不误报', () => {
  const bad = analyzeContract(withClause('公司为员工购买商业意外险，不再缴纳工伤保险。'));
  assert.ok(byRule(bad, 'R26').some(item => item.verdict === 'yellow' && item.ruleName.includes('商业险')));
  const good = analyzeContract(withClause('甲方依法为乙方缴纳工伤保险，事故伤害发生之日起30日内申请工伤认定。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '工伤保险'));
});

test('R27 识别过度收集个人信息，最小必要不误报', () => {
  const bad = analyzeContract(withClause('乙方入职必须提供全部家庭成员的收入和身份证号。'));
  assert.ok(byRule(bad, 'R27').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('甲方仅为办理入职和缴纳社保收集乙方身份证、学历信息；向第三方提供需另行取得单独同意。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '个人信息'));
});

test('R28 识别非全日制超时或按月结算，合规安排不误报', () => {
  const bad = analyzeContract(withClause('本合同为非全日制用工，乙方每天工作8小时，工资按月发放。'));
  assert.ok(byRule(bad, 'R28').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('本合同为非全日制用工，乙方平均每日工作不超过4小时，每周不超过24小时，报酬每15日结算一次。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '非全日制'));
});

test('R29 识别电子合同不提供文本，可靠签名与交付不误报', () => {
  const bad = analyzeContract(withClause('双方通过电子平台签署电子合同，合同文本由平台保管，乙方不得下载。'));
  assert.ok(byRule(bad, 'R29').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('双方同意以电子形式订立劳动合同，使用可靠电子签名；合同可下载、打印，双方各执一份。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '电子签署'));
});

test('R30 识别排除法定管辖，法定管辖不误报', () => {
  const bad = analyzeContract(withClause('双方争议只能向甲方所在地劳动争议仲裁委员会申请仲裁。'));
  assert.ok(byRule(bad, 'R30').some(item => item.verdict === 'red'));
  const good = analyzeContract(withClause('双方发生劳动争议，可向劳动合同履行地或用人单位所在地劳动争议仲裁委员会申请仲裁。'));
  assert.ok(good.items.some(item => item.verdict === 'green' && item.ruleName === '争议管辖'));
});

test('零命中只声明本次应用的规则，并列出未覆盖的规则包', () => {
  const analysis = analyzeContract('乙方在试用期内参加甲方安排的岗前培训。', { scope: 'excerpt' });
  assert.equal(analysis.docKey, 'probation');
  assert.deepEqual(analysis.packs, ['probation']);
  assert.equal(analysis.coverage.appliedCount, 3);
  assert.equal(analysis.coverage.uncoveredCount, RULE_LIBRARY.length - 3);
  assert.ok(!analysis.oneLiner.includes('36 类规则没有扫到'));
  assert.ok(analysis.oneLiner.includes('只核对 3 类'));
  assert.ok(analysis.oneLiner.includes('未覆盖'));
  assert.ok(analysis.oneLiner.includes('没扫到'));
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('本次应用 3/36 类规则'));
  assert.ok(html.includes('本次应用规则未命中 ≠ 无风险'));
  assert.ok(!html.includes('本次规则未命中风险'));
});

test('R2 不因期限条未写工资而误报，工资已写在其他条款时只出实际结论', () => {
  const analysis = analyzeContract(sample('labor').text, { scope: 'full' });
  const r2 = byRule(analysis, 'R2');
  assert.ok(!r2.some(item => item.ruleName === '试用期工资未明确'));
  assert.ok(r2.some(item => item.verdict === 'red' && item.consequence.includes('4,800')));
});

test('R6 人员适用卡定位到人员条款，range 与 clauseIndex 同坐标系', () => {
  const text = `劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生

第一条 合同期限
本合同期限为 2 年。

第二条 工作内容
乙方不知悉、接触甲方商业秘密或与知识产权相关的保密事项。

第三条 竞业限制
乙方离职后 2 年内不得从事同类业务，甲方按月支付经济补偿。

第四条 劳动报酬
月工资 15000 元，试用期工资 12000 元。`;
  const analysis = analyzeContract(text, { scope: 'full' });
  const item = byRule(analysis, 'R6').find(it => it.ruleName === '竞业限制人员适用待核对');
  assert.ok(item);
  const clause = analysis.clauses[item.clauseIndex];
  assert.ok(clause.body.includes('不知悉'));
  assert.equal(clause.body.slice(item.range.start, item.range.end), item.range.raw);
  assert.ok(item.evidence.some(ev => ev.clauseIndex === 3 && ev.quote));
});

test('所有样本的 range 都落在 item.clauseIndex 指向的条款 body 内', () => {
  for (const s of SAMPLES) {
    const analysis = analyzeContract(s.text, { scope: 'full' });
    for (const item of analysis.items) {
      if (!item.range || item.range.start == null || item.clauseIndex == null) continue;
      const clause = analysis.clauses[item.clauseIndex];
      assert.ok(clause, `${s.id} ${item.id} clause missing`);
      assert.equal(clause.body.slice(item.range.start, item.range.end), item.range.raw, `${s.id} ${item.id}`);
    }
  }
});

test('培训贷样本把每期服务费计入总额，不再报频次不明', () => {
  const loan = sample('loan');
  const analysis = analyzeContract(loan.text, { scope: 'full' });
  const r9 = byRule(analysis, 'R9');
  assert.ok(r9.some(item => item.consequence.includes('38,400')));
  assert.ok(!r9.some(item => item.ruleName === '服务费收取频次不明'));
  assert.ok(loan.sub.includes('8600'));
});

test('冲突卡的 evidence 会进入导出报告，而不是只留在引擎数据里', () => {
  const text = `劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生

第一条 合同期限
本合同期限为 2 年。

第二条 试用期
试用期 3 个月，试用期工资为每月 5000 元，转正后工资为每月 8000 元。

第三条 补充约定
试用期工资为每月 3000 元。`;
  const analysis = analyzeContract(text, { scope: 'full' });
  const conflict = byRule(analysis, 'R2').find(item => item.ruleName === '试用期工资约定冲突');
  assert.ok(conflict);
  assert.ok(conflict.evidence.length >= 2);
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('依据原文'));
  assert.ok(html.includes('5,000'));
  assert.ok(html.includes('3,000'));
});

test('双端规则注册表：App 与网页端规则一致，PDF 页脚不再写死规则数', () => {
  const root = path.join(__dirname, '..');
  const dart = fs.readFileSync(path.join(root, 'client', 'lib', 'engine', 'engine.dart'), 'utf8');
  const ids = Array.from(dart.matchAll(/RuleInfo\(\s*'(R\d+)'/g)).map(m => m[1]);
  const webIds = RULE_LIBRARY.map(r => r.id);
  assert.ok(ids.length > 0, 'Dart rule library should not be empty');
  assert.deepEqual(ids, webIds, 'Dart rules must match the web rule registry');
  const gapMatch = dart.match(/const List<String> ruleLibraryGap = \[([^\]]*)\]/);
  assert.ok(gapMatch, 'ruleLibraryGap must be declared');
  const gap = Array.from(gapMatch[1].matchAll(/'(R\d+)'/g)).map(m => m[1]);
  assert.deepEqual(gap, webIds.filter(id => !ids.includes(id)), 'declared gap must equal web minus app');
  const pdf = fs.readFileSync(path.join(root, 'client', 'lib', 'services', 'pdf_export.dart'), 'utf8');
  assert.ok(!pdf.includes('规则库 20 类'));
  assert.ok(pdf.includes('ruleLibrary.length'));
  assert.ok(!pdf.includes('R31–R36 未移植'));
  const about = fs.readFileSync(path.join(root, 'client', 'lib', 'pages', 'about_page.dart'), 'utf8');
  assert.ok(about.includes('ruleLibrarySnapshotNote'));
});

test('导出报告带合同身份与完整原文，不再被 60 字截断', () => {
  const text = `劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生

第一条 合同期限
本合同期限为 2 年。

第二条 劳动报酬
乙方试用期工资为每月 3000 元，转正后工资为每月 8000 元，甲方可根据经营情况单方调整工资标准且乙方不得异议。`;

  const analysis = analyzeContract(text, { scope: 'full', sourceName: '测试合同.pdf' });
  assert.equal(analysis.sourceName, '测试合同.pdf');
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('测试合同.pdf'));
  assert.ok(html.includes('不得异议'));
  assert.ok(html.includes('本报告基于你提供的文本'));
});

test('纯预付课程合同自动识别为预付课程，并触发 R33 退款红线', () => {
  const text = `课程服务协议
甲方：某教育公司
乙方：学员

第一条 课程与费用
乙方一次性支付课程费 12000 元，购买 60 课时。

第二条 退款
开课后费用一律不予退还。`;
  const analysis = analyzeContract(text, { scope: 'full' });
  assert.equal(analysis.docKey, 'prepay');
  assert.equal(analysis.docType, '预付课程');
  assert.ok(analysis.packs.includes('prepay'));
  const r33 = byRule(analysis, 'R33');
  assert.ok(r33.some(item => item.verdict === 'red' && item.ruleName.includes('拒绝退款')));
  assert.ok(r33.some(item => item.loss === 12000));
});

test('预付课程无退款约定时给灰卡，含迁址不退的手动贷款合同仍出 R33', () => {
  const noRefund = analyzeContract(`课程购买协议
甲方：某机构
乙方：学员
第一条 费用
乙方支付学费 8000 元，共 40 课时。`, { scope: 'full' });
  assert.ok(byRule(noRefund, 'R33').some(item => item.verdict === 'gray' && item.ruleName.includes('未约定退款')));

  const relocation = analyzeContract(`培训服务协议
甲方：某机构
乙方：学员
第一条 费用
乙方支付培训费 9000 元。
第二条 服务地点
甲方关闭原服务点、改由外省合作方提供服务的，余款不退。`, { docType: 'loan', scope: 'full' });
  assert.ok(byRule(relocation, 'R33').some(item => item.verdict === 'red' && /迁址|跨省/.test(item.ruleName)));
});

test('法源元数据带核对日期与官方入口，R10 不再写“需核对”', () => {
  const analysis = analyzeContract(`实习协议
甲方（实习单位）：测试公司
乙方（实习学生）：测试学生
第一条 实习期限
实习期自 2026 年 1 月 1 日起至 2026 年 6 月 30 日止。
第二条 实习内容
乙方每周实习 5 天，每天 8 小时。`, { scope: 'excerpt' });
  const r10 = analysis.items.find(item => item.ruleId === 'R10' && item.basis);
  assert.ok(r10);
  assert.ok(r10.basis.article !== '需核对');
  assert.ok(r10.basis.checkedAt);
  assert.ok(r10.basis.url.includes('flk.npc.gov.cn'));
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('法源核对日期'));
  assert.ok(html.includes('官方文本'));
});

test('商业险替代工伤与工伤按病假分别引用第六十二条和第三十三条', () => {
  const commercial = analyzeContract(`劳动合同
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 合同期限
本合同期限 2 年。
第二条 保险
公司为乙方购买商业意外险，替代工伤保险，不再缴纳工伤保险。`, { scope: 'excerpt' });
  const commercialItem = commercial.items.find(item => item.ruleName === '商业险替代工伤保险');
  assert.ok(commercialItem);
  assert.equal(commercialItem.basis.article, '第六十二条');

  const sick = analyzeContract(`劳动合同
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 合同期限
本合同期限 2 年。
第二条 工伤
工伤停工留薪期按病假处理，不发工资。`, { scope: 'excerpt' });
  const sickItem = sick.items.find(item => item.ruleName === '工伤期间按病假处理');
  assert.ok(sickItem);
  assert.equal(sickItem.basis.article, '第三十三条');
});

test('待确认事项不再静默截断到 5 条', () => {
  const analysis = analyzeContract(sample('labor').text, { scope: 'full' });
  assert.ok(analysis.pending.length > 5);
});

test('R9 逾期违约金给出折算年化，并区分调减规则与罚息上限', () => {
  const text = `培训分期协议
甲方：某培训机构
乙方：学员
第一条 付款
分 12 期，每期还款 1000 元。
第二条 逾期
乙方逾期还款的，每日按未还金额的 1% 支付逾期违约金。`;
  const analysis = analyzeContract(text, { docType: 'loan', scope: 'excerpt' });
  const item = byRule(analysis, 'R9').find(it => it.ruleName === '逾期违约金过高');
  assert.ok(item);
  assert.match(item.consequence, /年化约 365%/);
  assert.match(item.consequence, /不是司法保护上限/);
  assert.match(item.short, /年化 365%/);

  const fixedOnly = analyzeContract(`培训分期协议
甲方：某培训机构
乙方：学员
第一条 付款
分 12 期，每期还款 1000 元。
第二条 逾期
乙方逾期还款的，每次支付违约金 300 元。`, { docType: 'loan', scope: 'excerpt' });
  const gray = byRule(fixedOnly, 'R9').find(it => it.ruleName === '逾期费用未写上限');
  assert.ok(gray);
  assert.match(gray.consequence, /无法折算年化/);
});

test('重复分析同一文本结果稳定，不带入上一次状态', () => {
  const first = analyzeContract(sample('labor').text, { scope: 'full' });
  const second = analyzeContract(sample('labor').text, { scope: 'full' });
  assert.deepEqual(second.items, first.items);
  assert.deepEqual(second.counts, first.counts);
  assert.equal(second.oneLiner, first.oneLiner);
  assert.deepEqual(second.pending, first.pending);
});

test('所有带依据的发现都有核对日期和官方入口', () => {
  for (const s of SAMPLES) {
    const analysis = analyzeContract(s.text, { scope: 'full' });
    for (const item of analysis.items) {
      if (!item.basis) continue;
      assert.ok(item.basis.checkedAt, `${s.id} ${item.id} checkedAt`);
      assert.ok(item.basis.url, `${s.id} ${item.id} url`);
      assert.notEqual(item.basis.article, '需核对', `${s.id} ${item.id} article`);
    }
  }
});

test('正常劳动合同对照不产生红线或黄线', () => {
  const text = `劳动合同书
甲方（用人单位）：示例科技有限公司
乙方（劳动者）：测试员工

第一条 合同期限
本合同期限自 2026 年 1 月 1 日起至 2028 年 12 月 31 日止，试用期 2 个月。

第二条 工作内容与地点
乙方担任产品助理，工作地点为杭州市西湖区。

第三条 工作时间
甲方实行标准工时制，每日工作 8 小时，每周工作 40 小时，依法安排休息休假。

第四条 劳动报酬
乙方试用期工资为每月 6400 元，转正后工资为每月 8000 元，每月 10 日发放。

第五条 社会保险
甲方依法为乙方缴纳社会保险，个人部分由甲方代扣代缴。

第六条 劳动保护
甲方提供必要的劳动保护用品和职业危害防护。

第七条 合同解除
乙方提前 30 日书面通知甲方，可以解除劳动合同；试用期内提前 3 日通知。`;
  const analysis = analyzeContract(text, { scope: 'full' });
  assert.equal(analysis.counts.red, 0);
  assert.equal(analysis.counts.yellow, 0);
});

test('正常劳动合同样本作为对照，不产生红黄灰线', () => {
  const analysis = analyzeContract(sample('normal').text, { scope: 'full' });
  assert.equal(analysis.counts.red, 0);
  assert.equal(analysis.counts.yellow, 0);
  assert.equal(analysis.counts.gray, 0);
  assert.ok(analysis.counts.green > 0);
});

test('同一句同时写转正 30 日和试用期 3 日，不误报试用期通知期过高', () => {
  const text = `劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试学生
第一条 合同期限
本合同期限 2 年，试用期 2 个月。
第二条 解除
乙方提前 30 日书面通知甲方，可以解除劳动合同；试用期内提前 3 日通知。`;
  const analysis = analyzeContract(text, { scope: 'full' });
  assert.ok(!analysis.items.some(item => /试用期通知期高于/.test(item.ruleName)));
});

test('无条款编号的长文本给出换行丢失提醒，并进入导出', () => {
  const longText = '甲方：测试公司 乙方：测试学生 乙方同意根据甲方需要从事运营工作，工作地点为杭州市，工资为每月8000元，试用期2个月，试用期工资6400元，双方按国家规定缴纳社会保险，甲方可随时调整岗位和工资，乙方应服从安排。';
  const analysis = analyzeContract(longText, { scope: 'unknown' });
  assert.ok(analysis.formatWarning);
  assert.match(analysis.formatWarning, /换行|段落/);
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('格式提醒'));
});
