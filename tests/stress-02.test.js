const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeContract } = require('../engine.js');

const STRESS = `云栈排班项目劳动合同（虚构测试样本）
此文本仅用于测试合同审阅程序。甲乙双方和所有项目均为虚构。

甲方（用人单位）：云栈示例服务有限公司
乙方（劳动者）：测试人员甲
签约及履行地：北京市。本合同及下列附件一并审阅。

第一条 期限
本合同期限为十八个月。乙方自第一天起正式入职，接受甲方管理并提供劳动；见习、试岗等内部称呼均不改变劳动关系起算日。

第二条 观察资格
乙方有两个月试用期。第二个月最后一个工作日，如系统仍显示“待转正”，原试用资格自动顺延四十五日；顺延期间仍照原试用待遇。

第三条 观察期给付
转正基本月工资与试用期对比口径均以本条约定为准。转正工资每月8000元。试用期不设其他固定报酬，其每月固定工资只按转正工资的65%发放。

第四条 身份核验
入职当日仅核验居民身份证原件，核验后当场归还。原件不得扣押，甲方不收取入职押金。

第五条 门禁前置条件
门禁开通前，乙方须把800元转给甲方作为“权限冷却余额”；当天无法转款的，不进入排班。余额无息，于离职交回门禁卡后返还。双方确认该余额不称为押金或保证金。

第六条 周末排班
休息日确由甲方安排工作的，优先安排同等时长补休；不能安排补休时，依法支付不低于工资200%的报酬。

第七条 节庆班
春节法定假日由甲方排班的，按正常工资200%结算，外加食堂券一张。系统将法定假日的班次归到周末档，无其他工资补发。

第八条 排班额外时段
甲方主管在周排班表上明确指派乙方下班后继续值班的，只要当天未另签《加班确认单》，系统一律算作自愿停留且免发这一时段的加班工资。

第九条 例行调岗流程
甲方可提出调整工位和薪酬的建议；涉及本合同约定内容的变更，经甲乙双方协商一致后书面确认。

第十条 经营弹性
与第九条不同，夜班系统上线后，甲方可单方将乙方调至任意省份并下调基本工资30%，无须乙方同意。乙方只签收通知，签收与否均按变更后的标准执行。

第十一条 首月保障
乙方登录个人账户选择“自行解决”，即可由乙方自行以灵活就业身份缴费；甲方无须为乙方缴纳社会保险费。此选择从签字当天生效。

第十二条 安全卡
甲方只购买商业意外险，此保单替代工伤保险；用人单位依法应承担的工伤保险责任，统统由保险公司保单条款承担。

第十三条 伤情报备
出了工伤只准甲方申报。甲方未在30日内提出申请的，视为该事故作废，乙方、近亲属和工会以后都不得提出工伤认定申请。

第十四条 设备差错
若查实乙方本人造成设备实际损坏，甲方可以从乙方当月工资扣除该工资的60%，扣完后即便低于当地最低工资，也不补足。

第十五条 剩余假期
已经依法取得年休假资格的乙方，如果因为甲方排班未能休完年休假，余额在12月31日清零，不支付未休年休假报酬，乙方无需单独确认。

第十六条 生育签收
生育后“休养券”为60个自然日，包含全部产假；之后即回岗，无例外。乙方一经确认怀孕，附件中的“预签辞职单”立即生效，由系统按自愿离职办理。

第十七条 私有资料
签字时，乙方一并同意采集人脸模板并永久保存。模板将交给无关广告公司用于素材建模，拒绝提供者无法入职，不另行取得单独同意。

第十八条 一般离职
正式员工提前30日以书面形式通知甲方可解除劳动合同，无须审批；甲方于解除或终止时出具证明，并依法办理后续档案和社会保险关系转移。

第十九条 试用离职
处于试用期的，发出通知后须等待45日，并等主管签字批准，方可离岗。未办完交接的，甲方可暂扣全部工资至下一年度。

第二十条 离职后业务
乙方只接待访客，不接触商业秘密和与知识产权相关的保密事项。离职后30个月内，不得在全国任何服务行业工作。竞业限制期间甲方按月另行支付2000元。

第二十一条 送达和争议
所有劳动争议只提交甲乙约定的商业仲裁机构，且为唯一终局程序；不得向劳动人事争议仲裁委员会申请仲裁，也不得依法向人民法院起诉。

第二十二条 电子文本
电子劳动合同签署后只归甲方保管，乙方可以当场看一眼，不交付任何副本，签约平台也不允许乙方下载、复制或保存自己的合同文本。

第二十三条 解除赔偿
若甲方依法应就违法解除支付赔偿金，按《劳动合同法》规定的经济补偿标准的二倍支付。本条不减少乙方依法享有的其他救济。

第二十四条 入职课件
甲方只提供员工手册 PDF 自习作为常规入职介绍，不组织专项专业技术培训，也无对外支出。乙方离职前若没有做满一年，必须向甲方支付6000元“知识解锁回收款”；它不称违约金。

第二十五条 附件：课程培训分期
借款本金12000元，分12期，每期还款1000元。平台服务费一次性收取120元，另每期另收风险管理费30元。上述两费均未包含在每期1000元内。放款主体名称、性质与完整的年化综合成本暂不填写，另行核对。`;

