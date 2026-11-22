const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeContract, buildExportHTML, LAW } = require('../engine.js');

const STRESS = `青岚直播剪辑课培训分期及个人贷款协议
本协议为虚构测试样本。甲方为青岚技能培训中心（经营者），乙方为成年学员（消费者、借款人），丙方为云汀消费金融有限公司（本样本设定为持牌消费金融公司、贷款人），丁方为丙方的分期服务合作平台。拟签订日期：2026年11月21日。第一条至第六条、第十三条至第十八条、第十九条和第二十条为各方拟使用的预拟条款。

第一条 课程和交付
甲方向乙方预收课程价款18,000元，在六个月内分次提供30节有老师现场答疑的直播课。乙方首次购买此类服务，此前未从甲方或其他经营者获得过相同服务，也未试听。全部课程签署时尚未交付。

第二条 开课凭证
丁方生成学习账号即视为30节课全部交付。即使乙方在付款后第三日尚未开课、未登录而提出解除，预付款也全部转成已使用的席位，甲方概不退还。

第三条 课程调整
甲方可以单方将30节直播课改为10段录播，或上调课程价款。乙方不同意的，可停用账号，但不得解除合同或要求返还余额。

第四条 网点变更
甲方可以关闭原服务点并改由外省合作方提供服务，余款不退。双方确认即使转移后乙方继续接受服务明显不便，也只能转往新点或放弃剩余课时。

第五条 退课结算
如甲方违约而停课，已上课程按虚列原价每节1,200元冲抵，再扣甲方销售人员的预付款提成2,000元。余款不足扣减的，乙方另行补足。

第六条 责任限制
线下补课中因甲方的设备问题造成乙方人身伤害，甲方均不赔偿。因甲方故意或重大过失损坏乙方自带电脑，甲方也不承担赔偿责任。

第七条 签约和本金
甲方已在签署前交付完整培训合同。丙方按乙方指示将18,000元借款本金全额付给甲方，乙方不用另付课程首付。课程价款与贷款本金指同一笔资金。

第八条 标准还款安排
借款本金18,000元，分18期，每期还款1,000元，自放款后一个月开始按月偿还。该金额已含平台服务费每期30元，已含的费用不另收。

第九条 另列正常履约费用
同一借款约定，一次性技术服务费650元由丁方在放款当日向乙方收取，每期另付风险管理费25元由丁方向乙方收取。这两笔均未计入第八条的每期还款。甲方自行负担教师意外保险费900元，由甲方直接付给保险机构。

第十条 签约显示
支付页只显示“每月1,000元、利息0元”。乙方签署贷款前只能看到月供，签署后才能查看综合融资成本明示表；该表不列各项费用的收取主体，也不显示正常履约的年化综合融资成本。

第十一条 表外加收
丙方或丁方可在已显示的费用之外，按内部清单新增任何借款履约服务费，收费金额与次数由丁方扣款后通知乙方。

第十二条 提前还款
乙方可以提前返还借款。办理前丙方提供书面结清账单，列明已付和未付本金，利息按实际借款期间计算，双方约定不另收费用。

第十三条 延期成本
逾期按尚欠本金每日收取0.8%的罚息，并每次加收固定违约金300元；罚息和固定违约金同时计算。即使只是一期迟付，丁方也按全部尚欠本金计提。

第十四条 退课和代偿
如甲方停课或退款获准，甲方仅给乙方发课程补偿券，从不向丙方返还预付款或协助结清。丙方仍按原计划划扣。乙方收到课程补偿券，即确认两类争议均已解决并放弃其他退款请求。

第十五条 上课验证
已经部署的一次性短信验证码能达到同等身份核验效果。乙方仍必须录入人脸模板才能上课，签培训合同即授权，不能单独选择；模板由丁方长期保留以便以后推广课程。

第十六条 合作营销
为了向乙方推销其他课程，甲方可将姓名、手机号、学习记录交给自行决定营销用途的合作商使用。合作商名称和联系方式不告知乙方，签署主合同即视为同意，没有单独授权。

第十七条 争议和投诉
乙方只能赴距常住地两千公里的甲方指定地点进行维护权利的线下申诉，不允许远程、邮寄或委托，须自行承担差旅。此前不得向行政机关投诉或向有管辖权的法院起诉。

第十八条 单方改价通知
丙方将成本条目或收取标准贴入仅内部可见的业务后台即视为通知乙方，乙方付款时仍看不到调整后的息费项目。

第十九条 正常通知
甲方仅使用乙方自愿提供的手机号发送本课程上课提醒，并允许乙方随时停止短信提醒或改在站内接收。

第二十条 付款凭证
乙方有权核对收款人、已付金额和剩余课时。甲方按实际收款出具票据，丙方提供还款及结清记录。

附件说明
上述文本为全部拟签署条款。未填写现实联系方式，所有主体、账号及交易均为虚构。`;

