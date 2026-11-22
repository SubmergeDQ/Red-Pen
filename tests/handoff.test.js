const test = require('node:test');
const assert = require('node:assert/strict');
const {
  analyzeContract,
  buildExportHTML,
  buildScopeInfo,
  parseContractTerm,
  shouldAcceptInput,
  summarizePdfImport
} = require('../engine.js');

const HEAD = `劳动合同书

甲方（用人单位）：测试公司
乙方（劳动者）：测试学生

`;

function byRule(analysis, ruleId) {
  return analysis.items.filter(item => item.ruleId === ruleId);
}

function labor(extra) {
  return HEAD + extra;
}

function dateContract(start, end, probation) {
  return labor(`第一条 合同期限
本合同期限自${start}起至${end}止。
第二条 试用期与工资
试用期${probation}个月，试用期工资为每月4800元，转正后工资为每月6000元。`);
}

const SAMPLE_A = `劳动合同书（虚构测试样本）
甲方（用人单位）：示例科技有限公司
乙方（劳动者）：测试员工

第一条 合同期限
本劳动合同期限自2026年1月1日起至2026年12月31日止。
试用期为2个月。

第二条 工作内容及地点
乙方从事软件测试，工作地点为杭州市西湖区。乙方不知悉、接触甲方商业秘密或与知识产权相关的保密事项。

第三条 工时和休假
实行标准工时，每日工作8小时，每周工作40小时。乙方依法享受休息休假。

第四条 劳动报酬
转正工资为每月6000元。试用期工资为每月4800元，每月10日支付。

第五条 社会保险
乙方签字即承诺自愿不参加社会保险，甲方无需为乙方缴纳社会保险费。

第六条 劳动保护
甲方提供所需劳动保护用品与必要的职业危害防护。

第七条 离职
乙方提前离职，无须支付违约金。

第八条 历史工资单
乙方离职后36个月内可查询历史工资单。

第九条 竞业限制
竞业限制期限为12个月。竞业限制期间甲方按月向乙方支付经济补偿3000元。

第十条 证件与保证金
甲方收取乙方入职保证金2000元，并扣押乙方居民身份证原件。

第十一条 加班
甲方安排法定节假日加班，只安排调休，不另支付加班费。

第十二条 补充约定
试用期为6个月。试用期不发工资。

第十三条 另一离职条件
乙方未满一年提前离职，应向甲方支付违约金5000元。`;

test('E01 无须支付违约金不产生员工付款红线，明确付款条款仍命中', () => {
  const negated = analyzeContract(labor('第一条 离职\n乙方提前离职，无须支付违约金。'), { docType: 'labor', scope: 'excerpt' });
  assert.equal(byRule(negated, 'R4').length, 0);

  const positive = analyzeContract(labor('第一条 离职\n乙方未满一年提前离职，应向甲方支付违约金5000元。'), { docType: 'labor', scope: 'excerpt' });
  const r4 = byRule(positive, 'R4');
  assert.equal(r4.length, 1);
  assert.equal(r4[0].verdict, 'red');
  assert.equal(r4[0].loss, 5000);
  assert.ok(r4[0].quote.includes('5000'));
});

test('E02 甲方付给乙方的违约金不输出为乙方付款义务', () => {
  const analysis = analyzeContract(labor('第一条 离职\n乙方提前离职，甲方应向乙方支付违约金3000元。'), { docType: 'labor', scope: 'excerpt' });
  assert.equal(byRule(analysis, 'R4').length, 0);
});

