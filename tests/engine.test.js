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
  assert.equal(r8.length, 1);
  assert.equal(r8[0].verdict, 'yellow');
  assert.ok(r8[0].loss >= 8000);
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