const OPTS = { docType: 'loan', scope: 'full' };

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

test('stress-03: 第八至九条按付款方逐笔合计 19,100，教师保险与已含费用不重复计', () => {
  const analysis = run();
  const yellow = pick(analysis, '第八条', 'R9', it => it.verdict === 'yellow' && /19,100/.test(it.consequence));
  assert.match(yellow.consequence, /比 18,000 元本金至少多 1,100 元/);
  assert.match(yellow.consequence, /技术服务费 650 元（一次性）/);
  assert.match(yellow.consequence, /风险管理费 25 元（每期另收）/);
  assert.doesNotMatch(yellow.consequence, /保险费/);
  assert.doesNotMatch(yellow.consequence, /平台服务费 30 元/);
  assert.equal(yellow.loss, 1100);
  assert.match(yellow.basis.law, /个人贷款业务明示综合融资成本规定/);
  assert.equal(
    analysis.items.filter(it => it.ruleId === 'R9' && /保险/.test(`${it.ruleName}${it.consequence}`)).length,
    0
  );
});

test('stress-03: 去掉保险句、去掉“同一借款约定”或改为“按第八条约定”都保持 19,100', () => {
  const variants = [
    STRESS.replace('。甲方自行负担教师意外保险费900元，由甲方直接付给保险机构。', '。'),
    STRESS.replace('同一借款约定，一次性技术服务费650元', '一次性技术服务费650元'),
    STRESS.replace('同一借款约定，一次性技术服务费650元', '按第八条约定，一次性技术服务费650元')
  ];
  variants.forEach(text => {
    const analysis = run(text);
    const yellow = analysis.items.find(it => it.ruleId === 'R9' && /19,100/.test(it.consequence || ''));
    assert.ok(yellow, 'missing 19,100 after variant');
    assert.equal(yellow.loss, 1100);
    assert.doesNotMatch(yellow.consequence, /保险费/);
  });
});

test('stress-03: 持牌贷款第十条分别提示签后才可看表、缺收费主体和缺年化成本', () => {
  const analysis = run();
  const items = at(analysis, '第十条', 'R31');
  assert.ok(items.length >= 3, `expected 3 R31 items, got ${items.length}`);
  assert.ok(items.some(it => /签约后|签前|签后才/.test(it.ruleName) && /月供/.test(it.consequence)));
  assert.ok(items.some(it => /收取主体/.test(it.ruleName)));
  assert.ok(items.some(it => /年化/.test(it.ruleName)));
  const table = items.find(it => /签约后|签前|签后才/.test(it.ruleName));
  assert.match(table.quote, /月供|每月/);
  assert.match(table.consequence, /零利息|利息0元/);
  assert.equal(at(analysis, '第十条', 'R9').length, 0);
  assert.ok(!analysis.pending.some(p => /LPR/.test(p)));
});

test('stress-03: 第十一条表外收费、第十八条内部后台通知分别出卡', () => {
  const analysis = run();
  const extra = pick(analysis, '第十一条', 'R32', it => it.verdict === 'red');
  assert.match(extra.quote, /已显示的费用之外|新增/);
  assert.match(extra.consequence, /扣款后|先扣后通知|金额和次数/);
  assert.match(extra.basis.law, /个人贷款业务明示综合融资成本规定/);

  const notice = pick(analysis, '第十八条', 'R32', it => it.verdict !== 'green');
  assert.match(notice.quote, /内部|后台/);
  assert.match(notice.consequence, /不能代替|不构成/);
});

test('stress-03: 第二条区分首次购买七日退款，账号生成不等于开课交付', () => {
  const analysis = run();
  const red = pick(analysis, '第二条', 'R33', it => it.verdict === 'red');
  assert.match(red.quote, /付款后第三日|未开课/);
  assert.match(red.consequence, /七日内/);
  assert.match(red.consequence, /首次购买/);
  assert.match(red.consequence, /账号生成不能代替/);
  assert.doesNotMatch(red.consequence, /开课后/);
  assert.equal(
    at(analysis, '第二条').filter(it => /开课后不退费/.test(it.consequence || '')).length,
    0
  );
});