test('E03 法定程序加实际损失按条件性损失提示，固定金额另算', () => {
  const conditional = analyzeContract(labor('第一条 解除\n乙方违反法定程序提前解除劳动合同且给甲方造成实际损失的，按有证据证明的实际损失承担赔偿责任。'), { docType: 'labor', scope: 'excerpt' });
  const r4 = byRule(conditional, 'R4');
  assert.ok(r4.length >= 1);
  assert.ok(r4.every(item => item.verdict !== 'red'));
  assert.ok(r4.some(item => item.verdict === 'gray' && item.ruleName.includes('实际损失')));

  const fixed = analyzeContract(labor('第一条 解除\n乙方违反法定程序提前解除劳动合同且给甲方造成实际损失的，按有证据证明的实际损失承担赔偿责任，另需向甲方支付固定赔偿5000元。'), { docType: 'labor', scope: 'excerpt' });
  const fixedR4 = byRule(fixed, 'R4');
  assert.ok(fixedR4.some(item => item.verdict === 'red' && item.consequence.includes('5,000')));

  const split = analyzeContract(labor('第一条 解除\n乙方提前离职，甲方应向乙方支付违约金3000元；乙方还应向甲方支付违约金5000元。'), { docType: 'labor', scope: 'excerpt' });
  const splitR4 = byRule(split, 'R4');
  const splitRed = splitR4.filter(item => item.verdict === 'red');
  assert.equal(splitRed.length, 1);
  assert.ok(splitRed[0].consequence.includes('5,000'));
  assert.ok(!splitRed[0].consequence.includes('3,000'));
});

test('E04 样本 A 同时保留两套试用期限和工资证据，并识别零工资', () => {
  const analysis = analyzeContract(SAMPLE_A, { scope: 'full' });
  assert.equal(analysis.docKey, 'labor');

  const conflictR1 = byRule(analysis, 'R1').find(item => item.verdict === 'red' && item.ruleName.includes('冲突'));
  assert.ok(conflictR1, 'R1 conflict should exist');
  assert.ok(conflictR1.evidence.length >= 2);
  assert.ok(conflictR1.consequence.includes('2 个月'));
  assert.ok(conflictR1.consequence.includes('6 个月'));

  const conflictR2 = byRule(analysis, 'R2').find(item => item.verdict === 'red' && item.ruleName.includes('冲突'));
  assert.ok(conflictR2, 'R2 conflict should exist');
  assert.ok(conflictR2.evidence.length >= 2);
  assert.ok(conflictR2.consequence.includes('4,800'));
  assert.ok(conflictR2.consequence.includes('不发工资'));
  assert.ok(byRule(analysis, 'R2').some(item => item.verdict === 'red' && item.ruleName.includes('不支付工资')));

  const r4 = byRule(analysis, 'R4');
  assert.ok(r4.some(item => item.verdict === 'red' && item.loss === 5000));
  assert.ok(!r4.some(item => (item.quote || '').includes('无须支付违约金')));

  const r15 = byRule(analysis, 'R15');
  assert.ok(r15.some(item => item.verdict === 'red' && item.ruleName.includes('不缴社保')));
  assert.ok(!analysis.items.some(item => item.verdict === 'green' && /社会保险/.test(item.ruleName || '')));

  const r11 = byRule(analysis, 'R11');
  assert.ok(r11.some(item => item.verdict === 'red' && /2,000/.test(item.consequence)));
  assert.ok(r11.some(item => item.verdict === 'red' && item.ruleName.includes('扣押证件')));
});