const OPTS = { docType: 'labor', scope: 'full' };

function run(text = STRESS) {
  return analyzeContract(text, OPTS);
}
function clause(analysis, heading) {
  const found = analysis.clauses.find(c => c.heading && c.heading.includes(heading));
  assert.ok(found, `missing clause ${heading}`);
  return found;
}
function at(analysis, heading, ruleId) {
  const idx = clause(analysis, heading).index;
  return analysis.items.filter(it => it.clauseIndex === idx && (!ruleId || it.ruleId === ruleId));
}
function pick(analysis, heading, ruleId, predicate, message) {
  const found = at(analysis, heading, ruleId).find(predicate);
  assert.ok(found, message || `missing ${ruleId} at ${heading}`);
  return found;
}
function cutBetween(text, startMark, endMark) {
  const start = text.indexOf(startMark);
  const end = text.indexOf(endMark);
  assert.ok(start >= 0 && end > start, `cannot cut ${startMark}`);
  return text.slice(0, start) + text.slice(end);
}

test('stress-02: 第2条自动顺延试用期独立报红并说明法定上限', () => {
  const analysis = run();
  const red = pick(analysis, '第二条', 'R1', it => it.verdict === 'red', 'missing R1 red');
  assert.match(red.quote, /顺延/);
  assert.match(red.consequence, /45\s*日/);
  assert.match(red.consequence, /上限是 2 个月/);
  assert.equal(at(analysis, '第二条', 'R1').filter(it => it.verdict === 'green').length, 0);
});

test('stress-02: 第3条试用期 65% 按 5200 / 6400 / 1200 展示差额', () => {
  const analysis = run();
  const red = pick(analysis, '第三条', 'R2', it => it.verdict === 'red', 'missing R2 red');
  assert.match(red.quote, /65\s*%/);
  assert.match(red.consequence, /5,200/);
  assert.match(red.consequence, /6,400/);
  assert.match(red.consequence, /1,200/);
});

test('stress-02: 第5条把 800 元“余额”识别为变相押金，且不污染第4条和第25条', () => {
  const analysis = run();
  const red = pick(analysis, '第五条', 'R11', it => it.verdict === 'red', 'missing R11 red');
  assert.match(red.ruleName, /变相收取押金/);
  assert.match(red.quote, /800/);
  assert.match(red.quote, /转给甲方/);
  const c5 = clause(analysis, '第五条');
  assert.equal(c5.body.slice(red.range.start, red.range.end), red.range.raw);
  assert.match(red.range.raw, /800/);
  assert.match(red.range.raw, /转给甲方/);
  assert.equal(at(analysis, '第四条', 'R11').length, 0);
  assert.equal(at(analysis, '第二十五条', 'R11').length, 0);
});

test('stress-02: 第7条法定假日 200% 被准确标为低于 300%', () => {
  const analysis = run();
  const red = pick(analysis, '第七条', 'R13', it => it.verdict === 'red', 'missing R13 red');
  assert.match(red.ruleName, /300%/);
  assert.match(red.quote, /200\s*%/);
  assert.doesNotMatch(red.ruleName, /一倍/);
});