test('stress-03: 第三条单方直播改录播或涨价并禁止解除退款', () => {
  const analysis = run();
  const red = pick(analysis, '第三条', 'R33', it => it.verdict === 'red');
  assert.match(red.quote, /录播|上调|价款/);
  assert.match(red.consequence, /单方变更|实质内容/);
  assert.match(red.consequence, /解除|退款/);
});

test('stress-03: 第四条外省迁址或转第三方明显不便仍拒绝退余款', () => {
  const analysis = run();
  const red = pick(analysis, '第四条', 'R33', it => it.verdict === 'red');
  assert.match(red.quote, /外省|服务点|余款不退/);
  assert.match(red.consequence, /明显不便/);
  assert.match(red.consequence, /未消费|余额/);
  assert.doesNotMatch(red.consequence, /开课后/);
});

test('stress-03: 第五条分别识别虚列原价、销售提成和反向补足', () => {
  const analysis = run();
  const items = at(analysis, '第五条', 'R34');
  assert.ok(items.some(it => /虚列原价/.test(it.ruleName)));
  assert.ok(items.some(it => /提成/.test(it.ruleName)));
  assert.ok(items.some(it => /补足/.test(it.ruleName)));
  const price = items.find(it => /虚列原价/.test(it.ruleName));
  assert.match(price.quote, /1,200/);
  assert.match(price.consequence, /实际|优惠价/);
});

test('stress-03: 第六条人身伤害与故意或重大过失财产损失免责均无效', () => {
  const analysis = run();
  const items = at(analysis, '第六条', 'R35');
  assert.ok(items.length >= 2, `expected 2 R35 items, got ${items.length}`);
  assert.ok(items.some(it => /人身伤害/.test(it.ruleName) && /无效/.test(it.consequence)));
  assert.ok(items.some(it => /故意|重大过失/.test(it.ruleName) && /无效/.test(it.consequence)));
  assert.ok(items.every(it => /民法典/.test(it.basis.law)));
});

test('stress-03: 第十三条同时提示日 0.8%、固定 300 和全部尚欠本金计提', () => {
  const analysis = run();
  const item = pick(analysis, '第十三条', 'R9', it => /逾期违约金/.test(it.ruleName));
  assert.match(item.quote, /0\.8/);
  assert.match(item.consequence, /300/);
  assert.match(item.consequence, /全部尚欠本金/);
  assert.match(item.consequence, /30 天就是 24%/);
  assert.match(item.basis.law, /民法典/);
});

test('stress-03: 第十四条课程券不替代退款，继续划扣与放弃退款分别提示', () => {
  const analysis = run();
  const items = at(analysis, '第十四条', 'R34');
  const voucher = items.find(it => /课程券/.test(it.ruleName));
  assert.ok(voucher);
  assert.match(voucher.consequence, /划扣/);
  assert.match(voucher.consequence, /贷款结清|结清/);
  assert.match(voucher.consequence, /不能.*自动停止扣款/);
  const waiver = items.find(it => /放弃/.test(it.ruleName));
  assert.ok(waiver);
  assert.match(waiver.consequence, /限制.*主要权利|贷款债务/);
});

test('stress-03: 第十五条强制人脸与长期留存推广分别出卡', () => {
  const analysis = run();
  const items = at(analysis, '第十五条', 'R36');
  assert.ok(items.length >= 2, `expected 2 R36 items, got ${items.length}`);
  assert.ok(items.some(it => /人脸/.test(it.ruleName) && /短信验证码/.test(it.consequence)));
  assert.ok(items.some(it => /长期留存|推广/.test(it.ruleName)));
  assert.ok(items.some(it => /单独同意/.test(it.consequence)));
  assert.ok(items.some(it => /人脸识别/.test(it.basis.law)));
});

test('stress-03: 第十六条营销共享未披露接收方且缺单独同意', () => {
  const analysis = run();
  const item = pick(analysis, '第十六条', 'R36', it => it.verdict === 'red');
  assert.match(item.quote, /合作商|学习记录/);
  assert.match(item.consequence, /接收方|名称|联系方式/);
  assert.match(item.consequence, /单独同意/);
  assert.match(item.basis.law, /个人信息保护法/);
});