test('E05 合同期限按日历端点分档，短于一年与整年分界不混淆', () => {
  const shortOfYear = parseContractTerm('合同期限自2026年1月1日起至2026年12月25日止。');
  assert.equal(shortOfYear.maxProbation, 1);
  const fullYear = parseContractTerm('合同期限自2026年1月1日起至2026年12月31日止。');
  assert.equal(fullYear.maxProbation, 2);
  const underThree = parseContractTerm('合同期限自2026年1月1日起至2026年3月30日止。');
  assert.equal(underThree.maxProbation, 0);
  const exactThree = parseContractTerm('合同期限自2026年1月1日起至2026年4月1日止。');
  assert.equal(exactThree.maxProbation, 1);
  assert.equal(exactThree.atLeast3, true);
  const justUnderThreeYears = parseContractTerm('合同期限自2026年1月1日起至2028年12月30日止。');
  assert.equal(justUnderThreeYears.maxProbation, 2);
  const exactThreeYears = parseContractTerm('合同期限自2026年1月1日起至2029年1月1日止。');
  assert.equal(exactThreeYears.maxProbation, 6);
  const leap = parseContractTerm('合同期限自2024年2月29日起至2025年2月28日止。');
  assert.equal(leap.atLeast12, true);
  assert.equal(leap.maxProbation, 2);

  const bad = analyzeContract(dateContract('2026年1月1日', '2026年12月25日', 2), { docType: 'labor', scope: 'excerpt' });
  assert.ok(byRule(bad, 'R1').some(item => item.verdict === 'red' && item.ruleName.includes('超过法定上限')));
  const good = analyzeContract(dateContract('2026年1月1日', '2026年12月31日', 2), { docType: 'labor', scope: 'excerpt' });
  assert.ok(!byRule(good, 'R1').some(item => item.verdict === 'red'));
  const green = good.items.find(item => item.verdict === 'green' && item.ruleName === '试用期期限');
  assert.ok(green, 'should emit the generic 试用期期限 green item');
  assert.ok(green.quote.includes('试用期2个月'));
  assert.ok(green.consequence.includes('2 个月'));
  assert.ok(green.consequence.includes('1 年'));
  assert.ok(green.consequence.includes('上限 2 个月'));
});

test('E06 明确的非全日制工时加试用期适用第七十条，矛盾工时不走该红线', () => {
  const badText = labor(`第一条 用工方式
本合同为非全日制用工，按小时计酬，每日工作4小时，每周工作20小时。
第二条 试用期
试用期1个月。`);
  const bad = analyzeContract(badText, { docType: 'labor', scope: 'excerpt' });
  const red = byRule(bad, 'R1').find(item => item.verdict === 'red' && item.ruleName.includes('非全日制'));
  assert.ok(red, 'non-full-time probation should be red');
  assert.equal(red.basis.article, '第七十条');

  const contradictoryText = labor(`第一条 用工方式
本合同为非全日制用工，合同期限为1年，每日工作8小时，每周工作40小时。
第二条 试用期
试用期1个月。`);
  const contradictory = analyzeContract(contradictoryText, { docType: 'labor', scope: 'excerpt' });
  assert.ok(!byRule(contradictory, 'R1').some(item => item.verdict === 'red' && item.ruleName.includes('非全日制')));
  assert.ok(byRule(contradictory, 'R28').some(item => item.verdict === 'red' && item.ruleName.includes('非全日制')));

  const compliantText = labor(`第一条 用工方式
本合同为非全日制用工，按小时计酬，每日工作4小时，每周工作20小时，报酬每15日结算一次。`);
  const compliant = analyzeContract(compliantText, { docType: 'labor', scope: 'excerpt' });
  assert.equal(byRule(compliant, 'R1').length, 0);
  assert.ok(!byRule(compliant, 'R28').some(item => item.verdict === 'red'));
});

test('E07 试岗期摘录仍启用试用期包并提示性质待核对', () => {
  const analysis = analyzeContract(labor('第一条 试岗\n乙方设三个月试岗期，试岗期间不发工资。'), { scope: 'excerpt' });
  assert.ok(analysis.packs.includes('probation'));
  assert.ok(byRule(analysis, 'R1').some(item => item.verdict === 'gray' && item.ruleName.includes('考察期')));
});