test('stress-02: 第8条主管排班后以未签确认单免付加班费仍需提示', () => {
  const analysis = run();
  const item = pick(analysis, '第八条', 'R13', it => it.verdict !== 'green', 'missing R13 risk');
  assert.match(item.quote, /排班表|确认单/);
  assert.match(item.consequence, /排班表/);
  assert.match(item.consequence, /内部签字/);
});

test('stress-02: 第10条单方跨省调岗降薪独立报红，不被第9条协商条款掩盖', () => {
  const analysis = run();
  const red = pick(analysis, '第十条', 'R7', it => it.verdict === 'red', 'missing R7 red');
  assert.match(red.quote, /30\s*%/);
  assert.match(red.quote, /无须/);
  assert.match(red.consequence, /协商一致|第九条/);
  assert.equal(at(analysis, '第九条', 'R7').length, 0);
});

test('stress-02: 第11条“无须”和“无需”都报 R15，社保关系转移不能当作已参保绿线', () => {
  const analysis = run();
  const red = pick(analysis, '第十一条', 'R15', it => it.verdict === 'red', 'missing R15 red');
  assert.match(red.quote, /无须/);
  assert.match(red.ruleName, /社保|社会保险/);
  assert.equal(at(analysis, '第十一条').filter(it => it.verdict === 'green').length, 0);

  const variant = run(STRESS.replace('甲方无须为乙方缴纳社会保险费', '甲方无需为乙方缴纳社会保险费'));
  const variantRed = pick(variant, '第十一条', 'R15', it => it.verdict === 'red', 'missing R15 red for 无需');
  assert.match(variantRed.quote, /无需/);

  assert.equal(at(analysis, '第十八条', 'R15').length, 0);
  assert.equal(
    at(analysis, '第十八条').filter(it => it.ruleName === '社会保险' && it.verdict === 'green').length,
    0
  );
});

test('stress-02: 第12条商业意外险替代工伤保险保留黄色风险', () => {
  const analysis = run();
  const item = pick(analysis, '第十二条', 'R26', it => it.verdict === 'yellow', 'missing R26 yellow');
  assert.match(item.quote, /商业意外险/);
  assert.match(item.quote, /替代/);
  assert.match(item.consequence, /不能替代工伤保险/);
});

test('stress-02: 第13条识别工伤申报权限制，R27 不把“近亲属”当隐私证据', () => {
  const analysis = run();
  const item = pick(analysis, '第十三条', 'R26', it => it.verdict === 'red', 'missing R26 apply-limit red');
  assert.match(item.ruleName, /限制工伤认定/);
  assert.match(item.quote, /30\s*日/);
  assert.match(item.quote, /作废|不得/);
  assert.match(item.consequence, /1\s*年/);
  assert.equal(at(analysis, '第十三条', 'R27').length, 0);
});

test('stress-02: 删除第13条后 R27 仍落在第17条人脸条款，不串到其他条', () => {
  const without13 = cutBetween(STRESS, '第十三条 伤情报备', '第十四条 设备差错');
  const analysis = run(without13);
  const red = pick(analysis, '第十七条', 'R27', it => it.verdict === 'red', 'missing R27 at clause 17');
  assert.match(red.quote, /人脸模板/);
  assert.match(red.quote, /永久/);
  assert.equal(
    analysis.items.filter(it => it.ruleId === 'R27' && /工伤|申报|近亲属/.test(it.quote || '')).length,
    0
  );
});

test('stress-02: 第14条识别扣当月工资 60% 且不保最低工资', () => {
  const analysis = run();
  const red = pick(analysis, '第十四条', 'R14', it => it.verdict === 'red', 'missing R14 red');
  assert.match(red.ruleName, /高比例扣工资/);
  assert.match(red.quote, /60\s*%/);
  assert.match(red.quote, /最低工资/);
  assert.match(red.consequence, /20%/);
});