test('stress-03: 第十七条异地申诉前置并限制投诉起诉，不套劳动仲裁', () => {
  const analysis = run();
  const item = pick(analysis, '第十七条', 'R35', it => it.verdict !== 'green');
  assert.match(item.quote, /两千公里|指定地点/);
  assert.match(item.consequence, /投诉|起诉/);
  assert.doesNotMatch(item.ruleName, /劳动仲裁/);
  assert.match(item.basis.law, /预付式消费/);
});

test('stress-03: 正常对照第 1、7、12、19、20 条不被误报', () => {
  const analysis = run();
  ['第一条', '第七条', '第十二条', '第十九条', '第二十条'].forEach(heading => {
    const risks = at(analysis, heading).filter(it => it.verdict !== 'green');
    assert.equal(risks.length, 0, `${heading} should stay clean: ${risks.map(it => it.ruleName).join(' / ')}`);
  });
});

test('stress-03: 导出报告包含 19,100 与新增风险，不再出现错误总额', () => {
  const analysis = run();
  const html = buildExportHTML(analysis);
  assert.match(html, /19,100/);
  assert.doesNotMatch(html, /18 期共 18,000/);
  assert.match(html, /签约后才能查看综合融资成本表/);
  assert.match(html, /账号生成视为交付并拒绝退款/);
  assert.match(html, /付款后七日内可请求返还预付款/);
});

test('stress-03: 预付式消费解释条文编号与退款规则对应', () => {
  assert.equal(LAW.PREPAY9.article, '第九条');
  assert.match(LAW.PREPAY9.text, /格式条款/);
  assert.match(LAW.PREPAY9.text, /解除|退款/);
  assert.doesNotMatch(LAW.PREPAY9.text, /七日内/);

  assert.equal(LAW.PREPAY12.article, '第十二条');
  assert.match(LAW.PREPAY12.text, /未经消费者同意/);
  assert.match(LAW.PREPAY12.text, /按照原约定履行|承担违约责任/);
  assert.doesNotMatch(LAW.PREPAY12.text, /解除合同并返还预付款/);

  assert.equal(LAW.PREPAY13.article, '第十三条');
  assert.match(LAW.PREPAY13.text, /明显不便/);
  assert.match(LAW.PREPAY13.text, /未经消费者同意/);

  assert.equal(LAW.PREPAY14.article, '第十四条');
  assert.match(LAW.PREPAY14.text, /付款之日起七日内/);
  assert.match(LAW.PREPAY14.text, /除外/);
  assert.match(LAW.PREPAY14.text, /更有利于/);

  assert.equal(LAW.PREPAY15.article, '第十五条');
  assert.match(LAW.PREPAY15.text, /合理费用/);
  assert.match(LAW.PREPAY15.text, /员工预付款提成/);

  assert.equal(LAW.PREPAY18.article, '第十八条');
  assert.match(LAW.PREPAY18.text, /优惠价|优惠比例/);
  assert.doesNotMatch(LAW.PREPAY18.text, /格式条款/);
});

test('stress-03: 金融明示规则按第二、三、四项分别引用', () => {
  assert.equal(LAW.IR26_2.article, '第二条');
  assert.match(LAW.IR26_2.text, /签署贷款合同前/);
  assert.match(LAW.IR26_2.text, /2026年8月1日/);
  assert.equal(LAW.IR26_3.article, '第三条');
  assert.match(LAW.IR26_3.text, /不得.*明示的费用项目之外/);
  assert.equal(LAW.IR26_4.article, '第四条');
  assert.match(LAW.IR26_4.text, /通知/);

  const analysis = run();
  const yellow = pick(analysis, '第八条', 'R9', it => it.verdict === 'yellow' && /19,100/.test(it.consequence));
  assert.equal(yellow.basis.article, '第二条');
  const r31 = at(analysis, '第十条', 'R31');
  assert.ok(r31.length >= 3);
  assert.ok(r31.every(it => it.basis.article === '第二条'));
  const extra = pick(analysis, '第十一条', 'R32', it => it.verdict === 'red');
  assert.equal(extra.basis.article, '第三条');
  const notice = pick(analysis, '第十八条', 'R32', it => it.verdict !== 'green');
  assert.equal(notice.basis.article, '第四条');
});