test('E08 竞业期限只绑定同一竞业约定，工资单 36 个月不串入', () => {
  const text = labor(`第八条 历史工资单
乙方离职后36个月内可查询历史工资单。
第九条 竞业限制
竞业限制期限为12个月。竞业限制期间甲方按月向乙方支付经济补偿3000元。`);
  const analysis = analyzeContract(text, { docType: 'labor', scope: 'excerpt' });
  const r6 = byRule(analysis, 'R6');
  assert.ok(!r6.some(item => (item.consequence || '').includes('36')));
  const green = analysis.items.find(item => item.verdict === 'green' && item.ruleName === '竞业限制');
  assert.ok(green, 'should emit the generic 竞业限制 green item');
  assert.ok(green.quote.includes('竞业限制'));
  assert.ok(green.quote.includes('12'));
  assert.ok(green.consequence.includes('12 个月'));
  assert.ok(!green.consequence.includes('36'));
  assert.ok(green.consequence.includes('仍需确认你是否属于应签人员'));

  const over = analyzeContract(labor('第一条 竞业限制\n竞业限制期限为25个月，竞业限制期间甲方按月支付经济补偿3000元。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(byRule(over, 'R6').some(item => item.verdict === 'red' && item.ruleName.includes('超过两年')));
  const boundary = analyzeContract(labor('第一条 竞业限制\n竞业限制期限为24个月，竞业限制期间甲方按月支付经济补偿3000元。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(!byRule(boundary, 'R6').some(item => item.verdict === 'red'));
});

test('E09 在职竞业不套离职补偿，未接触保密事项进入竞业结论', () => {
  const inService = analyzeContract(labor('第一条 竞业限制\n高级技术人员仅在职期间履行竞业限制，至劳动合同解除或终止之日。'), { docType: 'labor', scope: 'excerpt' });
  const r6 = byRule(inService, 'R6');
  assert.ok(r6.some(item => item.verdict === 'gray' && item.ruleName.includes('在职期间')));
  assert.ok(!r6.some(item => item.verdict !== 'gray' && (item.consequence || '').includes('没有写按月补偿')));

  const noComp = analyzeContract(labor('第一条 竞业限制\n竞业限制期限为24个月，离职后不得从事同类业务。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(byRule(noComp, 'R6').some(item => item.verdict === 'gray' && item.ruleName.includes('未约定补偿')));

  const personnel = analyzeContract(labor(`第一条 保密事项
乙方不知悉、接触甲方商业秘密或与知识产权相关的保密事项。
第二条 竞业限制
离职后12个月内不得从事同类业务，甲方按月支付经济补偿3000元。`), { docType: 'labor', scope: 'excerpt' });
  const personItem = byRule(personnel, 'R6').find(item => item.verdict === 'gray' && item.ruleName.includes('人员适用'));
  assert.ok(personItem);
  assert.ok(personItem.consequence.includes('不知悉'));
});

test('E10 服务期只取对应专项培训费 6000，8000 超过上限 2000', () => {
  const text = labor(`第一条 自购课程
乙方自购外语课程，费用20000元。
第二条 专项培训
甲方为乙方提供专项培训，专项培训费6000元，服务期2年。
第三条 服务期违约金
乙方提前离职的，应向甲方支付服务期违约金8000元。
第四条 普通离职
乙方未满一年提前离职的，应向甲方支付违约金3000元。`);
  const analysis = analyzeContract(text, { docType: 'labor', scope: 'excerpt' });
  const r5 = byRule(analysis, 'R5');
  assert.equal(r5.length, 1);
  assert.equal(r5[0].verdict, 'red');
  assert.ok(r5[0].ruleName.includes('超过培训费'));
  assert.equal(r5[0].loss, 2000);
  assert.ok(r5[0].consequence.includes('6,000'));
  assert.ok(r5[0].consequence.includes('8,000'));

  const r4 = byRule(analysis, 'R4');
  assert.equal(r4.length, 1);
  assert.equal(r4[0].loss, 3000);
});

test('E11 服务期按未履行月数分摊，12000×6/24 上限为 3000', () => {
  const text = labor('第一条 服务期\n甲方为乙方提供专项培训，专项培训实际支出12000元，服务期24个月，乙方已履行18个月；乙方提前离职的，应支付服务期违约金6000元。');
  const analysis = analyzeContract(text, { docType: 'labor', scope: 'excerpt' });
  const r5 = byRule(analysis, 'R5');
  assert.equal(r5.length, 1);
  assert.equal(r5[0].verdict, 'red');
  assert.equal(r5[0].loss, 3000);
  assert.ok(r5[0].consequence.includes('已履行 18 个月'));
  assert.ok(r5[0].consequence.includes('未履行 6 个月'));
  assert.ok(r5[0].consequence.includes('3,000'));

  const noPerformed = analyzeContract(labor('第一条 服务期\n专项培训实际支出12000元，服务期24个月；乙方提前离职的，应支付服务期违约金6000元。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(!byRule(noPerformed, 'R5').some(item => item.verdict === 'red'));
  assert.ok(byRule(noPerformed, 'R5').some(item => item.verdict === 'yellow'));
});

test('E12 自愿不参保或单位免缴为红线，依法参保代扣为正常对照', () => {
  const waiver = analyzeContract(labor('第一条 社会保险\n乙方承诺自愿不参加社会保险。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(byRule(waiver, 'R15').some(item => item.verdict === 'red' && item.ruleName.includes('不缴社保')));
  assert.ok(!waiver.items.some(item => item.verdict === 'green' && /社会保险/.test(item.ruleName || '')));

  const employerWaiver = analyzeContract(labor('第一条 社会保险\n甲方无需为乙方缴纳社会保险费。'), { docType: 'labor', scope: 'excerpt' });
  assert.ok(byRule(employerWaiver, 'R15').some(item => item.verdict === 'red'));

  const normal = analyzeContract(labor('第一条 社会保险\n甲方依法为乙方缴纳社会保险，乙方个人应缴部分由甲方代扣代缴。'), { docType: 'labor', scope: 'excerpt' });
  assert.equal(byRule(normal, 'R15').length, 0);
  assert.ok(normal.items.some(item => item.verdict === 'green' && /社会保险/.test(item.ruleName || '')));
});

function loanContract(body) {
  return `培训分期协议
甲方：测试培训机构
乙方：测试学员
第一条 付款与本金
${body}`;
}

test('E13 样本 B 一次性费用为 12300，已含为 13200，另收为 14400，频次不明留灰线', () => {
  const once = analyzeContract(loanContract('贷款本金为12000元。分12期，每期还款1000元，平台服务费一次性收取300元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(byRule(once, 'R9').some(item => item.consequence.includes('12,300')));
  assert.ok(byRule(once, 'R9').some(item => item.verdict === 'gray' && item.ruleName.includes('利率上限')));
  assert.ok(!byRule(once, 'R9').some(item => item.consequence.includes('15,600')));

  const included = analyzeContract(loanContract('分12期，每期还款1100元，已含每期平台服务费100元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(byRule(included, 'R9').some(item => item.consequence.includes('13,200')));

  const separate = analyzeContract(loanContract('分12期，每期还款1100元，另收每期平台服务费100元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(byRule(separate, 'R9').some(item => item.consequence.includes('14,400')));

  const unknownFreq = analyzeContract(loanContract('分12期，每期还款1100元，平台服务费100元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(byRule(unknownFreq, 'R9').some(item => item.verdict === 'gray' && item.ruleName.includes('频次')));

  const conflicting = analyzeContract(loanContract('分12期，每期还款1000元，平台服务费一次性收取300元，还款总额15000元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(byRule(conflicting, 'R9').some(item => item.consequence.includes('15,000') && item.consequence.includes('12,300')));
});

test('E14 本金绑定实际贷款本金字段，持牌机构不套民间借贷上限', () => {
  const unknown = analyzeContract(loanContract('课程原价15000元，实际贷款本金12000元。分12期，每期还款1000元，平台服务费一次性收取300元。'), { docType: 'loan', scope: 'excerpt' });
  const r9 = byRule(unknown, 'R9');
  assert.ok(r9.some(item => item.consequence.includes('12,000') && item.consequence.includes('300')));
  assert.ok(r9.some(item => item.verdict === 'gray' && item.ruleName.includes('利率上限')));
  assert.ok(!r9.some(item => item.consequence.includes('比 15,000 元本金')));

  const licensed = analyzeContract(loanContract('课程原价15000元，实际贷款本金12000元。放款人为某持牌消费金融公司。分12期，每期还款1000元，平台服务费一次性收取300元。'), { docType: 'loan', scope: 'excerpt' });
  assert.ok(!byRule(licensed, 'R9').some(item => item.ruleName.includes('利率上限')));
});

test('E15 样本 D 三方解约 5000 只写主张金额，不输出一般有效或调减计算', () => {
  const text = `毕业生就业三方协议
甲方（用人单位）：示例科技有限公司
乙方（毕业生）：测试学生
丙方：示例学校

第一条 解约
乙方解约的，应向甲方支付违约金5000元。`;
  const analysis = analyzeContract(text, { scope: 'excerpt' });
  assert.equal(analysis.docKey, 'three-party');
  const r8 = byRule(analysis, 'R8');
  assert.equal(r8.length, 1);
  assert.equal(r8[0].verdict, 'yellow');
  assert.equal(r8[0].loss, 5000);
  assert.ok(r8[0].consequence.includes('1.3 倍'));
  assert.ok(!r8[0].consequence.includes('一般有效'));
  assert.ok(!r8[0].consequence.includes('可以调减'));
  assert.equal(byRule(analysis, 'R4').length, 0);
});

test('E16 样本 C 空白模板不报齐全，摘录不做全文缺项，完整合同才做齐全检查', () => {
  const blank = `劳动合同
甲方（用人单位）：____
乙方（劳动者）：____
第一条 合同期限：____
第二条 工作岗位：____
第三条 工作时间：____
第四条 工资：____
第五条 社会保险：____
第六条 劳动保护：____`;
  const blankAnalysis = analyzeContract(blank, { scope: 'full' });
  assert.ok(!byRule(blankAnalysis, 'R21').some(item => item.verdict === 'green'));
  assert.ok(byRule(blankAnalysis, 'R21').some(item => item.verdict === 'gray' && item.ruleName.includes('空白')));

  const excerptText = `劳动合同
第一条 社会保险
甲方依法为乙方缴纳社会保险。`;
  const excerpt = analyzeContract(excerptText, { scope: 'excerpt' });
  assert.ok(byRule(excerpt, 'R21').some(item => item.verdict === 'gray' && item.ruleName.includes('审阅范围')));
  assert.ok(!byRule(excerpt, 'R21').some(item => item.verdict === 'red'));
  assert.equal(excerpt.scopeInfo.scope, 'excerpt');
  const html = buildExportHTML(excerpt);
  assert.ok(html.includes('审阅范围：条款摘录'));
  assert.ok(html.includes('未做全文必备条款缺项检查'));

  const full = labor(`第一条 合同期限
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
甲方提供必要的劳动保护。`);
  const good = analyzeContract(full, { scope: 'full' });
  assert.ok(byRule(good, 'R21').some(item => item.verdict === 'green'));
});

test('E17 只看到每日工时就不补写每周 40 小时', () => {
  const analysis = analyzeContract(labor('第一条 工时\n乙方每日工作8小时。'), { docType: 'labor', scope: 'excerpt' });
  const hours = analysis.items.find(item => item.ruleName === '工作时间');
  assert.ok(hours);
  assert.equal(hours.verdict, 'green');
  assert.ok(hours.consequence.includes('周工时没有写'));
  assert.ok(!hours.consequence.includes('每周工作 40 小时'));
});

test('W01 PDF 页级摘要保留成功页、扫描页、处理上限和空文件状态', () => {
  const pages81 = Array.from({ length: 81 }, (_, i) => `第${i + 1}页正文内容`);
  const big = summarizePdfImport(pages81, { maxPages: 80 });
  assert.equal(big.totalPages, 81);
  assert.equal(big.readPageCount, 80);
  assert.deepEqual(big.skippedPages, [81]);
  assert.equal(big.complete, false);
  assert.ok(!big.text.includes('第 81 页'));
  assert.ok(big.problems.some(p => p.includes('第 81 页')));

  const scanned = summarizePdfImport(['第一页有效正文', '', '第三页有效正文'], { maxPages: 80 });
  assert.deepEqual(scanned.readPages, [1, 3]);
  assert.deepEqual(scanned.unreadPages, [2]);
  assert.equal(scanned.complete, false);
  assert.ok(scanned.problems.some(p => p.includes('第 2 页')));

  const scope = buildScopeInfo('full', scanned);
  assert.equal(scope.scope, 'unknown');
  assert.equal(scope.requested, 'full');
  assert.ok(scope.note.includes('第 2 页'));

  const empty = summarizePdfImport([''], { totalPages: 1 });
  assert.equal(empty.complete, false);
  assert.equal(empty.text, '');
  assert.ok(empty.problems.some(p => p.includes('整份文件')));
});

test('W02 摘录可走试用期或手选类型，普通文本仍被明确拦截', () => {
  const auto = shouldAcceptInput('乙方试用期六个月，试用期工资每月3500元。');
  assert.equal(auto.accept, true);
  assert.ok(auto.packs.includes('probation'));
  const autoAnalysis = analyzeContract('乙方试用期六个月，试用期工资每月3500元。', { scope: 'excerpt' });
  assert.ok(autoAnalysis.packs.includes('probation'));
  assert.ok(byRule(autoAnalysis, 'R1').some(item => item.verdict === 'gray'));
  assert.ok(byRule(autoAnalysis, 'R2').some(item => item.verdict === 'gray'));

  const manualText = '试用期间月薪3500元，转正后月薪6000元。';
  const manual = shouldAcceptInput(manualText, { docType: 'labor' });
  assert.equal(manual.accept, true);
  assert.equal(manual.docKey, 'labor');
  const manualAnalysis = analyzeContract(manualText, { docType: 'labor', scope: 'excerpt' });
  assert.equal(manualAnalysis.docKey, 'labor');
  assert.ok(byRule(manualAnalysis, 'R2').some(item => item.verdict === 'gray' && item.ruleName.includes('未明确')));

  const ordinary = shouldAcceptInput('今天上午我们讨论了项目进度和下一步安排。'.repeat(8));
  assert.equal(ordinary.accept, false);
  assert.ok(ordinary.reason.includes('选择文档类型'));
});

test('W03 页面与打印共用范围元数据，缺页和不完整附件写入导出顶部', () => {
  const imported = summarizePdfImport(['第一页正文', '', '第三页正文'], { maxPages: 80 });
  const text = '劳动合同\n第一条 社会保险\n甲方依法为乙方缴纳社会保险。';
  const analysis = analyzeContract(text, { scope: 'full', importInfo: imported });
  assert.equal(analysis.scopeInfo.scope, 'unknown');
  assert.equal(analysis.scopeInfo.requested, 'full');
  assert.ok(analysis.scopeInfo.note.includes('成功提取 2 页'));
  assert.ok(analysis.scopeInfo.note.includes('第 2 页'));
  const html = buildExportHTML(analysis);
  assert.ok(html.includes('审阅范围：范围未确认'));
  assert.ok(html.includes('第 2 页未能提取文字'));
  assert.ok(html.includes('本次导入共 3 页'));

  const excerpt = analyzeContract(text, { scope: 'excerpt' });
  const excerptHtml = buildExportHTML(excerpt);
  assert.ok(excerptHtml.includes('审阅范围：条款摘录'));
  assert.ok(excerptHtml.includes('当前只审阅条款摘录'));
});