test('stress-02: 第15条年假清零且不支付未休报酬保持红线', () => {
  const analysis = run();
  const red = pick(analysis, '第十五条', 'R16', it => it.verdict === 'red', 'missing annual-leave red');
  assert.match(red.quote, /12月31日|清零/);
  assert.match(red.consequence, /300%/);
});

test('stress-02: 第16条分别识别 60 日“休养券”产假与怀孕触发预签辞职', () => {
  const analysis = run();
  const alias = pick(analysis, '第十六条', 'R25', it => it.verdict === 'yellow' && /产假/.test(it.ruleName), 'missing 60-day leave');
  assert.match(alias.quote, /休养券/);
  assert.match(alias.quote, /60/);
  assert.match(alias.quote, /产假/);

  const red = pick(analysis, '第十六条', 'R25', it => it.verdict === 'red', 'missing pregnancy resignation red');
  assert.match(red.quote, /怀孕/);
  assert.match(red.quote, /辞职/);
  assert.match(red.consequence, /预签辞职单|自愿离职/);
  assert.match(red.consequence, /不能直接当作.*真实自愿/);
  assert.equal(at(analysis, '第十六条').filter(it => it.verdict === 'green').length, 0);
});

test('stress-02: 第17条人脸模板永久保存、广告公司共享和未单独同意单独报红', () => {
  const analysis = run();
  const red = pick(analysis, '第十七条', 'R27', it => it.verdict === 'red', 'missing biometric red');
  assert.match(red.ruleName, /人脸/);
  assert.match(red.quote, /人脸模板/);
  assert.match(red.quote, /永久/);
  assert.match(red.quote, /广告公司/);
  assert.match(red.consequence, /单独同意/);
});

test('stress-02: 第19条分别识别 45 日等待批准与暂扣全部工资至下一年度', () => {
  const analysis = run();
  const wait = pick(analysis, '第十九条', 'R12', it => it.verdict !== 'green', 'missing R12 wait risk');
  assert.match(wait.quote, /45/);
  assert.match(wait.consequence, /批准/);

  const hold = pick(analysis, '第十九条', 'R18', it => it.verdict === 'red', 'missing R18 withhold red');
  assert.match(hold.quote, /暂扣/);
  assert.match(hold.quote, /下一年度|工资/);
});

test('stress-02: 第20条同一竞业义务分别给出 30 个月、全国范围和未接触保密事实', () => {
  const analysis = run();
  const term = pick(analysis, '第二十条', 'R6', it => it.verdict === 'red' && /超过两年/.test(it.ruleName), 'missing 30-month red');
  assert.match(term.quote, /30\s*个月/);
  assert.doesNotMatch(term.quote, /2000/);

  const scope = pick(analysis, '第二十条', 'R6', it => it.verdict === 'yellow' && /范围过宽/.test(it.ruleName), 'missing scope yellow');
  assert.match(scope.quote, /全国/);
  assert.match(scope.quote, /服务行业/);

  const person = pick(analysis, '第二十条', 'R6', it => it.verdict === 'gray' && /人员适用/.test(it.ruleName), 'missing personnel gray');
  assert.match(person.quote, /不接触/);
  assert.match(person.quote, /商业秘密/);

  assert.equal(
    at(analysis, '第二十条', 'R6').filter(it => /未约定补偿/.test(it.ruleName)).length,
    0
  );
});

test('stress-02: 第21条识别商业仲裁唯一终局并排除劳动仲裁', () => {
  const analysis = run();
  const red = pick(analysis, '第二十一条', 'R30', it => it.verdict === 'red', 'missing R30 red');
  assert.match(red.quote, /商业仲裁/);
  assert.match(red.consequence, /劳动.*仲裁|劳动仲裁/);
});

test('stress-02: 第22条把明确拒交电子合同副本报红，不停留在“方式不明”', () => {
  const analysis = run();
  const red = pick(analysis, '第二十二条', 'R29', it => it.verdict === 'red', 'missing R29 red');
  assert.match(red.ruleName, /不提供文本/);
  assert.match(red.quote, /不交付|副本|下载/);
  assert.notEqual(red.ruleName, '电子合同交付方式不明');
});