test('stress-03: 七日退款按第七/八/十日和历史购买事实分层', () => {
  const base = run();
  const seven = pick(base, '第二条', 'R33', it => it.ruleName.includes('七日内可请求'));
  assert.equal(seven.verdict, 'red');
  assert.equal(seven.basis.article, '第十四条');
  assert.match(seven.consequence, /首次购买/);
  assert.match(seven.consequence, /不以“未开课”为前提/);
  assert.doesNotMatch(seven.consequence, /开课后/);
  const c2 = clause(base, '第二条');
  assert.equal(c2.body.slice(seven.range.start, seven.range.end), seven.range.raw);

  const virtual = pick(base, '第二条', 'R33', it => it.ruleName.includes('账号生成'));
  assert.equal(virtual.verdict, 'red');
  assert.equal(virtual.basis.article, '第九条');
  assert.equal(c2.body.slice(virtual.range.start, virtual.range.end), virtual.range.raw);

  const day7 = run(STRESS.replace('付款后第三日', '付款后第七日'));
  assert.ok(pick(day7, '第二条', 'R33', it => it.ruleName.includes('七日内可请求') && it.verdict === 'red'));

  for(const day of ['第八日', '第十日']){
    const expired = run(STRESS.replace('付款后第三日', `付款后${day}`));
    const card = pick(expired, '第二条', 'R33', it => it.ruleName.includes('超过七日'));
    assert.notEqual(card.verdict, 'red', `${day} should not claim a successful seven-day request`);
    assert.match(card.consequence, /不能.*第十四条/);
    assert.ok(!at(expired, '第二条', 'R33').some(it => it.verdict === 'red' && it.ruleName.includes('七日内可请求')));
  }

  const prior = run(STRESS.replace('乙方首次购买此类服务，此前未从甲方或其他经营者获得过相同服务，也未试听。', '乙方此前已从其他经营者获得过相同服务，也未试听。'));
  const exception = pick(prior, '第二条', 'R33', it => it.ruleName.includes('法定例外'));
  assert.notEqual(exception.verdict, 'red');
  assert.match(exception.consequence, /法定例外/);
  assert.ok(!at(prior, '第二条', 'R33').some(it => it.verdict === 'red' && it.ruleName.includes('七日内可请求')));
  assert.ok(at(prior, '第二条', 'R33').some(it => it.ruleName.includes('账号生成') && it.verdict === 'red'));

  const unknown = run(STRESS.replace('付款后第三日', '付款后'));
  const unknownCard = pick(unknown, '第二条', 'R33', it => it.ruleName.includes('时间'));
  assert.notEqual(unknownCard.verdict, 'red');
  assert.match(unknownCard.consequence, /若在付款后七日内/);

  const favorable = run(STRESS.replace('预付款也全部转成已使用的席位，甲方概不退还。', '但乙方在付款后七日内可全额退款，甲方应在七日内返还预付款。'));
  assert.equal(at(favorable, '第二条', 'R33').length, 0);
});

test('stress-03: 变更、迁址、退款折算和课程券引用对应条文', () => {
  const analysis = run();
  const change = pick(analysis, '第三条', 'R33', it => it.verdict === 'red');
  assert.equal(change.basis.article, '第十二条');
  assert.match(change.consequence, /按原约定履行|承担违约责任/);
  assert.doesNotMatch(change.consequence, /一律解除/);

  const move = pick(analysis, '第四条', 'R33', it => it.verdict === 'red');
  assert.equal(move.basis.article, '第十三条');

  const price = at(analysis, '第五条', 'R34').find(it => /虚列原价/.test(it.ruleName));
  assert.ok(price);
  assert.equal(price.basis.article, '第十八条');

  const voucherItems = at(analysis, '第十四条', 'R34');
  assert.ok(voucherItems.length >= 2);
  assert.ok(voucherItems.every(it => it.basis.article === '第九条'));
});

function addClauseAfterBody(text, clauseText) {
  assert.ok(text.includes('附件说明'), 'sample must contain 附件说明');
  return text.replace('附件说明', `${clauseText}\n\n附件说明`);
}

