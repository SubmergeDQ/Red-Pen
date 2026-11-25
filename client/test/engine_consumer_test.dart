import 'package:flutter_test/flutter_test.dart';
import 'package:red_pen/engine/engine.dart';

const _prepayRefuse = '''课程服务协议
甲方（培训机构）：某教育公司
乙方（学员）：张三

第一条 课程与费用
乙方购买“全栈开发就业班”课程，课程费 19800 元，于签约时一次性支付。

第二条 退款
乙方开课后申请退款的，已缴纳费用不予退还。''';

const _prepayAccount = '''培训服务协议
甲方（培训机构）：某教育公司
乙方（学员）：李四

第一条 课程费用
课程费 12800 元，乙方于签约时一次性支付。

第二条 账号与退款
甲方开通学习账号即视为全部课程交付。乙方付款后 3 日内提出解除的，已缴费用不予退还。''';

const _prepayCover = '''课程购买协议
甲方（培训机构）：某教育公司
乙方（学员）：王五

第一条 课程费用
课程费 16800 元，乙方于签约时一次性支付。

第二条 账号与退款
甲方开通学习账号即视为全部课程交付。乙方开课后申请退款的，已缴纳的课程预付款不予退还。

第四条 特别约定
本条针对同一笔课程预付款承诺付款后十五日内无条件全额退款，并明确优先适用于第二条的拒退约定。''';

const _prepayConflict = '''课程购买协议
甲方（培训机构）：某教育公司
乙方（学员）：赵六

第一条 课程费用
课程费 16800 元，乙方于签约时一次性支付。

第二条 账号与退款
甲方开通学习账号即视为全部课程交付。乙方开课后申请退款的，已缴纳的课程预付款不予退还。

第四条 特别约定
本条针对同一笔课程预付款承诺付款后十五日内无条件全额退款。''';

const _prepayNoRefund = '''课程购买协议
甲方（培训机构）：某教育公司
乙方（学员）：孙七

第一条 课程费用
课程费 9800 元，乙方于签约时一次性支付。

第二条 学习安排
乙方应按课程表按时上课，遵守课堂纪律。''';

const _consumerOther = '''课程服务协议
甲方（培训机构）：某教育公司
乙方（学员）：周八

第一条 课程费用
课程费 15800 元，乙方于签约时一次性支付。

第二条 违约责任
甲方违约停课的，已上课程按虚列原价倒扣，销售提成计入退款扣减；余款不足的，乙方须另行补足。

第三条 免责
线下补课时因甲方设备问题造成乙方人身伤害的，甲方不承担赔偿责任。因甲方故意或重大过失损坏乙方自带电脑的，也不承担赔偿责任。

第四条 争议
乙方只能前往距常住地两千公里的指定地点申诉，不得先向行政机关投诉或起诉。

第五条 个人信息
乙方须录入人脸模板，即使已有短信验证码也不能替代；人脸模板由平台长期保留并用于推广。甲方可将乙方姓名、手机号、学习记录交给合作商用于营销。''';

const _loanDisclose = '''培训贷借款及课程服务协议
甲方（贷款人）：某消费金融有限公司
乙方（借款人）：王五
丙方（培训机构）：某教育公司
合同签署日期：2026年9月1日

第一条 培训与贷款
乙方参加丙方“全栈开发就业班”培训，并通过甲方办理教育分期贷款，贷款本金 29800 元。

第二条 综合融资成本明示表
乙方签署贷款合同前只能看到月供，签署后才能查看综合融资成本明示表。明示表不列各项费用的收取主体，也不显示正常履约的年化综合利率。支付页仅显示月供 1480 元。

第三条 费用调整
甲方可在已显示的费用之外新增借款履约服务费，并在扣款后通知乙方。

第四条 通知
收费标准贴入甲方仅内部可见的业务后台即视为通知乙方。''';

const _loanOldDate = '''培训贷借款及课程服务协议
甲方（贷款人）：某教育公司
乙方（借款人）：钱七
合同签署日期：2026年6月1日

第一条 培训与贷款
乙方参加培训，并通过教育分期付款，贷款本金 19800 元。

第二条 综合融资成本明示表
乙方签署贷款合同前只能看到月供，签署后才能查看综合融资成本明示表。明示表不列各项费用的收取主体。

第三条 费用调整
甲方可在已显示的费用之外新增借款履约服务费，并在扣款后通知乙方。''';

List<Finding> _byRule(Analysis a, String ruleId) =>
    a.items.where((it) => it.ruleId == ruleId).toList();

List<String> _names(Analysis a, String ruleId) =>
    _byRule(a, ruleId).map((it) => it.ruleName).toList();

