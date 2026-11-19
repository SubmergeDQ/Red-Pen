const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeContract, SAMPLES } = require('../engine.js');

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