test('stress-03: 跨条更有利退款明确优先时撤掉七日拒退红线并保留账号交付风险', () => {
  const text = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先适用。`);
  const analysis = run(text);
  const c2 = at(analysis, '第二条', 'R33');
  assert.equal(c2.filter(it => it.verdict === 'red' && /七日/.test(it.ruleName)).length, 0);
  assert.ok(c2.some(it => it.verdict === 'red' && /账号生成/.test(it.ruleName)));
  assert.equal(c2.filter(it => /冲突/.test(it.ruleName)).length, 0);

  const favourite = at(analysis, '第二十一条', 'R33');
  const cover = favourite.find(it => it.verdict === 'green' && /优先适用/.test(it.ruleName));
  assert.ok(cover);
  assert.equal(cover.clauseIndex, clause(analysis, '第二十一条').index);
  assert.match(cover.consequence, /同一笔预付款/);
  assert.match(cover.consequence, /优先/);
});

test('stress-03: 同一笔预付款但优先关系不明时保留红线并提示核对两条原文', () => {
  const text = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
学员自付款之日起十五日内可无理由申请全额退还预付款本金。`);
  const analysis = run(text);
  const c2 = at(analysis, '第二条', 'R33');
  assert.ok(c2.some(it => it.verdict === 'red' && /七日内可请求/.test(it.ruleName)));
  assert.ok(c2.some(it => it.verdict === 'red' && /账号生成/.test(it.ruleName)));
  const conflict = c2.find(it => it.verdict === 'gray' && /冲突/.test(it.ruleName));
  assert.ok(conflict);
  assert.match(conflict.consequence, /未明确/);
  assert.match(conflict.consequence, /核对两条原文/);
  assert.equal(
    at(analysis, '第二十一条', 'R33').filter(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)).length,
    0
  );
});

test('stress-03: 不同退款对象的更有利承诺不能抵消七日拒退风险', () => {
  const text = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还教材费，本条优先适用。`);
  const analysis = run(text);
  const c2 = at(analysis, '第二条', 'R33');
  assert.ok(c2.some(it => it.verdict === 'red' && /七日内可请求/.test(it.ruleName)));
  assert.ok(c2.some(it => it.verdict === 'red' && /账号生成/.test(it.ruleName)));
  assert.equal(c2.filter(it => /冲突|优先适用/.test(it.ruleName)).length, 0);
  assert.equal(at(analysis, '第二十一条', 'R33').length, 0);

  const otherCourseText = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还另一门课的学费，本条优先适用。`);
  const otherCourse = run(otherCourseText);
  assert.ok(at(otherCourse, '第二条', 'R33').some(it => it.verdict === 'red' && /七日内可请求/.test(it.ruleName)));
  assert.equal(at(otherCourse, '第二十一条', 'R33').length, 0);
});

test('stress-03: 优先约定仅指向其他条款时不能覆盖第二条七日拒退红线', () => {
  const text = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条仅优先于第六条。`);
  const analysis = run(text);
  const c2 = at(analysis, '第二条', 'R33');
  assert.ok(c2.some(it => it.verdict === 'red' && /七日内可请求/.test(it.ruleName)));
  assert.ok(c2.some(it => it.verdict === 'red' && /账号生成/.test(it.ruleName)));
  assert.equal(
    analysis.items.filter(it => it.ruleId === 'R33' && it.verdict === 'green' && /优先适用/.test(it.ruleName)).length,
    0
  );
});

test('stress-03: 明确不优先于拒退条款时保留红线且不出绿色覆盖', () => {
  const text = addClauseAfterBody(STRESS, `第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条不优先于第二条，第二条的拒退约定继续适用。`);
  const analysis = run(text);
  const c2 = at(analysis, '第二条', 'R33');
  assert.ok(c2.some(it => it.verdict === 'red' && /七日内可请求/.test(it.ruleName)));
  assert.ok(c2.some(it => it.verdict === 'red' && /账号生成/.test(it.ruleName)));
  assert.equal(
    analysis.items.filter(it => it.ruleId === 'R33' && it.verdict === 'green' && /优先适用/.test(it.ruleName)).length,
    0
  );
  assert.ok(!c2.some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));
});

function runExtra(extra) {
  return run(STRESS.replace('附件说明', `${extra}\n\n附件说明`));
}
function sevenDayRed(analysis, heading = '第二条') {
  return at(analysis, heading, 'R33').filter(it => it.verdict === 'red' && /七日/.test(it.ruleName));
}
function crossConflicts(analysis, heading = '第二条') {
  return at(analysis, heading, 'R33').filter(it => it.verdict === 'gray' && /冲突/.test(it.ruleName));
}

test('stress-03: R33 阿拉伯条号、括号限定和原条号都能唯一定位拒退条款', () => {
  const arabic = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于第2条（开课凭证）。`);
  assert.equal(sevenDayRed(arabic).length, 0);
  assert.ok(at(arabic, '第二条', 'R33').some(it => it.verdict === 'green' && /已被更有利/.test(it.ruleName)));
  const arabicGreen = at(arabic, '第二十一条', 'R33').find(it => it.verdict === 'green' && /优先适用/.test(it.ruleName));
  assert.ok(arabicGreen);
  assert.match(arabicGreen.consequence, /十五日内/);
  assert.match(arabicGreen.consequence, /概不退还/);

  const original = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于原第二条。`);
  assert.equal(sevenDayRed(original).length, 0);
  assert.ok(at(original, '第二十一条', 'R33').some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));
});

test('stress-03: R33 识别“该条”“前述拒退条款”并沿多段优先链确认覆盖', () => {
  const chain = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金。本条优先于第六条，该条优先于第二条。`);
  assert.equal(sevenDayRed(chain).length, 0);
  assert.ok(at(chain, '第二十一条', 'R33').some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));
  assert.equal(crossConflicts(chain).length, 0);

  const byPrevious = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于前述拒退条款。`);
  assert.equal(sevenDayRed(byPrevious).length, 0);
  assert.ok(at(byPrevious, '第二十一条', 'R33').some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));
});

test('stress-03: R33 重复条号按正文与附件区分，正文歧义时要求人工核对', () => {
  const dup = `附件一 第二条 附件退款