void main() {
  test('规则库已补齐 R31–R36，共 36 类', () {
    expect(ruleLibrary.length, 36);
    expect(ruleLibraryGap, isEmpty);
    expect(
      ruleLibrary.map((r) => r.id),
      containsAll(['R31', 'R32', 'R33', 'R34', 'R35', 'R36']),
    );
    expect(
      packRules['loan'],
      containsAll(['R31', 'R32', 'R33', 'R34', 'R35', 'R36']),
    );
    expect(packRules['prepay'], ['R33', 'R34', 'R35', 'R36']);
  });

  test('纯预付课程自动识别，并对一概不退报红', () {
    final a = analyzeContract(_prepayRefuse);
    expect(a.docKey, 'prepay');
    expect(a.detectedDocKey, 'prepay');
    expect(a.packs, ['prepay']);
    expect(a.countOf(Verdict.red), 1);
    final item = a.items.single;
    expect(item.ruleId, 'R33');
    expect(item.ruleName, '预付课程拒绝退款');
    expect(item.verdict, Verdict.red);
    expect(item.loss, 19800);
    expect(item.location, '第二条 退款');
  });

  test('账号生成视为交付：七日内拒退与账号交付分别报红', () {
    final a = analyzeContract(_prepayAccount);
    expect(a.countOf(Verdict.red), 2);
    expect(_names(a, 'R33'), containsAll(['付款后七日内可请求返还预付款', '账号生成视为交付并拒绝退款']));
  });

  test('更有利退款条款明确优先时，撤掉七日拒退并以绿线覆盖', () {
    final a = analyzeContract(_prepayCover);
    expect(a.countOf(Verdict.green), 2);
    expect(_names(a, 'R33'), isNot(contains('付款后七日内可请求返还预付款')));
    expect(_names(a, 'R33'), containsAll(['更有利退款条款优先适用', '拒退条款已被更有利退款条款覆盖']));
    // 账号生成视为交付属于独立风险，不因退款条款优先而消失。
    expect(_names(a, 'R33'), contains('账号生成视为交付并拒绝退款'));
  });

  test('更有利退款承诺未写优先关系时，保留冲突灰卡', () {
    final a = analyzeContract(_prepayConflict);
    expect(a.countOf(Verdict.gray), 3);
    expect(
      _names(a, 'R33'),
      containsAll(['七日退款需核对付款后提出解除的时间', '更有利退款承诺与拒退条款冲突', '退款承诺与拒退条款存在冲突']),
    );
    expect(a.countOf(Verdict.green), 0);
  });

  test('预付课程没有退款约定时给灰卡', () {
    final a = analyzeContract(_prepayNoRefund);
    expect(a.countOf(Verdict.gray), 1);
    final item = a.items.single;
    expect(item.ruleId, 'R33');
    expect(item.ruleName, '预付课程未约定退款');
    expect(item.location, '第一条 课程费用');
  });

  test('R34–R36 覆盖退款结算、免责维权与个人信息', () {
    final a = analyzeContract(_consumerOther);
    expect(a.countOf(Verdict.red), 6);
    expect(a.countOf(Verdict.yellow), 3);
    expect(
      _names(a, 'R34'),
      containsAll(['违约退款按虚列原价倒扣', '退款不足反向要求消费者补足', '员工销售提成计入退款扣减']),
    );
    expect(
      _names(a, 'R35'),
      containsAll(['人身伤害免责无效', '故意或重大过失财产损失免责无效', '异地申诉前置并限制投诉起诉']),
    );
    expect(
      _names(a, 'R36'),
      containsAll(['已有同等验证仍强制人脸', '人脸模板长期留存推广且无单独同意', '营销共享未披露接收方且无单独同意']),
    );
  });

  test('持牌机构且签署日期在新规施行后，R31/R32 给黄色或红色', () {
    final a = analyzeContract(_loanDisclose);
    expect(a.docKey, 'loan');
    final r31 = _byRule(a, 'R31');
    expect(r31.length, 2);
    expect(r31.every((it) => it.verdict == Verdict.yellow), isTrue);
    expect(
      r31.map((it) => it.ruleName),
      containsAll(['签约后才能查看综合融资成本表', '明示表未列费用收取主体']),
    );
    final r32 = _byRule(a, 'R32');
    expect(
      r32.map((it) => it.ruleName),
      containsAll(['明示费用外可新增收费', '仅内部后台改价不构成通知']),
    );
    expect(
      r32.firstWhere((it) => it.ruleName == '明示费用外可新增收费').verdict,
      Verdict.red,
    );
    expect(
      r32.firstWhere((it) => it.ruleName == '仅内部后台改价不构成通知').verdict,
      Verdict.yellow,
    );
  });

  test('未自称持牌或签署日期早于施行日时，R31/R32 只给灰卡', () {
    final a = analyzeContract(_loanOldDate);
    final r31 = _byRule(a, 'R31');
    expect(r31, isNotEmpty);
    expect(r31.every((it) => it.verdict == Verdict.gray), isTrue);
    final r32 = _byRule(a, 'R32');
    expect(r32, isNotEmpty);
    expect(r32.every((it) => it.verdict == Verdict.gray), isTrue);
  });
}