test('stress-02: 第24条普通入职手册不能支撑 6000 元换名离职款', () => {
  const analysis = run();
  const r4 = pick(analysis, '第二十四条', 'R4', it => it.verdict === 'red', 'missing renamed fixed payment red');
  assert.match(r4.ruleName, /换名|固定付款/);
  assert.match(r4.quote, /6000/);
  assert.match(r4.consequence, /6,?000/);

  const r5 = pick(analysis, '第二十四条', 'R5', it => it.verdict === 'gray', 'missing training-premise gray');
  assert.match(r5.ruleName, /缺少专项培训依据/);
  assert.match(r5.consequence, /不组织专项专业技术培训/);
  assert.equal(at(analysis, '第二十四条', 'R5').filter(it => it.verdict === 'red').length, 0);
});

test('stress-02: 第25条按每项费用自身频次合计 12,480，放款主体未知只留灰线', () => {
  const analysis = run();
  const yellow = pick(analysis, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing R9 yellow');
  assert.match(yellow.consequence, /12,480/);
  assert.match(yellow.consequence, /平台服务费 120 元（一次性）/);
  assert.match(yellow.consequence, /风险管理费 30 元（每期另收）/);
  assert.equal(yellow.loss, 480);

  const rate = pick(analysis, '第二十五条', 'R9', it => /利率上限需按借贷主体核对/.test(it.ruleName), 'missing lender/subject gray');
  assert.equal(rate.verdict, 'gray');
  assert.equal(at(analysis, '第二十五条', 'R9').filter(it => it.verdict === 'red').length, 0);
});

test('stress-02: 第25条费用频次变体分别计算，未知频次不报绝对总额', () => {
  const withoutRisk = run(STRESS.replace('，另每期另收风险管理费30元', ''));
  const a = pick(withoutRisk, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing fee-deleted R9');
  assert.match(a.consequence, /12,120/);

  const onceRisk = run(STRESS.replace('另每期另收风险管理费30元', '风险管理费一次性收取30元'));
  const b = pick(onceRisk, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing once-risk R9');
  assert.match(b.consequence, /12,150/);

  const includedRisk = run(STRESS.replace('另每期另收风险管理费30元', '风险管理费已包含在每期还款1000元内'));
  const c = pick(includedRisk, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing included-risk R9');
  assert.match(c.consequence, /12,120/);

  const unknownFreq = run(STRESS.replace('另每期另收风险管理费30元', '风险管理费30元'));
  const d = pick(unknownFreq, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing unknown-fee R9');
  assert.match(d.consequence, /不含频次未定/);
  const gray = pick(unknownFreq, '第二十五条', 'R9', it => it.ruleName === '服务费收取频次不明', 'missing unknown-frequency gray');
  assert.equal(gray.verdict, 'gray');
  assert.doesNotMatch(d.consequence, /按条款共还/);
});

test('stress-02: 第25条未知分期数时保留待核对，不报绝对全额', () => {
  const analysis = run(STRESS.replace('分12期，', ''));
  const yellow = pick(analysis, '第二十五条', 'R9', it => it.verdict === 'yellow', 'missing unknown-term R9');
  assert.doesNotMatch(yellow.consequence, /12,480/);
  assert.doesNotMatch(yellow.consequence, /12,000 元本金至少多/);
  assert.equal(at(analysis, '第二十五条', 'R9').filter(it => it.ruleName === '利率上限需按借贷主体核对').length, 0);
});

test('stress-02: 第7条改为法定 300% 后不再误报', () => {
  const lawful = run(STRESS.replace(
    '春节法定假日由甲方排班的，按正常工资200%结算，外加食堂券一张。系统将法定假日的班次归到周末档，无其他工资补发。',
    '春节法定假日由甲方安排工作，依法支付不低于工资300%的报酬。'
  ));
  assert.equal(at(lawful, '第七条', 'R13').length, 0);
});

test('stress-02: 正常对照第4、6、9、18、23条不被误报', () => {
  const analysis = run();
  assert.equal(at(analysis, '第四条', 'R11').length, 0);
  assert.equal(at(analysis, '第六条', 'R13').filter(it => it.verdict !== 'green').length, 0);
  assert.equal(at(analysis, '第九条', 'R7').length, 0);
  assert.equal(at(analysis, '第十八条').filter(it => it.verdict !== 'green').length, 0);
  assert.equal(at(analysis, '第二十三条').filter(it => it.verdict !== 'green').length, 0);
});

test('stress-02: 普通实际损失与有凭证的专项培训分摊不被扩大报红', () => {
  const actualLoss = analyzeContract(`劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试员工

第一条 解除
乙方违反法定程序提前解除劳动合同且给甲方造成实际损失的，按有证据证明的实际损失承担赔偿责任。`, { docType: 'labor', scope: 'excerpt' });
  assert.equal(actualLoss.items.filter(it => it.ruleId === 'R4' && it.verdict === 'red').length, 0);
  assert.ok(actualLoss.items.some(it => it.ruleId === 'R4' && it.verdict === 'gray'));

  const training = analyzeContract(`劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试员工

第一条 服务期
专项培训实际支出12000元，服务期24个月；乙方提前离职的，应支付服务期违约金6000元。`, { docType: 'labor', scope: 'excerpt' });
  assert.equal(training.items.filter(it => (it.ruleId === 'R4' || it.ruleId === 'R5') && it.verdict === 'red').length, 0);
});

function laborExcerpt(text) {
  return analyzeContract(`劳动合同书
甲方（用人单位）：测试公司
乙方（劳动者）：测试员工

${text}`, { docType: 'labor', scope: 'excerpt' });
}

function r11Reds(analysis) {
  return analysis.items.filter(it => it.ruleId === 'R11' && it.verdict === 'red');
}

test('stress-02: R11 区分当场归还、不会收取与明示收取，甲方收款口吻不误判', () => {
  const safe = laborExcerpt('第一条 身份核验\n入职后原件当场核验归还；甲方不会收取任何押金或保证金。');
  assert.equal(r11Reds(safe).length, 0);

  const renamed = laborExcerpt('第一条 门禁\n乙方须向甲方转账500元作为可退的排班权限周转款，未缴不予排班。');
  const renamedRed = r11Reds(renamed).find(it => /周转款/.test(it.quote) && /500/.test(it.quote));
  assert.ok(renamedRed);
  assert.equal(renamedRed.loss, 500);

  const mixed = laborExcerpt('第一条 证件与押金\n公司不得扣押身份证原件，当场核验归还；乙方需向甲方支付入职押金800元。');
  const mixedReds = r11Reds(mixed);
  assert.equal(mixedReds.length, 1);
  assert.equal(mixedReds[0].loss, 800);
  assert.match(mixedReds[0].quote, /向甲方支付入职押金800元/);

  const loan = analyzeContract(`培训分期协议
第一条 还款计划
借款本金12000元，分12期，每期还款1000元。平台服务费一次性收取120元。`, { docType: 'loan', scope: 'excerpt' });
  assert.equal(r11Reds(loan).length, 0);
});

function splitLoan(first, second) {
  return analyzeContract(`培训分期协议
甲方：测试培训机构
乙方：测试学员

第一条 还款计划
${first}

第二条 费用
${second}`, { docType: 'loan', scope: 'excerpt' });
}

test('stress-02: R9 合并紧邻的单独标题费用条款，合计 12,740', () => {
  const analysis = splitLoan('借款本金12000元，分12期，每期还款1000元。', '一次性平台服务费500元，每期另付管理费20元，均未计入每期还款。');
  const c1 = clause(analysis, '第一条');
  const yellow = analysis.items.find(it => it.clauseIndex === c1.index && it.ruleId === 'R9' && it.verdict === 'yellow' && /12,740/.test(it.consequence));
  assert.ok(yellow);
  assert.match(yellow.consequence, /平台服务费 500 元（一次性）/);
  assert.match(yellow.consequence, /管理费 20 元（每期另收）/);
  assert.equal(yellow.loss, 740);
});

test('stress-02: R9 紧邻费用频次未知时只给已列明小计，不给确定总额', () => {
  const analysis = splitLoan('借款本金12000元，分12期，每期还款1000元。', '另收平台服务费120元。未约定频次。');
  const yellow = pick(analysis, '第一条', 'R9', it => it.verdict === 'yellow', 'missing split-loan R9');
  assert.match(yellow.consequence, /12,000/);
  assert.match(yellow.consequence, /不含频次未定/);
  assert.doesNotMatch(yellow.consequence, /12,120/);
  assert.doesNotMatch(yellow.consequence, /按条款共还/);
  const gray = pick(analysis, '第二条', 'R9', it => it.ruleName === '服务费收取频次不明', 'missing split-loan unknown fee gray');
  assert.equal(gray.verdict, 'gray');
});

test('stress-02: R9 已包含的紧邻费用不重复加总，多个计划也不跨计划相加', () => {
  const included = splitLoan('借款本金12000元，分12期，每期还款1000元。', '平台服务费已包含在每期还款1000元内。');
  const includedYellow = pick(included, '第一条', 'R9', it => it.verdict === 'yellow', 'missing included-fee R9');
  assert.match(includedYellow.consequence, /12,000/);
  assert.doesNotMatch(includedYellow.consequence, /12,500/);

  const multiple = analyzeContract(`培训分期协议
第一条 方案一
借款本金12000元，分12期，每期还款1000元。
第二条 方案二
借款本金6000元，分6期，每期还款1000元。
第三条 费用
平台服务费500元，未说明归属哪一方案。`, { docType: 'loan', scope: 'excerpt' });
  assert.equal(multiple.items.filter(it => it.ruleId === 'R9' && /12,500|6,500/.test(it.consequence || '')).length, 0);
});

test('stress-02: R9 千分位逗号不截断费用金额，1,250 与 20×12 合计 13,490', () => {
  const analysis = splitLoan('借款本金12000元，分12期，每期还款1000元。', '一次性平台服务费1,250元，每期另付管理费20元。');
  const yellow = pick(analysis, '第一条', 'R9', it => it.verdict === 'yellow', 'missing thousand-separator R9');
  assert.match(yellow.consequence, /平台服务费 1,250 元（一次性）/);
  assert.match(yellow.consequence, /管理费 20 元（每期另收）/);
  assert.match(yellow.consequence, /13,490/);
  assert.equal(yellow.loss, 1490);
});

test('stress-02: R9 只合并借款费用，雇主直接支付给保险机构的保障费用不计入', () => {
  const employerPaid = splitLoan('借款本金12000元，分12期，每期还款1000元。', '雇主一次性承担商业保险费500元，由雇主直接向保险机构支付。');
  const employerYellow = pick(employerPaid, '第一条', 'R9', it => it.verdict === 'yellow', 'missing employer-insurance R9');
  assert.match(employerYellow.consequence, /12,000/);
  assert.doesNotMatch(employerYellow.consequence, /12,500/);
  assert.doesNotMatch(employerYellow.consequence, /保险费/);

  const borrowerPaid = splitLoan('借款本金12000元，分12期，每期还款1000元。', '借款人一次性承担商业保险费500元，由借款人直接向保险机构支付。');
  const borrowerYellow = pick(borrowerPaid, '第一条', 'R9', it => it.verdict === 'yellow', 'missing borrower-insurance R9');
  assert.match(borrowerYellow.consequence, /保险费 500 元（一次性）/);
  assert.match(borrowerYellow.consequence, /12,500/);
});

test('stress-02: R9 未知费用频次的灰线定位到费用条原文与 body 坐标', () => {
  const analysis = splitLoan('借款本金12000元，分12期，每期还款1000元。', '另收平台服务费120元。未约定频次。');
  const c2 = clause(analysis, '第二条');
  const gray = pick(analysis, '第二条', 'R9', it => it.ruleName === '服务费收取频次不明', 'missing unknown-frequency source');
  assert.equal(gray.clauseIndex, c2.index);
  assert.match(gray.quote, /平台服务费120元/);
  assert.equal(c2.body.slice(gray.range.start, gray.range.end), gray.range.raw);
  assert.match(gray.range.raw, /另收平台服务费120元/);
});