附件一约定预付款概不退还。`;
  const plain = runExtra(`${dup}

第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于第二条。`);
  assert.ok(plain.clauses.some(cl => /附件一 第二条/.test(cl.heading || '')));
  assert.equal(sevenDayRed(plain).length, 1);
  assert.ok(crossConflicts(plain).some(it => /候选|重复条号/.test(it.consequence)));
  assert.ok(at(plain, '第二十一条', 'R33').some(it => it.verdict === 'gray' && /冲突/.test(it.ruleName)));
  assert.equal(at(plain, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);

  const original = runExtra(`${dup}

第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于原第二条。`);
  assert.equal(sevenDayRed(original).length, 0);
  assert.ok(at(original, '第二十一条', 'R33').some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));

  const attachment = runExtra(`${dup}

第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于附件一第二条。`);
  assert.equal(sevenDayRed(attachment).length, 1);
  assert.equal(at(attachment, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);
});

test('stress-03: R33 两门课程都写学费且金额相同，仍不能证明是同一笔付款', () => {
  const analysis = runExtra(`第二十一条 商务英语班
商务英语班学费18,000元，另行收取。

第二十二条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还18,000元学费，本条优先适用。`);
  assert.equal(sevenDayRed(analysis).length, 1);
  const conflict = crossConflicts(analysis)[0];
  assert.ok(conflict);
  assert.match(conflict.consequence, /多门课程|同一笔付款/);
  assert.ok(at(analysis, '第二十二条', 'R33').some(it => it.verdict === 'gray' && /冲突/.test(it.ruleName)));
  assert.equal(analysis.items.filter(it => it.ruleId === 'R33' && it.verdict === 'green').length, 0);
});

test('stress-03: R33 反向优先、仅费用范围优先和循环优先都保留七日红线', () => {
  const reverse = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，第二条优先于本条。`);
  assert.equal(sevenDayRed(reverse).length, 1);
  assert.equal(at(reverse, '第二十一条', 'R33').length, 0);

  const feeOnly = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条仅对教材费优先于第二条。`);
  assert.equal(sevenDayRed(feeOnly).length, 1);
  assert.ok(crossConflicts(feeOnly).some(it => /教材费|费用项目/.test(it.consequence)));
  assert.equal(at(feeOnly, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);

  const cycle = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于第六条；第六条优先于本条。`);
  assert.equal(sevenDayRed(cycle).length, 1);
  assert.ok(crossConflicts(cycle).some(it => /循环|互相优先/.test(it.consequence)));
  assert.equal(at(cycle, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);
});

test('stress-03: R33 部分退款、按课时折算和未开课限制提示人工核对', () => {
  const variants = [
    [`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还剩余预付款本金，本条优先适用。`, /剩余|部分/],
    [`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，但须未开课，本条优先适用。`, /未开课|上课状态/],
    [`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可按实际课时折算退还预付款本金，本条优先适用。`, /课时|折算|部分/]
  ];
  variants.forEach(([extra, re]) => {
    const analysis = runExtra(extra);
    assert.equal(sevenDayRed(analysis).length, 1);
    const conflict = crossConflicts(analysis)[0];
    assert.ok(conflict, 'expected a conflict prompt');
    assert.match(conflict.consequence, re);
    assert.equal(at(analysis, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);
  });

  const unrestricted = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，无论是否开课均可申请，本条优先适用。`);
  assert.equal(sevenDayRed(unrestricted).length, 0);
  assert.ok(at(unrestricted, '第二十一条', 'R33').some(it => it.verdict === 'green' && /优先适用/.test(it.ruleName)));
});

test('stress-03: R33 未编号摘录、缺失附件和金额不一致都要求人工判断', () => {
  const unnumbered = `课程培训协议
乙方生成学习账号即视为全部课程交付，付款后第三日尚未开课，预付款概不退还。

补充退款承诺
学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先适用。`;
  const loose = analyzeContract(unnumbered, OPTS);
  assert.equal(loose.items.filter(it => it.ruleId === 'R33' && it.verdict === 'red' && /七日/.test(it.ruleName)).length, 1);
  const looseConflict = loose.items.find(it => it.ruleId === 'R33' && it.verdict === 'gray' && /冲突/.test(it.ruleName));
  assert.ok(looseConflict);
  assert.match(looseConflict.consequence, /未编号|附件/);
  assert.equal(loose.items.filter(it => it.ruleId === 'R33' && it.verdict === 'green').length, 0);

  const missingAttachment = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金，本条优先于附件二第二条。`);
  assert.equal(sevenDayRed(missingAttachment).length, 1);
  assert.ok(crossConflicts(missingAttachment).some(it => /附件二|可定位/.test(it.consequence)));

  const amount = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还12,000元学费，本条优先适用。`);
  assert.equal(sevenDayRed(amount).length, 1);
  assert.ok(crossConflicts(amount).some(it => /12,000|12000/.test(it.consequence)));
  assert.equal(at(amount, '第二十一条', 'R33').filter(it => it.verdict === 'green').length, 0);
});

test('stress-03: R33 绿色覆盖和灰色冲突卡在页面数据与导出中同时给出两条原文', () => {
  const covered = runExtra(`第二十一条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还预付款本金。本条优先于第六条，该条优先于第二条。`);
  const coverAtPromise = at(covered, '第二十一条', 'R33').find(it => it.verdict === 'green' && /优先适用/.test(it.ruleName));
  const coverAtRefusal = at(covered, '第二条', 'R33').find(it => it.verdict === 'green' && /已被更有利/.test(it.ruleName));
  assert.ok(coverAtPromise && coverAtRefusal);
  assert.match(coverAtPromise.consequence, /第二条/);
  assert.match(coverAtPromise.consequence, /十五日内/);
  assert.match(coverAtPromise.consequence, /概不退还/);
  assert.match(coverAtRefusal.consequence, /第二十一条/);
  const coveredHTML = buildExportHTML(covered);
  assert.match(coveredHTML, /拒退条款已被更有利退款条款覆盖/);
  assert.match(coveredHTML, /十五日内/);
  assert.match(coveredHTML, /概不退还/);

  const uncertain = runExtra(`第二十一条 商务英语班
商务英语班学费18,000元，另行收取。

第二十二条 更有利退款条款
即使第二条另有约定，学员自付款之日起十五日内可无理由申请全额退还18,000元学费，本条优先适用。`);
  const conflictAtRefusal = crossConflicts(uncertain)[0];
  const conflictAtPromise = at(uncertain, '第二十二条', 'R33').find(it => it.verdict === 'gray' && /冲突/.test(it.ruleName));
  assert.ok(conflictAtRefusal && conflictAtPromise);
  assert.match(conflictAtRefusal.consequence, /第二十二条/);
  assert.match(conflictAtPromise.consequence, /第二条/);
  const uncertainHTML = buildExportHTML(uncertain);
  assert.match(uncertainHTML, /多门课程|同一笔付款/);
  assert.match(uncertainHTML, /第二十二条/);
  assert.match(uncertainHTML, /18,000/);
  assert.match(uncertainHTML, /概不退还/);
});