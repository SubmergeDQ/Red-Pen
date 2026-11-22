/* Red Pen rule engine: rules, samples and pure analysis functions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RedPenEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

const LAW = {
  L10:{law:'《中华人民共和国劳动合同法》',article:'第十条',text:'建立劳动关系，应当订立书面劳动合同。已建立劳动关系，未同时订立书面劳动合同的，应当自用工之日起一个月内订立书面劳动合同。用人单位与劳动者在用工前订立劳动合同的，劳动关系自用工之日起建立。'},
  L16:{law:'《中华人民共和国劳动合同法》',article:'第十六条',text:'劳动合同由用人单位与劳动者协商一致，并经用人单位与劳动者在劳动合同文本上签字或者盖章生效。劳动合同文本由用人单位和劳动者各执一份。'},
  L17:{law:'《中华人民共和国劳动合同法》',article:'第十七条',text:'劳动合同应当具备以下条款：（一）用人单位的名称、住所和法定代表人或者主要负责人；（二）劳动者的姓名、住址和居民身份证或者其他有效身份证件号码；（三）劳动合同期限；（四）工作内容和工作地点；（五）工作时间和休息休假；（六）劳动报酬；（七）社会保险；（八）劳动保护、劳动条件和职业危害防护；（九）法律、法规规定应当纳入劳动合同的其他事项。'},
  L19:{law:'《中华人民共和国劳动合同法》',article:'第十九条',text:'劳动合同期限三个月以上不满一年的，试用期不得超过一个月；劳动合同期限一年以上不满三年的，试用期不得超过二个月；三年以上固定期限和无固定期限的劳动合同，试用期不得超过六个月。同一用人单位与同一劳动者只能约定一次试用期。以完成一定工作任务为期限的劳动合同或者劳动合同期限不满三个月的，不得约定试用期。试用期包含在劳动合同期限内。劳动合同仅约定试用期的，试用期不成立，该期限为劳动合同期限。'},
  L20:{law:'《中华人民共和国劳动合同法》',article:'第二十条',text:'劳动者在试用期的工资不得低于本单位相同岗位最低档工资或者劳动合同约定工资的百分之八十，并不得低于用人单位所在地的最低工资标准。'},
  L21:{law:'《中华人民共和国劳动合同法》',article:'第二十一条',text:'在试用期中，除劳动者有本法第三十九条和第四十条第一项、第二项规定的情形外，用人单位不得解除劳动合同。用人单位在试用期解除劳动合同的，应当向劳动者说明理由。'},
  L22:{law:'《中华人民共和国劳动合同法》',article:'第二十二条',text:'用人单位为劳动者提供专项培训费用，对其进行专业技术培训的，可以与该劳动者订立协议，约定服务期。劳动者违反服务期约定的，应当按照约定向用人单位支付违约金。违约金的数额不得超过用人单位提供的培训费用。用人单位要求劳动者支付的违约金不得超过服务期尚未履行部分所应分摊的培训费用。用人单位与劳动者约定服务期的，不影响按照正常的工资调整机制提高劳动者在服务期期间的劳动报酬。'},
  L23:{law:'《中华人民共和国劳动合同法》',article:'第二十三条',text:'用人单位与劳动者可以在劳动合同中约定保守用人单位的商业秘密和与知识产权相关的保密事项。对负有保密义务的劳动者，用人单位可以在劳动合同或者保密协议中与劳动者约定竞业限制条款，并约定在解除或者终止劳动合同后，在竞业限制期限内按月给予劳动者经济补偿。劳动者违反竞业限制约定的，应当按照约定向用人单位支付违约金。'},
  L24:{law:'《中华人民共和国劳动合同法》',article:'第二十四条',text:'竞业限制的人员限于用人单位的高级管理人员、高级技术人员和其他负有保密义务的人员。竞业限制的范围、地域、期限由用人单位与劳动者约定，竞业限制的约定不得违反法律、法规的规定。在解除或者终止劳动合同后，前款规定的人员到与本单位生产或者经营同类产品、从事同类业务的有竞争关系的其他用人单位，或者自己开业生产或者经营同类产品、从事同类业务的竞业限制期限，不得超过二年。'},
  L25:{law:'《中华人民共和国劳动合同法》',article:'第二十五条',text:'除本法第二十二条和第二十三条规定的情形外，用人单位不得与劳动者约定由劳动者承担违约金。'},
  JI2_13:{law:'《最高人民法院关于审理劳动争议案件适用法律问题的解释（二）》',article:'第十三条',text:'条文摘要：用人单位与劳动者约定竞业限制，劳动者请求确认竞业限制条款不生效的，人民法院依法审查劳动者是否属于负有保密义务的人员、竞业限制的范围和期限是否与其知悉、接触的商业秘密和与知识产权相关的保密事项相适应。'},
  JI2_14:{law:'《最高人民法院关于审理劳动争议案件适用法律问题的解释（二）》',article:'第十四条',text:'条文摘要：用人单位与负有保密义务的劳动者约定在职期间竞业限制的，人民法院依法予以支持；劳动者以用人单位未支付经济补偿为由请求确认在职竞业限制条款无效的，人民法院不予支持。'},
  JI2_19:{law:'《最高人民法院关于审理劳动争议案件适用法律问题的解释（二）》',article:'第十九条',text:'条文摘要：用人单位与劳动者约定或者劳动者承诺无需缴纳社会保险费的，该约定或者承诺无效；用人单位未依法缴纳社会保险费，劳动者依据劳动合同法第三十八条第一款第三项规定请求解除劳动合同、由用人单位支付经济补偿的，人民法院依法予以支持。'},
  L26:{law:'《中华人民共和国劳动合同法》',article:'第二十六条',text:'下列劳动合同无效或者部分无效：（一）以欺诈、胁迫的手段或者乘人之危，使对方在违背真实意思的情况下订立或者变更劳动合同的；（二）用人单位免除自己的法定责任、排除劳动者权利的；（三）违反法律、行政法规强制性规定的。对劳动合同的无效或者部分无效有争议的，由劳动争议仲裁机构或者人民法院确认。'},
  L30:{law:'《中华人民共和国劳动合同法》',article:'第三十条',text:'用人单位应当按照劳动合同约定和国家规定，向劳动者及时足额支付劳动报酬。用人单位拖欠或者未足额支付劳动报酬的，劳动者可以依法向当地人民法院申请支付令，人民法院应当依法发出支付令。'},
  L31:{law:'《中华人民共和国劳动合同法》',article:'第三十一条',text:'用人单位应当严格执行劳动定额标准，不得强迫或者变相强迫劳动者加班。用人单位安排加班的，应当按照国家有关规定向劳动者支付加班费。'},
  L37:{law:'《中华人民共和国劳动合同法》',article:'第三十七条',text:'劳动者提前三十日以书面形式通知用人单位，可以解除劳动合同。劳动者在试用期内提前三日通知用人单位，可以解除劳动合同。'},
  L44:{law:'《中华人民共和国劳动法》',article:'第四十四条',text:'有下列情形之一的，用人单位应当按照下列标准支付高于劳动者正常工作时间工资的工资报酬：（一）安排劳动者延长工作时间的，支付不低于工资的百分之一百五十的工资报酬；（二）休息日安排劳动者工作又不能安排补休的，支付不低于工资的百分之二百的工资报酬；（三）法定休假日安排劳动者工作的，支付不低于工资的百分之三百的工资报酬。'},
  L50:{law:'《中华人民共和国劳动合同法》',article:'第五十条',text:'用人单位应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续。劳动者应当按照双方约定，办理工作交接。用人单位依照本法有关规定应当向劳动者支付经济补偿的，在办结工作交接时支付。用人单位对已经解除或者终止的劳动合同的文本，至少保存二年备查。'},
  L58:{law:'《中华人民共和国社会保险法》',article:'第五十八条',text:'用人单位应当自用工之日起三十日内为其职工向社会保险经办机构申请办理社会保险登记。未办理社会保险登记的，由社会保险经办机构核定其应当缴纳的社会保险费。'},
  L60:{law:'《中华人民共和国社会保险法》',article:'第六十条',text:'用人单位应当自行申报、按时足额缴纳社会保险费，非因不可抗力等法定事由不得缓缴、减免。职工应当缴纳的社会保险费由用人单位代扣代缴，用人单位应当按月将缴纳社会保险费的明细情况告知本人。'},
  L82:{law:'《中华人民共和国劳动合同法》',article:'第八十二条',text:'用人单位自用工之日起超过一个月不满一年未与劳动者订立书面劳动合同的，应当向劳动者每月支付二倍的工资。用人单位违反本法规定不与劳动者订立无固定期限劳动合同的，自应当订立无固定期限劳动合同之日起向劳动者每月支付二倍的工资。'},
  L85:{law:'《中华人民共和国劳动合同法》',article:'第八十五条',text:'用人单位有下列情形之一的，由劳动行政部门责令限期支付劳动报酬、加班费或者经济补偿；劳动报酬低于当地最低工资标准的，应当支付其差额部分；逾期不支付的，责令用人单位按应付金额百分之五十以上百分之一百以下的标准向劳动者加付赔偿金：（一）未按照劳动合同的约定或者国家规定及时足额支付劳动者劳动报酬的；（二）低于当地最低工资标准支付劳动者工资的；（三）安排加班不支付加班费的；（四）解除或者终止劳动合同，未依照本法规定向劳动者支付经济补偿的。'},
  L86:{law:'《中华人民共和国社会保险法》',article:'第八十六条',text:'用人单位未按时足额缴纳社会保险费的，由社会保险费征收机构责令限期缴纳或者补足，并自欠缴之日起，按日加收万分之五的滞纳金；逾期仍不缴纳的，由有关行政部门处欠缴数额一倍以上三倍以下的罚款。'},
  L89:{law:'《中华人民共和国劳动合同法》',article:'第八十九条',text:'用人单位违反本法规定未向劳动者出具解除或者终止劳动合同的书面证明，由劳动行政部门责令改正；给劳动者造成损害的，应当承担赔偿责任。'},
  L09:{law:'《中华人民共和国劳动合同法》',article:'第九条',text:'用人单位招用劳动者，不得扣押劳动者的居民身份证和其他证件，不得要求劳动者提供担保或者以其他名义向劳动者收取财物。'},
  L70:{law:'《中华人民共和国劳动合同法》',article:'第七十条',text:'非全日制用工双方当事人不得约定试用期。'},
  L83:{law:'《中华人民共和国劳动合同法》',article:'第八十三条',text:'用人单位违反本法规定与劳动者约定试用期的，由劳动行政部门责令改正；违法约定的试用期已经履行的，由用人单位以劳动者试用期满月工资为标准，按已经履行的超过法定试用期的期间向劳动者支付赔偿金。'},
  L90:{law:'《中华人民共和国劳动合同法》',article:'第九十条',text:'劳动者违反本法规定解除劳动合同，或者违反劳动合同中约定的保密义务或者竞业限制，给用人单位造成损失的，应当承担赔偿责任。'},
  C585:{law:'《中华人民共和国民法典》',article:'第五百八十五条',text:'当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金，也可以约定因违约产生的损失赔偿额的计算方法。约定的违约金低于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以增加；约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。当事人就迟延履行约定违约金的，违约方支付违约金后，还应当履行债务。'},
  C65:{law:'《最高人民法院关于适用〈中华人民共和国民法典〉合同编通则若干问题的解释》',article:'第六十五条',text:'条文摘要：当事人主张约定的违约金过分高于违约造成的损失，请求予以适当减少的，人民法院应当以违约造成的损失为基础，兼顾合同主体、交易类型、合同履行情况、当事人过错程度、履约背景等因素，遵循公平原则和诚信原则进行衡量。约定的违约金超过造成损失的百分之三十的，一般可以认定为民法典第五百八十五条第二款规定的“过分高于造成的损失”。'},
  C497:{law:'《中华人民共和国民法典》',article:'第四百九十七条',text:'有下列情形之一的，该格式条款无效：（一）具有本法第一编第六章第三节和本法第五百零六条规定的无效情形；（二）提供格式条款一方不合理地免除或者减轻其责任、加重对方责任、限制对方主要权利；（三）提供格式条款一方排除对方主要权利。'},
  C562:{law:'《中华人民共和国民法典》',article:'第五百六十二条',text:'当事人协商一致，可以解除合同。当事人可以约定一方解除合同的事由。解除合同的事由发生时，解除权人可以解除合同。'},
  C470:{law:'《中华人民共和国民法典》',article:'第四百七十条',text:'合同的内容由当事人约定，一般包括下列条款：（一）当事人的姓名或者名称和住所；（二）标的；（三）数量；（四）质量；（五）价款或者报酬；（六）履行期限、地点和方式；（七）违约责任；（八）解决争议的方法。'},
  LPR25:{law:'《最高人民法院关于审理民间借贷案件适用法律若干问题的规定》',article:'第二十五条',text:'出借人请求借款人按照合同约定利率支付利息的，人民法院应予支持，但是双方约定的利率超过合同成立时一年期贷款市场报价利率四倍的除外。前款所称“一年期贷款市场报价利率”，是指中国人民银行授权全国银行间同业拆借中心自2019年8月20日起每月发布的一年期贷款市场报价利率。'},
  HF20:{law:'《住房公积金管理条例》',article:'第二十条',text:'单位应当按时、足额缴存住房公积金，不得逾期缴存或者少缴。对缴存住房公积金确有困难的单位，经本单位职工代表大会或者工会讨论通过，并经住房公积金管理中心审核，报住房公积金管理委员会批准后，可以降低缴存比例或者缓缴；待单位经济效益好转后，再提高缴存比例或者补缴缓缴。'},
  F16:{law:'《工资支付暂行规定》',article:'第十六条',text:'因劳动者本人原因给用人单位造成经济损失的，用人单位可按照劳动合同的约定要求其赔偿经济损失。经济损失的赔偿，可从劳动者本人的工资中扣除。但每月扣除的部分不得超过劳动者当月工资的20%。若扣除后的剩余工资部分低于当地月最低工资标准，则按最低工资标准支付。'},
  ANNUAL5:{law:'《职工带薪年休假条例》',article:'第五条',text:'单位根据生产、工作的具体情况，并考虑职工本人意愿，统筹安排职工年休假。年休假在1个年度内可以集中安排，也可以分段安排，一般不跨年度安排。单位因生产、工作特点确有必要跨年度安排职工年休假的，可以跨1个年度安排。单位确因工作需要不能安排职工休年休假的，经职工本人同意，可以不安排职工休年休假。对职工应休未休的年休假天数，单位应当按照该职工日工资收入的300%支付年休假工资报酬。'},
  LADY5:{law:'《女职工劳动保护特别规定》',article:'第五条',text:'用人单位不得因女职工怀孕、生育、哺乳降低其工资、予以辞退、与其解除劳动或者聘用合同。'},
  AD24:{law:'《中华人民共和国广告法》',article:'第二十四条',text:'教育、培训广告不得含有下列内容：（一）对升学、通过考试、获得学位学历或者合格证书，或者对教育、培训的效果作出明示或者暗示的保证性承诺；（二）明示或者暗示有相关考试机构或者其工作人员、考试命题人员参与教育、培训；（三）利用科研单位、学术机构、教育机构、行业协会、专业人士、受益者的名义或者形象作推荐、证明。'},
  C20:{law:'《中华人民共和国消费者权益保护法》',article:'第二十条',text:'经营者向消费者提供有关商品或者服务的质量、性能、用途、有效期限等信息，应当真实、全面，不得作虚假或者引人误解的宣传。'},
  R10:{law:'《职业学校学生实习管理规定》',article:'需核对',text:'该规定要求实习单位为学生投保实习责任保险；具体条文序号需核对原文。'},
  L14:{law:'《中华人民共和国劳动合同法》',article:'第十四条',text:'有下列情形之一，劳动者提出或者同意续订、订立劳动合同的，除劳动者提出订立固定期限劳动合同外，应当订立无固定期限劳动合同：（一）劳动者在该用人单位连续工作满十年的；（二）用人单位初次实行劳动合同制度或者国有企业改制重新订立劳动合同时，劳动者在该用人单位连续工作满十年且距法定退休年龄不足十年的；（三）连续订立二次固定期限劳动合同，且劳动者没有本法第三十九条和第四十条第一项、第二项规定的情形，续订劳动合同的。用人单位自用工之日起满一年不与劳动者订立书面劳动合同的，视为用人单位与劳动者已订立无固定期限劳动合同。'},
  L39:{law:'《中华人民共和国劳动法》',article:'第三十九条',text:'企业因生产特点不能实行本法第三十六条、第三十八条规定的，经劳动行政部门批准，可以实行其他工作和休息办法。'},
  SPWORK:{law:'《关于企业实行不定时工作制和综合计算工时工作制的审批办法》',article:'第四条、第五条、第七条',text:'企业实行不定时工作制或综合计算工时工作制，应符合规定条件并经劳动行政部门审批。具体条文以最新有效文本为准。'},
  L46:{law:'《中华人民共和国劳动合同法》',article:'第四十六条',text:'有下列情形之一的，用人单位应当向劳动者支付经济补偿：（一）劳动者依照本法第三十八条规定解除劳动合同的；（二）用人单位依照本法第三十六条规定向劳动者提出解除劳动合同并与劳动者协商一致解除劳动合同的；（三）用人单位依照本法第四十条规定解除劳动合同的；（四）用人单位依照本法第四十一条第一款规定解除劳动合同的；（五）除用人单位维持或者提高劳动合同约定条件续订劳动合同，劳动者不同意续订的情形外，依照本法第四十四条第一项规定终止固定期限劳动合同的；（六）依照本法第四十四条第四项、第五项规定终止劳动合同的；（七）法律、行政法规规定的其他情形。'},
  L47:{law:'《中华人民共和国劳动合同法》',article:'第四十七条',text:'经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。'},
  L87:{law:'《中华人民共和国劳动合同法》',article:'第八十七条',text:'用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。'},
  L42:{law:'《中华人民共和国劳动合同法》',article:'第四十二条',text:'劳动者有下列情形之一的，用人单位不得依照本法第四十条、第四十一条的规定解除劳动合同：……（四）女职工在孕期、产期、哺乳期的；……'},
  L45:{law:'《中华人民共和国劳动合同法》',article:'第四十五条',text:'劳动合同期满，有本法第四十二条规定情形之一的，劳动合同应当续延至相应的情形消失时终止。但是，本法第四十二条第二项规定丧失或者部分丧失劳动能力劳动者的劳动合同的终止，按照国家有关工伤保险的规定执行。'},
  L66:{law:'《中华人民共和国劳动合同法》',article:'第六十六条',text:'劳动合同用工是我国的企业基本用工形式。劳务派遣用工是补充形式，只能在临时性、辅助性或者替代性的工作岗位上实施。前款规定的临时性工作岗位是指存续时间不超过六个月的岗位；辅助性工作岗位是指为主营业务岗位提供服务的非主营业务岗位；替代性工作岗位是指用工单位的劳动者因脱产学习、休假等原因无法工作的一定期间内，可以由其他劳动者替代工作的岗位。'},
  L68:{law:'《中华人民共和国劳动合同法》',article:'第六十八条',text:'非全日制用工，是指以小时计酬为主，劳动者在同一用人单位一般平均每日工作时间不超过四小时，每周工作时间累计不超过二十四小时的用工形式。'},
  L69:{law:'《中华人民共和国劳动合同法》',article:'第六十九条',text:'非全日制用工双方当事人可以订立口头协议。从事非全日制用工的劳动者可以与一个或者一个以上用人单位订立劳动合同；但是，后订立的劳动合同不得影响先订立的劳动合同的履行。'},
  L72:{law:'《中华人民共和国劳动合同法》',article:'第七十二条',text:'非全日制用工小时计酬标准不得低于用人单位所在地人民政府规定的最低小时工资标准。非全日制用工劳动报酬结算支付周期最长不得超过十五日。'},
  L92:{law:'《中华人民共和国劳动合同法》',article:'第九十二条',text:'用工单位给被派遣劳动者造成损害的，劳务派遣单位与用工单位承担连带赔偿责任。'},
  LADY7:{law:'《女职工劳动保护特别规定》',article:'第七条',text:'女职工生育享受98天产假，其中产前可以休假15天；难产的，增加产假15天；生育多胞胎的，每多生育1个婴儿，增加产假15天。女职工怀孕未满4个月流产的，享受15天产假；怀孕满4个月流产的，享受42天产假。'},
  LADY9:{law:'《女职工劳动保护特别规定》',article:'第九条',text:'对哺乳未满1周岁婴儿的女职工，用人单位不得延长劳动时间或者安排夜班劳动。用人单位应当在每天的劳动时间内为哺乳期女职工安排1小时哺乳时间；女职工生育多胞胎的，每多哺乳1个婴儿每天增加1小时哺乳时间。'},
  GSW17:{law:'《工伤保险条例》',article:'第十七条',text:'职工发生事故伤害或者按照职业病防治法规定被诊断、鉴定为职业病，所在单位应当自事故伤害发生之日或者被诊断、鉴定为职业病之日起30日内，向统筹地区社会保险行政部门提出工伤认定申请。遇有特殊情况，经报社会保险行政部门同意，申请时限可以适当延长。用人单位未按前款规定提出工伤认定申请的，工伤职工或者其近亲属、工会组织在事故伤害发生之日或者被诊断、鉴定为职业病之日起1年内，可以直接向用人单位所在地统筹地区社会保险行政部门提出工伤认定申请。'},
  GSW62:{law:'《工伤保险条例》',article:'第六十二条',text:'依照本条例规定应当参加工伤保险而未参加工伤保险的用人单位职工发生工伤的，由该用人单位按照本条例规定的工伤保险待遇项目和标准支付费用。'},
  SI41:{law:'《中华人民共和国社会保险法》',article:'第四十一条',text:'职工所在用人单位未依法缴纳工伤保险费，发生工伤事故的，由用人单位支付工伤保险待遇。用人单位不支付的，从工伤保险基金中先行支付。从工伤保险基金中先行支付的工伤保险待遇应当由用人单位偿还。用人单位不偿还的，社会保险经办机构可以依照本法第六十三条的规定追偿。'},
  PI6:{law:'《中华人民共和国个人信息保护法》',article:'第六条',text:'处理个人信息应当具有明确、合理的目的，并应当与处理目的直接相关，采取对个人权益影响最小的方式。收集个人信息，应当限于实现处理目的的最小范围，不得过度收集个人信息。'},
  PI17:{law:'《中华人民共和国个人信息保护法》',article:'第十七条',text:'个人信息处理者在处理个人信息前，应当以显著方式、清晰易懂的语言真实、准确、完整地向个人告知下列事项：（一）个人信息处理者的名称或者姓名和联系方式；（二）个人信息的处理目的、处理方式，处理的个人信息种类、保存期限；（三）个人行使本法规定权利的方式和程序；（四）法律、行政法规规定应当告知的其他事项。'},
  PI23:{law:'《中华人民共和国个人信息保护法》',article:'第二十三条',text:'个人信息处理者向其他个人信息处理者提供其处理的个人信息的，应当向个人告知接收方的名称或者姓名、联系方式、处理目的、处理方式和个人信息的种类，并取得个人的单独同意。接收方应当在上述处理目的、处理方式和个人信息的种类等范围内处理个人信息。'},
  PI29:{law:'《中华人民共和国个人信息保护法》',article:'第二十九条',text:'处理敏感个人信息应当取得个人的单独同意；法律、行政法规规定处理敏感个人信息应当取得书面同意的，从其规定。'},
  ESIGN13:{law:'《中华人民共和国电子签名法》',article:'第十三条',text:'电子签名同时符合下列条件的，视为可靠的电子签名：（一）电子签名制作数据用于电子签名时，属于电子签名人专有；（二）签署时电子签名制作数据仅由电子签名人控制；（三）签署后对电子签名的任何改动能够被发现；（四）签署后对数据电文内容和形式的任何改动能够被发现。当事人也可以选择使用符合其约定的可靠条件的电子签名。'},
  ESIGN14:{law:'《中华人民共和国电子签名法》',article:'第十四条',text:'可靠的电子签名与手写签名或者盖章具有同等的法律效力。'},
  ARB21:{law:'《中华人民共和国劳动争议调解仲裁法》',article:'第二十一条',text:'劳动争议仲裁委员会负责管辖本区域内发生的劳动争议。劳动争议由劳动合同履行地或者用人单位所在地的劳动争议仲裁委员会管辖。双方当事人分别向劳动合同履行地和用人单位所在地的劳动争议仲裁委员会申请仲裁的，由劳动合同履行地的劳动争议仲裁委员会管辖。'},
  CIVPRO90:{law:'《中华人民共和国民事诉讼法》',article:'第九十条',text:'经受送达人同意，人民法院可以采用能够确认其收悉的电子方式送达诉讼文书。通过电子方式送达的，以送达信息到达受送达人特定系统的日期为送达日期。判决书、裁定书、调解书，经受送达人同意，可以采用电子方式送达。'},
  C465:{law:'《中华人民共和国民法典》',article:'第四百六十五条',text:'依法成立的合同，受法律保护。依法成立的合同，仅对当事人具有法律约束力，但是法律另有规定的除外。'},
  C506:{law:'《中华人民共和国民法典》',article:'第五百零六条',text:'合同中的下列免责条款无效：（一）造成对方人身损害的；（二）因故意或者重大过失造成对方财产损失的。'},
  C509:{law:'《中华人民共和国民法典》',article:'第五百零九条',text:'当事人应当按照约定全面履行自己的义务。当事人应当遵循诚信原则，根据合同的性质、目的和交易习惯履行通知、协助、保密等义务。'},
  C676:{law:'《中华人民共和国民法典》',article:'第六百七十六条',text:'借款人未按照约定的期限返还借款的，应当按照约定或者国家有关规定支付逾期利息。'},
  IR26:{law:'《个人贷款业务明示综合融资成本规定》',article:'第二条、第三条、第四条',text:'条文摘要：第二条要求贷款人在签署贷款合同前向借款人明示综合融资成本，列明各项费用的收取主体、金额、频次和正常履约年化成本；第三条禁止在已明示项目之外收取费用；第四条要求调整息费或者收费标准的通知以能够及时到达借款人的方式作出。该规定自2026年8月1日起施行。'},
  IR26_2:{law:'《个人贷款业务明示综合融资成本规定》',article:'第二条',text:'条文摘要：贷款人应当在签署贷款合同前向借款人明示综合融资成本，列明各项费用的收取主体、金额、频次和正常履约年化成本；不能以月供、零利息等单一口径替代完整披露。该规定自2026年8月1日起施行。'},
  IR26_3:{law:'《个人贷款业务明示综合融资成本规定》',article:'第三条',text:'条文摘要：贷款人不得在已明示的费用项目之外收取费用，不得以内部清单等方式新增借款履约费用。该规定自2026年8月1日起施行。'},
  IR26_4:{law:'《个人贷款业务明示综合融资成本规定》',article:'第四条',text:'条文摘要：贷款人调整息费项目或者收费标准的，应当以能够及时到达借款人的方式作出通知；仅在内部后台记录不构成有效通知。该规定自2026年8月1日起施行。'},
  PBOC21:{law:'中国人民银行公告〔2021〕第3号',article:'',text:'条文摘要：所有从事贷款业务的机构应当以明显方式向借款人展示年化利率，并在签订贷款合同时载明；年化利率应以借款人实际占用的本金为基础计算，包含与贷款直接相关的各项费用。'},
  PREPAY9:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第九条',text:'条文摘要：经营者以格式条款排除或者限制消费者依法解除合同、请求返还预付款等权利，单方改动商品或者服务的实质内容，或者不合理增加消费者维权成本的，人民法院可以依法认定该格式条款无效。'},
  PREPAY12:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第十二条',text:'条文摘要：经营者未经消费者同意提高商品或者服务价格、降低商品或者服务质量，消费者请求经营者按照原约定履行、承担违约责任的，人民法院依法予以支持；该条并非规定消费者只能解除合同。'},
  PREPAY13:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第十三条',text:'条文摘要：经营者迁移服务场所、变更服务提供主体等致使消费者接受服务明显不便，或者未经消费者同意将合同义务转移给第三人的，消费者请求解除合同并返还预付款的，人民法院依法予以支持。'},
  PREPAY14:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第十四条',text:'条文摘要：消费者自付款之日起七日内请求经营者返还预付款本金的，人民法院应予支持；消费者在订立合同时已经从本经营者或者其他经营者处获得相同商品或者服务的除外；经营者与消费者约定更有利于消费者的退款条件的，按照约定处理。'},
  PREPAY15:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第十五条',text:'条文摘要：合同解除等情形下，经营者应当返还预付款余额并支付利息、合理费用；已提供商品或者服务的，按照约定和实际履行情况扣除合理费用；经营者将员工预付款提成等不合理费用计入扣减的，人民法院不予支持。'},
  PREPAY18:{law:'《最高人民法院关于审理预付式消费民事纠纷案件适用法律若干问题的解释》',article:'第十八条',text:'条文摘要：非因消费者原因退款时，经营者已经提供商品或者服务的，应当按照约定的优惠价或者优惠比例折算已消费部分；不能以虚列的原价或者不合理的扣减口径压低退款。'},
  CONSUMER22:{law:'《中华人民共和国消费者权益保护法实施条例》',article:'第二十二条',text:'条文摘要：经营者决定停业或者迁移服务场所，应当提前告知消费者；消费者有权选择继续履行或者解除合同，经营者应当退还预付款余额。'},
  CONSUMER23:{law:'《中华人民共和国消费者权益保护法实施条例》',article:'第二十三条',text:'条文摘要：经营者收集、使用消费者个人信息，应当遵循合法、正当、必要原则，明示目的、方式和范围，取得消费者同意，并采取必要措施保护信息安全。'},
  PI19:{law:'《中华人民共和国个人信息保护法》',article:'第十九条',text:'除法律、行政法规另有规定外，个人信息的保存期限应当为实现处理目的所必要的最短时间。'},
  PI28:{law:'《中华人民共和国个人信息保护法》',article:'第二十八条',text:'敏感个人信息是一旦泄露或者非法使用，容易导致自然人的人格尊严受到侵害或者人身、财产安全受到危害的个人信息，包括生物识别、宗教信仰、特定身份、医疗健康、金融账户、行踪轨迹等信息，以及不满十四周岁未成年人的个人信息。只有在具有特定的目的和充分的必要性，并采取严格保护措施的情形下，个人信息处理者方可处理敏感个人信息。'},
  PI30:{law:'《中华人民共和国个人信息保护法》',article:'第三十条',text:'个人信息处理者处理敏感个人信息的，除本法第十七条第一款规定的事项外，还应当向个人告知处理敏感个人信息的必要性以及对个人权益的影响。'},
  FACE10:{law:'《人脸识别技术应用安全管理办法》',article:'第十条',text:'实现相同目的或者达到同等业务要求，存在其他非人脸识别技术方式的，不得将人脸识别技术作为唯一验证方式。个人不同意通过人脸信息进行身份验证的，应当提供其他合理、便捷的方式。'}
};

const RULE_LIBRARY = [
  {id:'R1',name:'试用期期限',cite:'《劳动合同法》第十九条',gist:'3 个月–1 年最多 1 个月，1–3 年最多 2 个月，3 年以上最多 6 个月；同一单位只能约定一次。'},
  {id:'R2',name:'试用期工资',cite:'《劳动合同法》第二十条',gist:'不低于同岗位最低档工资或约定工资的 80%，且不低于当地最低工资。'},
  {id:'R3',name:'试用期解除',cite:'《劳动合同法》第二十一条',gist:'试用期解除也要说明理由，不能只写「不合格」了事。'},
  {id:'R4',name:'违约金法定情形',cite:'《劳动合同法》第二十五条',gist:'除服务期与竞业限制外，不得约定由劳动者承担违约金。'},
  {id:'R5',name:'服务期违约金上限',cite:'《劳动合同法》第二十二条',gist:'只能为有凭证的专项培训约定服务期，违约金不得超过培训费用，并按未履行部分分摊。'},
  {id:'R6',name:'竞业限制',cite:'《劳动合同法》第二十三条、第二十四条',gist:'限于高管、高技与负保密义务人员；期限不超过 2 年；须按月支付补偿。'},
  {id:'R7',name:'无效条款',cite:'《劳动合同法》第二十六条',gist:'免除单位法定责任、排除劳动者权利的条款无效，例如放弃社保、单方调岗降薪、随时解除不补偿。'},
  {id:'R8',name:'三方协议违约金',cite:'《民法典》第五百八十五条',gist:'三方协议属民事协议，违约金一般有效；过分高于实际损失的可请求调减。'},
  {id:'R9',name:'培训贷与分期',cite:'民间借贷司法解释第二十五条；金规〔2026〕2号；人民银行公告〔2021〕第3号',gist:'逐笔按付款方核对正常履约成本与年化成本；持牌机构按明示综合融资成本规则审查，民间借贷四倍 LPR 不能当然套用于持牌机构。'},
  {id:'R10',name:'实习协议保障',cite:'《职业学校学生实习管理规定》（条文序号需核对）',gist:'报酬、工时、意外险与解除条件要写清；缺意外伤害保险是常见缺口。'},
  {id:'R11',name:'押金与扣证',cite:'《劳动合同法》第九条',gist:'不得扣押身份证等证件，不得要求担保或以其他名义收取财物。'},
  {id:'R12',name:'解除与通知期',cite:'《劳动合同法》第三十七条',gist:'提前 30 日书面通知即可解除；试用期内提前 3 日通知。'},
  {id:'R13',name:'工时与加班费',cite:'《劳动合同法》第三十一条、《劳动法》第四十四条',gist:'加班应支付 150%/200%/300% 工资；法定节假日不能只用调休替代，也不能约定工资已包含加班费。'},
  {id:'R14',name:'工资支付与扣款',cite:'《劳动合同法》第三十条、第五十条、第八十五条',gist:'工资应按月足额支付；押工资、离职不结算、无依据罚款、随意扣减或离职取消年终奖都要看清。'},
  {id:'R15',name:'社保与公积金',cite:'《社会保险法》第五十八条、第六十条、第八十六条；《住房公积金管理条例》第二十条',gist:'用工之日起 30 日内参保；试用期不缴、按最低基数缴、让员工全额承担或发补贴代替都不合规。'},
  {id:'R16',name:'休假与特殊保护',cite:'《职工带薪年休假条例》、《女职工劳动保护特别规定》',gist:'年假不能随意作废；婚育限制、产假降薪或辞退等条款无效。'},
  {id:'R17',name:'保密与成果归属',cite:'《劳动合同法》第二十三条、第二十六条',gist:'保密和成果归属要写清范围；把个人作品、业余成果全部收归公司或设置无上限赔偿，风险较高。'},
  {id:'R18',name:'离职手续与结算',cite:'《劳动合同法》第三十七条、第五十条、第八十九条',gist:'离职不需要公司批准；不得以未交接为由扣工资，解除时还应出具证明并办理档案社保转移。'},
  {id:'R19',name:'合同签订与文本',cite:'《劳动合同法》第十条、第十六条、第八十二条',gist:'建立劳动关系应签书面合同并各执一份；试用期后再签、只签试用期、空白合同都可能放大风险。'},
  {id:'R20',name:'就业承诺与培训服务',cite:'《广告法》第二十四条、《消费者权益保护法》第二十条',gist:'“包就业”“保底薪资”“不过退费”要写清条件和退款路径，口头承诺不等于合同义务。'},
  {id:'R21',name:'必备条款缺失',cite:'《劳动合同法》第十七条',gist:'劳动合同应具备单位信息、劳动者信息、期限、工作内容地点、工时休假、报酬、社保、劳动保护八项；缺核心条款会放大举证风险。'},
  {id:'R22',name:'经济补偿与违法解除',cite:'《劳动合同法》第四十六条、第四十七条、第八十七条',gist:'法定情形解除应按工作年限支付经济补偿；违法解除按二倍赔偿；不得提前约定一律不补偿。'},
  {id:'R23',name:'无固定期限与连续签约',cite:'《劳动合同法》第十四条',gist:'连续工作满十年或连续订立二次固定期限合同后，劳动者提出/同意续订的，应订立无固定期限合同；满一年未签书面合同视为无固定期限。'},
  {id:'R24',name:'特殊工时审批',cite:'《劳动法》第三十九条、《不定时工作制和综合计算工时工作制审批办法》',gist:'综合工时、不定时工时需经劳动行政部门审批；未审批应按标准工时支付加班费。'},
  {id:'R25',name:'女职工三期保护',cite:'《女职工劳动保护特别规定》第五条、第七条、第九条',gist:'不得因怀孕、生育、哺乳降薪或辞退；产假98天起，哺乳期每天1小时哺乳时间。'},
  {id:'R26',name:'工伤申报与待遇',cite:'《工伤保险条例》第十七条、第六十二条',gist:'单位应在事故伤害发生之日起30日内申请工伤认定；未参保的由单位按工伤保险待遇项目和标准支付。'},
  {id:'R27',name:'个人信息与背景调查',cite:'《个人信息保护法》第六条、第十七条、第二十三条、第二十九条',gist:'收集个人信息应最小必要并告知同意；敏感信息和向第三方提供需单独同意。'},
  {id:'R28',name:'非全日制与派遣外包',cite:'《劳动合同法》第六十六条、第六十八条、第七十二条',gist:'非全日制每日不超过4小时、每周不超过24小时、15日内结算；派遣限于三性岗位；不得假外包真用工。'},
  {id:'R29',name:'电子签署与文本交付',cite:'《电子签名法》第十三条、第十四条',gist:'电子劳动合同应使用可靠电子签名，可下载、打印，双方各执一份；不得只让签字不给文本。'},
  {id:'R30',name:'争议管辖与送达',cite:'《劳动争议调解仲裁法》第二十一条',gist:'劳动争议由劳动合同履行地或用人单位所在地仲裁委管辖；不得约定排除法定管辖或放弃仲裁/诉讼权利。'},
  {id:'R31',name:'持牌贷款成本明示',cite:'金规〔2026〕2号第二条至第四条；人民银行公告〔2021〕第3号',gist:'签前应能看到综合融资成本明示表，表中列明收费主体和正常履约年化成本；不能以月供和零利息替代。'},
  {id:'R32',name:'表外收费与改价通知',cite:'金规〔2026〕2号第三条、第四条',gist:'不得在已明示项目之外新增收费；调整息费应以及时到达借款人的方式通知，仅贴内部后台不构成通知。'},
  {id:'R33',name:'预付课程退款与变更',cite:'预付式消费解释第九条、第十二条至第十五条；消保条例第二十二条',gist:'付款后七日内可请求返还预付款本金，但订约时已从本经营者或其他经营者获得相同商品或者服务的除外；单方变更、迁址或者转第三方明显不便应保障相应救济。'},
  {id:'R34',name:'培训违约退款结算',cite:'预付式消费解释第十五条、第十八条；民法典第四百六十五条、第五百零九条',gist:'机构违约退款不得虚列原价或转嫁员工提成，也不得反向要求消费者补足；课程券不等于退款和贷款结清。'},
  {id:'R35',name:'消费合同免责与维权',cite:'民法典第五百零六条、第四百九十七条；预付式消费解释第九条',gist:'人身伤害及故意或重大过失财产损失免责无效；异地申诉前置并限制投诉、起诉会不合理增加维权成本。'},
  {id:'R36',name:'消费场景个人信息',cite:'个人信息保护法第十九条、第二十三条、第二十八条至第三十条；人脸识别办法第十条',gist:'已有同等验证方式仍强制人脸、长期留存用于营销，或向未披露的第三方提供学习记录，均需单独同意并说明必要性。'}
];

const SAMPLES = [
  {
    id:'labor',
    type:'劳动合同',
    name:'2 年期劳动合同',
    sub:'试用期 6 个月 · 离职违约金 2 万 · 收取押金',
    text:`劳动合同书

甲方（用人单位）：杭州启明网络科技有限公司
乙方（劳动者）：张明

第一条 合同期限
本合同为固定期限劳动合同，合同期限自 2026 年 7 月 1 日起至 2028 年 6 月 30 日止，其中试用期 6 个月。

第二条 工作内容与地点
乙方同意根据甲方工作需要，担任运营专员岗位，工作地点为杭州市西湖区。

第三条 工作时间
甲方实行标准工时制，乙方每日工作 8 小时，每周工作 40 小时。

第四条 劳动报酬
乙方试用期工资为每月 4800 元，转正后工资为每月 8000 元。甲方于每月 10 日前以银行转账方式支付上月工资。

第五条 社会保险
甲方依法为乙方缴纳社会保险，乙方个人应缴部分由甲方代扣代缴。

第六条 离职与违约金
乙方在合同期内提前离职的，应向甲方支付违约金人民币 20000 元；未满一年离职的，另扣除当月全部工资作为招聘损失赔偿。

第七条 竞业限制
乙方离职后 2 年内不得从事与甲方相同或类似的业务，甲方无需另行支付经济补偿。

第八条 其他
甲方有权根据经营情况随时调整乙方的工作岗位和工资标准，乙方应服从安排。乙方入职时须交纳岗位保证金 500 元，离职时无息退还。`
  },
  {
    id:'intern',
    type:'实习协议',
    name:'6 个月实习协议',
    sub:'缺意外伤害保险 · 单位可随时终止',
    text:`实习协议

甲方（实习单位）：上海远航文化传播有限公司
乙方（实习学生）：李雨

第一条 实习期限
实习期自 2026 年 7 月 1 日起至 2026 年 12 月 31 日止，共 6 个月。

第二条 实习内容
乙方在甲方新媒体部门从事内容编辑辅助工作，每周实习 5 天，每天 9:00 至 18:00，中午休息 1 小时。

第三条 实习报酬
甲方按每月 1500 元的标准向乙方支付实习补贴，于次月 15 日前发放。实习不足整月的，按实际出勤天数折算。

第四条 实习管理
乙方应遵守甲方各项规章制度。甲方可根据业务需要调整乙方的实习岗位和实习内容。乙方无故缺勤的，甲方有权扣减当日补贴。

第五条 协议解除
乙方提前终止实习的，应提前 15 日书面通知甲方；甲方可随时终止本协议，无需说明理由。

第六条 其他
实习期间，乙方应自行注意人身安全。因乙方个人原因发生的意外，甲方不承担责任。本协议一式两份，双方各执一份。`
  },
  {
    id:'loan',
    type:'培训贷',
    name:'24 期培训分期',
    sub:'共多付 8600 元 · 逾期日息 1% · 不退费',
    text:`职业技能培训及就业服务协议

甲方（培训服务机构）：北京优职教育科技有限公司
乙方（学员）：王浩

第一条 培训项目
甲方为乙方提供“全栈开发就业班”培训，培训周期 6 个月，培训费共计 29800 元。

第二条 付款方式
乙方通过甲方指定的“优学分期”平台办理教育分期，分 24 期支付，每期还款 1480 元，另需支付平台服务费每期 120 元。乙方签署本协议即视为同意向分期平台申请贷款。

第三条 就业服务
甲方承诺为乙方推荐就业机会，但不保证薪资水平和录用结果。乙方完成培训后，无论是否就业，均应按期偿还分期款项。

第四条 退费规则
乙方开课后申请退费的，已缴纳费用不予退还。因乙方个人原因无法继续学习的，剩余分期款项仍需一次性结清。

第五条 违约责任
乙方逾期还款的，每日按未还金额的 1% 支付逾期违约金，并承担甲方为实现债权支出的全部费用。

第六条 其他
本协议自乙方在分期平台完成电子签署之日起生效。`
  },
  {
    id:'three-party',
    type:'三方协议',
    name:'毕业生三方协议',
    sub:'解约违约金 8000 元 · 未按期报到赔偿',
    text:`毕业生就业协议书

甲方（用人单位）：广州云图科技有限公司
乙方（毕业生）：陈晓
丙方（学校）：广东某大学就业指导中心

第一条 就业安排
乙方毕业后到甲方从事产品助理工作，试用期 2 个月，工作地点为广州市天河区。

第二条 协议解除
乙方在毕业前提前解除本协议的，应向甲方支付违约金人民币 8000 元。

第三条 报到义务
乙方未按期报到的，视为违约，须赔偿甲方招聘损失 5000 元。

第四条 单位解除
甲方因自身原因解除本协议的，不承担违约责任，无需赔偿乙方。`
  }
];

const VERDICT_ORDER = {red:0,yellow:1,gray:2,green:3};
const VERDICT_LABEL = {red:'红线',yellow:'黄线',gray:'灰线',green:'绿线'};
const DOC_LABEL = {labor:'劳动合同',intern:'实习协议','three-party':'三方协议',loan:'培训贷',probation:'试用期条款'};
const PACK_LABEL = {labor:'劳动合同', probation:'试用期', intern:'实习协议','three-party':'三方协议', loan:'培训贷'};

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function cnNum(v){
  if(v == null) return NaN;
  const s = String(v).trim().replace(/[〇零]/g,'零').replace(/[，,\s]/g,'');
  if(/^\d+(?:\.\d+)?$/.test(s)) return +s;
  const digits = {零:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
  const units = {十:10,百:100,千:1000,万:10000};
  let total = 0, section = 0, number = 0, seen = false;
  for(const ch of s){
    if(digits[ch] != null){
      number = digits[ch];
      seen = true;
    }else if(units[ch]){
      seen = true;
      if(ch === '万'){
        section = (section + number) * 10000;
        total += section;
        section = 0;
        number = 0;
      }else{
        section += (number || 1) * units[ch];
        number = 0;
      }
    }else{
      return NaN;
    }
  }
  return seen ? total + section + number : NaN;
}
function fmtYuan(n){ return Number(n || 0).toLocaleString('zh-CN'); }
function fmtWan(n){
  if(!n) return '';
  return n >= 10000 && n % 10000 === 0 ? `${n/10000} 万元` : `${fmtYuan(n)} 元`;
}
function parseAmount(str){
  const compact = String(str || '').replace(/[，,\s]/g,'');
  let m = compact.match(/(?:人民币|RMB|¥|￥)?(\d+(?:\.\d+)?)(万元|万|千元|千|元)/);
  if(m){
    let n = parseFloat(m[1]);
    if(!Number.isFinite(n)) return null;
    if(m[2].startsWith('万')) n *= 10000;
    else if(m[2].startsWith('千')) n *= 1000;
    return n;
  }
  m = compact.match(/([一二两三四五六七八九十百千万零〇]+)(万元|万|千元|千|元)/);
  if(m){
    let n = cnNum(m[1]);
    if(!Number.isFinite(n)) return null;
    if(m[2].startsWith('万')) n *= 10000;
    else if(m[2].startsWith('千')) n *= 1000;
    return n;
  }
  return null;
}
function parsePercent(str){
  const s = String(str || '');
  let m = s.match(/(\d+(?:\.\d+)?)\s*[%％]/);
  if(m) return +m[1];
  m = s.match(/百分之\s*([一二两三四五六七八九十百零〇\d]+)/);
  if(m){
    const n = cnNum(m[1]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function makeDate(y,m,d){
  y = +y; m = +m; d = +d;
  if(!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if(m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if(dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  dt.setHours(0,0,0,0);
  return dt;
}
function addDays(d,n){
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + n);
  out.setHours(0,0,0,0);
  return out;
}
function addMonthsClamped(d,n){
  const day = d.getDate();
  const out = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(day, last));
  out.setHours(0,0,0,0);
  return out;
}
function calendarSpan(start,end){
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if(end.getDate() < start.getDate()) months -= 1;
  const anchor = addMonthsClamped(start, Math.max(0, months));
  const days = Math.round((end - anchor) / 86400000);
  return {months:Math.max(0, months), days:Math.max(0, days)};
}
function termBucket(start,end){
  // 合同起止日期通常包含首尾两天，分类时把结束日 +1 天作为排他端点。
  const endExclusive = addDays(end, 1);
  const atLeast3 = addMonthsClamped(start, 3) <= endExclusive;
  const atLeast12 = addMonthsClamped(start, 12) <= endExclusive;
  const atLeast36 = addMonthsClamped(start, 36) <= endExclusive;
  const maxProbation = !atLeast3 ? 0 : !atLeast12 ? 1 : !atLeast36 ? 2 : 6;
  return {atLeast3,atLeast12,atLeast36,maxProbation,endExclusive};
}
function describeSpan(start,end){
  const span = calendarSpan(start, addDays(end, 1));
  const months = span.months;
  const days = span.days;
  if(months >= 12 && months % 12 === 0 && days === 0) return `${months / 12} 年`;
  if(days === 0) return `${months || 0} 个月`;
  return `${months} 个月 ${days} 天`;
}
function parseDateTriplet(y,m,d){
  return makeDate(y,m,d);
}
function clipQuote(q, focusStart, focusEnd){
  const s = String(q || '').replace(/^\s+|\s+$/g,'');
  const MAX = 60;
  if(s.length <= MAX) return s;
  const fs = Number.isFinite(focusStart) ? Math.max(0, Math.min(s.length, focusStart)) : 0;
  const fe = Number.isFinite(focusEnd) ? Math.max(fs, Math.min(s.length, focusEnd)) : Math.min(s.length, fs + 1);
  const punct = /[，。；：、]/;
  const budget = MAX - 4;
  let start = Math.max(0, Math.min(s.length - budget, fe - 46));
  if(start > 0){
    let p = start;
    const cap = Math.min(s.length, start + 22, fs);
    while(p < cap && !punct.test(s[p-1])) p++;
    if(p <= fs && punct.test(s[p-1])) start = p;
  }
  let end = Math.min(s.length, start + budget);
  if(end < s.length && end > fe){
    let p = end;
    const floor = Math.max(fe, start + 16);
    while(p > floor && !punct.test(s[p-1])) p--;
    if(p > fe && punct.test(s[p-1])) end = p;
  }
  const lead = start > 0;
  const trail = end < s.length;
  const bodyBudget = MAX - (lead ? 2 : 0) - (trail ? 2 : 0);
  if(end - start > bodyBudget) end = start + bodyBudget;
  let out = s.slice(start, end);
  if(lead) out = '……' + out;
  if(trail) out = out + '……';
  return out;
}
function sentenceOf(text,re){
  re.lastIndex = 0;
  const m = re.exec(text);
  if(!m) return null;
  let s = m.index, e = m.index + m[0].length;
  const stop = /[。；！？\n]/;
  let guard = 0;
  while(s > 0 && !stop.test(text[s-1]) && guard++ < 600) s--;
  guard = 0;
  while(e < text.length && !stop.test(text[e]) && guard++ < 600) e++;
  if(e < text.length && /[。；！？]/.test(text[e])) e++;
  while(s < e && /\s/.test(text[s])) s++;
  while(e > s && /\s/.test(text[e-1])) e--;
  const matchStart = Math.max(0, Math.min(e-s, m.index - s));
  const matchEnd = Math.max(matchStart, Math.min(e-s, m.index + m[0].length - s));
  return { quote:text.slice(s,e), start:s, end:e, matchStart, matchEnd };
}
function parseProbation(text){
  const s = String(text || '');
  let m = s.match(/试用期(?:限|期限|时间)?\s*(?:为|是|：|:|共)?\s*(\d{1,3}|[一二两三四五六七八九十]{1,4})\s*(?:至|到|—|-|~|～)\s*(\d{1,3}|[一二两三四五六七八九十]{1,4})\s*个?月/);
  if(m){
    const a = cnNum(m[1]), b = cnNum(m[2]);
    if(Number.isFinite(a) && Number.isFinite(b) && b > 0) return Math.max(a,b);
  }
  m = s.match(/试用期(?:限|期限|时间)?\s*(?:为|是|：|:|共)?\s*(\d{1,3}|[一二两三四五六七八九十]{1,4})\s*个?月/);
  if(m){
    const n = cnNum(m[1]);
    if(Number.isFinite(n) && n > 0) return n;
  }
  m = s.match(/试用期(?:限|期限|时间)?\s*(?:为|是|：|:|共)?\s*半年/);
  if(m) return 6;
  m = s.match(/试用期[^。；\n]{0,30}?(?:自\s*)?(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,12}?至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if(m){
    const d1 = makeDate(m[1],m[2],m[3]);
    const d2 = makeDate(m[4],m[5],m[6]);
    if(!d1 || !d2 || d2 < d1) return null;
    const span = calendarSpan(d1, addDays(d2, 1));
    if(span.months > 0 || span.days > 0) return Math.max(1, span.months);
  }
  return null;
}
function parseTermRange(text){
  const s = String(text || '');
  let m = s.match(/(?:自\s*)?(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,16}?至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if(!m) m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})[\s\S]{0,12}?(?:至|到|—|-)[\s\S]{0,4}?(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if(!m) return null;
  const start = makeDate(m[1],m[2],m[3]);
  const end = makeDate(m[4],m[5],m[6]);
  return {start,end,raw:m[0]};
}
function termFromRange(range){
  if(!range || !range.start || !range.end) return null;
  if(range.end < range.start) return {invalid:'reversed',months:0,label:'日期逆序',start:range.start,end:range.end,raw:range.raw};
  const bucket = termBucket(range.start, range.end);
  const span = calendarSpan(range.start, addDays(range.end, 1));
  const label = describeSpan(range.start, range.end);
  return Object.assign({
    months:span.months,
    days:span.days,
    label,
    start:range.start,
    end:range.end,
    raw:range.raw,
    invalid:null
  }, bucket);
}
function parseTermMonths(text){
  const s = String(text || '');
  const range = parseTermRange(s);
  if(range){
    const term = termFromRange(range);
    if(term) return term;
  }
  let m = s.match(/(?:合同期限|合同期|劳动合同期限|期限|有效期)(?:为|是|：|:)?\s*([一二两三四五六七八九十\d]{1,3})\s*年/);
  if(m){
    const y = cnNum(m[1]);
    if(y > 0) return {months:y*12,days:0,label:`${y} 年`,atLeast3:y*12>=3,atLeast12:y>=1,atLeast36:y>=3,maxProbation:y>=3?6:(y>=1?2:1),invalid:null};
  }
  m = s.match(/(?:合同期限|合同期|劳动合同期限|期限|有效期)(?:为|是|：|:)?\s*([一二两三四五六七八九十\d]{1,3})\s*个?月/);
  if(m){
    const mo = cnNum(m[1]);
    if(mo > 0) return {months:mo,days:0,label:`${mo} 个月`,atLeast3:mo>=3,atLeast12:mo>=12,atLeast36:mo>=36,maxProbation:mo>=36?6:(mo>=12?2:(mo>=3?1:0)),invalid:null};
  }
  return null;
}
function parseContractTerm(text){
  const t = String(text || '');
  const noFixed = t.split(/[。；\n]/).find(s => /无固定期限/.test(s) && /(本合同|合同期限|期限为|约定为|订立|签订)/.test(s) && !/(可以|可订立|协商|续订|再次|期满后)/.test(s));
  if(noFixed) return {months:9999,days:0,label:'无固定期限',atLeast3:true,atLeast12:true,atLeast36:true,maxProbation:6,invalid:null};
  if(/以完成一定工作任务为期限/.test(t)) return {months:0,days:0,label:'以完成一定工作任务为期限',atLeast3:false,atLeast12:false,atLeast36:false,maxProbation:0,invalid:null};
  const parts = t.split(/[\n。；]/).map(s => s.trim()).filter(Boolean);
  const nonProbation = parts.filter(s => !/(试用期|实习期|培训期)/.test(s));
  const groups = [
    {re:/(合同期限|劳动合同期限|合同期|合同有效期|本协议有效期|协议有效期|实习期限|实习期|协议期限)/, list:parts},
    {re:/期限/, list:nonProbation},
    {re:/自\s*\d{4}\s*年|(\d{4})[-/.]\d{1,2}[-/.]\d{1,2}/, list:nonProbation}
  ];
  for(const group of groups){
    for(const s of group.list){
      if(!group.re.test(s)) continue;
      const term = parseTermMonths(s);
      if(term) return term;
    }
  }
  if(/(合同期限|劳动合同期限|合同期|合同有效期)/.test(t)){
    const term = parseTermMonths(t);
    if(term) return term;
  }
  return null;
}
function findClauseHeadings(text){
  const out = [];
  const seen = new Set();
  const add = (index,length,style) => {
    if(index < 0 || seen.has(index)) return;
    seen.add(index);
    out.push({index,length,style});
  };
  const article = /第[一二三四五六七八九十百零〇\d]+条/g;
  let m;
  while((m = article.exec(text))){
    const i = m.index;
    const before = text.slice(Math.max(0, i-12), i);
    const attPrefix = before.match(/(附件[一二三四五六七八九十百零〇\d]*[ \t　:：、.．]*)$/);
    const startIndex = attPrefix ? i - attPrefix[1].length : i;
    const beforeStart = text.slice(Math.max(0, startIndex-8), startIndex);
    const atStart = startIndex === 0 || /(^|\n)[ \t　]*$/.test(beforeStart) || /[。；][ \t　]*$/.test(beforeStart);
    if(!atStart) continue;
    const after = text.slice(i + m[0].length, i + m[0].length + 1);
    const afterFew = text.slice(i + m[0].length, i + m[0].length + 8);
    if(/[款项项目]/.test(after)) continue;
    if(!/[ \t　、：:．.]/.test(after) && /^(规定|约定|的约定|之规定|所称)/.test(afterFew)) continue;
    if(!/(^|\n)[ \t　]*$/.test(beforeStart) && /^(优先|不优先|继续|仍然|另有|已经|有效|适用)/.test(afterFew)) continue;
    const lineEnd = text.indexOf('\n', startIndex);
    const lineLen = (lineEnd < 0 ? text.length : lineEnd) - startIndex;
    if(!/[ \t　、：:．.]/.test(after) && lineLen > 32) continue;
    add(startIndex, i + m[0].length - startIndex, 'article');
  }
  const list = /(^|\n)[ \t　]*([一二三四五六七八九十]+、|\d{1,2}[.、．])/g;
  while((m = list.exec(text))){
    const idx = m.index + m[0].indexOf(m[2]);
    if(/\d/.test(text[idx + m[2].length] || '')) continue;
    add(idx, m[2].length, 'list');
  }
  return out.sort((a,b) => a.index - b.index);
}
function extractClauses(text){
  const raw = String(text).replace(/\r\n?/g,'\n');
  const headings = findClauseHeadings(raw);
  const groups = [];
  if(headings.length){
    const first = headings[0].index;
    const pre = raw.slice(0, first).trim();
    if(pre) groups.push({kind:'preamble',heading:'',body:pre,text:pre,start:0,end:first,numbered:false});
    headings.forEach((h,i) => {
      const start = h.index;
      const end = i+1 < headings.length ? headings[i+1].index : raw.length;
      const seg = raw.slice(start, end);
      if(!seg.trim()) return;
      const lineEnd = raw.indexOf('\n', start);
      const hasNewline = lineEnd >= 0 && lineEnd < end;
      const firstLineEnd = hasNewline ? lineEnd : end;
      const firstLine = raw.slice(start, firstLineEnd).trim();
      let heading, body;
      if(hasNewline && firstLine.length <= 28 && !/[。；]/.test(firstLine)){
        heading = firstLine;
        body = raw.slice(firstLineEnd, end).replace(/^\n+/,'').trim();
      }else if(!hasNewline){
        const restRaw = raw.slice(start + h.length, end);
        const titleM = restRaw.match(/^[\s\u3000]*([^。；：:\n]{1,14})[：:]/);
        heading = raw.slice(start, start + h.length).trim() + (titleM ? ' ' + titleM[1].trim() : '');
        body = (titleM ? restRaw.slice(titleM[0].length) : restRaw).replace(/^[\s\u3000：:、.．]+/,'').trim();
      }else{
        heading = raw.slice(start, start + h.length).trim();
        body = raw.slice(start + h.length, end).replace(/^[\s\u3000]+/,'').trim();
      }
      groups.push({kind:'clause',heading,body,text:seg.trim(),start,end,numbered:true});
    });
  }else{
    const parts = [];
    let start = 0;
    const re = /\n[ \t　]*\n+/g;
    let m;
    while((m = re.exec(raw))){
      const seg = raw.slice(start, m.index);
      if(seg.trim()) parts.push({start,end:m.index,text:seg.trim()});
      start = re.lastIndex;
    }
    const last = raw.slice(start);
    if(last.trim()) parts.push({start,end:raw.length,text:last.trim()});
    if(parts.length <= 1){
      const body = raw.trim();
      if(body) groups.push({kind:'body',heading:'',body,text:body,start:0,end:raw.length,numbered:false});
    }else{
      parts.forEach(p => groups.push({kind:'body',heading:'',body:p.text,text:p.text,start:p.start,end:p.end,numbered:false}));
    }
  }
  return groups.map((g,i) => Object.assign({},g,{index:i}));
}
function clauseLabel(clause,fallbackIndex){
  const h = String(clause.heading || '').trim();
  if(h) return h.length > 28 ? h.slice(0,28) + '…' : h;
  return fallbackIndex === 0 ? '文首' : `第 ${fallbackIndex+1} 段`;
}
function detectDocType(text){
  const t = String(text || '');
  const firstLines = t.split('\n').map(s => s.trim()).filter(Boolean).slice(0,5).join('\n');
  const score = {labor:0,intern:0,'three-party':0,loan:0};
  const add = (key,n) => { score[key] += n; };

  if(/(毕业生就业协议|三方协议|三方协议书|就业协议书)/.test(firstLines)) add('three-party',9);
  else if(/(三方|就业协议)/.test(firstLines)) add('three-party',5);
  if(/劳动合同/.test(firstLines)) add('labor',8);
  if(/(实习协议|实习合同|实习协议书)/.test(firstLines)) add('intern',8);
  else if(/实习/.test(firstLines) && /(协议|合同)/.test(firstLines)) add('intern',4);
  if(/(培训贷|教育分期|分期贷款|助学贷款|培训分期|学费分期)/.test(firstLines)) add('loan',7);
  else if(/(培训|教育|课程|学员|学费)/.test(firstLines) && /(分期|贷款|还款|月供|服务费|利息)/.test(firstLines)) add('loan',3);

  if(/(三方协议|三方协议书|毕业生就业协议|就业协议书)/.test(t)) add('three-party',4);
  if(/毕业生/.test(t) && /(学校|用人单位)/.test(t)) add('three-party',3);
  if(/(实习协议|实习合同|实习单位|实习学生)/.test(t)) add('intern',4);
  if(/(实习期|实习补贴|实习岗位|实习证明)/.test(t)) add('intern',2);
  if(/(劳动合同|劳动者|用人单位)/.test(t)) add('labor',3);
  if(/(试用期|工作岗位|劳动报酬|社会保险|竞业限制|服务期)/.test(t)) add('labor',2);
  if(/(甲方（用人单位）|乙方（劳动者）|甲方\(用人单位\)|乙方\(劳动者\))/.test(t)) add('labor',3);
  if(/(分期|贷款|放款|还款|月供|平台服务费)/.test(t)) add('loan',3);
  if(/(培训费|课程|学员|培训机构|教育科技|学费)/.test(t)) add('loan',3);
  if(/(贷款|借款|分期)[^。；\n]{0,20}(协议|合同)/.test(t)) add('loan',2);

  if(/(不构成劳动关系|不属于劳动关系|实习关系)/.test(t)) add('labor',-2);
  if(/(劳务(协议|合同)|承揽合同)/.test(firstLines) && !/劳动合同/.test(firstLines)) score.labor = 0;
  if(/(房租|租赁|买卖|装修|运输|委托)/.test(firstLines) && !/(劳动|实习|培训|就业)/.test(firstLines)) return 'other';

  const coreFinancing = /(培训贷|分期|贷款|放款|还款|月供|利息|征信)/.test(t);
  if(!coreFinancing) score.loan = 0;
  if(score.loan > 0 && !/(培训|教育|课程|学员|学费|技能)/.test(t)) score.loan = 0;

  const ranked = Object.entries(score).sort((a,b) => b[1] - a[1]);
  const [best,bestScore] = ranked[0];
  if(bestScore < 3) return 'other';
  return best;
}
function looksLikeContract(text){
  const t = String(text).trim();
  if(t.length < 12) return false;
  const hasPair = /甲方|乙方/.test(t);
  const hasTerms = /第[一二三四五六七八九十百零〇\d]+条/.test(t);
  const hasAgreement = /协议|合同|条款/.test(t);
  return hasPair || hasTerms || (hasAgreement && t.length > 60);
}
function guessTextKind(text){
  if(!String(text).trim()) return '空白文本';
  if(/简历|教育经历|项目经历|技能特长|求职意向/.test(text)) return '简历';
  if(/招聘|岗位职责|任职要求|投递简历|面试安排/.test(text)) return '招聘信息';
  if(/通知|会议|放假|安排如下/.test(text)) return '一则通知';
  if(/老师|同学|作业|考试安排/.test(text)) return '聊天或校内消息';
  return '一段普通文本';
}
function fmtDate(d){
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

/* ---------- analysis engine ---------- */

function clauseFull(clause){
  return `${clause.heading ? clause.heading + '\n' : ''}${clause.body || ''}`;
}
function qFor(clause,re){
  const body = clause.body || '';
  const s = sentenceOf(body,re);
  if(!s || !s.quote) return null;
  return {quote:clipQuote(s.quote, s.matchStart, s.matchEnd),raw:s.quote,start:s.start,end:s.end};
}
function qAny(clause,re){
  const q = qFor(clause,re);
  if(q) return q;
  if(clause.heading){
    const s = sentenceOf(clause.heading,re);
    if(s && s.quote){
      return {quote:clipQuote(s.quote, s.matchStart, s.matchEnd),raw:s.quote,start:null,end:null,headingOnly:true};
    }
  }
  return null;
}
function sentenceList(text){
  const s = String(text || '');
  const list = [];
  let start = 0;
  for(let i = 0; i <= s.length; i++){
    const ch = s[i];
    if(i === s.length || ch === '。' || ch === '；' || ch === '\n'){
      const raw = s.slice(start, i).trim();
      if(raw){
        const lead = s.slice(start, i).search(/\S/);
        const st = start + Math.max(0, lead);
        list.push({quote:raw, start:st, end:st + raw.length});
      }
      start = i + 1;
    }
  }
  return list;
}
function qFilter(clause,re,excludeRe){
  const list = sentenceList(clause.body || '');
  for(const s of list){
    const excluded = typeof excludeRe === 'function' ? excludeRe(s.quote) : (excludeRe && excludeRe.test(s.quote));
    if(excluded) continue;
    const m = re.exec(s.quote);
    if(m){
      const ms = m.index;
      const me = m.index + m[0].length;
      return {quote:clipQuote(s.quote, ms, me), raw:s.quote, start:s.start, end:s.end};
    }
  }
  if(excludeRe) return null;
  return qFor(clause, re);
}
function amountNear(text,re){
  const s = String(text || '');
  const m = re.exec(s);
  if(!m) return parseAmount(s);
  const win = s.slice(Math.max(0, m.index - 12), Math.min(s.length, m.index + 64));
  return parseAmount(win) || parseAmount(s);
}
function maxAmountAfter(text,re){
  const s = String(text || '');
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let max = null;
  let m;
  while((m = g.exec(s))){
    const v = parseAmount(s.slice(m.index));
    if(v != null && (max == null || v > max)) max = v;
    if(m.index === g.lastIndex) g.lastIndex++;
  }
  return max;
}
function addItem(ctx,data){
  if(data.clauseIndex != null && data.ruleId && data.ruleName){
    const dup = ctx.items.some(it => it.clauseIndex === data.clauseIndex && it.ruleId === data.ruleId && it.ruleName === data.ruleName);
    if(dup) return;
  }
  if(data.verdict !== 'green' && data.clauseIndex != null){
    ctx.items = ctx.items.filter(it => !(it.verdict === 'green' && it.clauseIndex === data.clauseIndex));
  }
  const base = data.base || String(data.ruleId).split('-')[0];
  ctx.seq[base] = (ctx.seq[base] || 0) + 1;
  const id = `${base}-${String(ctx.seq[base]).padStart(2,'0')}`;
  ctx.items.push(Object.assign({},data,{id,seq:ctx.step++}));
}
function hasNonGreen(ctx,clauseIndex){
  return ctx.items.some(it => it.clauseIndex === clauseIndex && it.verdict !== 'green');
}
function addGreen(ctx,clause,ruleName,re,line){
  if(!clause) return;
  if(hasNonGreen(ctx,clause.index)) return;
  if(ctx.items.filter(it => it.verdict === 'green').length >= 5) return;
  const q = qAny(clause,re) || {quote:'',range:null};
  addItem(ctx,{
    base:'G',ruleId:'常规',verdict:'green',ruleName,
    short:ruleName,clauseIndex:clause.index,location:clauseLabel(clause,clause.index),
    quote:q.quote,range:q.range===null?null:q,consequence:line,basis:null,ask:'',counter:'',confidence:'高',loss:0
  });
}
function addPatternItem(ctx,c,data,quoteRe,sentenceExclude){
  const q = c ? (qFilter(c,quoteRe,sentenceExclude) || qAny(c,quoteRe)) : null;
  addItem(ctx,Object.assign({
    quote:q ? q.quote : '',range:q||null,
    clauseIndex:c ? c.index : null,location:c ? clauseLabel(c,c.index) : '全文'
  },data));
}
function commaParts(text){
  const s = String(text || '');
  const out = [];
  let start = 0;
  for(let i = 0; i <= s.length; i++){
    const ch = s[i];
    if(i === s.length || ch === '，' || ch === ','){
      const raw = s.slice(start, i).trim();
      if(raw){
        const lead = s.slice(start, i).search(/\S/);
        const st = start + Math.max(0, lead);
        out.push({quote:raw,start:st,end:st + raw.length});
      }
      start = i + 1;
    }
  }
  return out;
}
function addPending(ctx,list){
  (list || []).forEach(p => { if(p && !ctx.pending.includes(p)) ctx.pending.push(p); });
}
function toCents(n){
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}
function partTimeInfo(text){
  const t = String(text || '');
  const isPartTime = /(非全日制|小时工|按小时计酬)/.test(t);
  const dm = t.match(/每(?:日|天)[^。；\n]{0,12}?(\d+(?:\.\d+)?)\s*小时/);
  const wm = t.match(/每周[^。；\n]{0,12}?(\d+(?:\.\d+)?)\s*小时/);
  const daily = dm ? +dm[1] : null;
  const weekly = wm ? +wm[1] : null;
  const solid = isPartTime && daily != null && weekly != null && daily <= 4 && weekly <= 24;
  return {isPartTime,daily,weekly,solid};
}
function evidenceOf(c,re,role){
  if(!c) return null;
  const q = re ? (qFilter(c,re) || qAny(c,re)) : null;
  const ev = {clauseIndex:c.index,start:q ? q.start : null,end:q ? q.end : null,role,quote:q ? q.quote : ''};
  return ev;
}
function paymentDirection(sentence){
  const s = String(sentence || '');
  const negated = /(?:无须|无需|不需|不必|免于|不用)[^。；\n]{0,14}(?:支付|承担|赔偿|给付|缴纳)/.test(s)
    || /(?:不|未)[^。；\n]{0,6}(?:支付|承担|赔偿|给付)[^。；\n]{0,8}(?:违约金|赔偿|罚款)/.test(s);
  const partyRe = /(甲方|乙方|公司|用人单位|单位|劳动者|员工|本人)/g;
  const receiverRe = /(?:向|给)([^，。；\n]{0,10}?)(甲方|乙方|公司|用人单位|单位|劳动者|员工|本人)\s*$/;
  const kindOf = party => /^(?:甲方|公司|用人单位|单位)$/.test(party) ? 'employer' : 'employee';
  const payers = [];
  const predRe = /(支付|赔偿|承担|缴纳|给付)/g;
  let pred;
  let lastCut = null;
  while((pred = predRe.exec(s))){
    const prefix = s.slice(0, pred.index);
    const cut = Math.max(prefix.lastIndexOf('，'), prefix.lastIndexOf(','), prefix.lastIndexOf('；'), prefix.lastIndexOf(';'), prefix.lastIndexOf('。'), prefix.lastIndexOf('\n'));
    if(cut === lastCut) continue;
    lastCut = cut;
    const segment = prefix.slice(cut + 1);
    const recv = segment.match(receiverRe);
    const before = recv ? segment.slice(0, recv.index) : segment;
    const parties = Array.from(before.matchAll(partyRe));
    if(parties.length) payers.push(kindOf(parties[parties.length - 1][1]));
  }
  const employeePays = payers.includes('employee');
  const employerPays = payers.includes('employer') && !employeePays;
  return {negated,employerPays,employeePays};
}
function actualLossOnly(sentence){
  const s = String(sentence || '');
  if(!/实际损失/.test(s)) return false;
  if(!/(?:赔偿|承担)[^。；\n]{0,8}(?:责任)?/.test(s)) return false;
  if(/(\d[\d,.]*\s*(?:万元|万|千元|千|元))|(?:不低于|至少|最低)[^。；\n]{0,8}(?:元|赔偿)/.test(s)) return false;
  return /(?:违反[^。；\n]{0,10}法定程序|违法[^。；\n]{0,8}解除|违反[^。；\n]{0,10}(?:规定|法律)|提前解除|解除劳动合同)/.test(s);
}
function clauseHasBlankValue(text){
  const t = String(text || '');
  if(!/_{2,}|＿{2,}|—{2,}|-{3,}|…{2,}|\.{4,}/.test(t)) return false;
  const stripped = t
    .replace(/第[一二三四五六七八九十百零〇\d]+条/g,'')
    .replace(/(甲方|乙方|丙方|用人单位|劳动者|合同期限|劳动合同期限|工作内容|工作岗位|工作地点|工作时间|休息休假|劳动报酬|工资|社会保险|劳动保护|劳动条件|职业危害防护|名称|住所|法定代表人|姓名|住址|身份证件号码|其他)[^。；\n]{0,8}[：:]?/g,'')
    .replace(/[_＿—\-…\.\s：:、，。；（）()]/g,'');
  const residue = stripped.replace(/(?:劳动合同书?|劳动合同|协议书?|合同书?)/g,'');
  return stripped.length < 2 || residue.length < 2;
}

/* R1 试用期期限 */
function runR1(ctx){
  const extendRe = /(?:试用期[^。；\n]{0,16}(?:可以|可|经[^。；\n]{0,8}同意)?(?:延长|顺延|再延)|(?:延长|顺延)[^。；\n]{0,12}试用期|再次约定[^。；\n]{0,10}试用期|二次试用|重复试用|续签[^。；\n]{0,16}约定[^。；\n]{0,6}试用期)/;
  const extendC = ctx.clauses.find(cl => extendRe.test(clauseFull(cl)) && !/(不得|禁止|不能|不再)[^。；\n]{0,8}(?:延长|顺延)/.test(clauseFull(cl)));
  if(extendC){
    addPatternItem(ctx,extendC,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'延长或重复约定试用期',
      short:'试用期被延长或重复约定',consequence:'同一单位与同一劳动者只能约定一次试用期；延长、二次试用或续签时重新约定，超出法定上限的部分不成立，但公司可能先按延长后的低工资执行。',
      ask:'HR：这次是第几次约定试用期？延长依据是什么？',counter:'删除延长或二次试用；同一段劳动关系只保留一次法定上限内的试用期。',
      basis:LAW.L19,confidence:'高',loss:0
    },extendRe);
  }
  const autoExtendC = ctx.clauses.find(cl => /(?:原)?试用(?:期|资格)[^。；\n]{0,16}(?:自动)?(?:顺延|延长)[^。；\n]{0,12}(?:日|天|个月)/.test(clauseFull(cl)) && !/(不得|禁止|不能)[^。；\n]{0,8}(?:顺延|延长)/.test(clauseFull(cl)));
  if(autoExtendC){
    const t = clauseFull(autoExtendC);
    const m = t.match(/(?:顺延|延长)[^。；\n]{0,12}?([一二两三四五六七八九十\d]{1,4})\s*(?:日|天|个月)/);
    const n = m ? (/^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1])) : null;
    const termInfo = parseContractTerm(ctx.text);
    const max = termInfo && !termInfo.invalid ? termInfo.maxProbation : null;
    const q = qFilter(autoExtendC, /(?:原)?试用(?:期|资格)?[^。；\n]{0,24}(?:顺延|延长)[^。；\n]{0,16}/) || qAny(autoExtendC, /(顺延|延长)/);
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'试用期自动顺延',
      short:'试用期被自动顺延',clauseIndex:autoExtendC.index,location:clauseLabel(autoExtendC,autoExtendC.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:`合同把“待转正”直接变成自动顺延${n ? ` ${n} 日` : ''}，顺延期间仍按试用待遇；这等于在约定试用期之外继续延长试用期，同一段劳动关系只能约定一次试用期${max != null ? `，约 ${termInfo.label} 合同对应的上限是 ${max} 个月` : ''}。顺延期间的工资差额和超期履行问题要另行核对。`,
      ask:'HR：顺延后试用期一共多久？顺延期间工资按什么标准发？',counter:'删除自动顺延；按合同期限对应的法定上限一次性约定，转正条件与期限分开处理。',
      basis:LAW.L19,confidence:'高',loss:0
    });
  }
  const includeRe = /(?:试用期[^。；\n]{0,16}(?:不(?:计入|包括在|包含在)|另行计算|除外)[^。；\n]{0,10}(?:合同期限|劳动合同期限)|(?:合同期限|劳动合同期限)[^。；\n]{0,16}(?:不(?:包括|含|计入))[^。；\n]{0,8}试用期)/;
  const includeC = ctx.clauses.find(cl => includeRe.test(clauseFull(cl)));
  if(includeC){
    addPatternItem(ctx,includeC,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'试用期不计入合同期限',
      short:'试用期被排除在合同期外',consequence:'试用期依法包含在劳动合同期限内。把它排除在外，会连带影响合同期限、社保起算和试用期上限的判断。',
      ask:'HR：试用期是否包含在劳动合同期限内？',counter:'改为“试用期包含在劳动合同期限内”，并写清合同起止日期。',
      basis:LAW.L19,confidence:'高',loss:0
    },includeRe);
  }
  const trialLikeC = ctx.clauses.find(cl => !/试用期/.test(clauseFull(cl)) && /(试岗期|见习期|适应期|磨合期)/.test(clauseFull(cl)));
  if(trialLikeC){
    addPatternItem(ctx,trialLikeC,{
      base:'R1',ruleId:'R1',verdict:'gray',ruleName:'非试用期名义的考察期',
      short:'试岗/见习期性质不明',consequence:'文本没有写“试用期”，但出现试岗期、见习期或适应期。名称不同不代表不受试用期规则约束；如果实际按低工资、随意辞退管理，仍可能被认定为试用期。',
      ask:'HR：这段考察期的工资、社保和解除条件是否与正式员工一致？',counter:'写清考察期性质与待遇；如按试用期管理，直接使用“试用期”并遵守法定上限。',
      basis:LAW.L19,confidence:'中',loss:0
    },/(试岗期|见习期|适应期|磨合期)/);
  }
  const probClauses = ctx.clauses.filter(cl => /试用期/.test(clauseFull(cl)) && parseProbation(clauseFull(cl)));
  if(!probClauses.length) return;

  const partTime = partTimeInfo(ctx.text);
  if(partTime.solid){
    const c = probClauses[0];
    addPatternItem(ctx,c,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'非全日制约定试用期',
      short:'非全日制不得约定试用期',
      consequence:`合同写明非全日制（每日 ${partTime.daily} 小时、每周 ${partTime.weekly} 小时），仍约定试用期 ${parseProbation(clauseFull(c))} 个月；《劳动合同法》第七十条禁止非全日制约定试用期，这段试用期不成立，相关低工资和解除安排应按非全日制核对。`,
      ask:'HR：既然是每日不超过 4 小时的非全日制，为什么还约定试用期？',
      counter:'删除试用期约定；按非全日制的小时计酬和 15 日结算周期执行。',
      basis:LAW.L70,confidence:'高',loss:0
    },/试用期[^。；\n]{0,20}/);
    return;
  }

  const term = parseContractTerm(ctx.text);
  if(!term){
    const c = probClauses[0];
    const prob = parseProbation(clauseFull(c));
    const q = qAny(c,/(试用期[^。；\n]{0,40}?(?:个月|月))/) || qAny(c,/试用期/);
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'gray',ruleName:'试用期期限无法核对',
      short:`试用期 ${prob} 个月未对应期限`,clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q ? q.quote : '',range:q,consequence:`约定试用期 ${prob} 个月，但文本里没有写合同期限；无法核对法定上限，先让 HR 把起止日期写清。`,
      ask:'HR：合同期限是多久？试用期为什么定这个长度？',counter:'写明合同起止日期，并按期限对应的上限改短试用期。',
      basis:LAW.L19,confidence:'中',loss:0
    });
    return;
  }
  if(term.invalid){
    const c = probClauses[0];
    const q = qAny(c,/试用期/) || qAny(ctx.clauses.find(cl => /期限/.test(clauseFull(cl))) || c,/\d{4}\s*年[\s\S]{0,20}\d{4}\s*年/);
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'gray',ruleName:'合同期限日期异常',
      short:'合同起止日期逆序或无效',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q ? q.quote : '',range:q,
      consequence:`合同起止日期无法形成有效期限（${term.label}），试用期上限、社保起算和到期日都不能据此计算；先核对原件和补签日期。`,
      ask:'HR：合同起止日期是否写反或写错？能否提供盖章原件的日期页？',
      counter:'按真实起止日期重写合同期限；日期逆序或无效时不要先签。',
      basis:LAW.L19,confidence:'中',loss:0
    });
    return;
  }

  const max = term.maxProbation;
  const values = [];
  probClauses.forEach(c => {
    const full = clauseFull(c);
    const prob = parseProbation(full);
    if(!prob) return;
    values.push({clause:c,prob});
    const q = qAny(c,/(试用期[^。；\n]{0,40}?(?:个月|月))/) || qAny(c,/试用期/);
    const loc = clauseLabel(c,c.index);
    if(prob > max){
      const excess = prob - max;
      const cons = max === 0
        ? `合同期限约 ${term.label}，依法不得约定试用期，这里却写了 ${prob} 个月；这段期间应按正常工资标准支付。若已经履行，可另核第 83 条赔偿，需要已履行期间和试用期满月工资。`
        : `合同期限约 ${term.label}，试用期上限 ${max} 个月，这里写了 ${prob} 个月；多出的 ${excess} 个月工资差额可主张补足。若已经履行超期部分，可另核第 83 条赔偿，需要已履行期间和试用期满月工资。`;
      addItem(ctx,{
        base:'R1',ruleId:'R1',verdict:'red',ruleName:'试用期超过法定上限',
        short:`试用期超上限 ${excess} 个月`,clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q,consequence:cons,
        ask:`HR：${term.label}合同为什么约定 ${prob} 个月试用期？`,counter:`按上限改为 ${max} 个月，并写明合同起止日期。`,
        basis:LAW.L19,confidence:'高',loss:0
      });
    }else{
      addGreen(ctx,c,'试用期期限',/试用期/,`试用期 ${prob} 个月，未超过约 ${term.label} 合同对应的上限 ${max} 个月。`);
    }
  });

  const unique = Array.from(new Set(values.map(v => v.prob)));
  if(unique.length > 1){
    const labels = values.map(v => `${clauseLabel(v.clause,v.clause.index)} 为 ${v.prob} 个月`).join('；');
    const over = values.filter(v => v.prob > max).map(v => `${clauseLabel(v.clause,v.clause.index)} 的 ${v.prob} 个月`);
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'试用期期限约定冲突',
      short:`试用期出现 ${unique.length} 种期限`,clauseIndex:null,location:'全文',
      quote:values.map(v => (qAny(v.clause,/试用期/) || {}).quote).filter(Boolean).join(' / '),
      range:null,evidence:values.map(v => evidenceOf(v.clause,/试用期/,'试用期限')),
      consequence:`文本对试用期给出不同期限：${labels}${over.length ? `。其中 ${over.join('、')} 超过约 ${term.label} 合同对应的上限 ${max} 个月` : ''}。这些约定不能同时成立，请先确认适用哪一条或哪份补充文件，再判断工资和解除条件。`,
      ask:'HR：以哪一条试用期约定为准？是否另有补充协议或附件？',
      counter:'只保留一条与合同期限匹配的试用期，删除其余冲突表述；如已履行较长试用期，另核工资差额和第 83 条赔偿。',
      basis:LAW.L19,confidence:'高',loss:0
    });
  }
}

/* R2 试用期工资 */
function parseRegWage(text){
  const m = String(text || '').match(/(?:转正后|转正|正式|录用后|合同约定)(?:工资|月薪|薪资|报酬)?\s*(?:为|按|是|：|:)?\s*(?:每月|月)?\s*(?:人民币)?\s*([\d,]+(?:\.\d+)?|[一二两三四五六七八九十百千万]+)\s*(?:元|千元|万元)/);
  return m ? parseAmount(m[0]) : null;
}

function runR2(ctx){
  const probationClauses = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /试用期/.test(t) && (parseProbation(t) || /试用期[^。；\n]{0,16}(工资|月薪|薪资|报酬)|试用期[^。；\n]{0,30}(元|%|％|百分之)/.test(t));
  });
  if(!probationClauses.length) return;
  const globalReg = parseRegWage(ctx.text);
  const noPayRe = /(?:试用期[^。；\n]{0,20}(?:无薪|不发工资|无工资|不支付工资|零工资|工资(?:为|是)?\s*0\s*元)|(?:无薪|免费)[^。；\n]{0,8}试用)/;
  const entries = [];

  probationClauses.forEach(c => {
    const full = clauseFull(c);
    const probPayMatch = full.match(/试用期(?:工资|月薪|薪资|报酬)?\s*(?:为|按|是|不低于|：|:)?\s*(?:每月|月)?\s*(?:人民币)?\s*([\d,]+(?:\.\d+)?|[一二两三四五六七八九十百千万]+)\s*(?:元|千元|万元)/);
    const probPay = probPayMatch ? parseAmount(probPayMatch[0]) : null;
    const probPercentMatch = full.match(/试用期[^。；\n]{0,30}?(?:转正后|转正|正式|合同约定|约定工资|工资)[^。；\n]{0,16}?(?:的|\s)(\d+(?:\.\d+)?)\s*[%％]/);
    const probPercentCN = probPercentMatch ? null : full.match(/试用期[^。；\n]{0,30}?百分之\s*([一二两三四五六七八九十百零〇\d]+)/);
    let probPercent = probPercentMatch ? +probPercentMatch[1] : (probPercentCN ? cnNum(probPercentCN[1]) : null);
    if(probPercent == null && /(工资|薪|报酬|发放|标准)/.test(full)){
      const directPct = full.match(/试用期[^。；\n]{0,30}?(\d+(?:\.\d+)?)\s*[%％]/);
      const directCheng = full.match(/试用期[^。；\n]{0,30}?([一二三四五六七八九])成/);
      if(directPct) probPercent = +directPct[1];
      else if(directCheng){ const n = cnNum(directCheng[1]); if(Number.isFinite(n)) probPercent = n * 10; }
    }
    const percentText = probPercentMatch ? probPercentMatch[0] : (probPercentCN ? probPercentCN[0] : '');
    const percentIsFloor = /(不低于|至少|最低)/.test(percentText);
    const reg = parseRegWage(full) != null ? parseRegWage(full) : globalReg;
    const q = qAny(c,/(试用期[^。；\n]{0,40}(?:元|%|％|百分之[一二两三四五六七八九十百]+|[一二两三四五六七八九十]+成))/)
      || qAny(c,/(试用期[^。；\n]{0,40}(?:工资|薪资|月薪|报酬))/)
      || qAny(c,/试用期/);
    const loc = clauseLabel(c,c.index);
    const months = parseProbation(full);
    const noPay = noPayRe.test(full);
    const probCents = probPay != null ? toCents(probPay) : null;
    const regCents = reg != null ? toCents(reg) : null;
    const floorCents = regCents != null ? Math.round(regCents * 0.8) : null;
    const amountTooLow = probCents != null && floorCents != null && probCents < floorCents;
    const percentTooLow = probPercent != null && probPercent < 80;
    entries.push({clause:c, noPay, probPay, probPercent, reg, amountTooLow, percentTooLow, months, q, loc, floorCents, probCents});

    if(noPay){
      addPatternItem(ctx,c,{
        base:'R2',ruleId:'R2',verdict:'red',ruleName:'试用期不支付工资',
        short:'试用期无薪',consequence:`试用期也是劳动关系，必须支付工资且不得低于当地最低工资标准；“无薪试用”的约定不产生效力${reg != null ? `，按转正工资 ${fmtYuan(reg)} 元计算，试用期至少应发 ${fmtYuan(reg*0.8)} 元/月` : ''}。`,
        ask:'HR：试用期按什么标准发工资？',counter:'删除无薪约定，按不低于约定工资 80% 且不低于当地最低工资支付。',
        basis:LAW.L20,confidence:'高',loss:reg != null && months ? Math.round(regCents * 0.8) / 100 * months : 0
      },noPayRe);
      return;
    }
    const scopeRe = /(?:试用期[^。；\n]{0,24}(?:只|仅)[^。；\n]{0,10}(?:发放|发|领取|按)[^。；\n]{0,8}(?:基本工资|底薪)|试用期[^。；\n]{0,20}(?:不享受|不参与|不含|不含绩效)[^。；\n]{0,10}(?:绩效|奖金|提成|补贴))/;
    if(scopeRe.test(full) && !amountTooLow && !percentTooLow){
      addPatternItem(ctx,c,{
        base:'R2',ruleId:'R2',verdict:'gray',ruleName:'试用期工资口径不明',
        short:'试用期只发基本工资',consequence:'合同把试用期工资限定为基本工资，或不参与绩效、奖金。80% 的比较基数应是约定工资；如果转正工资还包含固定发放的绩效或补贴，实际试用期工资可能低于下限。',
        ask:'HR：试用期工资是否包含绩效、补贴？转正工资的固定部分是多少？',counter:'写明试用期与转正工资的完整构成，按同一口径计算 80% 下限。',
        basis:LAW.L20,confidence:'中',loss:0
      },scopeRe);
      return;
    }

    if(amountTooLow || percentTooLow){
      const diffCents = amountTooLow ? floorCents - probCents : 0;
      const diff = diffCents / 100;
      const cons = amountTooLow
        ? `转正工资 ${fmtYuan(reg)} 元，试用期最低应 ${fmtYuan(floorCents/100)} 元；现按 ${fmtYuan(probPay)} 元发，每月少 ${fmtYuan(diff)} 元${months ? `，合同写的 ${months} 个月共少 ${fmtYuan(diff*months)} 元` : ''}${percentTooLow ? `。条款还另写了 ${probPercent}% 的比例，低于 80% 下限` : ''}。`
        : `合同把试用期工资写成转正工资的 ${probPercent}%${reg != null ? `（即约 ${fmtYuan(reg*probPercent/100)} 元/月；法定下限 ${fmtYuan(floorCents/100)} 元/月，每月少 ${fmtYuan(Math.max(0, floorCents/100 - reg*probPercent/100))} 元）` : ''}，低于法定 80% 下限${probPay != null ? `；虽然另写了 ${fmtYuan(probPay)} 元，但按低比例执行的风险仍在` : ''}。`;
      addItem(ctx,{
        base:'R2',ruleId:'R2',verdict:'red',ruleName:'试用期工资低于约定工资的 80%',
        short:'试用期工资低于 80%',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:cons,
        ask:'HR：试用期工资为什么低于转正工资的 80%？',counter:'改为不低于转正工资的 80%，且不低于当地最低工资标准。',
        basis:LAW.L20,confidence:'高',loss:amountTooLow ? diff * (months || 1) : (reg != null ? Math.max(0, reg*(80-probPercent)/100) * (months || 1) : 0)
      });
      return;
    }

    if(probPay != null){
      if(reg == null){
        addItem(ctx,{
          base:'R2',ruleId:'R2',verdict:'gray',ruleName:'试用期工资缺比较基准',
          short:'试用期工资无法核对',clauseIndex:c.index,location:loc,
          quote:q ? q.quote : '',range:q||null,consequence:`写了试用期工资 ${fmtYuan(probPay)} 元，但没有转正工资，无法核对是否达到约定工资的 80%。`,
          ask:'HR：转正后工资和试用期工资的计算基数是多少？',counter:'把转正工资、试用期工资和是否含绩效写进合同。',
          basis:LAW.L20,confidence:'中',loss:0
        });
        return;
      }
      addGreen(ctx,c,'试用期工资',/(试用期[^。；\n]{0,40}元)/,`试用期工资 ${fmtYuan(probPay)} 元，不低于转正工资 ${fmtYuan(reg)} 元的 80%（${fmtYuan(floorCents/100)} 元）。`);
      return;
    }

    if(probPercent != null){
      if(percentIsFloor){
        addItem(ctx,{
          base:'R2',ruleId:'R2',verdict:'gray',ruleName:'试用期工资只写了下限',
          short:'试用期工资未写具体金额',clauseIndex:c.index,location:loc,
          quote:q ? q.quote : '',range:q||null,consequence:`只写了“不低于转正工资的 ${probPercent}%”，没有写试用期实际发多少；比例本身达标，但具体金额和当地最低工资仍无法核对。`,
          ask:'HR：试用期每月实际到手多少？是否按转正工资的 80% 以上发？',counter:'把试用期工资的具体金额和计算基数写进合同。',
          basis:LAW.L20,confidence:'中',loss:0
        });
      }else if(reg != null){
        const computed = reg * probPercent / 100;
        addGreen(ctx,c,'试用期工资',/(试用期[^。；\n]{0,40}(?:%|％|百分之[一二两三四五六七八九十百]+|[一二两三四五六七八九十]+成))/,`试用期工资按转正工资的 ${probPercent}% 约定（约 ${fmtYuan(computed)} 元/月），不低于法定 80%；仍需核对当地最低工资。`);
      }else{
        addGreen(ctx,c,'试用期工资',/(试用期[^。；\n]{0,40}(?:%|％|百分之[一二两三四五六七八九十百]+|[一二两三四五六七八九十]+成))/,`试用期工资按转正工资的 ${probPercent}% 约定，不低于法定 80%；仍需核对具体金额与当地最低工资。`);
      }
      return;
    }

    if(reg != null){
      addItem(ctx,{
        base:'R2',ruleId:'R2',verdict:'gray',ruleName:'试用期工资未明确',
        short:'试用期工资未写明',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`合同写了转正工资 ${fmtYuan(reg)} 元，但没有写试用期工资；按 80% 算底线是 ${fmtYuan(reg*0.8)} 元，实际发多少现在无法核对。`,
        ask:'HR：试用期工资具体多少？是否按转正工资的 80% 以上发？',counter:'把试用期工资和转正工资分别写清，并注明是否含绩效。',
        basis:LAW.L20,confidence:'高',loss:0
      });
    }else{
      addItem(ctx,{
        base:'R2',ruleId:'R2',verdict:'gray',ruleName:'试用期工资无法核对',
        short:'试用期工资未写明',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:'只写了试用期，没有写试用期工资，也没有可比较的转正工资；80% 下限和当地最低工资都无法核对。',
        ask:'HR：试用期工资和转正工资分别是多少？',counter:'把两项工资、计算基数和发放日写进合同。',
        basis:LAW.L20,confidence:'中',loss:0
      });
    }
  });

  const wageValues = entries.map(e => e.noPay ? 0 : (e.probPay != null ? e.probPay : (e.probPercent != null && e.reg != null ? e.reg * e.probPercent / 100 : null)))
    .filter(v => v != null);
  const unique = Array.from(new Set(wageValues.map(v => toCents(v))));
  if(unique.length > 1){
    const labels = entries.map(e => {
      const v = e.noPay ? '0 元（不发工资）' : (e.probPay != null ? `${fmtYuan(e.probPay)} 元` : (e.probPercent != null ? `${e.probPercent}%` : '未写'));
      return `${e.loc} 为 ${v}`;
    }).join('；');
    addItem(ctx,{
      base:'R2',ruleId:'R2',verdict:'red',ruleName:'试用期工资约定冲突',
      short:`试用期工资出现 ${unique.length} 种口径`,clauseIndex:null,location:'全文',
      quote:entries.map(e => (e.q || {}).quote).filter(Boolean).join(' / '),range:null,
      evidence:entries.map(e => evidenceOf(e.clause,/(试用期[^。；\n]{0,40}(?:元|工资|薪资|月薪|报酬))|试用期/,'试用期工资')),
      consequence:`文本对试用期工资给出不同口径：${labels}。不能同时按这些标准执行，请先确认适用哪一条或哪份补充文件；若实际执行较低或无薪版本，工资差额仍应另行核对。`,
      ask:'HR：以哪一条试用期工资约定为准？是否另有补充协议？',
      counter:'只保留一条试用期工资约定；删除冲突表述，并确保不低于转正工资 80% 和当地最低工资。',
      basis:LAW.L20,confidence:'高',loss:0
    });
  }
}

/* R3 试用期解除 */
function runR3(ctx){
  const matches = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /试用期/.test(t) && /(解除|辞退|终止|不予录用|不予转正|淘汰)/.test(t) &&
      /(不合格|不符合(?:录用条件|岗位要求|工作要求)|不胜任|不能胜任|考核(?:不通过|不合格|未通过|不达标)|评分(?:不合格|不达标)|排名末位|末位淘汰|不适合(?:本)?岗位|不符合要求)/.test(t) &&
      !/(?:^|[^无])(?:应|需|必须|要)[^。；\n]{0,4}说明理由/.test(t);
  });
  matches.forEach(c => {
    const t = clauseFull(c);
    const explicit = /(无需|无须|不需|不必|不用)[^。；\n]{0,6}(?:说明)?理由|不(?:再|另行|需要)?说明理由|可(?:随时|直接)(?:辞退|解除)/.test(t);
    const q = qAny(c,/(解除|辞退|终止|不予录用)/);
    addItem(ctx,{
      base:'R3',ruleId:'R3',verdict:explicit?'red':'yellow',
      ruleName:explicit?'试用期解除可不说明理由':'试用期解除理由不清',
      short:explicit?'可不说明理由辞退':'试用期解除理由不清',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:explicit
        ? '公司可以不给理由就辞退你；这与“试用期解除应说明理由”的规定冲突，但真发生时你得先固定考核和沟通记录，再主张程序违法。'
        : '试用期被辞退，公司若只写“不合格”不说明理由，你需要自己固定录用条件、考核和沟通记录；仅凭这条也可能当场让你走。',
      ask:'HR：录用条件和考核标准写在哪份文件里？',counter:'把录用条件、考核方式和解除说明写进附件与流程。',
      basis:LAW.L21,confidence:explicit?'高':'中',loss:0
    });
  });
}

/* R4 违约金（劳动合同） */
function runR4(ctx){
  const penaltyRe = /(违约金|违约赔偿|赔偿金|赔偿|罚款|罚金|扣除[^。；\n]{0,10}(?:工资|薪资|报酬)|扣发[^。；\n]{0,10}(?:工资|薪资|报酬))/;
  const exitRe = /(提前(?:离职|辞职|解除|终止|走人)|未满[^。；\n]{0,12}(?:离职|辞职|解除)|擅自(?:离职|辞职|离岗|走人)|未(?:提前|按)[^。；\n]{0,12}(?:通知|申请)[^。；\n]{0,10}(?:离职|辞职|解除)|未(?:办理|完成)[^。；\n]{0,10}(?:交接|离职手续)|不辞而别|自动离职|(?:辞职|离职|擅离)[^。；\n]{0,26}(?:违约金|赔偿|罚款|扣除|扣发)|(?:违约金|赔偿|罚款|扣除|扣发)[^。；\n]{0,18}(?:辞职|离职)|(?:乙方|劳动者)[^。；\n]{0,10}解除[^。；\n]{0,8}(?:合同|协议|劳动关系))/;
  const legalRe = /(服务期|专项培训|竞业限制|竞业|保密协议)/;
  const legalPenaltyRe = /(?:服务期|专项培训|竞业限制|竞业|保密协议)[^。；\n]{0,36}(?:违约金|赔偿|罚款)|(?:违约金|赔偿|罚款)[^。；\n]{0,36}(?:服务期|专项培训|竞业限制|竞业|保密协议)/;
  const hits = [];
  ctx.clauses.forEach(c => {
    const full = clauseFull(c);
    if(!penaltyRe.test(full)) return;
    if(legalRe.test(full) && !exitRe.test(full)) return;
    const clauseHasExit = exitRe.test(full);
    let hit = null;
    const consider = raw => {
      if(!penaltyRe.test(raw) || legalPenaltyRe.test(raw)) return false;
      const dir = paymentDirection(raw);
      if(dir.negated || dir.employerPays) return false;
      if(!exitRe.test(raw) && !(clauseHasExit && dir.employeePays)) return false;
      hit = raw;
      return true;
    };
    for(const sentence of sentenceList(c.body || '')){
      const parts = commaParts(sentence.quote);
      for(const p of parts){
        if(consider(p.quote)){
          hit = {quote:p.quote, start:sentence.start + p.start, end:sentence.start + p.end};
          break;
        }
      }
      if(hit) break;
      for(let i = 0; i < parts.length - 1; i++){
        const raw = sentence.quote.slice(parts[i].start, parts[i+1].end);
        if(consider(raw)){
          hit = {quote:raw, start:sentence.start + parts[i].start, end:sentence.start + parts[i+1].end};
          break;
        }
      }
      if(hit) break;
    }
    if(hit) hits.push({clause:c, sentence:hit});
  });
  hits.forEach(({clause:c, sentence:s}) => {
    const pm = penaltyRe.exec(s.quote);
    const q = pm
      ? {quote:clipQuote(s.quote, pm.index, pm.index + pm[0].length), raw:s.quote, start:s.start, end:s.end}
      : {quote:clipQuote(s.quote, 0, 1), raw:s.quote, start:s.start, end:s.end};
    const amt = maxAmountAfter(s.quote, /(违约金|赔偿|罚款|扣除)/) ?? parseAmount(s.quote);
    const deduct = /(扣除|扣减|扣发)[^。；\n]{0,12}(工资|薪资)/.test(s.quote);
    const lossOnly = actualLossOnly(s.quote);
    if(lossOnly){
      addItem(ctx,{
        base:'R4',ruleId:'R4',verdict:'gray',ruleName:'实际损失赔偿（条件性）',
        short:'实际损失需单位举证',clauseIndex:c.index,location:clauseLabel(c,c.index),
        quote:q.quote,range:q,
        consequence:'这句把责任限定为“有证据证明的实际损失”，不是固定离职罚款。单位需要证明损失金额和因果关系；是否另需走过法定程序，要结合解除事实核对。若同一条或另一条另写固定金额、最低赔偿或扣工资，再按那一条单独判断。',
        ask:'HR：实际损失有哪些凭证？是否另有固定金额约定或扣工资条款？',
        counter:'保留“实际损失以证据为准”的限制；删除同条中的固定金额、最低赔偿和扣工资表述。',
        basis:LAW.L90,confidence:'中',loss:0
      });
      const fixed = commaParts(c.body || '').find(p => {
        const raw = p.quote;
        if(!/(\d[\d,.]*\s*(?:万元|万|千元|千|元))/.test(raw)) return false;
        if(!/(赔偿|违约金|罚款|支付|承担)/.test(raw)) return false;
        const dir = paymentDirection(raw);
        return !dir.negated && !dir.employerPays;
      });
      if(fixed){
        const amt = parseAmount(fixed.quote);
        addItem(ctx,{
          base:'R4',ruleId:'R4',verdict:'red',ruleName:'实际损失之外另约定固定赔偿',
          short:'在同一句另写固定赔偿',clauseIndex:c.index,location:clauseLabel(c,c.index),
          quote:fixed.quote,range:{quote:fixed.quote,raw:fixed.quote,start:fixed.start,end:fixed.end},
          consequence:`同一句既写按实际损失赔偿，又另写固定赔偿${amt ? ` ${fmtYuan(amt)} 元` : ''}；固定金额部分不是“以实际损失为限”，离职时单位可能直接按这个数主张。`,
          ask:'HR：固定赔偿与实际损失是什么关系？是否只能择一主张？',
          counter:'删除固定赔偿，只保留“以有证据证明的实际损失为限”的表述。',
          basis:LAW.L25,confidence:'高',loss:amt || 0
        });
      }
      return;
    }
    const cons = amt
      ? `提前离职要赔 ${fmtYuan(amt)} 元${deduct ? '，还可能被扣当月工资' : ''}；条款是否有效要另争，但钱被扣、流程被拖会先落在你身上。`
      : `提前离职要赔钱${deduct ? '或被扣当月工资' : ''}，但没写金额；先要求写明计算方式，或者直接删除。`;
    addItem(ctx,{
      base:'R4',ruleId:'R4',verdict:'red',ruleName:'离职违约金（法定情形外）',
      short:amt ? `${fmtWan(amt)}离职违约金` : '离职违约金',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q.quote,range:q,consequence:cons,
      ask:'HR：普通岗位的离职违约金依据哪条法定情形？',counter:'删除离职违约金与扣工资；如确有专项培训，另签服务期协议并列明费用凭证。',
      basis:LAW.L25,confidence:amt ? '高' : '中',loss:amt || 0
    });
  });
  const renamedExitRe = /(?:未满|没有做满|未做满|做满|工作满)[^。；\n]{0,12}(?:一年|1年|十二个月|12个月)[^。；\n]{0,32}(?:支付|赔偿|补偿|扣|收取)[^。；\n]{0,18}(\d[\d,.]*)\s*(?:万元|万|千元|千|元)/;
  ctx.clauses.forEach(c => {
    if(hits.some(h => h.clause.index === c.index)) return;
    const full = clauseFull(c);
    if(/(服务期|专项培训|培训服务期)/.test(full)) return;
    const m = full.match(renamedExitRe);
    if(!m) return;
    const amt = parseAmount(m[0]);
    const q = qFilter(c, /(?:未满|做满)[^。；\n]{0,60}(?:回收款|\d[\d,.]*\s*(?:万元|万|千元|千|元))/)
      || qFilter(c, /(?:回收款|知识解锁)/) || qAny(c, /(?:回收款|未满|做满)/);
    addItem(ctx,{
      base:'R4',ruleId:'R4',verdict:'red',ruleName:'离职固定付款（换名）',
      short:amt ? `${fmtWan(amt)}离职固定付款` : '离职固定付款',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:`条款把离职未满一年要付的钱写成“回收款”等名称，甚至明确不称违约金；名称不改变它仍是一项固定付款义务。当前文本又写明只有员工手册自习、不组织专项专业技术培训且无对外支出，这笔${amt ? ` ${fmtYuan(amt)} 元` : ''}更缺少专项培训和服务期依据。`,
      ask:'HR：这笔钱对应哪项专项培训、多少实际支出、服务期多长？为什么固定金额且不称违约金？',
      counter:'删除换名固定付款；如确有专项培训，另签服务期协议并列明培训费凭证和按未履行期限分摊的算法。',
      basis:LAW.L25,confidence:'高',loss:amt || 0
    });
  });
}

/* R5 服务期违约金 */
function feeInText(text){
  const t = String(text || '');
  const labeled = t.match(/(?:专项培训(?:费|费用)?|培训费用|培训费|培养费|进修费|学费)[^。；\n]{0,12}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/)
    || t.match(/([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)[^。；\n]{0,8}(?:的)?(?:专项培训(?:费|费用)?|培训费用|培训费|培养费|进修费|学费)/);
  return labeled ? parseAmount(labeled[0]) : null;
}
function monthsInText(text, re){
  const m = String(text || '').match(re);
  if(!m) return null;
  const n = /^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1]);
  if(!Number.isFinite(n)) return null;
  return m[2] === '年' ? n * 12 : n;
}

function runR5(ctx){
  const matches = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /(服务期|服务年限|最低服务年限|培训服务期)/.test(t) && /(违约金|赔偿|退还|返还|补缴|承担)/.test(t) && /(提前|离职|解除|未满|违反|不足|不满)/.test(t);
  });
  const fullRefundRe = /(?:未满|违反|提前[^。；\n]{0,10}(?:离职|解除))[^。；\n]{0,30}(?:全额|全部|100\s*%|所有)[^。；\n]{0,12}(?:退还|返还|赔偿|支付)|(?:全额|全部)[^。；\n]{0,10}(?:退还|返还|赔偿)[^。；\n]{0,10}(?:培训费|培训费用|学费)/;
  matches.forEach(c => {
    const full = clauseFull(c);
    const q = qAny(c,/(服务期|违约金|赔偿|退还|返还)/);
    const penSentence = sentenceOf(c.body,/(违约金|赔偿|退还|返还|补缴|承担)/);
    let penalty = null;
    if(penSentence){
      const raw = penSentence.quote;
      const penM = raw.slice(Math.max(0, raw.search(/(违约金|赔偿|退还|返还|补缴|承担)/))).match(/(违约金|赔偿|退还|返还|补缴|承担)[^。；\n]{0,30}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
      if(penM) penalty = parseAmount(penM[2] + penM[3]);
    }
    if(penalty == null) penalty = parseAmount(c.body);
    let fee = feeInText(full);
    if(fee == null){
      const projectClause = ctx.clauses.find(cl => {
        const t = clauseFull(cl);
        return /(专项培训|培训费|培训费用|服务期)/.test(t) && !/(自购|自行购买|个人购买|外语课程|兴趣班)/.test(t) && feeInText(t) != null;
      });
      if(projectClause) fee = feeInText(clauseFull(projectClause));
    }
    const serviceMonths = monthsInText(full, /服务期(?:为|共|约定|最短)?\s*([一二两三四五六七八九十\d]+)\s*(年|个月|月)/)
      || monthsInText(ctx.text, /服务期(?:为|共|约定|最短)?\s*([一二两三四五六七八九十\d]+)\s*(年|个月|月)/);
    const performed = monthsInText(full, /已(?:履行|服务|工作|完成)\s*([一二两三四五六七八九十\d]+)\s*(年|个月|月)/)
      || monthsInText(ctx.text, /已(?:履行|服务|工作|完成)\s*([一二两三四五六七八九十\d]+)\s*(年|个月|月)/);
    const remaining = serviceMonths != null && performed != null ? Math.max(0, serviceMonths - performed) : null;
    const penaltyCents = penalty != null ? toCents(penalty) : null;
    const feeCents = fee != null ? toCents(fee) : null;
    const capCents = feeCents != null
      ? (serviceMonths != null && remaining != null ? Math.round(feeCents * remaining / serviceMonths) : feeCents)
      : null;
    const cap = capCents != null ? capCents / 100 : null;
    const loc = clauseLabel(c,c.index);
    if(fee == null){
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'gray',ruleName:'服务期缺少专项培训依据',
        short:'服务期缺培训费凭证',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:`写了服务期违约金${penalty ? ` ${fmtYuan(penalty)} 元` : ''}，但当前文本没有可对应的专项培训费用。缺少费用凭证时，这笔钱是否成立以及上限都无法核对；附件、发票或补充协议可能另有资料。`,
        ask:'HR：这项专项培训的实际支出是多少？有发票或支付凭证吗？',counter:'提供培训费凭证，按实际支出和未履行期限分摊；不能用其他课程或个人消费充当培训费。',
        basis:LAW.L22,confidence:'中',loss:0
      });
    }else if(fullRefundRe.test(c.body)){
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'red',ruleName:'服务期违约金未按未履行部分分摊',
        short:'服务期要求全额退培训费',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:`对应专项培训费 ${fmtYuan(fee)} 元，条款要求离职时全额退还或赔偿；法定上限是按服务期未履行部分分摊，已经履行期间对应的培训费不应再赔${serviceMonths ? `（服务期 ${serviceMonths} 个月${performed != null ? `，已履行 ${performed} 个月` : ''}）` : ''}。`,
        ask:'HR：服务期多长？未履行部分怎么折算？',counter:'改为按未履行期限比例分摊，并写明培训费凭证。',
        basis:LAW.L22,confidence:'高',loss:penalty || fee
      });
    }else if(penalty != null && capCents != null && penaltyCents > capCents){
      const excess = (penaltyCents - capCents) / 100;
      const basisText = remaining != null
        ? `服务期 ${serviceMonths} 个月，已履行 ${performed} 个月，未履行 ${remaining} 个月；对应上限 ${fmtYuan(cap)} 元`
        : `按实际培训费 ${fmtYuan(fee)} 元作全额上限`;
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'red',ruleName:'服务期违约金超过培训费',
        short:remaining != null ? '违约金超剩余服务期分摊' : '服务期违约金超培训费',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:`约定违约金 ${fmtYuan(penalty)} 元；${basisText}，约定金额高 ${fmtYuan(excess)} 元${remaining != null ? '。以上按文本给出的期间计算，实际还要核对培训费凭证、已履行期间和是否另签变更协议' : '。超过实际培训费用的部分可以拒绝承担'}。`,
        ask:'HR：培训费凭证、服务期起止日和已履行期间能提供吗？',counter:'把违约金上限改为实际培训费用，并按未履行期限分摊。',
        basis:LAW.L22,confidence:'高',loss:excess
      });
    }else{
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'yellow',ruleName:'服务期约束',
        short:'服务期与培训费挂钩',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:`服务期与 ${fmtYuan(fee)} 元专项培训费挂钩${cap != null ? `，按未履行部分计算的当前上限约 ${fmtYuan(cap)} 元` : ''}；签了就要在服务期内受约束。`,
        ask:'HR：服务期多久？培训费凭证和分摊算法能提供吗？',counter:'写明培训费总额与凭证，并约定按未履行期限分摊。',
        basis:LAW.L22,confidence:'中',loss:penalty || 0
      });
    }
  });
  const pseudoService = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return /(员工手册|常规入职|入职介绍|自习)/.test(t)
      && /(不组织|未组织|没有组织)[^。；\n]{0,16}(?:专项|专业技术)?培训/.test(t)
      && /(未满|没有做满|做满)[^。；\n]{0,12}(?:一年|1年)/.test(t)
      && /(?:支付|回收款)[^。；\n]{0,14}\d[\d,.]*\s*(?:元|万元)/.test(t);
  });
  if(pseudoService && !matches.some(m => m.index === pseudoService.index)){
    const q = qFilter(pseudoService, /(?:未满|做满)[^。；\n]{0,60}(?:回收款|\d[\d,.]*\s*(?:万元|万|千元|千|元))/)
      || qFilter(pseudoService, /(?:回收款|知识解锁)/) || qAny(pseudoService, /(?:回收款|未满|做满)/);
    addItem(ctx,{
      base:'R5',ruleId:'R5',verdict:'gray',ruleName:'服务期缺少专项培训依据',
      short:'换名固定付款缺培训依据',clauseIndex:pseudoService.index,location:clauseLabel(pseudoService,pseudoService.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'合同承认只提供员工手册 PDF 自习等常规入职介绍，不组织专项专业技术培训，也无对外支出；普通入职资料通常不构成可约定服务期违约金的专项培训。另写的固定付款即使改称“回收款”，仍要先核对培训费凭证、服务期和分摊方式，当前事实不清，先按待核对处理。',
      ask:'HR：这项“回收款”对应哪次专项培训？有培训费发票或支付凭证吗？服务期多长？',
      counter:'删除固定回收款；如确有专项培训，列明实际支出并按未履行服务期分摊。',
      basis:LAW.L22,confidence:'中',loss:0
    });
  }
}

/* R6 竞业限制 */
function runR6(ctx){
  const matches = ctx.clauses.filter(cl => /(竞业|不竞争)/.test(clauseFull(cl)) && /(限制|禁止|不得|义务|补偿)/.test(clauseFull(cl)));
  if(!matches.length) return;
  const personnelClause = ctx.clauses.find(cl => /(不知悉|未接触|不接触|不涉及|无法接触)/.test(clauseFull(cl)) && /(商业秘密|保密事项|知识产权)/.test(clauseFull(cl)));
  const personnelRisk = !!personnelClause;
  const titleOnly = !personnelRisk && /(高级技术人员|高级管理人员|高级管理|核心岗位|涉密岗位)/.test(ctx.text);
  matches.forEach(c => {
    const full = clauseFull(c);
    const q = qAny(c,/(竞业限制|竞业|不竞争|经济补偿|补偿|不得从事)/);
    const qTerm = qFilter(c,/(?:离职后|解除或终止后|终止后|竞业限制(?:期限|期)?)[^。；\n]{0,24}(?:个月|年)[^。；\n]{0,24}(?:不得|不能|禁止|限制)/) || q;
    const qScope = qFilter(c,/(?:全国|全球|全行业|所有行业|任何服务行业|任何行业)[^。；\n]{0,24}(?:工作|从事|任职|竞业)/) || q;
    const qComp = qFilter(c,/(?:经济补偿|竞业补偿|补偿|按月|每月)[^。；\n]{0,30}(?:\d[\d,]*\s*元|工资|%)/) || q;
    const qPerson = personnelClause ? (qAny(personnelClause,/(?:不知悉|未接触|不接触|不涉及|无法接触)[^。；\n]{0,40}/) || q) : null;
    const loc = clauseLabel(c,c.index);
    const inServiceOnly = /(?:仅|只)[^。；\n]{0,10}(?:在职期间|在职)|在职期间[^。；\n]{0,12}(?:竞业|不竞争|不得从事)|至[^。；\n]{0,10}(?:劳动合同)?(?:解除|终止)[^。；\n]{0,4}(?:之日|时)/.test(full)
      && !/(离职后|离职之日起|解除或终止后|终止后)/.test(full);
    if(inServiceOnly){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:'在职期间竞业限制',
        short:'限在职期间，不涉及离职后',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:'这条只约束在职期间，截止到劳动合同解除或终止之日；在职竞业限制不以离职后经济补偿为条件。不要把本条当成离职后的竞业限制，也不要据此判断离职后有没有补偿。离职后是否另有限制，要看单独条款或协议。',
        ask:'HR：离职后是否另有竞业限制协议？在职期间的限制范围具体是什么？',
        counter:'把在职期间限制与离职后竞业分开写；如无离职后安排，明确写“离职后不适用竞业限制”。',
        basis:LAW.JI2_14,confidence:'中',loss:0
      });
      return;
    }
    const permanentRe = /(?:竞业|不竞争)[^。；\n]{0,30}(?:永久|无限期|长期)|(?:永久|无限期)[^。；\n]{0,20}(?:竞业|不竞争|不得从事)/;
    const durM = full.match(/(?:竞业限制(?:期限|期)?|竞业期限|竞业禁止(?:期限|期)?|限制期限)[^。；\n]{0,24}?([一二两三四五六七八九十\d]{1,3})\s*(年|个月|月)/)
      || full.match(/(?:竞业|不竞争)[^。；\n]{0,40}?([一二两三四五六七八九十\d]{1,3})\s*(年|个月|月)/)
      || full.match(/([一二两三四五六七八九十\d]{1,3})\s*(年|个月|月)[^。；\n]{0,20}(?:内|以内)?[^。；\n]{0,12}(?:不得|不能|禁止)[^。；\n]{0,12}(?:竞业|同类|竞争|工作|从事|任职)/);
    const durNum = durM ? (/^\d+$/.test(durM[1]) ? +durM[1] : cnNum(durM[1])) : null;
    const durMonths = permanentRe.test(full) ? 999 : (durNum && Number.isFinite(durNum) ? (durM[2] === '年' ? durNum * 12 : durNum) : null);
    const negComp = /(无需|不需|不用|不予|不支付|不再支付|没有|无)[^。；\n]{0,16}(经济补偿|补偿)/.test(full)
      || /(经济补偿|补偿)[^。；\n]{0,12}(没有|不支付|不予|无需)/.test(full);
    const compInSalary = /(?:经济补偿|竞业补偿|补偿金?)[^。；\n]{0,24}(?:已包含|包含在|计入|随工资|在职期间发放|每月工资中)|(?:工资|薪资|月薪)[^。；\n]{0,20}(?:已包含|包含|含)[^。；\n]{0,12}(?:竞业|经济补偿)/.test(full);
    const compMention = /(?:竞业|离职后|限制期)[^。；\n]{0,40}(?:经济补偿|补偿)|(?:经济补偿|补偿)[^。；\n]{0,40}(?:竞业|离职后|限制期)|(?:竞业|限制期)[^。；\n]{0,40}(?:按月|每月)[^。；\n]{0,14}(?:支付|补偿)/.test(full);
    const compAmount = /(?:经济补偿|竞业补偿|补偿金?)[^。；\n]{0,24}(?:每月|按月|月工资|年薪|百分之|\d+\s*%|\d+\s*元|不低于)|(?:按月|每月)[^。；\n]{0,20}\d[\d,]*\s*元/.test(full);
    const scopeWide = /(?:竞业|不竞争)[^。；\n]{0,30}(?:全国|全球|全行业|所有行业|任何(?:公司|单位|行业)|同行业所有|不限地域)|(?:全国|全球|全行业)[^。；\n]{0,30}(?:从事|工作|任职|竞业|不竞争)/.test(full);
    const hasComp = compMention && !negComp && !compInSalary;
    const dText = durMonths === 999 ? '无固定期限' : (durMonths ? `${durMonths} 个月` : '期限未写');
    const personnelNote = personnelRisk
      ? `但合同另有“${clipQuote((qAny(personnelClause,/(?:不知悉|未接触|不接触|不涉及)[^。；\n]{0,30}/) || {}).quote || '',0,40)}”的表述：如果你确实未接触商业秘密或相关保密事项，竞业限制条款可能不生效，需要按人员范围和实际接触情况核对。`
      : '';

    let added = false;
    if(durMonths && durMonths > 24){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'red',ruleName:'竞业限制超过两年上限',
        short:permanentRe.test(full) ? '竞业限制无期限' : '竞业限制超过 2 年',clauseIndex:c.index,location:loc,
        quote:qTerm ? qTerm.quote : '',range:qTerm||null,
        consequence:`本条竞业限制约 ${dText}，超过法定 2 年上限；多出的约定不受支持，但可能吓退下家${!hasComp ? '，且本条没有写补偿' : ''}。${personnelNote}`,
        ask:'HR：竞业限制为什么超过 2 年？范围包括哪些公司？',counter:'期限改为不超过 2 年，范围列明具体竞品，按月支付补偿。',
        basis:LAW.L24,confidence:'高',loss:0
      });
      added = true;
    }
    if(personnelRisk){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:'竞业限制人员适用待核对',
        short:'未接触保密事项，条款可能不生效',clauseIndex:c.index,location:loc,
        quote:qPerson ? qPerson.quote : (q ? q.quote : ''),range:qPerson || null,
        consequence:`本条竞业限制 ${dText}${hasComp ? `，并约定补偿${compAmount ? '' : '（标准待核对）'}` : ''}。${personnelNote} 只知道岗位名称、没有接触证据时，先按待确认处理。`,
        ask:'HR：乙方实际接触了哪些商业秘密或保密事项？竞业范围如何与这些事项对应？',
        counter:'把竞业范围限定到实际接触的保密事项和具体竞品；不接触保密事项的人员不纳入竞业限制。',
        basis:LAW.JI2_13,confidence:'中',loss:0
      });
      added = true;
    }else if(!hasComp){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:compInSalary ? '竞业补偿包含在工资中' : '竞业限制未约定补偿',
        short:compInSalary ? '竞业补偿已在工资里' : '竞业限制没有补偿',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:compInSalary
          ? `本条把竞业补偿写成已包含在工资或随工资发放；离职后的竞业限制补偿原则上应在竞业期内按月另行支付，这种写法可能被认定为没有约定补偿。`
          : `本条约定竞业限制 ${dText}，没有写按月补偿；公司不付补偿时，你可先发函或申请仲裁确认限制是否继续，但不要自行假定条款自动消失。`,
        ask:'HR：竞业补偿按什么标准、离职后怎么发？',counter:'离职时另签竞业协议；按月补偿，期限不超过 2 年，范围写明具体竞品。',
        basis:LAW.L23,confidence:durMonths ? '高' : '中',loss:0
      });
      added = true;
    }else if(!compAmount){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:'竞业补偿标准不明',
        short:'竞业补偿没写标准',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`本条写了竞业限制 ${dText} 和补偿，但没有每月金额、比例或计算方式；离职后实际发多少、能不能覆盖生活成本，现在无法判断。`,
        ask:'HR：竞业补偿每月多少？按离职前工资的什么比例？',counter:'写明补偿标准、发放日和支付方式，再签竞业协议。',
        basis:LAW.L23,confidence:'中',loss:0
      });
      added = true;
    }
    if(scopeWide){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'yellow',ruleName:'竞业限制范围过宽',
        short:'竞业范围覆盖全行业',clauseIndex:c.index,location:loc,
        quote:qScope ? qScope.quote : '',range:qScope||null,consequence:'竞业范围写成全国、全行业或任何单位；范围过宽会实际限制你换工作，超出合理保护范围的部分可请求调整，但先会被条款吓住。',
        ask:'HR：竞业范围具体包括哪些产品或公司？',counter:'把范围限定到有竞争关系的具体业务、地域和岗位。',
        basis:LAW.L24,confidence:'中',loss:0
      });
      added = true;
    }
    if(!added && titleOnly){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:'竞业限制人员范围待核对',
        short:'仅凭岗位名称，未写接触事项',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,
        consequence:`本条约定竞业限制 ${dText}，并写了补偿；文本只出现岗位名称，没有说明实际接触哪些商业秘密或保密事项。是否属于应签人员，需要按实际工作内容核对。`,
        ask:'HR：这个岗位实际接触哪些保密事项？',counter:'按实际接触的保密事项确定是否签竞业限制，并限缩范围。',
        basis:LAW.JI2_13,confidence:'中',loss:0
      });
    }else if(!added){
      addGreen(ctx,c,'竞业限制',/(竞业限制[^。；\n]{0,30}(?:个月|年)|竞业|补偿)/,`竞业限制${durMonths ? ` ${durMonths} 个月` : ''}并约定补偿，属常规安排；仍需确认你是否属于应签人员。`);
    }
  });
}

/* R7 无效与单方变更 */
function runR7(ctx){
    const waiverRe = /(放弃|不缴|不缴纳|不需缴纳|无需缴纳|不办理)[^。；\n]{0,16}(社保|社会保险|五险)|(社保|社会保险|五险)[^。；\n]{0,16}(自理|自行承担|自行缴纳|放弃|不缴)/;
  const personalRe = /个人(?:应缴|应缴纳|缴纳|承担|负担)?(?:的|部分)|个人部分/;
  ctx.clauses.filter(cl => waiverRe.test(clauseFull(cl))).forEach(c1 => {
    const q = qFilter(c1, /(社保|社会保险|五险|放弃)/, personalRe);
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'放弃社保（无效）',
      short:'放弃社保',clauseIndex:c1.index,location:clauseLabel(c1,c1.index),
      quote:q.quote,range:q,consequence:'公司不给你缴社保，看病、工伤、养老都少一层保障；“自愿放弃”的约定不产生法律效力，但补缴要先投诉或申请仲裁。',
      ask:'HR：社保从哪个月开始缴？按什么基数缴？',counter:'删除放弃社保的写法，入职当月依法参保。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const changeRe = /(甲方|公司|用人单位)[^。；\n]{0,30}(有权|可以|将)[^。；\n]{0,24}(调整|变更|调动)[^。；\n]{0,26}(岗位|工资|薪资|工作地点|职位|部门)|(乙方|劳动者)[^。；\n]{0,14}(服从|接受)[^。；\n]{0,24}(调整|调动|变更)/;
  const obeyRe = /(服从|不得异议|不得拒绝|无条件|视为同意)/;
  const consentRe = /协商一致|双方书面|书面同意|另行签订/;
  ctx.clauses.filter(cl => changeRe.test(clauseFull(cl)) && obeyRe.test(clauseFull(cl))).forEach(c2 => {
    const q = qFilter(c2, /(调整|变更|调动)/, consentRe);
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'单方调岗降薪',
      short:'单方调岗降薪',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
      quote:q.quote,range:q,consequence:'公司可据此单方调岗降薪，你拒绝后可能被针对；变更劳动合同应双方协商一致并书面确认，保留原合同和沟通记录。',
      ask:'HR：调岗调薪的触发条件和范围是什么？',counter:'改为岗位、薪资变更需双方书面协商一致。',
      basis:LAW.L26,confidence:'中',loss:0
    });
  });
  const unilateralRe = /(?:甲方|公司|用人单位)[^。；\n]{0,30}(?:可|有权|可以)[^。；\n]{0,24}(?:单方|自行|无须|无需)[^。；\n]{0,24}(?:调至|调动|调整|下调|降低|变更)[^。；\n]{0,24}(?:岗位|省份|地点|工资|薪资|基本工资)/;
  ctx.clauses.filter(cl => unilateralRe.test(clauseFull(cl))).forEach(cU => {
    const sent = sentenceOf(cU.body, /(?:单方|调至|下调)/);
    const q = sent
      ? {quote:sent.quote,raw:sent.quote,start:sent.start,end:sent.end}
      : (qFilter(cU, unilateralRe) || qAny(cU, /(单方|调至|下调|降薪|变更)/));
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'单方调岗降薪（无须同意）',
      short:'公司可单方跨省调岗降薪',clauseIndex:cU.index,location:clauseLabel(cU,cU.index),
      quote:q.quote,range:q,consequence:'同一份合同前面写了变更需协商一致，后面又保留单方调岗降薪，并以签收与否都按变更后标准执行；这种“先协商、后单方”的写法不能用前面的正常条款掩盖后面的风险。',
      ask:'HR：跨省调岗和降薪是否仍需我书面同意？拒绝签收会有什么后果？',counter:'删除单方调岗降薪；变更岗位、地点和工资均以双方书面协商一致为前提。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const injuryRe = /(?:工伤|职业病|因工受伤|上下班途中|工作期间|工作场所)[^。；\n]{0,30}(?:受伤|事故|伤害|损害)[^。；\n]{0,24}(?:自负|自理|自行承担|不负责|不承担|概不负责|与甲方无关)|(?:工伤|职业病|因工受伤)[^。；\n]{0,24}(?:自负|自理|自行承担|不负责|不承担|概不负责|与甲方无关)/;
  ctx.clauses.filter(cl => injuryRe.test(clauseFull(cl))).forEach(c3 => {
    const q = qFilter(c3, /(工伤|职业病|受伤|事故|自负|自理|不承担|与甲方无关)/, /甲方[^。；\n]{0,12}(?:负责|承担|支付)/) || qAny(c3, /(工伤|自负|自理|不承担)/);
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'工伤责任自负（无效）',
      short:'工伤责任自负',clauseIndex:c3.index,location:clauseLabel(c3,c3.index),
      quote:q.quote,range:q,consequence:'公司把工伤责任推给你；这类免除单位法定责任的约定无效，但真出事时医疗费可能先由你垫付，再走认定和追偿。',
      ask:'HR：工伤申报和医疗费垫付由谁负责？',counter:'删除工伤自负条款，按工伤保险规定处理。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const rightsWaiverRe = /(?:放弃|自愿放弃|不要求|不主张)[^。；\n]{0,18}(?:经济补偿|经济补偿金|赔偿金|工伤保险待遇|工伤赔偿)/;
  ctx.clauses.filter(cl => rightsWaiverRe.test(clauseFull(cl))).forEach(c4 => {
    const q = qFilter(c4, rightsWaiverRe, /甲方[^。；\n]{0,12}(?:支付|承担|补偿)/) || qAny(c4, rightsWaiverRe);
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'放弃法定补偿（无效）',
      short:'放弃经济补偿或赔偿',clauseIndex:c4.index,location:clauseLabel(c4,c4.index),
      quote:q.quote,range:q,consequence:'让你提前放弃经济补偿、赔偿金或工伤待遇；这类放弃通常不产生效力，但真发生争议时，公司会拿它作为抗辩，你需要额外举证。',
      ask:'HR：为什么要求提前放弃法定补偿？',counter:'删除放弃条款；补偿金额在解除或工伤认定后再依法协商。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const arbitraryFireRe = /(?:甲方|公司|用人单位)[^。；\n]{0,18}(?:有权|可以|可)[^。；\n]{0,12}(?:随时|直接|单方)[^。；\n]{0,10}(?:解除|终止|辞退)[^。；\n]{0,16}(?:劳动合同|劳动关系|合同|乙方)/;
  const faultFireRe = /严重违纪|严重违反|不符合录用条件|不胜任|不能胜任|经济性裁员|协商一致|合同期满|法定情形/;
  ctx.clauses.filter(cl => arbitraryFireRe.test(clauseFull(cl))).forEach(c6 => {
    const q = qFilter(c6, arbitraryFireRe, faultFireRe) || (faultFireRe.test(clauseFull(c6)) ? null : qAny(c6, arbitraryFireRe));
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'单位可随时解除（无效）',
      short:'公司可随时辞退',clauseIndex:c6.index,location:clauseLabel(c6,c6.index),
      quote:q.quote,range:q,consequence:'合同给公司保留“随时/单方解除”的权利；除法定情形和法定程序外，单位不能随意解除，真被辞退时要先固定解除通知和理由。',
      ask:'HR：公司依据哪一条法定情形解除？会出具书面解除通知吗？',counter:'删除“随时解除”；解除条件按法定情形列明，并写明补偿。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const noCompRe = /(?:甲方|公司|用人单位)[^。；\n]{0,26}(?:解除|终止|辞退|裁员)[^。；\n]{0,20}(?:无需|无须|不支付|不予支付|不承担|不予补偿)[^。；\n]{0,12}(?:经济补偿|经济补偿金|赔偿金|补偿)/;
  ctx.clauses.filter(cl => noCompRe.test(clauseFull(cl))).forEach(c7 => {
    const q = qFilter(c7, noCompRe, faultFireRe) || (faultFireRe.test(clauseFull(c7)) ? null : qAny(c7, noCompRe));
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'解除不支付经济补偿（无效）',
      short:'辞退不给补偿',clauseIndex:c7.index,location:clauseLabel(c7,c7.index),
      quote:q.quote,range:q,consequence:'合同提前排除单位解除时的经济补偿；符合法定补偿情形时，这类约定不能免除支付义务，但你需要先证明解除事实和工作年限。',
      ask:'HR：解除时经济补偿按什么标准算？',counter:'删除“无需补偿”；按工作年限和法定标准写明经济补偿。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
  const rulesChangeRe = /(?:规章制度|员工手册)[^。；\n]{0,30}(?:随时|单方|无需协商)[^。；\n]{0,10}(?:修改|变更|调整)[^。；\n]{0,20}(?:无需|不需)[^。；\n]{0,10}(?:通知|公示|协商)|(?:规章制度|员工手册)[^。；\n]{0,30}(?:最终解释权|解释权归)[^。；\n]{0,10}(?:甲方|公司)/;
  ctx.clauses.filter(cl => rulesChangeRe.test(clauseFull(cl))).forEach(c5 => {
    const q = qFilter(c5, rulesChangeRe) || qAny(c5, /(规章制度|员工手册|最终解释权|解释权)/);
    if(!q) return;
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'yellow',ruleName:'规章制度可单方变更',
      short:'规章制度单方变更',clauseIndex:c5.index,location:clauseLabel(c5,c5.index),
      quote:q.quote,range:q,consequence:'公司保留随时修改规章制度或最终解释权；涉及工资、考勤、处罚的规则如果未经民主程序和公示，可能不能直接约束你，但实际管理中会先按公司版本执行。',
      ask:'HR：员工手册有没有公示、签收和民主程序记录？',counter:'写明制度变更需公示或送达；涉及切身利益的重大事项依法协商。',
      basis:LAW.L26,confidence:'中',loss:0
    });
  });
}

/* R8 三方协议违约金 */
function runR8(ctx){
  const penaltyRe = /(违约金|违约责任|违约赔偿|赔偿(?:金|损失)?|诚信金|意向金|押金|保证金|定金)/;
  const actionRe = /(提前(?:解除|离职|终止)|解约|解除|违约|擅自|未按期|未按|不报到|拒绝|放弃|变更|升学|考公|参军|不去|不履行|违反)/;
  const studentSide = s => /(任何一方|双方)[^。；\n]{0,10}(?:违约|解约|解除)/.test(s)
    || new RegExp(`(?:乙方|学生|毕业生|本人)[^。；\\n]{0,24}(?:${actionRe.source})`).test(s);
  const skipRe = /不得(?:约定|要求)|无权|无效|不承担/;
  const employerSide = s => /(甲方|用人单位)[^。；\n]{0,14}(?:违约|违反)[^。；\n]{0,24}(?:向|给)?[^。；\n]{0,10}(?:乙方|学生|毕业生)/.test(s)
    && !/(乙方|学生|毕业生)[^。；\n]{0,14}(?:违约|解约|违反)/.test(s);
  ctx.clauses.filter(cl => penaltyRe.test(clauseFull(cl))).forEach(c => {
    let q = qFilter(c, penaltyRe, s => skipRe.test(s) || employerSide(s) || !studentSide(s));
    if(!q && c.heading && /(乙方|学生|毕业生|任何一方)/.test(c.heading)
      && !sentenceList(c.body || '').some(s => employerSide(s.quote) || skipRe.test(s.quote))) q = qAny(c, penaltyRe);
    if(!q) return;
    const amt = maxAmountAfter(q.raw || q.quote, penaltyRe) ?? parseAmount(q.raw || q.quote);
    const isLiquidated = /违约金|违约责任|违约赔偿/.test(q.raw || q.quote);
    addItem(ctx,{
      base:'R8',ruleId:'R8',verdict:'yellow',ruleName:isLiquidated ? '三方协议解约违约金' : '三方协议违约赔偿',
      short:amt ? `${fmtWan(amt)}${isLiquidated ? '解约违约金' : '违约赔偿'}` : (isLiquidated ? '三方解约违约金' : '三方违约赔偿'),clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q.quote,range:q,consequence:amt
        ? `${isLiquidated ? '解约' : '违约'}时单位可主张合同约定的 ${fmtYuan(amt)} 元${isLiquidated ? '违约金' : '赔偿'}；是否构成违约、有没有免责条件，要先按协议和实际履行核对。单位主张后，法院可能依民法典第 585 条以实际损失为基础审查违约金是否过高；合同编通则解释第 65 条的一般判断口径是约定金额超过实际损失 30%（即高于实际损失的 1.3 倍），但仍需举证并个案权衡，这里不能直接替你算出调减金额。`
        : `写了${isLiquidated ? '违约金' : '违约赔偿'}但没有金额；解约时单位可能按实际损失索赔，金额和计算方式要让它写明。`,
      ask:'就业办或单位：这笔违约金或赔偿对应哪些实际损失？',counter:'把金额降到有据可查的实际招聘支出，并写明解约流程。',
      basis:LAW.C65,confidence:'高',loss:amt || 0
    });
  });
  const employerOnlyRe = /(?:甲方|用人单位)[^。；\n]{0,24}(?:有权|可以|可)[^。；\n]{0,18}(?:解除|终止)[^。；\n]{0,26}(?:不承担|无需|不予|不支付)[^。；\n]{0,14}(?:违约|赔偿|补偿)/;
  ctx.clauses.filter(cl => employerOnlyRe.test(clauseFull(cl))).forEach(c => {
    const q = qFilter(c, employerOnlyRe) || qAny(c, /(解除|终止|不承担|无需赔偿)/);
    if(!q) return;
    addItem(ctx,{
      base:'R8',ruleId:'R8',verdict:'yellow',ruleName:'单位单方解约不担责',
      short:'单位解约不承担违约责任',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q.quote,range:q,consequence:'协议把单位的解约责任排除掉，只约束学生一方；真到单位反悔时，你很难按同一条款要求赔偿，三方协议的权利义务明显不对等。',
      ask:'就业办或单位：单位解约时学生可以主张哪些损失？',counter:'改为双方对等承担违约责任，或明确单位解约的赔偿标准。',
      basis:LAW.C497,confidence:'中',loss:0
    });
  });
}

/* R9 培训贷与分期 */
function parseRate(text){
  const s = String(text || '');
  const daily = /(?:每?日|每天|按日)/.test(s);
  const monthly = /(?:每月|按月)/.test(s);
  let m = s.match(/(\d+(?:\.\d+)?)\s*[%％]/);
  let rate = m ? +m[1] : null;
  if(rate == null){
    m = s.match(/(\d+(?:\.\d+)?)\s*‰/);
    if(m) rate = +m[1] / 10;
  }
  if(rate == null){
    m = s.match(/万分之\s*([一二两三四五六七八九十百零〇\d.]+)/);
    if(m){ const n = cnNum(m[1]); if(Number.isFinite(n)) rate = n / 100; }
  }
  if(rate == null){
    m = s.match(/千分之\s*([一二两三四五六七八九十百零〇\d.]+)/);
    if(m){ const n = cnNum(m[1]); if(Number.isFinite(n)) rate = n / 10; }
  }
  return {rate,daily,monthly};
}
function parseLoanPrincipal(text){
  const s = String(text || '');
  const labeled = s.match(/(?:实际贷款本金|实际借款本金|贷款本金|借款本金|本金)\s*(?:为|是|：|:)?\s*(?:人民币)?\s*([\d,]+(?:\.\d+)?)\s*(?:万元|万|千元|千|元)/);
  if(labeled) return parseAmount(labeled[0]);
  const trailing = s.match(/([\d,]+(?:\.\d+)?)\s*(?:万元|万|千元|千|元)[^。；\n]{0,8}(?:贷款本金|借款本金)/);
  return trailing ? parseAmount(trailing[0]) : null;
}
function runR9(ctx){
  const principal = parseLoanPrincipal(ctx.text);
  const licensedClaim = /(持牌消费金融(?:机构|公司)?|消费金融(?:股份)?有限公司|消费金融公司)/.test(ctx.text);
  let payClauses = ctx.clauses.filter(cl => /(分\s*[一二两三四五六七八九十\d]{1,3}\s*期|分\s*[一二两三四五六七八九十\d]{1,3}\s*个?月|每期(?:还款|应还|偿还|支付|另付|收取|缴纳|金额|款|应付)|每期\s*[\d,]+|月供|每月(?:还款|应还|支付)|还款计划|先学后付|边学边付|学费分期)/.test(clauseFull(cl)));
  if(!payClauses.length){
    payClauses = ctx.clauses.filter(cl => /(分期|贷款|借款|放款|助学贷款|培训贷|分期平台|贷款机构|出借人|资方)/.test(clauseFull(cl))).slice(0,1);
  }
  const feeNameRe = /(平台服务费|技术服务费|咨询服务费|服务费|风险管理费|管理费|手续费|担保费|保险费)/;
  const feeRe = new RegExp(feeNameRe.source, 'g');
  const extractFees = text => {
    const out = [];
    const scan = new RegExp(feeRe.source, 'g');
    const groupComma = i => text[i] === ',' && /\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '');
    let fm;
    while((fm = scan.exec(text))){
      let segStart = 0;
      for(let i = fm.index - 1; i >= 0; i--){
        if(/[，,；;。\n]/.test(text[i]) && !groupComma(i)){ segStart = i + 1; break; }
      }
      let segEnd = text.length;
      for(let i = fm.index + fm[0].length; i < text.length; i++){
        if(/[，,；;。\n]/.test(text[i]) && !groupComma(i)){ segEnd = i; break; }
      }
      const seg = text.slice(segStart, segEnd);
      const after = text.slice(fm.index + fm[0].length, segEnd);
      const before = text.slice(segStart, fm.index);
      const am = after.match(/([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/)
        || before.match(/([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)\s*$/);
      if(!am) continue;
      const borrowerPays = /(?:由|向)[^。；\n]{0,10}(?:乙方|学员|借款人|消费者)[^。；\n]{0,8}(?:收取|支付|承担|缴纳)|(?:乙方|学员|借款人|消费者)[^。；\n]{0,14}(?:另行|另行补足|另行支付|支付|承担|缴纳)/.test(seg);
      const thirdPartyPays = !borrowerPays
        && /(?:甲方|丙方|丁方|贷款人|平台|培训机构|雇主|用人单位|公司)[^。；\n]{0,20}(?:自行|另行|直接)?(?:承担|负担|支付|缴纳)[^。；\n]{0,24}(?:保险费|服务费|管理费|手续费|费用)/.test(seg);
      if(thirdPartyPays) continue;
      let freq = 'unknown';
      if(/(?:一次性|一次收取|一次付清|只收一次|单次)/.test(seg)) freq = 'once';
      else if(/(?:已含|已包含|包含在|含在|已包括|纳入)/.test(seg)) freq = 'included';
      else if(/每期[^。；\n]{0,16}(?:收取|另收|另付|服务费|手续费|管理费)/.test(seg)
        || /(?:每期|每月)[^。；\n]{0,14}(?:另收|另行|另外|额外|收取)/.test(seg)) freq = 'period';
      out.push({name:fm[1],amount:parseAmount(am[0]),freq});
    }
    return out;
  };
  const planShape = c => {
    const t = clauseFull(c);
    let periods = null, per = null;
    let m = t.match(/(?:分|共)\s*([一二两三四五六七八九十\d]{1,3})\s*(?:期|个?月)/);
    if(m){ const n = /^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1]); if(Number.isFinite(n)) periods = n; }
    m = t.match(/(?:每期还款|每期应还|每期偿还|每期支付|每月还款|每月应还|月供|每期)[^。；\n]{0,16}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
    if(m) per = parseAmount(m[0]);
    return {periods,per,hasPlan:periods != null && per != null};
  };
  const planClauses = payClauses.filter(c => planShape(c).hasPlan);
  const solePlan = planClauses.length === 1 ? planClauses[0] : null;
  const feeOnlyClauses = solePlan ? ctx.clauses.filter(c => c !== solePlan
    && Math.abs(c.index - solePlan.index) <= 1
    && !planShape(c).hasPlan
    && !/(?:借款本金|贷款本金|本金为)[^。；\n]{0,8}[\d,]+/.test(clauseFull(c))
    && feeNameRe.test(clauseFull(c))
    && /[\d,]+(?:\.\d+)?\s*(?:万元|万|千元|千|元)/.test(clauseFull(c))) : [];
  let primaryPay = null, primaryQ = null, primaryTotal = null;
  payClauses.forEach(cPay => {
    if(solePlan && feeOnlyClauses.includes(cPay)) return;
    const t = clauseFull(cPay);
    const shape = planShape(cPay);
    if(!shape.hasPlan && /(支付页|签署前|签署后|明示表|只能看到|只能查看)/.test(t)) return;
    const periods = shape.periods;
    const per = shape.per;
    let total = null, totalCalc = null;
    let m = t.match(/(?:还款总额|共还|共计还款|总还款|本息合计|合计还款)[^。；\n]{0,16}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
    if(m) total = parseAmount(m[0]);
    const feeClauses = [cPay];
    if(cPay === solePlan) feeOnlyClauses.forEach(fc => feeClauses.push(fc));
    const fees = [], feeSource = [];
    feeClauses.forEach(fc => {
      extractFees(clauseFull(fc)).forEach(f => {
        fees.push(f);
        feeSource.push(fc);
      });
    });
    let knownFeeTotal = 0;
    fees.forEach(f => {
      if(f.freq === 'once') knownFeeTotal += f.amount;
      else if(f.freq === 'period' && periods != null) knownFeeTotal += periods * f.amount;
    });
    const hasUnknownFee = fees.some(f => f.freq === 'unknown');
    if(periods != null && per != null) totalCalc = periods * per + knownFeeTotal;
    const displayTotal = totalCalc != null ? totalCalc : total;
    const over = displayTotal != null && principal != null && displayTotal > principal ? displayTotal - principal : null;
    const q = qFilter(cPay,/(平台服务费|技术服务费|咨询服务费|服务费|管理费|分期|每期|月供)/) || qAny(cPay,/(分期|每期|月供)/);
    const feeMode = f => f.freq === 'once' ? '一次性' : f.freq === 'period' ? '每期另收' : f.freq === 'included' ? '已包含在每期还款中' : '收取频次未写';
    const feeDesc = fees.filter(f => f.freq !== 'included').map(f => `${f.name} ${fmtYuan(f.amount)} 元（${feeMode(f)}）`).join('、');
    let cons;
    if(periods != null && per != null && displayTotal != null){
      cons = `分 ${periods} 期、每期 ${fmtYuan(per)} 元`;
      if(feeDesc) cons += `，另列费用：${feeDesc}`;
      cons += hasUnknownFee
        ? `，已列明的分期还款及已确定费用小计 ${fmtYuan(displayTotal)} 元（不含频次未定的费用）`
        : `，按条款共还 ${fmtYuan(displayTotal)} 元`;
      if(principal != null){
        if(hasUnknownFee) cons += over
          ? `，已确定的金额已比 ${fmtYuan(principal)} 元本金多 ${fmtYuan(over)} 元，但费用频次未定，尚不能确定全部成本`
          : `，已确定的金额未超过 ${fmtYuan(principal)} 元本金，但费用频次未定，尚不能确定全部成本`;
        else cons += over ? `，比 ${fmtYuan(principal)} 元本金至少多 ${fmtYuan(over)} 元` : `，未超过 ${fmtYuan(principal)} 元本金`;
      }
      if(total != null && totalCalc != null && toCents(total) !== toCents(totalCalc)){
        cons += `；但合同明示总额为 ${fmtYuan(total)} 元，与按条款计算不一致，需核对哪一份金额有效`;
      }
      cons += '。';
    }else if(total != null){
      cons = `合同写明还款总额 ${fmtYuan(total)} 元${principal != null ? `，本金 ${fmtYuan(principal)} 元` : ''}；分期数或每期金额没有同时写清，无法核对现金流是否一致。`;
    }else{
      cons = '把培训费拆成分期贷款，但没写清分期数、每期金额和年化综合成本；签了之后还款义务先落在你身上。';
    }
    if(licensedClaim && periods != null){
      cons += ' 合同自称贷款人为持牌消费金融公司，正常履约成本应按明示综合融资成本规则核对，不套用民间借贷利率上限。';
    }
    const unknownIndex = fees.findIndex(f => f.freq === 'unknown');
    const unknownFee = unknownIndex >= 0 ? fees[unknownIndex] : null;
    const unknownFeeClause = unknownIndex >= 0 ? feeSource[unknownIndex] : cPay;
    if(unknownFee){
      cons += ` ${unknownFee.name} ${fmtYuan(unknownFee.amount)} 元没有写收取频次：如果只在第一期收一次，合计与每期都收相差很大，签约前必须问明。`;
    }
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'分期贷款与信息披露',
      short:displayTotal ? (hasUnknownFee ? `${periods || ''} 期已列明 ${fmtYuan(displayTotal)} 元（未计频次未定费用）` : `${periods || ''} 期共 ${fmtYuan(displayTotal)} 元`) : '分期贷款信息不清',clauseIndex:cPay.index,location:clauseLabel(cPay,cPay.index),
      quote:q ? q.quote : '',range:q||null,consequence:cons,
      ask:'机构：放款人是谁？各项费用分别由谁、收几次？含全部费用的年化综合成本是多少？',counter:'把放款主体、每项费用的付款方与频次、每期金额、总额和年化成本写进同一份协议。',
      basis:licensedClaim ? LAW.IR26_2 : LAW.LPR25,confidence:periods && per ? '高' : '中',loss:over || 0
    });
    if(periods != null && per != null && unknownFee){
      const uq = qFilter(unknownFeeClause, feeNameRe) || qAny(unknownFeeClause, feeNameRe);
      addItem(ctx,{
        base:'R9',ruleId:'R9',verdict:'gray',ruleName:'服务费收取频次不明',
        short:'费用只写金额，没写收几次',clauseIndex:unknownFeeClause.index,location:clauseLabel(unknownFeeClause,unknownFeeClause.index),
        quote:uq ? uq.quote : '',range:uq||null,
        consequence:`合同只写 ${unknownFee.name} ${fmtYuan(unknownFee.amount)} 元，没有说是一次性收取、每期收取还是已包含在每期还款中；三种口径的总额不同，不能直接按其中一种替你估算。`,
        ask:'机构：这项费用收一次还是每期都收？是否已包含在每期还款里？',counter:'在合同里写明每项费用的收取频次和总额。',
        basis:licensedClaim ? LAW.IR26_2 : LAW.LPR25,confidence:'中',loss:0
      });
    }
    if(over && !primaryPay){ primaryPay = cPay; primaryQ = q; primaryTotal = {over,total:displayTotal,periods,perTotal:per}; }
  });
  if(primaryPay && !/(银行|消费金融|持牌|小额贷款公司|汽车金融|信托)/.test(ctx.text)){
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'gray',ruleName:'利率上限需按借贷主体核对',
      short:'利率上限待核对',clauseIndex:primaryPay.index,location:clauseLabel(primaryPay,primaryPay.index),
      quote:primaryQ ? primaryQ.quote : '',range:primaryQ||null,
      consequence:`按合同数字共比本金多 ${fmtYuan(primaryTotal.over)} 元。放款主体尚未明确：若属于民间借贷，需按合同成立时一年期 LPR 四倍核算；若是银行、持牌消费金融等机构，则不套用这一民间借贷上限，而要按金融借款规则和年化披露核对。`,
      ask:'合同相对方是谁？签约当月一年期 LPR 是多少？全部费用折算的年化是多少？',counter:'先确认放款主体和合同性质，再按适用规则核算年化成本。',
      basis:LAW.LPR25,confidence:'中',loss:primaryTotal.over
    });
  }
  ctx.clauses.filter(cl => /(逾期|罚息|滞纳金)/.test(clauseFull(cl)) && /(违约金|罚息|滞纳金)/.test(clauseFull(cl))).forEach(cP => {
    const q = qFilter(cP,/(逾期|罚息|滞纳金|违约金)/);
    const src = q ? q.raw : cP.body;
    const full = clauseFull(cP);
    const {rate,daily,monthly} = parseRate(src);
    const fixedM = src.match(/(?:固定|每次|另)[^。；\n]{0,16}?([\d,]+(?:\.\d+)?)\s*元/)
      || full.match(/(?:固定|每次|另)[^。；\n]{0,16}?([\d,]+(?:\.\d+)?)\s*元/)
      || full.match(/([\d,]+(?:\.\d+)?)\s*元[^。；\n]{0,10}(?:固定违约金|违约金)/);
    const fixedAmount = fixedM ? parseAmount(fixedM[0]) : null;
    const allPrincipal = /(?:全部|全额)[^。；\n]{0,8}(?:尚欠|未还|剩余)本金|(?:尚欠|未还|剩余)本金[^。；\n]{0,10}(?:全部|全额)|按全部尚欠本金/.test(full);
    if(rate != null){
      let cons = `逾期${daily ? '一天' : ''}加收未还金额的 ${rate}%${daily ? `，30 天就是 ${+(rate*30).toFixed(2)}%` : ''}`;
      if(fixedAmount != null) cons += `；合同还约定每次另收固定违约金 ${fmtYuan(fixedAmount)} 元，且与罚息同时计算`;
      if(allPrincipal) cons += '；即使只迟付一期，也按全部尚欠本金计提，实际金额会高于仅按逾期当期计算';
      cons += '。高额逾期费用可请求调减，但催收和征信影响会先发生。';
      addItem(ctx,{
        base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'逾期违约金过高',
        short:`逾期${daily ? '日息' : monthly ? '月' : ''} ${rate}%${fixedAmount != null ? `+${fmtYuan(fixedAmount)}元` : ''}`,clauseIndex:cP.index,location:clauseLabel(cP,cP.index),
        quote:q ? q.quote : '',range:q||null,consequence:cons,
        ask:`机构：逾期违约金为什么按${daily ? '日 ' : ''}${rate}% 计？${fixedAmount != null ? `固定 ${fmtYuan(fixedAmount)} 元与罚息为何叠加？` : ''}计提基础是全部尚欠本金还是逾期当期？`,counter:licensedClaim ? '按明示综合融资成本规则核算逾期成本，列明计费基数和封顶，并说明与持牌机构规则的对应关系。' : '改为不超过依法保护范围折算的逾期利率，删除开口或重复计费的条款。',
        basis:LAW.C585,confidence:'高',loss:0
      });
    }else{
      addItem(ctx,{
        base:'R9',ruleId:'R9',verdict:'gray',ruleName:'逾期费用未写上限',
        short:'逾期费用没写清',clauseIndex:cP.index,location:clauseLabel(cP,cP.index),
        quote:q ? q.quote : '',range:q||null,consequence:`写了逾期要收费${fixedAmount != null ? `，每次固定 ${fmtYuan(fixedAmount)} 元` : ''}，但没有写清比例或上限；一旦晚还，费用可能越滚越大，必须在签约前问明。`,
        ask:'机构：逾期一天收多少？有没有封顶？',counter:'写明逾期利率和上限，且不超过司法保护范围。',
        basis:LAW.C585,confidence:'中',loss:0
      });
    }
  });
  ctx.clauses.filter(cl => /(不予退还|不退)/.test(clauseFull(cl)) || /(剩余|未付|未还)[^。；\n]{0,20}一次性结清/.test(clauseFull(cl))).forEach(cR => {
    const fullR = clauseFull(cR);
    if(/(未开课|未登录|付款后[^。；\n]{0,8}日|迁址|外省|跨省|转移[^。；\n]{0,10}明显不便|改由[^。；\n]{0,10}第三方)/.test(fullR)) return;
    const q = qAny(cR,/(不予退还|不退|一次性结清)/);
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'gray',ruleName:'退费与解约限制',
      short:'开课后不退费',clauseIndex:cR.index,location:clauseLabel(cR,cR.index),
      quote:q ? q.quote : '',range:q||null,consequence:`开课后不退费${/一次性结清/.test(cR.body) ? '，退学还要一次性结清剩余分期' : ''}；这类格式条款是否有效要看培训实际履行情况，退不成时先固定课时与服务证据。`,
      ask:'机构：开课前、开课后分别怎么退？剩余分期能否停止？',counter:'写明按已上课时比例退费；退学后未发生的贷款停止计息。',
      basis:LAW.C497,confidence:'中',loss:0
    });
  });
  const refundFeeRe = /(?:退费|退款)[^。；\n]{0,24}(?:扣除|扣收|收取)[^。；\n]{0,14}(?:手续费|违约金|服务费|管理费)|(?:扣除|扣收)[^。；\n]{0,14}(?:手续费|违约金)[^。；\n]{0,20}(?:退费|退款|退还)/;
  ctx.clauses.filter(cl => refundFeeRe.test(clauseFull(cl))).forEach(cR => {
    const q = qFilter(cR, refundFeeRe) || qAny(cR, /(退费|退款|手续费|违约金)/);
    if(!q) return;
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'退费扣手续费或违约金',
      short:'退费要扣手续费',clauseIndex:cR.index,location:clauseLabel(cR,cR.index),
      quote:q.quote,range:q,consequence:'退费要扣手续费或违约金，但扣多少、对应什么成本没写清；真退学时可能先扣一笔，再让你继续还剩余分期。',
      ask:'机构：退费手续费按什么比例？对应哪些已发生成本？',counter:'按已上课时和已发生费用结算，未发生的学费与分期应停止。',
      basis:LAW.C497,confidence:'中',loss:0
    });
  });
  const upfrontRe = /(砍头息|前置利息|预先扣除[^。；\n]{0,10}(?:服务费|利息|手续费)|先扣[^。；\n]{0,10}(?:服务费|利息|手续费))/;
  ctx.clauses.filter(cl => upfrontRe.test(clauseFull(cl))).forEach(cU => {
    const q = qFilter(cU, upfrontRe) || qAny(cU, /(砍头息|前置利息|预先扣除|先扣)/);
    if(!q) return;
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'贷款费用预先扣除',
      short:'预扣服务费或利息',clauseIndex:cU.index,location:clauseLabel(cU,cU.index),
      quote:q.quote,range:q,consequence:'放款前先扣服务费、利息或手续费，实际到手会少于合同本金，但还款仍按合同本金计算；真实年化成本会被抬高。',
      ask:'机构：实际放款金额是多少？预扣费用是否计入年化成本？',counter:'按实际到手金额计算本金和年化成本，所有费用写入同一份披露表。',
      basis:LAW.LPR25,confidence:'中',loss:0
    });
  });
  const advanceRe = /(提前(?:还款|结清|还清))[^。；\n]{0,24}(?:违约金|手续费|服务费|不予减免|仍需支付全部利息)|(?:违约金|手续费|服务费)[^。；\n]{0,20}(?:提前(?:还款|结清|还清))/;
  ctx.clauses.filter(cl => advanceRe.test(clauseFull(cl))).forEach(cA => {
    const q = qFilter(cA, advanceRe) || qAny(cA, /(提前还款|提前结清|提前还清)/);
    if(!q) return;
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'gray',ruleName:'提前结清仍收费用',
      short:'提前还款仍收费',clauseIndex:cA.index,location:clauseLabel(cA,cA.index),
      quote:q.quote,range:q,consequence:'提前还款仍要收违约金、手续费或全部利息；想早点止损时，实际结清金额可能高于剩余本金。',
      ask:'机构：提前结清要付多少？剩余利息能否减免？',counter:'写明提前结清公式，未发生的利息和管理费不再收取。',
      basis:LAW.C585,confidence:'中',loss:0
    });
  });
  const agencyRe = /(?:贷款|分期)[^。；\n]{0,24}(?:由甲方|由机构|由平台)[^。；\n]{0,10}(?:代办|代签|代为办理|操作)|(?:代(?:为)?(?:办理|申请|签署))[^。；\n]{0,12}(?:贷款|分期)|(?:签署本协议即视为同意)[^。；\n]{0,16}(?:贷款|分期)/;
  ctx.clauses.filter(cl => agencyRe.test(clauseFull(cl))).forEach(cG => {
    const q = qFilter(cG, agencyRe) || qAny(cG, /(贷款|分期|代签|代办|视为同意)/);
    if(!q) return;
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'贷款由机构代办或默示同意',
      short:'签协议即视为同意贷款',clauseIndex:cG.index,location:clauseLabel(cG,cG.index),
      quote:q.quote,range:q,consequence:'签培训协议就被视为同意贷款，或由机构代为操作；你可能没看到借款合同、放款人和真实利率，就已经背上还款义务。',
      ask:'机构：贷款合同和放款人是谁？能否先看完整借款合同再签字？',counter:'培训协议与贷款合同分开签署，单独确认放款主体、金额、利率和退费。',
      basis:LAW.C497,confidence:'中',loss:0
    });
  });
  const cCourse = ctx.clauses.find(cl => /(培训项目|培训周期|培训费)/.test(clauseFull(cl)) && parseAmount(cl.body));
  addGreen(ctx,cCourse,'培训项目与周期',/(培训周期|培训费)/,'培训项目、周期和总费用已写明。');
}

/* R10 实习协议 */
function runR10(ctx){
    const selfInsRe = /(乙方|学生|实习生|本人)[^。；\n]{0,18}(自行|自己|本人)[^。；\n]{0,12}(购买|投保|承担)[^。；\n]{0,12}(保险|意外)|(保险|意外险)[^。；\n]{0,12}(由乙方|自行|自理)/;
  const positiveInsRe = /(甲方|实习单位|公司|学校)[^。；\n]{0,26}(购买|投保|缴纳|办理|承担)[^。；\n]{0,16}(意外伤害保险|意外险|实习责任保险)|(购买|投保)[^。；\n]{0,16}(意外伤害保险|意外险|实习责任保险)/;
  const selfIns = selfInsRe.test(ctx.text);
  const hasIns = positiveInsRe.test(ctx.text) && !selfIns;
  if(!hasIns){
    const cSelf = selfIns ? ctx.clauses.find(cl => selfInsRe.test(clauseFull(cl))) : null;
    const cSafe = cSelf || ctx.clauses.find(cl => /(安全|意外|伤害|不承担责任|保险)/.test(clauseFull(cl)));
    const q = cSafe ? (qFilter(cSafe,/(不承担责任|保险|意外)/) || qFilter(cSafe,/(安全|意外)/) || qAny(cSafe,/(保险|意外|安全|不承担责任)/)) : null;
    const extra = /不承担责任|概不负责/.test(cSafe ? clauseFull(cSafe) : '');
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习意外伤害保险缺失',
      short:selfIns ? '意外险要你自己买' : '缺少意外伤害保险',clauseIndex:cSafe ? cSafe.index : null,location:cSafe ? clauseLabel(cSafe,cSafe.index) : '全文',
      quote:q ? q.quote : '',range:q||null,consequence:selfIns
        ? `协议把意外伤害保险推给你自己购买${extra ? '，还写了意外不承担责任' : ''}；实习期间受伤，医疗费和误工可能没有保险兜底。`
        : `全文没有意外伤害保险约定${extra ? '，还写了意外不承担责任' : ''}；实习期间受伤，医疗费和误工可能没有保险兜底。`,
      ask:'HR 或学校：实习责任险或意外险由谁买？保额多少？',counter:'写入由甲方投保实习责任保险 / 意外伤害保险，并把保单作为附件。',
      basis:LAW.R10,confidence:'中',loss:0
    });
  }
  const noPayRe = /(?:无薪|无偿|不支付(?:实习)?(?:补贴|报酬|工资)|没有(?:实习)?(?:补贴|报酬|工资))/;
  ctx.clauses.filter(cl => noPayRe.test(clauseFull(cl))).forEach(cNoPay => {
    const q = qFilter(cNoPay, noPayRe) || qAny(cNoPay, /(无薪|无偿|不支付|没有)/);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'无薪或无偿实习',
      short:'无薪实习',clauseIndex:cNoPay.index,location:clauseLabel(cNoPay,cNoPay.index),
      quote:q.quote,range:q,consequence:'协议明确不支付补贴或报酬；短期体验尚可，但如果按固定工时承担实际工作，既没有收入，也可能掩盖应得的劳动报酬。',
      ask:'HR：实习补贴为什么没有？每月出勤和请假怎么算？',counter:'写明补贴标准与发放日；实际承担岗位工作的，按约定支付报酬。',
      basis:LAW.C470,confidence:'中',loss:0
    });
  });
  const hoursRe = /每周[^。；\n]{0,12}(?:[6六]\s*天|超过\s*40\s*小时)|(?:单休|做六休一|996|007)|每(?:日|天)[^。；\n]{0,10}(?:工作|实习)?(?:9|10|11|12)\s*小时/;
  ctx.clauses.filter(cl => hoursRe.test(clauseFull(cl))).forEach(cH => {
    const q = qFilter(cH, hoursRe) || qAny(cH, /(每周|每天|单休|996)/);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习工时偏高',
      short:'实习工时超过 40 小时/周',clauseIndex:cH.index,location:clauseLabel(cH,cH.index),
      quote:q.quote,range:q,consequence:'每周 6 天、单休或每天 9 小时以上，工时已接近或超过标准工时；实习协议不当然排除劳动保护，长期超时还会挤占课程和休息。',
      ask:'HR：每周实际实习几天、每天几小时？超时怎么调休或补贴？',counter:'写明每周上限、休息日和超时处理，避免把实习生当全职员工使用。',
      basis:LAW.C470,confidence:'中',loss:0
    });
  });
  const internFeeRe = /(押金|保证金|培训费|服装费|工装费|体检费|管理费|建档费|报名费|设备费)/;
  const internFeePayRe = /(交纳|缴纳|收取|支付|从补贴[^。；\n]{0,8}扣)/;
  ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return internFeeRe.test(t) && internFeePayRe.test(t) && !/(甲方|实习单位|公司)[^。；\n]{0,14}(承担|支付|报销)/.test(t);
  }).forEach(cF => {
    const q = qFilter(cF, internFeeRe, /(甲方|实习单位|公司)[^。；\n]{0,14}(承担|支付|报销)/) || qAny(cF, internFeeRe);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'向实习生收费或收押金',
      short:'实习要交押金或费用',clauseIndex:cF.index,location:clauseLabel(cF,cF.index),
      quote:q.quote,range:q,consequence:'实习还要交押金、培训费或服装费；这笔钱可能以“违约”“损坏”“未满期”为由不退，事后追要成本很高。',
      ask:'HR：这笔费用对应什么成本？有没有收据和退还条件？',counter:'删除向学生收费的条款；必要的工装和设备由实习单位提供。',
      basis:LAW.C470,confidence:'中',loss:0
    });
  });
  const renewRe = /(?:自动续期|自动延长|单方延长|期满后继续有效|未提出异议视为续期)/;
  ctx.clauses.filter(cl => renewRe.test(clauseFull(cl))).forEach(cRn => {
    const q = qFilter(cRn, renewRe) || qAny(cRn, /(续期|延长|继续有效)/);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习协议自动续期',
      short:'实习协议自动续期',clauseIndex:cRn.index,location:clauseLabel(cRn,cRn.index),
      quote:q.quote,range:q,consequence:'协议可自动续期或由单位单方延长；到期后你可能在不知情的情况下继续受约束，影响返校、考试和找工作。',
      ask:'HR：续期需要谁确认？每次续多久？',counter:'改为双方书面确认后续期，到期自动终止。',
      basis:LAW.C562,confidence:'中',loss:0
    });
  });
  const noLaborRe = /(?:不构成|不属于|并非)[^。；\n]{0,8}劳动关系/;
  ctx.clauses.filter(cl => noLaborRe.test(clauseFull(cl))).forEach(cN => {
    const q = qFilter(cN, noLaborRe) || qAny(cN, /(不构成|不属于|劳动关系)/);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'gray',ruleName:'实习关系被单方定性',
      short:'协议否认劳动关系',clauseIndex:cN.index,location:clauseLabel(cN,cN.index),
      quote:q.quote,range:q,consequence:'协议声明不构成劳动关系。实习通常确实不按劳动关系处理，但如果实际存在固定岗位、考勤、绩效和持续报酬，仍可能被认定为劳动关系。',
      ask:'HR 或学校：这份实习是否在学校的实习计划内？日常是否按员工考核？',counter:'保留实习计划、考勤、报酬和管理记录，必要时再判断关系性质。',
      basis:LAW.C470,confidence:'中',loss:0
    });
  });
  const endRe = /(甲方|实习单位|公司)[^。；\n]{0,26}(随时|有权|可以)[^。；\n]{0,18}(终止|解除)|(甲方|实习单位|公司)[^。；\n]{0,26}(无需|不需|不必)(?:说明)?理由/;
  ctx.clauses.filter(cl => endRe.test(clauseFull(cl))).forEach(cEnd => {
    const q = qFilter(cEnd,/(随时(?:终止|解除)|无需(?:说明)?理由)/) || qFilter(cEnd,/(终止|解除)/);
    if(!q) return;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习解除条件不对等',
      short:'公司可随时终止实习',clauseIndex:cEnd.index,location:clauseLabel(cEnd,cEnd.index),
      quote:q.quote,range:q,consequence:'公司可以随时终止实习且不用说明理由；你为实习租的房、推掉的课可能落空，实习证明也未必拿得到。',
      ask:'HR：终止实习要提前几天通知？能写明理由吗？',counter:'改为双方提前 7 日书面通知；单方终止需说明理由并结清补贴。',
      basis:LAW.C562,confidence:'高',loss:0
    });
  });
  const payWord = /(补贴|报酬|工资|实习补助)/;
  const payClause = ctx.clauses.find(cl => payWord.test(clauseFull(cl)) && parseAmount(cl.body));
  if(!payWord.test(ctx.text)){
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习报酬未约定',
      short:'实习报酬未约定',clauseIndex:null,location:'全文',
      quote:'',range:null,consequence:'没写补贴标准和发放时间；干了几个月也可能拿不到钱，事后追要时说不清标准。',
      ask:'HR：实习补贴多少、每月几号发？',counter:'写明金额、发放日和不足整月的折算方式。',
      basis:LAW.C470,confidence:'高',loss:0
    });
  }else if(!payClause){
    const cP = ctx.clauses.find(cl => payWord.test(clauseFull(cl)));
    const q = cP ? qAny(cP, payWord) : null;
    addItem(ctx,{
      base:'R10',ruleId:'R10',verdict:'yellow',ruleName:'实习报酬标准未写明',
      short:'实习报酬没写金额',clauseIndex:cP ? cP.index : null,location:cP ? clauseLabel(cP,cP.index) : '全文',
      quote:q ? q.quote : '',range:q||null,consequence:'提到了补贴或报酬，但没写具体金额和发放时间；干了几个月也可能说不清该拿多少。',
      ask:'HR：实习补贴多少、每月几号发？',counter:'写明金额、发放日和不足整月的折算方式。',
      basis:LAW.C470,confidence:'中',loss:0
    });
  }
  const cTerm = ctx.clauses.find(cl => /(实习期|实习期限)/.test(clauseFull(cl)) && /\d{4}\s*年/.test(clauseFull(cl)));
  addGreen(ctx,cTerm,'实习期限',/(实习期|实习期限)/,'实习起止日期完整。');
  addGreen(ctx,payClause,'实习报酬',/(补贴|报酬)/,'报酬标准、发放时间与折算方式已写明。');
  const cHours = ctx.clauses.find(cl => /(每日|每天|每周)[^。；\n]{0,14}(小时|天)/.test(clauseFull(cl)));
  addGreen(ctx,cHours,'实习工时',/(每日|每天|每周)/,'每周天数与每日时段已写明。');
  if(hasIns){
    const cIns = ctx.clauses.find(cl => positiveInsRe.test(clauseFull(cl)));
    addGreen(ctx,cIns,'意外伤害保险',/(保险|意外)/,'意外伤害保险由单位投保，属常规安排。');
  }
}

/* R11 押金与扣证 */
function runR11(ctx){
  const feeRe = /(押金|保证金|抵押金|担保金|风险金|风险抵押金|履约保证金|保密保证金|培训押金|服装费|工装费|工服费|工牌费|体检费|培训费|入职费|管理费|建档费|报名费|设备费|工具费|资料费|电脑押金|住宿押金|水电押金|背景调查费|招聘费|集资款|入股款|余额|周转款|周转金|诚意金|意向金|垫付款|占用款)/;
  const payRe = /(交纳|缴纳|收取|交付|支付|预交|预缴|代收|扣留|扣除|转给|转账|汇入|打入|存入|从工资[^。；\n]{0,8}扣)/;
  const employmentRe = /(入职|报到|上班|排班|门禁|工牌|工服|工作服|岗位|离职|交回|退还|返还|押金|保证金|余额)/;
  const negFeeRe = /(不收取|不会收取|不会收|不得收取|不予收取|不收|不得扣押|不扣押|不扣留|无需|无须|不缴纳|不缴|不交|当场归还|核验后归还|禁止收取)/;
  ctx.clauses.forEach(cDep => {
    if(!employmentRe.test(clauseFull(cDep))) return;
    sentenceList(cDep.body || '').forEach(sentence => {
      const raw = sentence.quote;
      const dir = paymentDirection(raw);
      if(!feeRe.test(raw) || !payRe.test(raw) || negFeeRe.test(raw) || (dir.employerPays && !dir.employeePays)) return;
      const kindM = raw.match(feeRe);
      const kind = kindM ? kindM[1] : '费用';
      const namedDeposit = /押金|保证金|抵押金|担保金|风险金|集资款|入股款/.test(kind);
      const deposit = namedDeposit || /余额|周转款|周转金|可退/.test(kind) || /(?:可退|退还|返还)/.test(raw);
      const renamed = deposit && !namedDeposit;
      const amt = amountNear(raw, feeRe) || parseAmount(raw);
      const q = {quote:clipQuote(raw, 0, raw.length),raw,start:sentence.start,end:sentence.end};
      addItem(ctx,{
        base:'R11',ruleId:'R11',verdict:'red',ruleName:renamed ? '变相收取押金或保证金' : (deposit ? '向劳动者收取押金或保证金' : '以其他名义向劳动者收费'),
        short:amt ? `${fmtWan(amt)}${kind}` : `收取${kind}`,clauseIndex:cDep.index,location:clauseLabel(cDep,cDep.index),
        quote:q.quote,range:q,consequence:deposit
          ? `${renamed ? `虽然换成“${kind}”的叫法、也承诺可退或离职返还，但` : ''}入职前必须先向单位交 ${amt ? fmtYuan(amt) + ' 元' : ''}${kind}，否则不能上班或排班；名称和是否可退不改变招用时收财物的性质，离职时仍可能以各种理由拖延不退。`
          : `入职先交 ${amt ? fmtYuan(amt) + ' 元' : ''}${kind}；以其他名义向劳动者收费同样被禁止，这笔钱可能退不回来。`,
        ask:`HR：这笔${kind}依据什么规定收取？为什么必须在入职或排班前交纳？`,counter:`删除收取${kind}的条款；已交的出具收据并无条件退还。`,
        basis:LAW.L09,confidence:'高',loss:amt || 0
      });
    });
  });
  const guaranteeRe = /(?:要求|需|须|应)[^。；\n]{0,12}(?:乙方|劳动者|员工)[^。；\n]{0,10}(?:提供|找|出具)[^。；\n]{0,10}(?:担保|保证人)|(?:担保人|保证人)[^。；\n]{0,14}(?:签字|提供|承担连带)/;
  ctx.clauses.filter(cl => guaranteeRe.test(clauseFull(cl))).forEach(cG => {
    const q = qFilter(cG, guaranteeRe) || qAny(cG, /(担保|保证人|连带)/);
    if(!q) return;
    addItem(ctx,{
      base:'R11',ruleId:'R11',verdict:'red',ruleName:'要求劳动者提供担保',
      short:'要求提供担保人',clauseIndex:cG.index,location:clauseLabel(cG,cG.index),
      quote:q.quote,range:q,consequence:'入职还要求担保人或连带责任保证；用人单位招用劳动者不得要求提供担保，这类条款会把你和家人的财产一起卷进来。',
      ask:'HR：为什么要求提供担保？依据是什么？',counter:'删除担保条款；如涉及财物保管，用岗位制度和交接清单解决。',
      basis:LAW.L09,confidence:'高',loss:0
    });
  });
  const idRe = /(扣押|扣留|收走|收缴|保管)/;
  const certRe = /(身份证|毕业证|学位证|学历证|资格证|证件|证书|户口本|护照)/;
  ctx.clauses.forEach(cId => {
    const full = clauseFull(cId);
    if(!certRe.test(full)) return;
    const bad = sentenceList(cId.body || '').find(s => certRe.test(s.quote) && idRe.test(s.quote)
      && !/(?:不得|禁止|不)[^。；\n]{0,8}(?:扣押|扣留|收走|收缴)|(?:核验|查验|核对)[^。；\n]{0,12}(?:归还|返还)|当场归还/.test(s.quote));
    if(!bad) return;
    const q = {quote:clipQuote(bad.quote, 0, bad.quote.length),raw:bad.quote,start:bad.start,end:bad.end};
    addItem(ctx,{
      base:'R11',ruleId:'R11',verdict:'red',ruleName:'扣押证件',
      short:'扣留证件',clauseIndex:cId.index,location:clauseLabel(cId,cId.index),
      quote:q.quote,range:q,consequence:'公司扣下你的证件，出行、入职、办卡都会被卡住；扣押证件本身被法律禁止，先要回证件再谈其他。',
      ask:'HR：为什么要收走证件？什么时候归还？',counter:'删除扣押条款；入职核验后当场归还。',
      basis:LAW.L09,confidence:'高',loss:0
    });
  });
}

/* R12 解除与通知期 */
function runR12(ctx){
  const noticeRe = /(离职|辞职|解除|终止)/;
  const employeeRe = /(乙方|劳动者|员工|本人)/;
  const employerRe = /(甲方|公司|用人单位|雇主)/;
  const employeeLeaningRe = /(辞职|离职|劳动者)/;
  const subjectOf = (sentence, heading, matchIndex) => {
    const before = sentence.slice(0, matchIndex);
    const employeeAt = Math.max(before.lastIndexOf('乙方'), before.lastIndexOf('劳动者'), before.lastIndexOf('员工'), before.lastIndexOf('本人'));
    const employerAt = Math.max(before.lastIndexOf('甲方'), before.lastIndexOf('公司'), before.lastIndexOf('用人单位'), before.lastIndexOf('雇主'));
    if(employeeAt > employerAt) return 'employee';
    if(employerAt > employeeAt) return 'employer';
    const h = heading || '';
    if(employeeRe.test(h)) return 'employee';
    if(employerRe.test(h)) return 'employer';
    return 'unknown';
  };
  ctx.clauses.filter(cl => /提前[^。；\n]{0,12}(日|天|个?工作日|个?自然日|个?日历日|个月|月|周|星期)/.test(clauseFull(cl)) && noticeRe.test(clauseFull(cl))).forEach(c => {
    const isTrial = /试用期/.test(clauseFull(c));
    let found = null;
    let trialFound = null;
    sentenceList(c.body || '').forEach(s => {
      const re = /提前\s*([一二两三四五六七八九十百零〇\d]{1,4})\s*(个?工作日|个?自然日|个?日历日|日|天|个月|月|周|星期)/g;
      let m;
      while((m = re.exec(s.quote))){
        const n = cnNum(m[1]);
        if(!Number.isFinite(n)) continue;
        let days = n;
        if(m[2] === '个月' || m[2] === '月') days = n * 30;
        else if(m[2] === '周' || m[2] === '星期') days = n * 7;
        else if(/工作日/.test(m[2])) days = Math.round(n * 7 / 5);
        const subject = subjectOf(s.quote, c.heading, m.index);
        if(subject === 'employer') continue;
        if(subject === 'unknown' && !employeeLeaningRe.test(s.quote)) continue;
        const candidate = {days, quote:clipQuote(s.quote, m.index, m.index + m[0].length), raw:s.quote, start:s.start, end:s.end};
        if(isTrial && days > 3 && days <= 30 && (!trialFound || days > trialFound.days)) trialFound = candidate;
        if(days > 30 && (!found || days > found.days)) found = candidate;
      }
    });
    if(found){
      addItem(ctx,{
        base:'R12',ruleId:'R12',verdict:'gray',ruleName:'离职通知期高于法定 30 天',
        short:`${found.days} 天离职通知期`,clauseIndex:c.index,location:clauseLabel(c,c.index),
        quote:found.quote,range:found,consequence:`合同要求你提前 ${found.days} 天通知离职，高于法定的 30 天；多出的时间可能拖住下家和入职，超出部分是否有效要个案判断。`,
        ask:'HR：这条通知期能否按法定 30 天执行？',counter:'改为提前 30 日书面通知，试用期内提前 3 日。',
        basis:LAW.L37,confidence:'中',loss:0
      });
    }else if(trialFound){
      addItem(ctx,{
        base:'R12',ruleId:'R12',verdict:'gray',ruleName:'试用期通知期高于法定 3 天',
        short:`试用期 ${trialFound.days} 天通知期`,clauseIndex:c.index,location:clauseLabel(c,c.index),
        quote:trialFound.quote,range:trialFound,consequence:`合同要求试用期离职提前 ${trialFound.days} 天通知，高于法定的 3 天；多出的通知时间可能被公司拿来做交接或拖延。`,
        ask:'HR：试用期离职能否按法定 3 天执行？',counter:'改为试用期内提前 3 日通知，转正后提前 30 日书面通知。',
        basis:LAW.L37,confidence:'中',loss:0
      });
    }
  });
  const waitRe = /(?:发出|提出|提交|递交)[^。；\n]{0,10}(?:通知|辞职)[^。；\n]{0,24}(?:等待|等|满)\s*([一二两三四五六七八九十\d]{1,3})\s*(?:日|天)/;
  const waitC = ctx.clauses.find(cl => waitRe.test(clauseFull(cl)));
  if(waitC){
    const m = clauseFull(waitC).match(waitRe);
    const n = m ? (/^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1])) : null;
    const q = qFilter(waitC, waitRe) || qAny(waitC, /(通知|等待|批准|离岗)/);
    addItem(ctx,{
      base:'R12',ruleId:'R12',verdict:'yellow',ruleName:'离职通知后附加等待期',
      short:n ? `通知后还要等 ${n} 日` : '通知后还要等批准',clauseIndex:waitC.index,location:clauseLabel(waitC,waitC.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:`通知离职后还要等待${n ? ` ${n} 日` : ''}并经主管签字批准才能离岗；试用期内依法提前 3 日通知即可解除，转正后提前 30 日书面通知即可，等待期和审批不能改变法定解除权。`,
      ask:'HR：我按法定通知期提交书面通知后，等待期和主管批准是否仍作为离岗前提？',counter:'删除额外等待期和审批前置；按法定通知期办理交接和结算。',
      basis:LAW.L37,confidence:'高',loss:0
    });
  }
}
function runR13(ctx){
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const waiverRe = /(?:加班费|加班工资|加班报酬)[^。；\n]{0,32}(?:不再|不另|无需|无须|不予|不支付|不计算|不计发|包含(?:在|于)[^。；\n]{0,10}(?:工资|薪资|月薪)|已包含|已含)|(?:放弃|不要求|自愿放弃)[^。；\n]{0,14}(?:加班费|加班工资|加班报酬)/;
  const waiverC = find(waiverRe);
  if(waiverC){
    addPatternItem(ctx,waiverC,{
      base:'R13',ruleId:'R13',verdict:'red',ruleName:'加班费被排除或已包含',
      short:'不另付加班费',consequence:'合同把加班费排除掉，或写成工资已经包含加班费；只要实际存在单位安排的加班，仍应按法定标准补足，但你要先证明加班事实。',
      ask:'HR：加班费按什么基数、什么比例计算？',counter:'删除“不再支付/已包含”的写法，按 150%/200%/300% 法定标准另行列明。',
      basis:LAW.L44,confidence:'高',loss:0
    },waiverRe);
  }
  const holiday200Re = /(?:法定节假日|法定假日)[^。；\n]{0,36}(?:按|只按|仅按)[^。；\n]{0,12}(?:正常工资|工资)?[^。；\n]{0,8}(?:200\s*%|百分之二百|2(?:\.0)?倍|两倍)[^。；\n]{0,16}(?:结算|支付|计算|计发)?/;
  const holiday200C = find(holiday200Re);
  if(holiday200C){
    addPatternItem(ctx,holiday200C,{
      base:'R13',ruleId:'R13',verdict:'red',ruleName:'法定节假日加班费低于 300%',
      short:'法定节假日只按 200% 算',consequence:'法定节假日安排工作，应支付不低于工资 300% 的报酬；合同只按 200% 结算，即使另给食堂券或把班次归到周末档，差额仍应按法定标准核对。',
      ask:'HR：法定节假日加班为什么只按 200% 结算？食堂券和周末档如何处理？',counter:'法定节假日按不低于 300% 支付，不能以食堂券或内部档期替代。',
      basis:LAW.L44,confidence:'高',loss:0
    },holiday200Re);
  }
  const holidayRe = /(?:法定节假日|法定假日)[^。；\n]{0,32}(?:安排调休|调休|补休)[^。；\n]{0,22}(?:不(?:再)?支付|无需支付|不另支付)|(?:法定节假日|法定假日)[^。；\n]{0,24}(?:按|只按|仅按)(?:基本工资|1(?:\.0)?倍|一(?:倍|倍工资)|100\s*%)(?:支付|计算|计发)?/;
  const holidayC = find(holidayRe);
  if(holidayC){
    addPatternItem(ctx,holidayC,{
      base:'R13',ruleId:'R13',verdict:'red',ruleName:'法定节假日加班只调休或按一倍算',
      short:'法定节假日加班费不足',consequence:'法定节假日加班不能只用调休替代，也不应按正常工资计算；依法应支付不低于 300% 的工资报酬。',
      ask:'HR：法定节假日加班的 300% 工资怎么发？',counter:'按法定节假日 300% 标准支付，不能以调休或正常工资替代。',
      basis:LAW.L44,confidence:'高',loss:0
    },holidayRe);
  }
  const lowBaseRe = /(?:加班|加班费|加班工资)[^。；\n]{0,26}(?:按|按照|以)[^。；\n]{0,18}(?:基本工资|底薪|最低工资|当地最低工资|1(?:\.0)?倍|一(?:倍|倍工资)|100\s*%|百分之百)[^。；\n]{0,14}(?:计算|支付|计发|为基数)?/;
  const lowBaseC = find(lowBaseRe);
  if(lowBaseC){
    addPatternItem(ctx,lowBaseC,{
      base:'R13',ruleId:'R13',verdict:'yellow',ruleName:'加班费计算基数偏低',
      short:'加班费按基本工资或最低工资算',consequence:'把加班费基数压到基本工资、底薪或最低工资，会让实际加班费低于按正常工资计算的法定标准；差额可以主张，但需要工资条和考勤。',
      ask:'HR：加班费基数是否包含绩效、补贴等正常工资？',counter:'按正常工作时间工资作为加班费基数，并在合同中写清构成。',
      basis:LAW.L44,confidence:'中',loss:0
    },lowBaseRe);
  }
  const scheduleRe = /(996|007|朝九晚九|早9晚9|早九晚九|大小周|单休|做六休一|月休[二两三四2-4]天|每月(?:休息|休)[二两三四2-4]天|每周(?:工作)?[6六]天|六天工作制)/;
  const scheduleC = find(scheduleRe);
  if(scheduleC){
    const term = (clauseFull(scheduleC).match(scheduleRe) || [''])[0];
    addPatternItem(ctx,scheduleC,{
      base:'R13',ruleId:'R13',verdict:'yellow',ruleName:'工时安排超过标准工时风险',
      short:`工时安排：${term || '单休/超时'}`,consequence:`合同出现“${term || '单休'}”等安排，可能超过每日 8 小时、每周 40 小时的标准工时；如果公司没有经过审批实行综合工时或不定时工时，超时部分应支付加班费。`,
      ask:'HR：公司实行哪种工时制度？综合工时或不定时工时有没有审批？',counter:'写明标准工时与休息日；确需轮班的，先确认工时制度审批和加班费。',
      basis:LAW.L31,confidence:'中',loss:0
    },scheduleRe);
  }
  const approvalRe = /(?:加班|延时工作)[^。；\n]{0,18}(?:须|需|必须|应)[^。；\n]{0,12}(?:审批|申请|批准|同意)|未经[^。；\n]{0,14}(?:审批|批准)[^。；\n]{0,14}(?:不(?:视为|算作|属于)加班|无加班费|不支付加班费)/;
  const approvalC = find(approvalRe);
  if(approvalC){
    addPatternItem(ctx,approvalC,{
      base:'R13',ruleId:'R13',verdict:'gray',ruleName:'加班认定受审批限制',
      short:'加班需审批才算',consequence:'公司规定加班必须事先审批，未审批不算加班；实际被安排加班但没走流程时，你需要用排班、聊天记录、打卡和工作成果证明。',
      ask:'HR：主管口头安排的加班算不算？审批流程怎么留痕？',counter:'保留加班安排和考勤记录；确需审批的，写明补批机制。',
      basis:LAW.L31,confidence:'中',loss:0
    },approvalRe);
  }
  const arrangedRe = /(?:主管|甲方|公司|排班表)[^。；\n]{0,30}(?:指派|安排|要求)[^。；\n]{0,30}(?:继续值班|延时工作|加班)[^。；\n]{0,20}(?:未|没有)[^。；\n]{0,24}(?:签字|签|确认单|审批)[^。；\n]{0,24}(?:不(?:算|视为|支付|发)|免发|自愿停留)/;
  const arrangedC = find(arrangedRe);
  if(arrangedC){
    addPatternItem(ctx,arrangedC,{
      base:'R13',ruleId:'R13',verdict:'yellow',ruleName:'已安排加班以未审批为由免付',
      short:'主管排了班却说没签字不算加班',consequence:'主管已在排班表上明确安排延时值班，合同又以未另签确认单为由一律算自愿停留、免发加班工资；是否属于加班要看单位是否实际安排和管理，不能只凭缺少内部签字否定。请保留排班表、聊天记录和打卡。',
      ask:'HR：主管排班表上的延时值班为什么不算加班？内部确认单由谁负责补签？',counter:'删除“未签字一律免付”；单位安排的加班按实际考勤认定，审批只是内部流程。',
      basis:LAW.L44,confidence:'中',loss:0
    },arrangedRe);
  }
  if(!ctx.items.some(it => it.ruleId === 'R13')){
    const cGreen = find(/(?:依法|按法定标准|按照法定标准)[^。；\n]{0,24}(?:支付|计发)?[^。；\n]{0,8}加班费|加班费[^。；\n]{0,20}(?:150%|200%|300%|百分之一百五十|百分之二百|百分之三百)/);
    if(cGreen) addGreen(ctx,cGreen,'加班费',/(加班费|加班工资)/,'加班费按法定标准支付，属常规安排。');
  }
}

/* R14 工资支付与扣款 */
function runR14(ctx){
  const r4Clauses = new Set(ctx.items.filter(it => it.ruleId === 'R4').map(it => it.clauseIndex));
  const r13Clauses = new Set(ctx.items.filter(it => it.ruleId === 'R13').map(it => it.clauseIndex));
  const find = re => ctx.clauses.find(cl => !r4Clauses.has(cl.index) && !r13Clauses.has(cl.index) && re.test(clauseFull(cl)));
  const withholdRe = /(?:压|押)(?:一个月|1个月|半个月|十五天|15天|两个月|2个月|三十天|30天)?[^。；\n]{0,10}(?:工资|薪资)|(?:工资|薪资)[^。；\n]{0,16}(?:年底|年后|次次月|第三个月|下下月|统一)[^。；\n]{0,10}(?:发放|结算|支付)|(?:离职|辞职)[^。；\n]{0,22}(?:工资|薪资)[^。；\n]{0,14}(?:不(?:予|再)?(?:发放|结算|支付)|暂缓|延后|扣发|扣除|年底|年后|次次月|第三个月|下下月|统一发放)|(?:离职|辞职)[^。；\n]{0,16}(?:不予结算|不结算|不发放工资|视为放弃)/;
  const handoverRe = /(?:未|不|拒绝)[^。；\n]{0,12}(?:办理|完成|配合|按)[^。；\n]{0,6}(?:交接|离职手续)|(?:交接|离职手续)[^。；\n]{0,16}(?:未|不)[^。；\n]{0,8}(?:办理|完成|配合)/;
  let withholdC = find(withholdRe);
  if(withholdC && handoverRe.test(clauseFull(withholdC))){
    withholdC = ctx.clauses.find(cl => !r4Clauses.has(cl.index) && !r13Clauses.has(cl.index) && !handoverRe.test(clauseFull(cl)) && withholdRe.test(clauseFull(cl)));
  }
  if(withholdC){
    addPatternItem(ctx,withholdC,{
      base:'R14',ruleId:'R14',verdict:'red',ruleName:'押工资或离职不结算',
      short:'工资被押后或离职不结算',consequence:'工资应按月足额支付；押一个月、离职不结算或把工资拖到年底，都会让你在离职时先失去现金流，追讨还要另走投诉或仲裁。',
      ask:'HR：工资每月几号发？离职当月工资什么时候结清？',counter:'按约定日期足额发放；离职时一次性结清，不附加审批或交接条件。',
      basis:LAW.L30,confidence:'高',loss:0
    },withholdRe);
  }
  const bonusRe = /(?:年终奖|年终奖金|十三薪|13薪|年度奖金|季度奖|绩效奖金)[^。；\n]{0,26}(?:离职|辞职|解除|不在职)[^。；\n]{0,16}(?:不(?:予|再)?(?:发放|支付|结算)|取消|扣除|清零)|(?:离职|辞职|解除)[^。；\n]{0,20}(?:年终奖|年终奖金|十三薪|13薪|年度奖金)[^。；\n]{0,16}(?:不(?:予|再)?(?:发放|支付|结算)|取消|扣除|清零)/;
  const bonusC = find(bonusRe);
  if(bonusC){
    addPatternItem(ctx,bonusC,{
      base:'R14',ruleId:'R14',verdict:'yellow',ruleName:'离职后年终奖被取消',
      short:'离职不发年终奖',consequence:'合同写明离职后不发放年终奖或直接清零；年终奖是否属于劳动报酬要看约定和发放规则，已经确定或按比例应得的部分，仍可能主张。',
      ask:'HR：年终奖的发放条件、计算周期和离职折算规则是什么？',counter:'写明发放条件与计算方式；离职时按已工作月份折算应得部分。',
      basis:LAW.L30,confidence:'中',loss:0
    },bonusRe);
  }
  const deductBaseRe = /(?:旷工[^。；\n]{0,14}(?:一天|1天)[^。；\n]{0,10}(?:扣|罚)[^。；\n]{0,10}(?:三天|3天|双倍|两倍))|(?:(?:未完成|未达到|未达|完不成)[^。；\n]{0,18}(?:业绩|任务|指标|考核|销售)[^。；\n]{0,18}(?:扣|减|降)[^。；\n]{0,12}(?:基本工资|底薪|工资|薪资))/;
  const deductBaseC = find(deductBaseRe);
  if(deductBaseC){
    addPatternItem(ctx,deductBaseC,{
      base:'R14',ruleId:'R14',verdict:'red',ruleName:'无依据扣减基本工资',
      short:'旷工或业绩不达标扣基本工资',consequence:'旷工一天扣三天、业绩不达标直接扣基本工资，属于把经营风险转给你；可以扣的通常只是对应未出勤工资或依法约定的绩效，不能随意放大。',
      ask:'HR：扣工资的计算依据和制度公示在哪里？',counter:'删除放大扣款；按实际缺勤扣减，绩效规则单独写清并公示。',
      basis:LAW.L30,confidence:'中',loss:0
    },deductBaseRe);
  }
  const highDeductRe = /(?:工资|薪资)[^。；\n]{0,18}(?:扣除|扣减|扣发)[^。；\n]{0,20}(\d{1,3})\s*%[^。；\n]{0,40}(?:最低工资|不补足|低于)/;
  const highDeductC = find(highDeductRe);
  if(highDeductC){
    const m = clauseFull(highDeductC).match(highDeductRe);
    const pct = m ? parseInt(m[1], 10) : null;
    addPatternItem(ctx,highDeductC,{
      base:'R14',ruleId:'R14',verdict:'red',ruleName:'高比例扣工资且低于最低工资',
      short:pct ? `扣当月工资 ${pct}%` : '高比例扣工资',consequence:`合同约定从当月工资扣除${pct ? ` ${pct}%` : '高比例'}，并明确扣后低于当地最低工资也不补足。因劳动者本人原因造成损失可以依法主张赔偿，但每月扣除通常不得超过当月工资的 20%，且扣除后不得低于当地最低工资；现约定明显超过限制。`,
      ask:'HR：实际损失金额和凭证是什么？为什么一次扣这么多且不保最低工资？',counter:'按实际损失举证，每月扣除不超过 20%，并保证扣除后不低于当地最低工资。',
      basis:LAW.F16,confidence:'高',loss:0
    },highDeductRe);
  }
  const fineRe = /(?:甲方|公司|用人单位|单位)[^。；\n]{0,18}(?:罚款|罚金)|(?:罚款|罚金)[^。；\n]{0,12}(?:乙方|员工|劳动者)|(?:迟到|早退|请假|旷工)[^。；\n]{0,12}(?:罚款|罚金|处以)[^。；\n]{0,10}(?:\d+\s*元|工资|薪资)/;
  const fineC = find(fineRe);
  if(fineC){
    addPatternItem(ctx,fineC,{
      base:'R14',ruleId:'R14',verdict:'yellow',ruleName:'用人单位罚款条款',
      short:'公司可对员工罚款',consequence:'公司不是行政机关，通常没有对员工“罚款”的权力；迟到、早退等只能按实际缺勤扣工资或依合法公示的绩效制度处理，直接罚款可能被要求返还。',
      ask:'HR：罚款依据哪份制度？制度有没有公示和签收？',counter:'删除罚款表述，改为按考勤扣减对应工资或明确的绩效规则。',
      basis:LAW.L30,confidence:'中',loss:0
    },fineRe);
  }
  const performanceRe = /(?:绩效|奖金|提成)[^。；\n]{0,20}(?:由|根据)[^。；\n]{0,12}(?:公司|甲方|领导|主管)[^。；\n]{0,10}(?:决定|确定|评定|调整)|(?:绩效|奖金|提成)[^。；\n]{0,16}(?:不固定|不保证|可扣|可减|视[^。；\n]{0,8}情况)/;
  const performanceC = find(performanceRe);
  if(performanceC){
    addPatternItem(ctx,performanceC,{
      base:'R14',ruleId:'R14',verdict:'gray',ruleName:'绩效工资规则不明',
      short:'绩效由公司单方决定',consequence:'绩效、奖金或提成由公司单方决定，合同没有计算规则；实际发放可能远低于预期，离职时也容易就“应发多少”扯皮。',
      ask:'HR：绩效基数、考核指标和发放条件是什么？',counter:'把绩效计算方式、考核周期和发放条件写进合同或附件。',
      basis:LAW.L30,confidence:'中',loss:0
    },performanceRe);
  }
  const wageStructureRe = /(?:工资|薪资|劳动报酬)[^。；\n]{0,24}(?:包含|包括|已含)[^。；\n]{0,22}(?:加班费|加班工资|社保补贴|社会保险补贴|全勤奖|餐补|交通补贴)/;
  const wageStructureC = find(wageStructureRe);
  if(wageStructureC){
    addPatternItem(ctx,wageStructureC,{
      base:'R14',ruleId:'R14',verdict:'yellow',ruleName:'工资结构打包',
      short:'工资被写成包含多项费用',consequence:'把加班费、社保补贴或各类补助都算进一份工资，会让基本工资、加班费基数和社保基数被压低；实际到手不一定少，但维权时计算标准会变低。',
      ask:'HR：基本工资、绩效、补贴和加班费分别是多少？',counter:'拆分工资构成，明确加班费与社保缴费基数。',
      basis:LAW.L30,confidence:'中',loss:0
    },wageStructureRe);
  }
  const lowBaseRe = /(?:基本工资|合同工资|底薪)[^。；\n]{0,18}(?:按|为|不低于)?[^。；\n]{0,10}(?:当地最低工资|最低工资标准)/;
  const lowBaseC = find(lowBaseRe);
  if(lowBaseC){
    addPatternItem(ctx,lowBaseC,{
      base:'R14',ruleId:'R14',verdict:'yellow',ruleName:'工资基数按最低工资写',
      short:'合同工资按最低工资写',consequence:'合同把基本工资写成当地最低工资，其余靠绩效或现金发放；这会把加班费、社保和离职补偿的计算基数压低，实际收入还不稳定。',
      ask:'HR：合同工资与实际工资为什么不一样？社保和加班费按哪个基数？',counter:'按真实工资约定合同工资和社保基数，避免“阴阳工资”。',
      basis:LAW.L30,confidence:'中',loss:0
    },lowBaseRe);
  }
  const unclearRe = /(?:工资|薪资|劳动报酬)[^。；\n]{0,18}(?:面议|另行商定|按公司规定|按公司薪酬制度|根据考核确定|不固定|以实际发放为准)/;
  const unclearC = find(unclearRe);
  if(unclearC){
    addPatternItem(ctx,unclearC,{
      base:'R14',ruleId:'R14',verdict:'gray',ruleName:'工资标准未写清',
      short:'工资面议或按公司制度',consequence:'合同不写明确工资，只说面议、按公司制度或按考核确定；入职后实际发多少、怎么涨都缺少书面依据。',
      ask:'HR：我的月工资具体是多少？由哪些部分组成？',counter:'把固定工资、绩效和发薪日写进劳动合同。',
      basis:LAW.L17,confidence:'中',loss:0
    },unclearRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R14')){
    addPending(ctx,['工资构成（基本工资/绩效/补贴）、发薪日与扣款制度的具体依据']);
  }
}

/* R15 社保与公积金 */
function runR15(ctx){
  const waiverRe = /(?:乙方|劳动者|员工|本人)[^。；\n]{0,12}(?:签字|承诺|自愿|同意)[^。；\n]{0,12}(?:不参加|不缴纳|不参保|放弃|无需|无须)[^。；\n]{0,10}(?:社会保险|社保|五险)|(?:甲方|用人单位|单位|公司)[^。；\n]{0,10}(?:无需|无须|不需|不用|不)[^。；\n]{0,8}(?:为乙方|为员工|为劳动者|给乙方)?[^。；\n]{0,8}(?:缴纳|办理|参加)[^。；\n]{0,8}(?:社会保险|社保|五险)|(?:无需|无须|不需|不用)[^。；\n]{0,10}(?:缴纳|办理)[^。；\n]{0,8}(?:社会保险|社保|五险)/;
  const waiverC = ctx.clauses.find(cl => waiverRe.test(clauseFull(cl)));
  if(waiverC){
    const q = qAny(waiverC,waiverRe) || qAny(waiverC,/(?:社会保险|社保|五险|自愿|无需|无须|不参加)/);
    addItem(ctx,{
      base:'R15',ruleId:'R15',verdict:'red',ruleName:'约定或承诺不缴社保（无效）',
      short:'自愿不参保或单位免缴',clauseIndex:waiverC.index,location:clauseLabel(waiverC,waiverC.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'这句直接写成劳动者自愿不参保或单位无需缴纳。这样的约定或承诺无效，单位仍有参保义务；但签字后你可能先失去医保、工伤和养老记录，之后要补缴还得投诉或申请仲裁确认。',
      ask:'HR：社保从哪个月开始缴？按什么基数缴？',counter:'删除“自愿不参保”“单位无需缴纳”的写法，入职当月依法参保，个人部分由单位代扣代缴。',
      basis:LAW.JI2_19,confidence:'高',loss:0
    });
  }
  const r7Clauses = new Set(ctx.items.filter(it => it.ruleId === 'R7').map(it => it.clauseIndex));
  const find = re => ctx.clauses.find(cl => !r7Clauses.has(cl.index) && re.test(clauseFull(cl)));
  const delayRe = /(?:试用期(?:间|内)?|转正前|转正后|试用期满后|入职满(?:一年|1年)(?:后)?|工作满(?:一年|1年)(?:后)?)[^。；\n]{0,30}(?:不缴|不缴纳|不办理|不参保|无需缴纳|才(?:为|给)?[^。；\n]{0,8}(?:缴纳|办理|参保)|(?:后|再|开始)[^。；\n]{0,10}(?:为|给)?[^。；\n]{0,8}(?:缴纳|办理|参保))/;
  const delayC = find(delayRe);
  if(delayC){
    addPatternItem(ctx,delayC,{
      base:'R15',ruleId:'R15',verdict:'red',ruleName:'社保未从用工之日起缴纳',
      short:'试用期或满一年后才缴社保',consequence:'社保应从用工之日起 30 日内办理；试用期不缴、转正后才缴或满一年才缴，都会造成医保、工伤和养老断档，补缴还要另走投诉。',
      ask:'HR：社保从哪个月开始缴？按什么基数？',counter:'删除延迟参保条款，入职当月依法办理社保登记。',
      basis:LAW.L58,confidence:'高',loss:0
    },delayRe);
  }
  const subsidyRe = /(?:社保|社会保险|五险)[^。；\n]{0,26}(?:补贴|补助|折现|现金|以工资|随工资|自行缴纳|自己缴纳)|(?:不缴|不办理|不缴纳)[^。；\n]{0,18}(?:社保|社会保险)[^。；\n]{0,22}(?:补贴|补助|折现|补偿)/;
  const subsidyC = find(subsidyRe);
  if(subsidyC){
    const selfPayOnly = !/(?:补贴|补助|折现|现金|以工资|随工资)/.test(clauseFull(subsidyC));
    addPatternItem(ctx,subsidyC,{
      base:'R15',ruleId:'R15',verdict:'red',
      ruleName:selfPayOnly ? '社保由员工自行承担' : '以补贴代替社保',
      short:selfPayOnly ? '社保全部自己交' : '社保折现或发补贴',
      consequence:selfPayOnly
        ? '合同把社保写成由你个人缴纳或自行承担；单位参保义务不因这种约定转移，但你会先失去医保、工伤和养老记录，补缴还要另走投诉。'
        : '把社保折成现金补贴，表面多拿一点，实际没有医保、工伤和养老记录；这种约定不能免除单位参保义务，但补缴时你也要配合。',
      ask:'HR：社保是否实际参保？补贴之外还会不会缴？',counter:'删除折现或自缴条款，依法参保并按实际工资申报基数。',
      basis:LAW.L60,confidence:'高',loss:0
    },subsidyRe);
  }
  const baseRe = /(?:按|以)[^。；\n]{0,18}(?:最低缴费基数|最低基数|最低标准|当地最低工资)[^。；\n]{0,18}(?:缴纳|申报|作为基数|为基数)|(?:未按|不按)[^。；\n]{0,18}(?:实际工资|工资总额|应发工资)[^。；\n]{0,18}(?:缴纳|申报)/;
  const baseC = find(baseRe);
  if(baseC){
    addPatternItem(ctx,baseC,{
      base:'R15',ruleId:'R15',verdict:'red',ruleName:'社保按最低基数缴纳',
      short:'社保基数被压低',consequence:'社保不按实际工资申报，而统一按最低基数缴；每月看似少扣一点，医保个人账户、工伤待遇和养老金都会缩水。',
      ask:'HR：社保缴费基数按多少申报？是否包含绩效和补贴？',counter:'按实际工资总额申报社保基数，并在工资条中列明。',
      basis:LAW.L60,confidence:'高',loss:0
    },baseRe);
  }
  const employeeAllRe = /(?:社保|社会保险|五险)[^。；\n]{0,26}(?:全部|全额)[^。；\n]{0,12}(?:由乙方|由员工|由个人)[^。；\n]{0,10}(?:承担|缴纳)|(?:乙方|员工|个人)[^。；\n]{0,18}(?:自行|全额|全部)[^。；\n]{0,10}(?:承担|缴纳)[^。；\n]{0,14}(?:社保|社会保险|五险)/;
  const employeeAllC = find(employeeAllRe);
  if(employeeAllC){
    addPatternItem(ctx,employeeAllC,{
      base:'R15',ruleId:'R15',verdict:'red',ruleName:'社保费用全部由员工承担',
      short:'社保全部自己交',consequence:'单位应承担的部分也让你全额承担，实际工资会被多扣；这不因“双方同意”而合法，但每月扣款会先发生。',
      ask:'HR：单位应缴部分为什么从我的工资里扣？',counter:'单位承担法定部分，个人部分依法代扣代缴。',
      basis:LAW.L60,confidence:'高',loss:0
    },employeeAllRe);
  }
  const housingRe = /(?:公积金|住房公积金)[^。；\n]{0,26}(?:不缴|不办理|不缴纳|个人(?:自行)?承担|由乙方承担|以补贴代替|包含在工资)/;
  const housingC = find(housingRe);
  if(housingC){
    addPatternItem(ctx,housingC,{
      base:'R15',ruleId:'R15',verdict:'yellow',ruleName:'公积金未缴或由个人承担',
      short:'公积金不缴或自己承担',consequence:'公积金不缴、让个人全额承担或用补贴代替，会影响你后续租房、购房贷款额度；公积金属于另一套投诉渠道，处理周期可能较长。',
      ask:'HR：公积金从什么时候开始缴？缴存比例是多少？',counter:'按工资基数和当地比例缴存，个人部分依法代扣。',
      basis:LAW.HF20,confidence:'中',loss:0
    },housingRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R15')){
    addPending(ctx,['社保参保地、缴费基数和公积金缴存比例（工资条与参保记录要能对上）']);
  }
}

/* R16 休假与特殊保护 */
function runR16(ctx){
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const annualRe = /(?:年休假|年假)[^。；\n]{0,32}(?:不享受|不再享受|自动放弃|放弃|不休|作废|清零|包含在(?:春节|法定节假日)|统一安排[^。；\n]{0,20}(?:不(?:再)?支付|无补偿|不补休))/;
  const annualC = find(annualRe);
  if(annualC){
    addPatternItem(ctx,annualC,{
      base:'R16',ruleId:'R16',verdict:'red',ruleName:'年休假被作废或排除',
      short:'年假被作废',consequence:'年休假是法定权利，不能简单写成自动放弃、年底清零或包含在春节假期里；未休年假应依法安排补休或支付 300% 工资报酬。',
      ask:'HR：年假几天？没休完怎么处理？',counter:'按累计工作年限写明年假天数；未休部分安排补休或依法支付。',
      basis:LAW.ANNUAL5,confidence:'高',loss:0
    },annualRe);
  }
  const sickRe = /病假[^。；\n]{0,26}(?:无工资|不支付|扣发(?:全部)?工资|按事假|不计薪|最低工资以下)/;
  const sickC = find(sickRe);
  if(sickC){
    addPatternItem(ctx,sickC,{
      base:'R16',ruleId:'R16',verdict:'yellow',ruleName:'病假工资被取消',
      short:'病假不发工资',consequence:'病假期间完全不发工资或按最低工资以下处理，可能低于当地病假工资标准；具体比例看地方规定，但“病假无薪”通常站不住。',
      ask:'HR：病假工资按什么标准发？需要哪些证明？',counter:'按当地病假工资规定执行，写明计算方式和所需材料。',
      basis:LAW.L26,confidence:'中',loss:0
    },sickRe);
  }
  const maternityRe = /(?:不得|禁止|不允许|不能|承诺|保证)[^。；\n]{0,10}(?:怀孕|生育|结婚)|(?:怀孕|生育|结婚)[^。；\n]{0,26}(?:即|就|视为|按)[^。；\n]{0,12}(?:自动离职|辞退|解除|不续签)|(?:怀孕|生育|结婚)[^。；\n]{0,26}(?:降薪|调岗|辞退|解除|不续签)/;
  const protectiveRe = /(?:不得|禁止)[^。；\n]{0,8}(?:因|因为)[^。；\n]{0,6}(?:怀孕|生育|结婚)|(?:不得|禁止)[^。；\n]{0,14}(?:降低|辞退|解除|降薪|调岗|不续签)/;
  let maternityC = null, maternityQ = null;
  for(const cl of ctx.clauses){
    if(!maternityRe.test(clauseFull(cl))) continue;
    const q = qFilter(cl, maternityRe, protectiveRe);
    if(q){ maternityC = cl; maternityQ = q; break; }
  }
  if(maternityC){
    const q = maternityQ;
    if(q){
      addItem(ctx,{
        base:'R16',ruleId:'R16',verdict:'red',ruleName:'限制婚育（无效）',
        short:'限制怀孕/生育/结婚',clauseIndex:maternityC.index,location:clauseLabel(maternityC,maternityC.index),
        quote:q.quote,range:q,consequence:'合同要求你在一定期限内不得怀孕、生育或结婚，或把怀孕视为离职、降薪、辞退的理由；这类条款违反女职工特殊保护规定，通常无效，但现实中会影响你的工作安排。',
        ask:'HR：这条限制的依据是什么？怀孕后岗位和待遇怎么安排？',counter:'删除婚育限制；按女职工劳动保护规定安排产假、岗位和工资。',
        basis:LAW.LADY5,confidence:'高',loss:0
      });
    }
  }
  const leavePayRe = /(?:婚假|丧假|产假|陪产假|护理假|育儿假)[^。；\n]{0,26}(?:无薪|不支付|不发工资|按事假|不计薪|不予批准)/;
  const leavePayC = find(leavePayRe);
  if(leavePayC){
    addPatternItem(ctx,leavePayC,{
      base:'R16',ruleId:'R16',verdict:'yellow',ruleName:'法定假期待遇被取消',
      short:'婚丧产假不付工资',consequence:'婚假、丧假、产假、陪产假等法定假期的工资待遇被取消，可能违反当地规定；产假期间还可能涉及生育津贴。',
      ask:'HR：这些假期按什么标准发工资？',counter:'按当地法定假期和生育保险规定执行，写明工资或津贴标准。',
      basis:LAW.LADY5,confidence:'中',loss:0
    },leavePayRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R16')){
    addPending(ctx,['年假天数、病假工资标准、婚育假期与当地规定的对应关系']);
  }
}

/* R17 保密与成果归属 */
function runR17(ctx){
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const allWorksRe = /(?:所有|一切|全部|无论何时|任何)[^。；\n]{0,20}(?:成果|作品|发明|创作|知识产权)[^。；\n]{0,24}(?:归|属于|归属)[^。；\n]{0,10}(?:甲方|公司)/;
  const personalWorkRe = /(?:非工作时间|业余时间|个人时间|工作之外|与工作无关)[^。；\n]{0,30}(?:成果|作品|发明|创作|代码|设计)[^。；\n]{0,26}(?:归|属于)[^。；\n]{0,10}(?:甲方|公司)/;
  const worksC = find(allWorksRe) || find(personalWorkRe);
  if(worksC){
    const q = qFilter(worksC, /(所有|一切|全部|成果|作品|发明|创作|知识产权|甲方|公司)/, null) || qAny(worksC, /(成果|作品|知识产权)/);
    addItem(ctx,{
      base:'R17',ruleId:'R17',verdict:'gray',ruleName:'成果归属范围过宽',
      short:'个人成果也可能归公司',clauseIndex:worksC.index,location:clauseLabel(worksC,worksC.index),
      quote:q ? q.quote : '',range:q||null,consequence:'合同把“所有成果”或业余时间创作也归公司；职务成果归单位通常合理，但你的课程作业、开源项目、个人作品如果没有排除，离职时可能被主张归属。',
      ask:'HR：职务成果和个人作品的边界怎么划？',counter:'明确仅限本职工作、使用公司资源完成的成果归公司，列出个人作品和开源项目例外。',
      basis:LAW.L23,confidence:'中',loss:0
    });
  }
  const confidentialityRe = /(?:保密期限|保密义务)[^。；\n]{0,24}(?:永久|无限期|长期|离职后[^。；\n]{0,10}(?:仍然|继续))/;
  const confidentialityC = find(confidentialityRe);
  if(confidentialityC){
    addPatternItem(ctx,confidentialityC,{
      base:'R17',ruleId:'R17',verdict:'yellow',ruleName:'保密期限过长',
      short:'保密义务永久或无限期',consequence:'保密义务写成永久、无限期或离职后继续；商业秘密在仍属秘密时可以持续保护，但范围过宽会限制你以后使用通用技能。',
      ask:'HR：哪些信息属于商业秘密？保密期限具体多久？',counter:'列明保密信息范围；对已公开信息、通用技能和个人经验作例外。',
      basis:LAW.L23,confidence:'中',loss:0
    },confidentialityRe);
  }
  const penaltyRe = /(?:违反[^。；\n]{0,12}保密|泄露[^。；\n]{0,12}秘密|泄密)[^。；\n]{0,28}(?:赔偿|违约金|罚款)[^。；\n]{0,18}(?:全部|一切|无限|不低于|双倍|三倍)?/;
  const penaltyC = find(penaltyRe);
  if(penaltyC){
    addPatternItem(ctx,penaltyC,{
      base:'R17',ruleId:'R17',verdict:'yellow',ruleName:'保密违约赔偿无上限',
      short:'泄密赔偿无上限',consequence:'保密违约写成赔偿全部损失、无上限或高倍罚款；真发生争议时，公司需要证明实际损失，但条款会先给你很大压力。',
      ask:'HR：保密违约的赔偿上限和计算方式是什么？',counter:'把赔偿限定为可证明的实际损失，删除无上限和高倍惩罚。',
      basis:LAW.C497,confidence:'中',loss:0
    },penaltyRe);
  }
  const moonlightRe = /(?:不得|禁止|未经[^。；\n]{0,8}(?:同意|批准))[^。；\n]{0,14}(?:兼职|副业|对外投资|在其他单位任职|提供(?:服务|咨询))|(?:兼职|副业)[^。；\n]{0,18}(?:一经发现|视为严重违纪|解除|辞退)/;
  const moonlightC = find(moonlightRe);
  if(moonlightC){
    addPatternItem(ctx,moonlightC,{
      base:'R17',ruleId:'R17',verdict:'yellow',ruleName:'兼职或副业限制过宽',
      short:'禁止一切兼职副业',consequence:'合同禁止一切兼职、副业或对外服务；如果范围过宽，可能影响你正常的课程项目、开源贡献和过渡收入，严重违纪还可能被解除。',
      ask:'HR：兼职限制是否限于与公司有竞争关系的业务？',counter:'把限制限定为竞争性兼职和利益冲突，不影响个人学习和开源项目。',
      basis:LAW.L26,confidence:'中',loss:0
    },moonlightRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R17')){
    addPending(ctx,['保密信息范围、成果归属边界、个人作品/开源项目是否被排除']);
  }
}

/* R18 离职手续与结算 */
function runR18(ctx){
  const r4Clauses = new Set(ctx.items.filter(it => it.ruleId === 'R4').map(it => it.clauseIndex));
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const approvalRe = /(?:辞职|离职|解除(?:劳动)?合同|解除劳动关系)[^。；\n]{0,20}(?:须|需|必须|应|应当)[^。；\n]{0,14}(?:经|由)[^。；\n]{0,14}(?:甲方|公司|领导|主管|人事)[^。；\n]{0,12}(?:批准|同意|审批)|(?:未经|未获)[^。；\n]{0,14}(?:批准|同意)[^。；\n]{0,14}(?:不得|不能|不予)[^。；\n]{0,10}(?:离职|辞职|解除)/;
  const approvalC = find(approvalRe);
  if(approvalC){
    addPatternItem(ctx,approvalC,{
      base:'R18',ruleId:'R18',verdict:'red',ruleName:'离职需要公司批准',
      short:'辞职要公司批准',consequence:'劳动者提前 30 日书面通知即可解除，不需要公司批准；把批准作为离职前提，会把你困在“公司不同意就走不了”的状态。',
      ask:'HR：我提交书面通知后，公司不批准怎么办？',counter:'删除审批前置；写明收到书面通知后按期办理交接和结算。',
      basis:LAW.L37,confidence:'高',loss:0
    },approvalRe);
  }
  const withholdRe = /(?:未(?:提前|办理|完成|按规定)[^。；\n]{0,22}(?:通知|交接|手续|离职)[^。；\n]{0,22}(?:工资|薪资|报酬)[^。；\n]{0,14}(?:不(?:予|再)?(?:发|结算|支付)|暂缓|延后|扣发|扣除)|(?:离职|辞职)[^。；\n]{0,18}(?:未[^。；\n]{0,12}(?:交接|手续))[^。；\n]{0,18}(?:不(?:予)?(?:发|结算|支付)|扣(?:发|除))|未(?:办理|完成|按规定)[^。；\n]{0,12}(?:交接|手续)[^。；\n]{0,26}(?:不(?:予|再)?(?:发|结算|支付)|扣(?:发|除))[^。；\n]{0,8}(?:工资|薪资|报酬)|(?:未|没有)[^。；\n]{0,10}(?:办完|完成|办理)[^。；\n]{0,8}(?:交接|离职手续)[^。；\n]{0,24}(?:暂扣|扣留|扣发|不(?:予|再)?(?:发|结算|支付))[^。；\n]{0,12}(?:工资|薪资|报酬)|(?:暂扣|扣留)[^。；\n]{0,12}(?:全部|所有)?[^。；\n]{0,8}(?:工资|薪资)[^。；\n]{0,16}(?:下一年度|明年|年底))/;
  const withholdC = ctx.clauses.find(cl => !r4Clauses.has(cl.index) && withholdRe.test(clauseFull(cl)));
  if(withholdC){
    addPatternItem(ctx,withholdC,{
      base:'R18',ruleId:'R18',verdict:'red',ruleName:'未交接或未通知就扣工资',
      short:'不交接就扣工资',consequence:'公司以未提前通知、未办交接为由扣工资或拒绝结算；工资和交接是两件事，交接争议可以另算，不能直接扣住已经产生的劳动报酬。',
      ask:'HR：交接清单是什么？工资结算和交接能不能分开处理？',counter:'离职时先结算工资；交接按清单办理，损失赔偿另行举证。',
      basis:LAW.L50,confidence:'高',loss:0
    },withholdRe);
  }
  const certificateRe = /(?:离职证明|解除(?:劳动)?合同证明|终止(?:劳动)?合同证明|离职手续)[^。；\n]{0,26}(?:不(?:予|再)?(?:出具|办理|提供)|拒绝|扣押|与[^。；\n]{0,12}(?:工资|补偿|赔偿|交接)[^。；\n]{0,10}挂钩)|(?:档案|社会保险关系|社保关系)[^。；\n]{0,20}(?:扣押|不(?:予)?转出|不办理|拖延)/;
  const certificateC = find(certificateRe);
  if(certificateC){
    addPatternItem(ctx,certificateC,{
      base:'R18',ruleId:'R18',verdict:'red',ruleName:'离职证明或档案被扣押',
      short:'离职证明/档案被卡',consequence:'公司拒开离职证明、扣押档案或社保关系，会影响下家入职、社保接续和考公政审；这些义务不能拿来和工资、赔偿或交接绑定。',
      ask:'HR：离职证明什么时候开？档案和社保什么时候转？',counter:'解除时出具证明，15 日内办理档案和社保转移；交接争议另行处理。',
      basis:LAW.L50,confidence:'高',loss:0
    },certificateRe);
  }
  const autoExitRe = /(?:旷工|连续[^。；\n]{0,10}(?:日|天)|未(?:按时)?(?:到岗|上班))[^。；\n]{0,24}(?:视为|按|作)[^。；\n]{0,12}(?:自动离职|自动解除|放弃[^。；\n]{0,8}(?:工资|权利)|严重违纪)/;
  const autoExitC = find(autoExitRe);
  if(autoExitC){
    addPatternItem(ctx,autoExitC,{
      base:'R18',ruleId:'R18',verdict:'yellow',ruleName:'缺勤直接视为自动离职',
      short:'旷工视为自动离职',consequence:'把缺勤直接写成“自动离职”，公司可能据此不办手续、不结算工资；是否构成严重违纪要看制度是否合法公示、缺勤原因和程序。',
      ask:'HR：旷工多久算严重违纪？制度有没有公示？',counter:'改为按规章制度处理并书面通知；离职手续和工资照常结算。',
      basis:LAW.L37,confidence:'中',loss:0
    },autoExitRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R18')){
    addPending(ctx,['离职证明出具时间、工资结算日、档案和社保转移流程']);
  }
}

/* R19 合同签订与文本 */
function runR19(ctx){
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const laterContractRe = /(?:试用期(?:满|结束|后)|转正后|入职满[^。；\n]{0,12})[^。；\n]{0,18}(?:再|才|签订|订立)[^。；\n]{0,10}(?:劳动)?合同|(?:先|暂时)[^。；\n]{0,10}(?:不签|不签订)[^。；\n]{0,10}(?:劳动)?合同|(?:未|不)[^。；\n]{0,8}(?:签订|订立)[^。；\n]{0,10}书面[^。；\n]{0,8}(?:劳动)?合同|试用期[^。；\n]{0,10}(?:暂不|不|无需)[^。；\n]{0,10}(?:签|签订|订立)[^。；\n]{0,6}(?:劳动)?合同/;
  const laterContractC = find(laterContractRe);
  if(laterContractC){
    addPatternItem(ctx,laterContractC,{
      base:'R19',ruleId:'R19',verdict:'red',ruleName:'试用期后再签书面合同',
      short:'先试用后签合同',consequence:'建立劳动关系就应在一个月内订立书面劳动合同；先试用、转正后再签，会让你在一段时间里没有合同，追二倍工资和证明劳动关系都更麻烦。',
      ask:'HR：入职当天能不能签书面合同？合同期限从哪天算？',counter:'入职一个月内签订书面合同，试用期写进合同期限。',
      basis:LAW.L10,confidence:'高',loss:0
    },laterContractRe);
  }
  const probationOnlyRe = /(?:仅|只)[^。；\n]{0,10}(?:约定|签订)[^。；\n]{0,10}试用期|试用期[^。；\n]{0,18}(?:即|视为)[^。；\n]{0,10}(?:劳动)?合同|(?:劳动)?合同[^。；\n]{0,18}(?:仅|只)[^。；\n]{0,10}(?:约定|写)[^。；\n]{0,8}试用期/;
  const probationOnlyC = find(probationOnlyRe);
  if(probationOnlyC){
    addPatternItem(ctx,probationOnlyC,{
      base:'R19',ruleId:'R19',verdict:'red',ruleName:'只签试用期不签劳动合同',
      short:'只约定试用期',consequence:'劳动合同仅约定试用期的，试用期不成立，该期限视为劳动合同期限；公司不能靠“只签试用期”随时让你走。',
      ask:'HR：劳动合同期限和试用期分别怎么约定？',counter:'签订完整劳动合同，把试用期包含在合同期限内。',
      basis:LAW.L19,confidence:'高',loss:0
    },probationOnlyRe);
  }
  const copyRe = /(?:劳动合同|合同|协议)(?:文本|原件)?[^。；\n]{0,22}(?:由|交|留)[^。；\n]{0,12}(?:甲方|公司|单位)[^。；\n]{0,12}(?:保管|保存|留存)|(?:只|仅)[^。；\n]{0,10}(?:签|签署)[^。；\n]{0,10}(?:一份|1份)|(?:不(?:交|给|提供)|拒绝提供)[^。；\n]{0,14}(?:合同|协议)(?:文本|原件)/;
  const copyC = find(copyRe);
  if(copyC){
    addPatternItem(ctx,copyC,{
      base:'R19',ruleId:'R19',verdict:'yellow',ruleName:'合同文本不给劳动者',
      short:'合同只由公司保管',consequence:'劳动合同文本应由双方各执一份；只签一份、公司保管或拒绝给你，之后修改条款、补填空白时你很难举证。',
      ask:'HR：签完后能不能给我一份盖章原件？',counter:'双方各执一份，签字盖章后当场交付。',
      basis:LAW.L16,confidence:'高',loss:0
    },copyRe);
  }
  const blankRe = /(?:空白|留白)[^。；\n]{0,12}(?:合同|协议)|(?:先|先行)[^。；\n]{0,12}(?:签(?:字|署)|盖章)[^。；\n]{0,14}(?:后|再)[^。；\n]{0,10}(?:填写|补充|确定)/;
  const blankC = find(blankRe);
  if(blankC){
    addPatternItem(ctx,blankC,{
      base:'R19',ruleId:'R19',verdict:'yellow',ruleName:'空白合同或先签后填',
      short:'空白合同/先签后填',consequence:'先签空白合同、后补内容，工资、岗位、期限都可能被改写；你签的字在形式上会对最终文本生效，举证非常被动。',
      ask:'HR：合同内容能不能全部填写完再签字？',counter:'所有空白处填写或划掉后再签字，双方各留原件。',
      basis:LAW.L16,confidence:'中',loss:0
    },blankRe);
  }
  const disguisedRe = /(?:签订|签署|按)[^。；\n]{0,12}(?:劳务协议|合作协议|承揽协议|兼职协议|外包协议)[^。；\n]{0,24}(?:不(?:构成|属于)|代替|规避)[^。；\n]{0,10}(?:劳动关系|劳动合同)|(?:以|按)[^。；\n]{0,10}(?:劳务|合作|承揽)[^。；\n]{0,10}(?:名义|形式)[^。；\n]{0,10}(?:用工|管理)/;
  const disguisedC = find(disguisedRe);
  if(disguisedC){
    addPatternItem(ctx,disguisedC,{
      base:'R19',ruleId:'R19',verdict:'yellow',ruleName:'以劳务或合作名义用工',
      short:'劳务/合作协议代替劳动合同',consequence:'用劳务、合作或承揽协议代替劳动合同，可能规避社保、加班费和解除保护；如果实际按员工管理，关系性质仍可能被重新认定。',
      ask:'HR：为什么签劳务/合作协议而不是劳动合同？日常怎么管理？',counter:'按实际关系签劳动合同；如确属劳务，写清成果交付而非考勤管理。',
      basis:LAW.L10,confidence:'中',loss:0
    },disguisedRe);
  }
  const noLaborRe = /(?:不构成|不属于|并非)[^。；\n]{0,10}劳动关系/;
  const noLaborC = find(noLaborRe);
  if(noLaborC){
    addPatternItem(ctx,noLaborC,{
      base:'R19',ruleId:'R19',verdict:'gray',ruleName:'劳动关系被合同否认',
      short:'合同声明不构成劳动关系',consequence:'合同声明不构成劳动关系，但关系性质按实际用工判断；固定岗位、考勤、绩效和持续工资都可能支持劳动关系认定。',
      ask:'HR：日常是否按员工考勤、考核和发工资？',counter:'保留招聘、考勤、工资和管理记录，再判断是否需要主张劳动关系。',
      basis:LAW.L10,confidence:'中',loss:0
    },noLaborRe);
  }
  const cCopy = ctx.clauses.find(cl => /(一式两份|一式二份|各执一份|双方各执)/.test(clauseFull(cl)));
  addGreen(ctx,cCopy,'合同文本',/(一式两份|一式二份|各执一份|双方各执)/,'合同一式两份、双方各执一份，属常规安排。');
  if(ctx.items.some(it => it.ruleId === 'R19')){
    addPending(ctx,['是否已拿到盖章的书面合同原件，空白处是否全部填写或划掉']);
  }
}

/* R20 就业承诺与培训服务 */
function runR20(ctx){
  const find = re => ctx.clauses.find(cl => re.test(clauseFull(cl)));
  const guaranteeRe = /(?:(?:保证|承诺|包|确保)[^。；\n]{0,18}(?:就业|入职|录用|转正|薪资|月薪|底薪|高薪))|(?:(?:推荐|安排|提供)[^。；\n]{0,12}就业[^。；\n]{0,32}(?:不保证|不承诺|不负责|不担保))/;
  const guaranteeC = find(guaranteeRe);
  if(guaranteeC){
    addPatternItem(ctx,guaranteeC,{
      base:'R20',ruleId:'R20',verdict:'yellow',ruleName:'就业或薪资承诺',
      short:'包就业/保底薪资承诺',consequence:'“包就业”“保底薪资”如果只停留在口头或模糊宣传，很难变成可执行的合同义务；合同同时又写“不保证录用”，承诺基本落空。',
      ask:'机构：推荐就业的次数、岗位范围和保底薪资条件写在哪一条？',counter:'把就业服务标准、推荐次数和未达成时的退费写进合同。',
      basis:LAW.AD24,confidence:'中',loss:0
    },guaranteeRe);
  }
  const noJobStillPayRe = /(?:无论|不管)[^。；\n]{0,14}(?:是否|有无)[^。；\n]{0,12}(?:就业|录用|入职)[^。；\n]{0,24}(?:均|仍|都)[^。；\n]{0,12}(?:还款|偿还|支付|履行)/;
  const noJobStillPayC = find(noJobStillPayRe);
  if(noJobStillPayC){
    addPatternItem(ctx,noJobStillPayC,{
      base:'R20',ruleId:'R20',verdict:'yellow',ruleName:'未就业仍需还款',
      short:'没就业也要还贷款',consequence:'培训结束没找到工作，分期仍要照还；就业风险完全落在你身上，机构只要完成“推荐”就可能不再负责。',
      ask:'机构：没就业时能否暂停还款、延长分期或退费？',counter:'把未就业、未推荐面试等情形下的停还款或退费安排写进合同。',
      basis:LAW.C497,confidence:'高',loss:0
    },noJobStillPayRe);
  }
  const refundPromiseRe = /(?:保过|包过|不过(?:全额)?退费|未就业(?:全额)?退费|就业不成功[^。；\n]{0,12}(?:退|返还))/;
  const refundPromiseC = find(refundPromiseRe);
  if(refundPromiseC){
    addPatternItem(ctx,refundPromiseC,{
      base:'R20',ruleId:'R20',verdict:'gray',ruleName:'保过或退费承诺',
      short:'保过/未就业退费',consequence:'“保过”“不过退费”“未就业退费”听起来像保障，实际常附带出勤、考试、面试次数等条件；触发条件不写清，退费会很难。',
      ask:'机构：退费触发条件、办理时限和扣除费用是什么？',counter:'把退费条件、比例、时限和流程写成可核对的条款。',
      basis:LAW.C20,confidence:'中',loss:0
    },refundPromiseRe);
  }
  if(ctx.items.some(it => it.ruleId === 'R20')){
    addPending(ctx,['就业服务的岗位范围、推荐次数、未就业时的退费或停还款安排']);
  }
}

/* R21 必备条款缺失 */
function hasRuleItem(ctx, clauseIndex, ruleId){
  return clauseIndex != null && ctx.items.some(it => it.clauseIndex === clauseIndex && it.ruleId === ruleId);
}
function runR21(ctx){
  const checks = [
    {label:'用人单位名称、住所和法定代表人', re:/(甲方[（(]用人单位[）)]|用人单位[^。；\n]{0,10}(名称|住所|法定代表人)|甲方[^。；\n]{0,10}(名称|住所|法定代表人))/},
    {label:'劳动者姓名、住址和身份证件号码', re:/(乙方[（(]劳动者[）)]|劳动者[^。；\n]{0,10}(姓名|身份证)|乙方[^。；\n]{0,10}(姓名|身份证))/},
    {label:'合同期限', re:/(合同期限|劳动合同期限|期限自)/},
    {label:'工作内容与工作地点', re:/(工作内容|工作岗位|工作地点|岗位为)/},
    {label:'工作时间与休息休假', re:/(工作时间|休息休假|工时制度|每周工作)/},
    {label:'劳动报酬', re:/(劳动报酬|工资|薪资|月薪)/},
    {label:'社会保险', re:/(社会保险|社保|五险)/},
    {label:'劳动保护、劳动条件和职业危害防护', re:/(劳动保护|劳动条件|职业危害|安全生产)/}
  ];
  const scope = ctx.scope || 'unknown';
  if(scope !== 'full'){
    addItem(ctx,{
      base:'R21',ruleId:'R21',verdict:'gray',ruleName:'审阅范围未确认',
      short:'未做全文缺项检查',clauseIndex:null,location:'全文',
      quote:'',range:null,
      consequence:'当前输入可能只是条款摘录，不能据此判断整份合同缺哪些必备条款。这里只核对已出现的条款；全文缺项检查需要确认已导入完整合同后再做。',
      ask:'这份文本是完整合同，还是只摘录了部分条款？能否提供全文或未截断的 PDF？',
      counter:'确认全文范围后再做必备条款检查；摘录阶段只核对具体条款内容。',
      basis:LAW.L17,confidence:'中',loss:0
    });
    return;
  }
  const filled = checks.map(x => {
    const clause = ctx.clauses.find(cl => x.re.test(clauseFull(cl)) && !clauseHasBlankValue(clauseFull(cl)));
    const blankClause = ctx.clauses.find(cl => x.re.test(clauseFull(cl)) && clauseHasBlankValue(clauseFull(cl)));
    return {...x, present:!!clause, blank:!clause && !!blankClause};
  });
  const missing = filled.filter(x => !x.present).map(x => x.label);
  const blankCount = ctx.clauses.filter(cl => clauseHasBlankValue(clauseFull(cl))).length;
  const blankTemplate = blankCount >= 3 && filled.filter(x => x.present).length <= 1;
  if(!missing.length){
    addItem(ctx,{
      base:'R21',ruleId:'R21',verdict:'green',ruleName:'必备条款齐全',short:'八项条款均有填写',
      clauseIndex:null,location:'全文',quote:'',range:null,
      consequence:'在已提供的全文里，八项法定必备条款位置都有非空内容；这只说明文本可见，不保证每项约定本身合法，也不替代逐条核对。',basis:LAW.L17,ask:'',counter:'',confidence:'中',loss:0
    });
    return;
  }
  const core = ['合同期限','工作内容与工作地点','劳动报酬','社会保险'];
  const missingCore = missing.filter(m => core.includes(m));
  const c = ctx.clauses.find(cl => /(其他按公司规定|按公司制度|另行约定|具体以公司)/.test(clauseFull(cl)));
  const q = c ? qAny(c, /(其他按公司规定|按公司制度|另行约定|具体以公司)/) : null;
  if(blankTemplate){
    addItem(ctx,{
      base:'R21',ruleId:'R21',verdict:'gray',ruleName:'空白模板未填写',
      short:'合同模板有空白项',clauseIndex:null,location:'全文',
      quote:'',range:null,
      consequence:`文本里有 ${blankCount} 处条款仍是空白或占位符，不能据此认定“必备条款齐全”。当前无法核对：${missing.join('、')}。空白处可能在签署时补填，也可能一直空着，风险取决于实际交付的版本。`,
      ask:'HR：这些空白项在签署前会填什么？能否提供已填写并盖章的版本？',
      counter:'签署前补齐八项必备条款；不适用或留空的项划掉并双方确认，不要签空白合同。',
      basis:LAW.L17,confidence:'中',loss:0
    });
    return;
  }
  const verdict = missingCore.length >= 3 ? 'red' : 'gray';
  addItem(ctx,{
    base:'R21',ruleId:'R21',verdict,
    ruleName:verdict==='red'?'核心必备条款缺失':'部分必备条款缺失',
    short:missingCore.length ? `缺 ${missingCore.length} 项核心条款` : `缺 ${missing.length} 项条款`,
    clauseIndex:c ? c.index : null,location:c ? clauseLabel(c,c.index) : '全文',
    quote:q ? q.quote : '',range:q,
    consequence:`已确认全文范围内，合同没有可核对的内容：${missing.join('、')}。这不等同于已在附件或员工手册中约定；若确有附件，需要一并交付并核对。`,
    ask:'HR：这些缺失条款能否补齐后再签？如果写在附件或员工手册里，能否一并交付？',
    counter:'按《劳动合同法》第十七条补齐八项必备条款；附件须双方签字并交付。',
    basis:LAW.L17,confidence:verdict==='red'?'高':'中',loss:0
  });
}

/* R22 经济补偿与违法解除 */
function runR22(ctx){
  const noCompRe = /(解除|终止|辞退|裁员)[^。；\n]{0,24}(无需|无须|不支付|不予|不承担|不补偿)[^。；\n]{0,12}(经济补偿|补偿)/;
  const waiverRe = /(放弃|不主张|不要求)[^。；\n]{0,12}(经济补偿|补偿金)/;
  const lowBaseRe = /(经济补偿|补偿金)[^。；\n]{0,24}(按|以)[^。；\n]{0,12}(最低工资|基本工资|当地最低工资)/;
  const illegalLowRe = /(违法解除|违法辞退)[^。；\n]{0,20}(只|仅|按)[^。；\n]{0,10}(一个月|1个月|N|N\+1)[^。；\n]{0,10}(工资|补偿|赔偿)/;
  const greenRe = /(经济补偿)[^。；\n]{0,40}(每满一年|工作年限|十二个月平均工资)|(违法解除)[^。；\n]{0,20}(二倍|2N)/;
  const c = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return (noCompRe.test(t) || waiverRe.test(t)) && !hasRuleItem(ctx, cl.index, 'R7') &&
      !/(依法|应当|需要)[^。；\n]{0,12}(支付|补偿)/.test(t);
  });
  if(c){
    addPatternItem(ctx,c,{
      base:'R22',ruleId:'R22',verdict:'red',ruleName:'解除不支付经济补偿',
      short:'辞退不给补偿',consequence:'合同提前排除了解除或终止时的经济补偿；符合法定补偿情形时，这类约定不能免除支付义务，违法解除还应按二倍标准赔偿。',
      ask:'HR：解除时经济补偿按什么标准算？违法解除是否按2N赔偿？',counter:'删除“无需补偿/放弃补偿”；按工作年限和法定标准写明经济补偿，违法解除按二倍赔偿。',
      basis:LAW.L47,confidence:'高',loss:0
    },noCompRe.test(c.body || '') ? noCompRe : waiverRe);
    return;
  }
  const low = ctx.clauses.find(cl => illegalLowRe.test(clauseFull(cl)));
  if(low){
    addPatternItem(ctx,low,{
      base:'R22',ruleId:'R22',verdict:'red',ruleName:'违法解除赔偿不足',
      short:'违法解除只给一个月',consequence:'违法解除或辞退应按经济补偿标准的二倍支付赔偿金；只给一个月工资或只按N支付，低于法定标准。',
      ask:'HR：这次解除是合法解除还是违法解除？赔偿按N还是2N？',counter:'违法解除按2N支付；合法解除按工作年限支付经济补偿。',
      basis:LAW.L87,confidence:'高',loss:0
    },illegalLowRe);
    return;
  }
  const lowBase = ctx.clauses.find(cl => lowBaseRe.test(clauseFull(cl)));
  if(lowBase){
    addPatternItem(ctx,lowBase,{
      base:'R22',ruleId:'R22',verdict:'yellow',ruleName:'经济补偿标准偏低',
      short:'补偿基数被压低',consequence:'把经济补偿基数写成最低工资或基本工资，会压低离职补偿；法定基数应是解除或终止前十二个月的平均工资。',
      ask:'HR：经济补偿的月工资基数按什么算？是否包含绩效和补贴？',counter:'按解除前十二个月平均工资计算，不按最低工资或基本工资单方压低。',
      basis:LAW.L47,confidence:'中',loss:0
    },lowBaseRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'经济补偿',greenRe,'经济补偿按工作年限和法定标准约定。');
}

/* R23 无固定期限与连续签约 */
function runR23(ctx){
  const tenRe = /(连续工作满十年|连续工作10年|工作满十年)/;
  const twiceRe = /(连续订立二次|连续订立两次|第三次签订|第三次续订)/;
  const fixRe = /(?:^|[^无])(固定期限|一年期|一年一签|不续签)/;
  const noWrittenRe = /(满一年|超过一年)[^。；\n]{0,12}(未|不)[^。；\n]{0,10}(签订|订立)[^。；\n]{0,8}书面/;
  const yearlyRe = /(一年一签|每年签订一次|一年一续)/;
  const greenRe = /(无固定期限)[^。；\n]{0,20}(应当|依法|订立)|(连续工作满十年)[^。；\n]{0,20}(无固定期限)/;
  const legalRecital = /(依法|应当|应)[^。；\n]{0,10}(订立|签订)[^。；\n]{0,10}无固定期限/;
  const red = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return ((tenRe.test(t) || twiceRe.test(t)) && fixRe.test(t) || noWrittenRe.test(t)) && !legalRecital.test(t);
  });
  if(red){
    addPatternItem(ctx,red,{
      base:'R23',ruleId:'R23',verdict:'red',ruleName:'应订无固定期限仍签固定期限',
      short:'规避无固定期限',consequence:'已符合连续工作满十年或连续订立二次固定期限合同的情形，仍约定固定期限或不续签，可能违反第十四条；满一年未签书面合同还会被视为无固定期限。',
      ask:'HR：这次是第几次签订固定期限合同？我是否符合订立无固定期限合同的条件？',counter:'符合条件时改为无固定期限合同；不续签请书面说明法定终止依据。',
      basis:LAW.L14,confidence:'中',loss:0
    },tenRe.test(red.body || '') ? tenRe : (twiceRe.test(red.body || '') ? twiceRe : noWrittenRe));
    return;
  }
  const yearly = ctx.clauses.find(cl => yearlyRe.test(clauseFull(cl)));
  if(yearly){
    addPatternItem(ctx,yearly,{
      base:'R23',ruleId:'R23',verdict:'yellow',ruleName:'反复签订短期合同',
      short:'一年一签',consequence:'长期一年一签可能规避无固定期限合同；连续订立二次后，劳动者提出或同意续订的，单位应订立无固定期限合同。',
      ask:'HR：公司为什么一直一年一签？第三次续签是否按无固定期限处理？',counter:'写明续订规则；符合第十四条情形时订立无固定期限合同。',
      basis:LAW.L14,confidence:'中',loss:0
    },yearlyRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'无固定期限',greenRe,'符合条件时订立无固定期限合同，属常规安排。');
}

/* R24 特殊工时审批 */
function runR24(ctx){
  const specialRe = /(综合计算工时|综合工时|不定时工作制|不定时工时|轮班制|倒班制)/;
  const approvalRe = /(经|已获)[^。；\n]{0,12}(劳动行政部门|人社局|人力资源和社会保障局|审批)[^。；\n]{0,10}(批准|审批)/;
  const noPayRe = /(加班费|加班工资)[^。；\n]{0,20}(不支付|不再|不予|按季度|包干|包含)/;
  const greenRe = /(150%|200%|300%|百分之一百五十|百分之二百|百分之三百)/;
  const c = ctx.clauses.find(cl => specialRe.test(clauseFull(cl)));
  if(!c) return;
  const t = clauseFull(c);
  if(!approvalRe.test(t)){
    const noPay = noPayRe.test(t);
    addPatternItem(ctx,c,{
      base:'R24',ruleId:'R24',verdict:noPay?'red':'yellow',
      ruleName:noPay?'特殊工时未审批且不付加班费':'特殊工时缺少审批信息',
      short:noPay?'综合工时没有加班费':'特殊工时未写审批',
      consequence:noPay
        ? '合同实行综合工时或不定时工时，却没有劳动行政部门审批，还约定超时不付加班费；未经审批应按标准工时支付加班费。'
        : '合同提到综合工时、不定时工时或轮班制，但没有审批文号、计算周期和超时加班费规则，实际执行时容易少算加班费。',
      ask:'HR：公司实行哪种工时制度？有没有劳动行政部门的审批文号？超时部分怎么算加班费？',
      counter:'写明审批文号与计算周期；未审批的按标准工时支付150%/200%/300%加班费。',
      basis:LAW.L39,confidence:noPay?'高':'中',loss:0
    },specialRe);
    return;
  }
  if(greenRe.test(t)){
    addGreen(ctx,c,'特殊工时',specialRe,'特殊工时已写审批与加班费标准，属常规安排。');
  }else{
    addPatternItem(ctx,c,{
      base:'R24',ruleId:'R24',verdict:'yellow',ruleName:'特殊工时加班费规则不明',
      short:'特殊工时加班费未写明',consequence:'写了特殊工时审批，但没有写清超出标准工时的加班费计算方式；实际结算时仍可能按低标准执行。',
      ask:'HR：综合计算周期内超过法定标准工时的部分按什么比例支付？',counter:'补写150%/200%/300%的支付规则和计算周期。',
      basis:LAW.L39,confidence:'中',loss:0
    },specialRe);
  }
}

/* R25 女职工三期保护 */
function runR25(ctx){
  const redRe = /(怀孕|孕期|生育|产期|哺乳|哺乳期)[^。；\n]{0,30}(降薪|调岗|辞退|辞职|离职|解除|不续签|扣工资|限制)/;
  const restrictRe = /(不得|禁止|不允许|不能|承诺|保证)[^。；\n]{0,10}(怀孕|生育|结婚)/;
  const protectRe = /(不得|禁止)[^。；\n]{0,8}(因|因为)[^。；\n]{0,6}(怀孕|生育|哺乳)/;
  const leaveRe = /产假[^。；\n]{0,10}?(\d{1,3})\s*天/;
  const aliasLeaveRe = /(?:休养券|产假|生育假)[^。；\n]{0,24}?(\d{1,3})\s*(?:个)?(?:自然日|日历日|天)[^。；\n]{0,20}(?:包含|含|覆盖)[^。；\n]{0,12}(?:全部|所有)?产假/;
  const aliasLeave = ctx.clauses.find(cl => aliasLeaveRe.test(clauseFull(cl)));
  if(aliasLeave){
    const m = clauseFull(aliasLeave).match(aliasLeaveRe);
    const days = m ? parseInt(m[1], 10) : 0;
    addPatternItem(ctx,aliasLeave,{
      base:'R25',ruleId:'R25',verdict:'yellow',ruleName:'产假被压缩或改用其他名义',
      short:days ? `产假仅 ${days} 天` : '产假被压缩',consequence:`合同用“休养券”等名义只给 ${days || '少量'} 个自然日，并写明包含全部产假；法定产假为98天起，难产和多胞胎还应增加。名称变化不能缩短法定假期。`,
      ask:'HR：这个“休养券”是否就是全部产假？98天产假和难产、多胞胎增加天数怎么安排？',counter:'按法定产假98天起执行，难产增加15天，多胞胎每多1个婴儿增加15天，不与其他假期互抵。',
      basis:LAW.LADY7,confidence:'高',loss:0
    },aliasLeaveRe);
  }
  const lactationRe = /哺乳[^。；\n]{0,20}(30分钟|半小时|扣工资|按事假)/;
  const greenRe = /产假[^。；\n]{0,10}98\s*天|哺乳[^。；\n]{0,20}(1小时|一小时)/;
  const red = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return (redRe.test(t) || restrictRe.test(t)) && !protectRe.test(t) && !hasRuleItem(ctx, cl.index, 'R16');
  });
  if(red){
    const q = qFilter(red, /(?:怀孕|孕期)[^。；\n]{0,44}(?:辞职|离职|自动离职|自愿离职|解除|辞退)|(?:预签)?辞职单[^。；\n]{0,24}|(?:降薪|调岗|辞退|解除|不续签|不得怀孕|不得生育|视为自动离职)/, protectRe) || qAny(red, /(怀孕|生育|哺乳)/);
    const coercedExit = /(预签辞职|自愿离职|自动离职)/.test(clauseFull(red));
    addItem(ctx,{
      base:'R25',ruleId:'R25',verdict:'red',ruleName:'限制婚育或三期降薪辞退',
      short:'三期降薪或辞退',clauseIndex:red.index,location:clauseLabel(red,red.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:coercedExit
        ? '合同把怀孕、生育、哺乳与降薪、调岗、辞退或不续签挂钩；这里用“预签辞职单”或“按自愿离职办理”处理怀孕后的劳动关系，不能直接当作你当时真实自愿的辞职意思，仍要审查解除原因、时间和程序。此类约定违反女职工特殊保护规定，通常无效，但现实中会直接影响岗位和待遇。'
        : '合同把怀孕、生育、哺乳与降薪、调岗、辞退或不续签挂钩；这类条款违反女职工特殊保护规定，通常无效，但现实中会直接影响岗位和待遇。',
      ask:'HR：怀孕、生育后岗位和工资怎么安排？会不会因此解除或不续签？',counter:'删除婚育限制和三期降薪/辞退条款，按女职工劳动保护规定执行。',
      basis:LAW.LADY5,confidence:'高',loss:0
    });
    return;
  }
  const leave = ctx.clauses.find(cl => leaveRe.test(clauseFull(cl)));
  if(leave){
    const m = clauseFull(leave).match(leaveRe);
    const days = m ? parseInt(m[1], 10) : 0;
    if(days > 0 && days < 98){
      addPatternItem(ctx,leave,{
        base:'R25',ruleId:'R25',verdict:'yellow',ruleName:'产假天数低于法定标准',
        short:`产假仅 ${days} 天`,consequence:`合同只写产假 ${days} 天，低于法定98天；难产、多胞胎还应依法增加。`,
        ask:'HR：产假为什么少于98天？难产和多胞胎是否另行增加？',counter:'改为产假98天起，难产增加15天，多胞胎每多1个婴儿增加15天。',
        basis:LAW.LADY7,confidence:'高',loss:0
      },leaveRe);
      return;
    }
  }
  const lactation = ctx.clauses.find(cl => lactationRe.test(clauseFull(cl)));
  if(lactation){
    addPatternItem(ctx,lactation,{
      base:'R25',ruleId:'R25',verdict:'yellow',ruleName:'哺乳时间不足或被扣工资',
      short:'哺乳时间不足',consequence:'哺乳期每天应安排1小时哺乳时间；写成30分钟、半小时或按事假扣工资，可能低于法定标准。',
      ask:'HR：哺乳时间每天多久？是否扣工资？',counter:'每天安排1小时哺乳时间，不扣工资；多胞胎每多1个婴儿每天增加1小时。',
      basis:LAW.LADY9,confidence:'高',loss:0
    },lactationRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'三期保护',greenRe,'产假与哺乳时间按法定标准安排。');
}

/* R26 工伤申报与待遇 */
function runR26(ctx){
  const selfRe = /(工伤|职业病|因工受伤)[^。；\n]{0,24}(自负|自理|自行承担|不负责|不承担|概不负责|与甲方无关)/;
  const waiverRe = /(放弃|不要求|不主张)[^。；\n]{0,18}(工伤|工伤保险待遇|工伤赔偿)/;
  const noInsPayRe = /未[^。；\n]{0,10}(参加|缴纳)[^。；\n]{0,8}工伤保险[^。；\n]{0,20}(不承担|不支付|概不负责)/;
  const commercialRe = /(商业意外险|意外险)[^。；\n]{0,20}(替代|代替|不再|不缴)/;
  const sickRe = /工伤[^。；\n]{0,20}(按病假|按事假|不发工资)/;
  const greenRe = /(依法|按照)[^。；\n]{0,10}(参加|缴纳)[^。；\n]{0,6}工伤保险/;
  const red = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return (selfRe.test(t) || waiverRe.test(t) || noInsPayRe.test(t)) && !hasRuleItem(ctx, cl.index, 'R7');
  });
  if(red){
    addPatternItem(ctx,red,{
      base:'R26',ruleId:'R26',verdict:'red',ruleName:'工伤责任自负或未参保不承担',
      short:'工伤责任被推给员工',consequence:'合同把工伤责任推给员工，或未参保还约定不承担；这类约定不能免除单位的工伤保险责任，但出事时医疗费可能先由你垫付。',
      ask:'HR：公司是否缴纳工伤保险？事故发生后30日内由谁申报？',counter:'删除工伤自负条款；依法参保并在30日内申报工伤认定。',
      basis:LAW.GSW62,confidence:'高',loss:0
    },selfRe.test(red.body || '') ? selfRe : (waiverRe.test(red.body || '') ? waiverRe : noInsPayRe));
    return;
  }
  const applyLimitRe = /(?:只准|只能|仅能|仅限|必须由)[^。；\n]{0,14}(?:甲方|单位|用人单位)[^。；\n]{0,12}(?:申报|申请)|(?:乙方|职工|近亲属|工会)[^。；\n]{0,24}(?:不得|不能|无权)[^。；\n]{0,14}(?:提出|申请)[^。；\n]{0,8}(?:工伤认定|工伤)|(?:未在|超过)[^。；\n]{0,8}(?:30|三十)\s*日[^。；\n]{0,16}(?:作废|视为|不得)/;
  const applyLimit = ctx.clauses.find(cl => applyLimitRe.test(clauseFull(cl)));
  if(applyLimit){
    const q = qFilter(applyLimit, /(?:未在|超过)[^。；\n]{0,20}(?:30|三十)\s*日[^。；\n]{0,45}/)
      || qFilter(applyLimit, /(?:只准|只能|仅能|不得|作废)[^。；\n]{0,40}/)
      || qAny(applyLimit, /(工伤|申报|申请|作废)/);
    addItem(ctx,{
      base:'R26',ruleId:'R26',verdict:'red',ruleName:'限制工伤认定申请主体或期限',
      short:'工伤只能单位申报，过期作废',clauseIndex:applyLimit.index,location:clauseLabel(applyLimit,applyLimit.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'单位应在事故伤害发生之日起30日内申请工伤认定；单位未按时申请的，职工、近亲属和工会组织仍可在1年内直接申请，不能约定“只准单位申报”或“过期作废”来排除这些权利。',
      ask:'HR：单位未在30日内申报时，职工和近亲属的1年申请权是否保留？',counter:'删除“只准单位申报、过期作废”；写明单位30日申报义务和职工一方1年内自行申请的权利。',
      basis:LAW.GSW17,confidence:'高',loss:0
    });
  }
  const commercial = ctx.clauses.find(cl => commercialRe.test(clauseFull(cl)));
  if(commercial){
    addPatternItem(ctx,commercial,{
      base:'R26',ruleId:'R26',verdict:'yellow',ruleName:'商业险替代工伤保险',
      short:'商业险代替工伤保险',consequence:'商业意外险不能替代工伤保险；未参保时，工伤待遇仍应由单位按条例支付。',
      ask:'HR：除了商业意外险，公司是否缴纳工伤保险？',counter:'依法参加工伤保险；商业险只能作为补充。',
      basis:LAW.GSW17,confidence:'中',loss:0
    },commercialRe);
    return;
  }
  const sick = ctx.clauses.find(cl => sickRe.test(clauseFull(cl)));
  if(sick){
    addPatternItem(ctx,sick,{
      base:'R26',ruleId:'R26',verdict:'yellow',ruleName:'工伤期间按病假处理',
      short:'工伤按病假处理',consequence:'工伤停工留薪期内原工资福利待遇不变，不能按病假或事假处理。',
      ask:'HR：工伤停工留薪期的工资按什么标准发？',counter:'按原工资福利待遇支付，医疗费按工伤保险规定处理。',
      basis:LAW.GSW17,confidence:'中',loss:0
    },sickRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)) && /(30日|三十日|停工留薪)/.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'工伤保险',greenRe,'工伤保险与工伤申报流程已写明。');
}

/* R27 个人信息与背景调查 */
function runR27(ctx){
  const overRe = /(必须|应当|须|要求)[^。；\n]{0,12}(提供|授权|提交)[^。；\n]{0,12}(家庭成员|直系亲属|亲属关系|家属|收入|犯罪记录|征信)/;
  const noNoticeRe = /(背景调查|背调)[^。；\n]{0,20}(无需|不必|不需)[^。；\n]{0,8}(告知|同意)/;
  const thirdPartyRe = /(向|提供给)[^。；\n]{0,10}(第三方|关联公司|集团)[^。；\n]{0,12}(个人信息|信息)[^。；\n]{0,10}(无需|不必|不需)[^。；\n]{0,6}(同意|告知)/;
  const sensitiveRe = /(背景调查|背调|征信|犯罪记录|学历核验|家庭成员|直系亲属|亲属关系|家属|生物识别|人脸|指纹|健康信息)/;
  const biometricRe = /(人脸|面部识别|人脸识别|指纹|声纹|虹膜|生物识别)[^。；\n]{0,20}(模板|信息|数据)|(?:采集|收集)[^。；\n]{0,10}(?:人脸|指纹|生物识别)/;
  const greenRe = /(最小必要|告知)[^。；\n]{0,20}(同意)|(单独同意)/;
  const biometric = ctx.clauses.find(cl => biometricRe.test(clauseFull(cl))
    && /(永久|长期|保存|广告|营销|第三方|素材|拒绝|无法入职|单独同意)/.test(clauseFull(cl)));
  if(biometric){
    const full = clauseFull(biometric);
    addItem(ctx,{
      base:'R27',ruleId:'R27',verdict:'red',ruleName:'强制采集人脸信息并共享',
      short:'人脸模板永久保存并交给第三方',clauseIndex:biometric.index,location:clauseLabel(biometric,biometric.index),
      quote:clipQuote(full, 0, full.length),range:null,
      consequence:'合同把采集人脸模板作为入职条件，并约定永久保存、交给无关广告公司用于素材建模，还拒绝单独同意；人脸信息属于敏感个人信息，处理应限于入职必需、明确保存期限、取得单独同意，向第三方提供还要告知接收方并取得单独同意。',
      ask:'HR：人脸模板是否入职必需？保存多久？交给哪些广告公司做什么？能否改用其他核验方式？',
      counter:'删除人脸模板永久保存和向广告公司提供；如确有必要，单独取得书面同意并写明目的、期限和接收方。',
      basis:LAW.PI23,confidence:'高',loss:0
    });
  }
  const red = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return overRe.test(t) || noNoticeRe.test(t) || thirdPartyRe.test(t);
  });
  if(red){
    addPatternItem(ctx,red,{
      base:'R27',ruleId:'R27',verdict:'red',ruleName:'过度收集个人信息或未告知同意',
      short:'个人信息收集越界',consequence:'合同要求提供与岗位无关的家庭成员、收入、征信或犯罪记录，或背景调查不告知、不取得单独同意；这类收集可能违反个人信息保护法。',
      ask:'HR：这些信息与岗位有什么关系？背景调查的范围、机构和用途能否书面告知？',counter:'只收集入职和社保必需的信息；敏感信息和第三方提供另行取得单独同意。',
      basis:LAW.PI6,confidence:'中',loss:0
    },overRe.test(red.body || '') ? overRe : (noNoticeRe.test(red.body || '') ? noNoticeRe : thirdPartyRe));
    return;
  }
  const sensitive = ctx.clauses.find(cl => sensitiveRe.test(clauseFull(cl)) && !hasRuleItem(ctx, cl.index, 'R27'));
  if(sensitive){
    addPatternItem(ctx,sensitive,{
      base:'R27',ruleId:'R27',verdict:'yellow',ruleName:'个人信息处理规则不明',
      short:'背景调查/敏感信息未写规则',consequence:'合同提到背景调查、征信、犯罪记录或生物识别，但没有写清收集目的、范围、保存期限和共享对象。',
      ask:'HR：收集这些信息的目的、范围和保存多久？会提供给哪些第三方？',counter:'写明最小必要范围、告知同意、保存期限；敏感信息取得单独同意。',
      basis:LAW.PI17,confidence:'中',loss:0
    },sensitiveRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'个人信息',greenRe,'个人信息处理已写明最小必要与告知同意。');
}

/* R28 非全日制、劳务派遣与外包混用 */
function runR28(ctx){
  const partTimeRe = /(非全日制|小时工|按小时计酬)/;
  const dispatchRe = /(劳务派遣|派遣)/;
  const outsourceRe = /(外包|合作|承揽)[^。；\n]{0,12}(协议|合同)/;
  const controlRe = /(考勤|打卡|固定工资|绩效|工牌|排班)/;
  const dailyRe = /每(?:日|天)[^。；\n]{0,10}?(\d+)\s*小时/;
  const weeklyRe = /每周[^。；\n]{0,10}?(\d+)\s*小时/;
  const monthlyPayRe = /(按月|每月)[^。；\n]{0,8}(发放|结算|支付)/;
  const trialRe = /试用期/;
  const fifteenRe = /(15日|十五日|每15日)/;
  const part = ctx.clauses.find(cl => partTimeRe.test(clauseFull(cl)));
  if(part){
    const t = clauseFull(part);
    const dm = t.match(dailyRe);
    const wm = t.match(weeklyRe);
    const daily = dm ? parseInt(dm[1], 10) : null;
    const weekly = wm ? parseInt(wm[1], 10) : null;
    const bad = (daily != null && daily > 4) || (weekly != null && weekly > 24) || monthlyPayRe.test(t) || trialRe.test(t);
    if(bad){
      addPatternItem(ctx,part,{
        base:'R28',ruleId:'R28',verdict:'red',ruleName:'非全日制用工超时或按月结算',
        short:'非全日制名不副实',consequence:'非全日制要求平均每日不超过4小时、每周不超过24小时，报酬结算周期不超过15日，且不得约定试用期；写成全日制工时、按月发薪或约定试用期，可能被按全日制处理。',
        ask:'HR：这份非全日制每天、每周实际工作多久？工资多久结算一次？为什么约定试用期？',
        counter:'改为每日不超过4小时、每周不超过24小时、15日内结算，并删除试用期。',
        basis:LAW.L68,confidence:'高',loss:0
      },/(非全日制|小时工|按小时计酬|按月|每月|试用期)/);
      return;
    }
    if(daily == null && weekly == null || !fifteenRe.test(t)){
      addPatternItem(ctx,part,{
        base:'R28',ruleId:'R28',verdict:'yellow',ruleName:'非全日制工时或结算周期不明',
        short:'非全日制规则未写清',consequence:'合同写了非全日制，但没有写清每日/每周工时上限或15日结算周期，实际执行时容易变成全日制。',
        ask:'HR：每天和每周最多工作多久？工资多久结算一次？',counter:'写明每日不超过4小时、每周不超过24小时、结算周期不超过15日。',
        basis:LAW.L68,confidence:'中',loss:0
      },partTimeRe);
      return;
    }
    addGreen(ctx,part,'非全日制',partTimeRe,'非全日制工时与结算周期符合规定。');
    return;
  }
  const outsource = ctx.clauses.find(cl => outsourceRe.test(clauseFull(cl)) && controlRe.test(clauseFull(cl)) && !hasRuleItem(ctx, cl.index, 'R19'));
  if(outsource){
    addPatternItem(ctx,outsource,{
      base:'R28',ruleId:'R28',verdict:'red',ruleName:'假外包真用工',
      short:'外包协议按员工管理',consequence:'协议写的是外包或合作，却要求考勤、打卡、固定工资、绩效或排班；实际按员工管理，可能被认定为劳动关系或假外包。',
      ask:'HR：外包人员为什么还要打卡、绩效考核和固定工资？',counter:'按成果交付和验收结算，不按员工考勤和绩效管理。',
      basis:LAW.L66,confidence:'中',loss:0
    },outsourceRe);
    return;
  }
  const dispatch = ctx.clauses.find(cl => dispatchRe.test(clauseFull(cl)) && !/(临时性|辅助性|替代性)/.test(clauseFull(cl)));
  if(dispatch){
    addPatternItem(ctx,dispatch,{
      base:'R28',ruleId:'R28',verdict:'yellow',ruleName:'派遣岗位性质不明',
      short:'派遣未写三性岗位',consequence:'劳务派遣只能用于临时性、辅助性或替代性岗位；合同没有写岗位性质，可能长期在主营业务岗位使用派遣工。',
      ask:'HR：这个派遣岗位属于临时性、辅助性还是替代性？',counter:'写明岗位性质、期限和同工同酬安排。',
      basis:LAW.L66,confidence:'中',loss:0
    },dispatchRe);
  }
}

/* R29 电子签署与文本交付 */
function runR29(ctx){
  const eRe = /(电子合同|电子签名|电子签署|线上签约|电子劳动合同|电子签章)/;
  const noCopyRe = /(不得|不予|拒绝|不交付|不提供)[^。；\n]{0,12}(下载|打印|提供|交付|复制|保存|副本|合同|文本)|(?:仅|只)[^。；\n]{0,8}(?:平台|系统)[^。；\n]{0,8}(?:保管|留存)|(?:平台|系统)[^。；\n]{0,8}(?:保管|留存)[^。；\n]{0,18}(不得|不予|拒绝|不允许)[^。；\n]{0,8}(下载|打印|提供|复制|保存)|(?:仅|只)归[^。；\n]{0,8}(?:甲方|公司|用人单位)[^。；\n]{0,8}保管|(?:不交付|不提供)[^。；\n]{0,10}(?:任何)?[^。；\n]{0,6}(?:副本|复印件)|(?:不允许|禁止)[^。；\n]{0,10}(?:乙方|员工|劳动者)[^。；\n]{0,12}(下载|复制|保存)/;
  const greenRe = /(可靠电子签名|电子签名)[^。；\n]{0,20}(下载|打印)|(下载|打印)[^。；\n]{0,20}(各执一份|双方各执)/;
  const c = ctx.clauses.find(cl => eRe.test(clauseFull(cl)));
  if(!c) return;
  const t = clauseFull(c);
  if(noCopyRe.test(t)){
    addPatternItem(ctx,c,{
      base:'R29',ruleId:'R29',verdict:'red',ruleName:'电子合同不提供文本',
      short:'电子合同不给下载',consequence:'只让在平台点击确认、不提供可下载或打印的合同文本；劳动合同文本应由双方各执一份，平台保管不能替代交付。',
      ask:'HR：电子合同能否下载、打印并给我一份完整文本？平台和存证方式是什么？',counter:'使用可靠电子签名；合同可下载、打印，双方各执一份。',
      basis:LAW.ESIGN14,confidence:'高',loss:0
    },noCopyRe);
    return;
  }
  if(greenRe.test(t)){
    addGreen(ctx,c,'电子签署',greenRe,'电子合同已写明可靠签名与文本交付。');
    return;
  }
  addPatternItem(ctx,c,{
    base:'R29',ruleId:'R29',verdict:'yellow',ruleName:'电子合同交付方式不明',
    short:'电子合同未写下载/存证',consequence:'写了电子合同，但没有写清平台、存证、下载打印和双方各执一份；发生争议时可能拿不到完整文本。',
    ask:'HR：电子合同在哪个平台签署？如何存证？我能否下载打印？',counter:'写明可靠电子签名、存证方式、下载打印和双方各执一份。',
    basis:LAW.ESIGN13,confidence:'中',loss:0
  },eRe);
}

/* R30 争议管辖与送达 */
function runR30(ctx){
  const redRe = /(争议|纠纷)[^。；\n]{0,20}(只能|仅能|应当)[^。；\n]{0,12}(甲方所在地|公司所在地|用人单位所在地|外地)[^。；\n]{0,10}(仲裁|法院|管辖)|(放弃|不提起)[^。；\n]{0,12}(仲裁|诉讼)|(?:只|仅)[^。；\n]{0,16}(?:提交|选择|约定)[^。；\n]{0,20}(?:商业仲裁|商业仲裁机构)|(?:唯一|终局)[^。；\n]{0,10}(?:程序|仲裁)|不得[^。；\n]{0,14}(?:劳动人事争议仲裁|劳动争议仲裁|劳动仲裁|人民法院|起诉)/;
  const courtRe = /(争议|纠纷)[^。；\n]{0,20}(法院|诉讼)[^。；\n]{0,10}(管辖|解决)/;
  const deliveryRe = /(短信|微信|电子)[^。；\n]{0,10}送达/;
  const greenRe = /(劳动合同履行地|用人单位所在地)[^。；\n]{0,16}(仲裁|管辖)/;
  const red = ctx.clauses.find(cl => redRe.test(clauseFull(cl)));
  if(red){
    addPatternItem(ctx,red,{
      base:'R30',ruleId:'R30',verdict:'red',ruleName:'排除法定管辖或放弃救济',
      short:'排除劳动仲裁或指定商业仲裁',consequence:'劳动争议应先向劳动合同履行地或用人单位所在地的劳动争议仲裁委员会申请仲裁；约定只能去公司所在地、只能提交商业仲裁机构、唯一终局，或提前放弃仲裁/诉讼权利，都会限制你的法定救济路径。',
      ask:'HR：劳动争议为什么排除劳动仲裁？能否按劳动合同履行地或用人单位所在地申请仲裁？',counter:'删除商业仲裁、唯一终局和排除劳动仲裁条款，按劳动争议调解仲裁法执行。',
      basis:LAW.ARB21,confidence:'高',loss:0
    },redRe);
    return;
  }
  const court = ctx.clauses.find(cl => courtRe.test(clauseFull(cl)));
  if(court){
    addPatternItem(ctx,court,{
      base:'R30',ruleId:'R30',verdict:'yellow',ruleName:'劳动争议约定法院管辖',
      short:'劳动争议直接约定法院',consequence:'劳动争议一般应先申请仲裁，直接约定由法院管辖不符合程序；这类条款可能无法排除仲裁前置。',
      ask:'HR：劳动争议是否先走劳动仲裁？为什么直接约定法院管辖？',counter:'改为向劳动合同履行地或用人单位所在地劳动争议仲裁委员会申请仲裁。',
      basis:LAW.ARB21,confidence:'中',loss:0
    },courtRe);
    return;
  }
  const delivery = ctx.clauses.find(cl => deliveryRe.test(clauseFull(cl)) && !/同意/.test(clauseFull(cl)));
  if(delivery){
    addPatternItem(ctx,delivery,{
      base:'R30',ruleId:'R30',verdict:'yellow',ruleName:'电子送达未取得同意',
      short:'短信/微信送达未同意',consequence:'约定短信、微信或电子方式送达，但没有写明经你同意；电子送达应以你同意并能确认收悉为前提。',
      ask:'HR：电子送达是否经过我同意？如何确认我收悉？',counter:'写明送达地址、电子送达同意方式和变更通知义务。',
      basis:LAW.CIVPRO90,confidence:'中',loss:0
    },deliveryRe);
    return;
  }
  const green = ctx.clauses.find(cl => greenRe.test(clauseFull(cl)));
  if(green) addGreen(ctx,green,'争议管辖',greenRe,'争议管辖按劳动合同履行地或用人单位所在地约定。');
}

/* greens（劳动合同） */
function runLaborGreens(ctx){
  const cHours = ctx.clauses.find(cl => /(标准工时制|每日工作\s*8\s*小时|每周工作\s*40\s*小时)/.test(clauseFull(cl)));
  if(cHours){
    const t = clauseFull(cHours);
    const hasDaily = /每日工作\s*8\s*小时/.test(t);
    const hasWeekly = /每周工作\s*40\s*小时/.test(t);
    const msg = hasDaily && hasWeekly
      ? '已看到标准工时、每日 8 小时与每周 40 小时的明确约定。'
      : hasDaily
        ? '只看到每日工作 8 小时；周工时没有写，不能在报告里补成每周 40 小时。'
        : hasWeekly
          ? '只看到每周工作 40 小时；每日工时没有写，不能据此补足每日 8 小时。'
          : '已看到标准工时制的表述；具体每日、每周工时仍需核对。';
    addGreen(ctx,cHours,'工作时间',/(标准工时制|每日工作|每周工作)/,msg);
  }
  const socialIssue = ctx.items.some(it => /社保|社会保险|公积金/.test(it.ruleName || ''));
  if(!socialIssue){
    const cSocial = ctx.clauses.find(cl => /(?:缴纳[^。；\n]{0,10}(?:社会保险|社保)|(?:社会保险|社保)[^。；\n]{0,10}(?:缴纳|参保|登记))/.test(clauseFull(cl)) && !/(放弃|不缴|自理|自行承担|自愿|承诺|无需|无须|不参加|关系转移)/.test(clauseFull(cl)));
    addGreen(ctx,cSocial,'社会保险',/(社会保险|社保)/,'约定依法缴纳社会保险，属常规条款；个人部分由单位代扣代缴时仍属正常安排。');
  }
  const cDuty = ctx.clauses.find(cl => /(岗位|工作地点)/.test(clauseFull(cl)) && !/(调整|变更|违约金|试用期|保证金|押金)/.test(clauseFull(cl)));
  addGreen(ctx,cDuty,'岗位与工作地点',/(岗位|工作地点)/,'岗位与工作地点明确。');
}

function contractDateKey(text){
  const m = String(text || '').match(/(20\d{2})\s*[年\-/.]\s*(\d{1,2})\s*[月\-/.]\s*(\d{1,2})\s*日?/);
  if(!m) return null;
  return +m[1] * 10000 + +m[2] * 100 + +m[3];
}

/* 消费培训与分期：预付退款、单方变更、免责、维权和隐私 */
function runLoanConsumer(ctx){
  const text = ctx.text || '';
  const consumerText = /(学员|消费者|课程|课时|直播课|录播|开课|上课|培训)/.test(text);
  const licensedClaim = /(持牌消费金融(?:机构|公司)?|消费金融(?:股份)?有限公司|消费金融公司)/.test(text);
  const dateKey = contractDateKey(text);
  const currentRules = dateKey != null && dateKey >= 20260801;
  const licensedNote = licensedClaim
    ? '合同文本自称贷款人为持牌消费金融公司；该资质真实性仍需另行向监管或工商信息核对，以下按合同陈述适用持牌机构规则。'
    : '合同未明确贷款人是否为持牌机构；以下按持牌机构规则作条件性提示，并需按实际放款主体核对。';
  const dateNote = dateKey == null
    ? '合同未写签署日期，以下提示应按实际签约和放款时点作条件性核对。'
    : dateKey < 20260801
      ? '合同签署日期早于2026年8月1日，不能直接套用届时才施行的规定；如实际签约或放款发生在施行后，应按下列要求核对。'
      : '';

  const c10 = ctx.clauses.find(cl => /(综合融资成本|明示表)/.test(clauseFull(cl)) && /(签署|签约|支付页|月供)/.test(clauseFull(cl)));
  if(c10){
    const t10 = clauseFull(c10);
    const tableQ = qFilter(c10, /支付页[^。；\n]{0,40}(?:月供|每月)/) || qAny(c10, /(月供|签署后|明示表)/);
    const disclosureVerdict = licensedClaim && currentRules ? 'yellow' : 'gray';
    if(/签署(?:贷款)?(?:合同)?前[^。；\n]{0,24}(?:只能|仅能)[^。；\n]{0,16}(?:看到|查看)[^。；\n]{0,12}(?:月供|每月)|签署后[^。；\n]{0,16}(?:才能|才可)[^。；\n]{0,16}(?:查看|看到)[^。；\n]{0,12}(?:表|成本)/.test(t10)){
        addItem(ctx,{
          base:'R31',ruleId:'R31',verdict:disclosureVerdict,ruleName:'签约后才能查看综合融资成本表',
          short:'签前只看月供，签后才能看成本表',clauseIndex:c10.index,location:clauseLabel(c10,c10.index),
          quote:tableQ ? tableQ.quote : '',range:tableQ||null,
          consequence:`${licensedNote}${dateNote}支付页只显示每月还款额和“利息0元”，签署贷款前看不到综合融资成本明示表，签署后才能查看；月供和零利息不能替代签前披露的全部成本。`,
          ask:'机构：为什么签前不能查看综合融资成本明示表？月供之外还有哪些费用？',counter:'在签署前提供完整明示表，列明每项费用、收取主体、频次和正常履约年化成本。',
          basis:LAW.IR26_2,confidence:'高',loss:0
        });
      }
      const subjectQ = qFilter(c10, /(?:明示表|该表|成本表)[^。；\n]{0,32}(?:不列|未列|没有)[^。；\n]{0,18}(?:收取主体|收费主体)/) || qFilter(c10, /(?:不列|未列|没有)[^。；\n]{0,24}(?:收取主体|收费主体)/);
      if(subjectQ){
        addItem(ctx,{
          base:'R31',ruleId:'R31',verdict:disclosureVerdict,ruleName:'明示表未列费用收取主体',
          short:'成本表不写钱付给谁',clauseIndex:c10.index,location:clauseLabel(c10,c10.index),
          quote:subjectQ.quote,range:subjectQ,
          consequence:`${licensedNote}${dateNote}综合融资成本明示表不列各项费用的收取主体，借款人无法判断费用由贷款人、平台还是培训机构收取，也无法核对谁有权收费。`,
          ask:'机构：每项费用由谁收取？贷款人和平台各自收多少？',counter:'在明示表逐项列明收取主体、金额、频次和收取时间。',
          basis:LAW.IR26_2,confidence:'高',loss:0
        });
      }
      const annualQ = qFilter(c10, /不显示[^。；\n]{0,24}(?:正常履约的)?年化(?:综合融资成本|利率)/);
      if(annualQ){
        addItem(ctx,{
          base:'R31',ruleId:'R31',verdict:disclosureVerdict,ruleName:'明示表未列正常履约年化成本',
          short:'没有年化综合融资成本',clauseIndex:c10.index,location:clauseLabel(c10,c10.index),
          quote:annualQ.quote,range:annualQ,
          consequence:`${licensedNote}${dateNote}明示表不显示正常履约的年化综合融资成本，只给月供和零利息，无法比较真实借款成本；应以实际占用本金为基础折算全部费用，并按人民银行公告〔2021〕第3号核对年化披露。`,
          ask:'机构：按实际占用本金折算的年化综合融资成本是多少？',counter:'在签前明示表列明年化综合融资成本及计算口径。',
          basis:LAW.IR26_2,confidence:'高',loss:0
        });
      }
  }

  const c11 = ctx.clauses.find(cl => /已(?:显示|明示|展示|列明)的费用之外[^。；\n]{0,30}(?:新增|加收|收取)/.test(clauseFull(cl)));
  if(c11){
    const q = qFilter(c11, /(?:已(?:显示|明示)的费用之外|新增任何|扣款后通知)/) || qAny(c11, /(新增|扣款|通知)/);
    addItem(ctx,{
      base:'R32',ruleId:'R32',verdict:licensedClaim && currentRules ? 'red' : 'gray',ruleName:'明示费用外可新增收费',
      short:'表外费用先扣后通知',clauseIndex:c11.index,location:clauseLabel(c11,c11.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:`${licensedNote}${dateNote}合同允许在已展示费用之外按内部清单新增借款履约服务费，金额和次数由平台单方决定，并可在扣款后才通知；这使借款人无法在签约前知道全部成本，也不能有效控制扣款。`,
      ask:'机构：已明示费用之外还可能收哪些钱？金额、次数和通知方式是什么？',counter:'删除开口收费条款；任何新增费用须事先书面告知并取得同意，不得先扣后通知。',
      basis:LAW.IR26_3,confidence:'高',loss:0
    });
  }
  const c18 = ctx.clauses.find(cl => /(仅内部可见|内部[^。；\n]{0,10}后台)/.test(clauseFull(cl)) && /(通知|视为)/.test(clauseFull(cl)));
  if(c18){
    const q = qFilter(c18, /(?:内部[^。；\n]{0,12}后台|仅内部可见|视为通知)/) || qAny(c18, /(后台|通知)/);
    addItem(ctx,{
      base:'R32',ruleId:'R32',verdict:licensedClaim && currentRules ? 'yellow' : 'gray',ruleName:'仅内部后台改价不构成通知',
      short:'贴内部后台就算通知',clauseIndex:c18.index,location:clauseLabel(c18,c18.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:`${licensedNote}${dateNote}把成本条目或收费标准贴入仅内部可见的业务后台就视为通知借款人，借款人付款时仍看不到调整后的息费项目；内部系统记录不能代替能够及时到达借款人的有效通知。`,
      ask:'机构：改价后如何通知我？我付款时在哪里能看到调整后的息费？',counter:'改为书面或可确认收悉的方式通知，并保证借款人在付款前能看到调整项目。',
      basis:LAW.IR26_4,confidence:'高',loss:0
    });
  }

  if(!consumerText) return;

  const c2 = ctx.clauses.find(cl => /(?:生成|开通)[^。；\n]{0,18}(?:学习)?账号[^。；\n]{0,18}(?:即视为|视为)[^。；\n]{0,20}(?:交付|提供)/.test(clauseFull(cl)));
  if(c2){
    const t2 = clauseFull(c2);
    const refusal = /(不退|不予退还|不返还|概不退还|拒绝退款|不得退款)/.test(t2);
    const favorable = /(?:七日内|7日内)[^。；\n]{0,16}(?:可|可以|有权|同意|应当|全额|无条件)[^。；\n]{0,12}(?:退款|退还|返还)|(?:全额|无条件)[^。；\n]{0,10}(?:退款|退还|返还)/.test(t2);
    const accountDeemed = /(?:生成|开通)[^。；\n]{0,22}(?:学习)?账号[^。；\n]{0,22}(?:即视为|视为)[^。；\n]{0,24}(?:交付|提供)/.test(t2);
    const dayMatch = t2.match(/(?:付款后|付款之日起)(?:第)?\s*([一二两三四五六七八九十\d]+)\s*(?:日|天)/);
    const day = dayMatch ? (/^\d+$/.test(dayMatch[1]) ? +dayMatch[1] : cnNum(dayMatch[1])) : null;
    const beyond = /(?:超过|超出|满)\s*七\s*日|七\s*日\s*(?:后|以后)/.test(t2);
    let priorSame = false, noPrior = false;
    sentenceList(ctx.text).forEach(s => {
      const q = s.quote || '';
      if(/(?:获得|接受|购买|取得)(?:过)?[^。；\n]{0,12}(?:相同|同类|同样)[^。；\n]{0,8}(?:商品|服务|课程)/.test(q) || /(?:获得|接受|购买|取得)过[^。；\n]{0,16}(?:商品|服务|课程)/.test(q) || /(?:获得|接受|购买|取得)[^。；\n]{0,12}(?:商品|服务|课程)过/.test(q)){
        if(/(?:未|没有|从未|未曾|并未)[^。；\n]{0,26}(?:从|向|在)?[^。；\n]{0,22}(?:获得|接受|购买|取得)(?:过)?/.test(q)) noPrior = true;
        else priorSame = true;
      }
    });
    const firstPurchase = noPrior || /首次购买|第一次购买|首次接受/.test(ctx.text);
    const sevenQ = qFilter(c2, /(?:付款后|付款之日起)[^。；\n]{0,34}(?:日|天)|(?:不退|不予退还|不返还)/) || qAny(c2, /(付款后|退还|退款)/);
    const accountQ = qFilter(c2, /(?:生成|开通)[^。；\n]{0,24}(?:学习)?账号[^。；\n]{0,24}(?:即视为|视为)[^。；\n]{0,24}(?:交付|提供)/) || qAny(c2, /(账号|交付)/);
    const refundObjectSet = text => {
      const set = new Set();
      if(/(?:预付款|课程款|课程价款|学费|培训费(?:用)?|课程费用)/.test(text)) set.add('prepay');
      if(/(?:教材费|资料费|材料费|书本费)/.test(text)) set.add('materials');
      if(/(?:平台费|平台服务费|技术服务费|风险管理费|服务费|利息|罚息|违约金|手续费|管理费)/.test(text)) set.add('fee');
      if(/(?:借款本金|贷款本金)/.test(text)) set.add('loan');
      return set;
    };
    const articleNum = text => {
      const m = String(text || '').match(/第\s*([一二两三四五六七八九十百零〇\d]+)\s*条/);
      if(!m) return null;
      const n = /^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1]);
      return Number.isFinite(n) ? n : null;
    };
    const clauseMeta = cl => {
      const heading = String(cl.heading || '');
      const body = String(cl.body || '');
      const num = articleNum(heading);
      const qualifiers = [...heading.matchAll(/[（(]([^）)]{1,30})[）)]/g)].map(x => x[1]);
      const attachment = /附件/.test(heading) || qualifiers.some(q => /附件/.test(q)) || /^\s*附件/.test(body);
      return {cl, num, qualifiers, attachment, heading, body, text:clauseFull(cl), label:clauseLabel(cl,cl.index)};
    };
    const metas = ctx.clauses.map(clauseMeta);
    const currentMeta = metas.find(m => m.cl.index === c2.index) || clauseMeta(c2);
    const refusalMetas = metas.filter(m => /(?:不退|不予退还|不返还|概不退还|拒绝退款|不得退款)/.test(m.text) &&
      /(?:预付款|课程款|课程价款|学费|培训费|退款)/.test(m.text));
    const normalizeRef = q => String(q || '').replace(/[“”"'《》\s]/g,'');
    const resolveArticleNumber = (num, refText, qualifier) => {
      let candidates = metas.filter(m => m.num === num);
      if(!candidates.length) return {ok:false, reason:'missing', message:`未找到第${num}条`};
      const t = String(refText || '');
      const attHint = /附件/.test(t) || /附件/.test(qualifier || '');
      const origHint = /原/.test(t);
      if(attHint){
        candidates = candidates.filter(m => m.attachment);
        if(!candidates.length) return {ok:false, reason:'missing-attachment', message:`${t.match(/附件[^，。；\n]{0,8}/)?.[0] || '附件'}中没有可定位的第${num}条`};
        const attNo = t.match(/附件([一二两三四五六七八九十百零〇\d]+)(?=(?:第|中|内))/);
        if(attNo){
          const label = `附件${attNo[1]}`;
          const exact = candidates.filter(m => normalizeRef(m.heading + m.qualifiers.join('')).includes(label));
          if(exact.length) candidates = exact;
          else return {ok:false, reason:'missing-attachment', message:`附件中没有可定位的第${num}条（${label}）`};
        }
      }else if(origHint){
        const bodyOnly = candidates.filter(m => !m.attachment);
        if(bodyOnly.length) candidates = bodyOnly;
      }
      if(qualifier){
        const q = normalizeRef(qualifier);
        if(q){
          const exact = candidates.filter(m => normalizeRef(m.heading + m.body).includes(q) || normalizeRef(m.qualifiers.join('')).includes(q));
          if(exact.length) candidates = exact;
          else return {ok:false, reason:'qualifier-miss', message:`第${num}条没有与“${qualifier}”相符的条款`};
        }
      }
      if(candidates.length === 1) return {ok:true, meta:candidates[0], clause:candidates[0].cl};
      return {ok:false, reason:'ambiguous', candidates, message:`第${num}条存在${candidates.length}个候选，正文与附件或重复条号无法唯一确定`};
    };
    const lastArticleRefBefore = text => {
      const re = /(?:原(?:合同)?|附件[一二两三四五六七八九十百零〇\d]*|前述|上述|该|本)?\s*第\s*([一二两三四五六七八九十百零〇\d]+)\s*条(?:\s*[（(]([^）)]{1,30})[）)])?/g;
      const found = [...String(text || '').matchAll(re)];
      return found.length ? found[found.length - 1] : null;
    };
    const resolveRefText = (refText, prefixText, currentMetaArg) => {
      const t = String(refText || '').trim();
      if(!t) return null;
      if(/(?:前述|上述|该|此)[^，。；\n]{0,10}(?:拒退|拒绝退款|退款)条款/.test(t)){
        if(refusalMetas.length === 1) return {ok:true, meta:refusalMetas[0], clause:refusalMetas[0].cl};
        return {ok:false, reason:'ambiguous-refusal', candidates:refusalMetas, message:'“前述拒退条款”存在多个候选，无法唯一定位'};
      }
      const explicit = t.match(/(?:原(?:合同)?|附件[一二两三四五六七八九十百零〇\d]*|前述|上述|该|本)?\s*第\s*([一二两三四五六七八九十百零〇\d]+)\s*条(?:\s*[（(]([^）)]{1,30})[）)])?/);
      if(explicit){
        const n = /^\d+$/.test(explicit[1]) ? +explicit[1] : cnNum(explicit[1]);
        if(!Number.isFinite(n)) return {ok:false, reason:'bad-number', message:'条号无法识别'};
        return resolveArticleNumber(n, explicit[0], explicit[2]);
      }
      if(/[该此]条|前述[^，。；\n]{0,6}条款/.test(t)){
        const last = lastArticleRefBefore(prefixText);
        if(last) return resolveArticleNumber(/^\d+$/.test(last[1]) ? +last[1] : cnNum(last[1]), last[0], last[2]);
        return {ok:false, reason:'pronoun', message:`“${t}”前没有可唯一定位的条号`};
      }
      if(/(?:^|[，,；;。\n\s])本(?:条|条款|约定|承诺)/.test(t) || /^本(?:条|条款|约定|承诺)/.test(t)){
        return {ok:true, meta:currentMetaArg, clause:currentMetaArg.cl};
      }
      if(/本合同|本协议/.test(t)) return {ok:false, reason:'document', message:'“本合同”不能作为具体条款定位'};
      return null;
    };
    const resolveTargets = (targetText, prefixText, currentMetaArg) => {
      const t = String(targetText || '').trim();
      const out = [];
      if(!t) return out;
      if(/(?:其他条款|其余条款|本合同其他|所有其他|其他约定)/.test(t)) return [{ok:true, generic:true}];
      if(/(?:前述|上述|该|此)[^，。；\n]{0,10}(?:拒退|拒绝退款|退款)条款/.test(t)){
        out.push(resolveRefText(t, prefixText, currentMetaArg));
      }
      const re = /(?:原(?:合同)?|附件[一二两三四五六七八九十百零〇\d]*|前述|上述|该|本)?\s*第\s*([一二两三四五六七八九十百零〇\d]+)\s*条(?:\s*[（(]([^）)]{1,30})[）)])?/g;
      let m;
      while((m = re.exec(t))){
        const n = /^\d+$/.test(m[1]) ? +m[1] : cnNum(m[1]);
        if(Number.isFinite(n)) out.push(resolveArticleNumber(n, m[0], m[2]));
      }
      if(/本条/.test(t) && !/第\s*[一二两三四五六七八九十百零〇\d]+\s*条/.test(t)) out.push({ok:true, meta:currentMetaArg, clause:currentMetaArg.cl});
      if(/[该此]条/.test(t) && !/第\s*[一二两三四五六七八九十百零〇\d]+\s*条/.test(t)){
        out.push(resolveRefText('该条', prefixText, currentMetaArg));
      }
      if(!out.length && /前述[^，。；\n]{0,6}条款/.test(t)) out.push(resolveRefText(t, prefixText, currentMetaArg));
      const seen = new Set();
      return out.filter(x => {
        if(!x) return false;
        if(x.ok && x.meta){
          if(seen.has(x.meta.cl.index)) return false;
          seen.add(x.meta.cl.index);
        }
        return true;
      });
    };
    const priorityScope = text => {
      const s = String(text || '');
      const feeWords = '教材费|资料费|材料费|书本费|平台费|平台服务费|技术服务费|风险管理费|服务费|管理费|手续费|利息|违约金|罚息';
      const feeScope = new RegExp(`(?:仅|只|限于|限|范围(?:仅|只|为|限于)?|就|对|针对)[^。；\\n]{0,14}(?:${feeWords})`).test(s) ||
        new RegExp(`(?:${feeWords})[^。；\\n]{0,10}(?:范围内|范围|优先|适用)`).test(s);
      if(feeScope) return 'fee';
      if(/(?:仅|只|限于|限|对|针对)[^。；\n]{0,10}(?:另一门|其他课程|另一课程|不同课程|第二门)/.test(s)) return 'other';
      return 'general';
    };
    const parsePriorityEdges = meta => {
      const s = String(meta.body || '');
      const edges = [];
      const re = /优先(?:适用)?/g;
      let m;
      while((m = re.exec(s))){
        let segStart = 0;
        [ '。', '；', '\n' ].forEach(ch => {
          const p = s.lastIndexOf(ch, m.index - 1);
          if(p >= 0 && p + 1 > segStart) segStart = p + 1;
        });
        let segEnd = s.length;
        [ '。', '；', '\n' ].forEach(ch => {
          const p = s.indexOf(ch, m.index + m[0].length);
          if(p >= 0 && p < segEnd) segEnd = p;
        });
        const before = s.slice(segStart, m.index);
        const afterRaw = s.slice(m.index + m[0].length, segEnd);
        const near = s.slice(Math.max(segStart, m.index - 24), Math.min(segEnd, m.index + m[0].length + 24));
        const subjectPart = before.split(/[，,]/).pop().trim();
        let subject = {ok:true, meta, clause:meta.cl};
        let subjectIssue = null;
        if(subjectPart && /(?:第\s*[一二两三四五六七八九十百零〇\d]+\s*条|本条|本条款|该条|前述|上述|本协议|本合同)/.test(subjectPart)){
          if(/本条\s*$/.test(subjectPart)) subject = {ok:true, meta, clause:meta.cl};
          else{
            const sr = resolveRefText(subjectPart, s.slice(0, m.index), meta);
            if(sr && sr.ok) subject = sr;
            else if(sr){ subject = {ok:false}; subjectIssue = sr; }
          }
        }
        const negative = /(?:不|未|并非|不得|不能|没有)\s*(?:再|予以|得|能)?\s*$/.test(before) ||
          /^(?:性|关系)?[^。；\n]{0,4}(?:低于|不及)/.test(afterRaw);
        const limited = /(?:仅|只)[^。；\n]{0,8}(?:优先|适用|限|针对|限于)|(?:优先|适用)[^。；\n]{0,8}(?:仅|只)/.test(near);
        const scope = priorityScope(near);
        const targetRaw = afterRaw.split(/[，,]/)[0].trim();
        const allOther = /(?:其他条款|其余条款|本合同其他|所有其他|其他约定)/.test(targetRaw);
        const targets = allOther ? [] : resolveTargets(targetRaw, s.slice(0, m.index + m[0].length), meta);
        const emptyTarget = !targetRaw || /^(?:适用|适用于)$/.test(targetRaw);
        const at = Math.max(0, m.index - segStart);
        const quote = clipQuote(near, at, at + m[0].length);
        const base = {source:meta.cl.index, subjectMeta:meta, negative, limited, scope, quote, raw:near};
        if(allOther || (emptyTarget && !limited)){
          edges.push(Object.assign({}, base, {
            from:subject.ok ? subject.meta.cl.index : null,
            to:'all', generic:true, resolved:subject.ok,
            reason:subjectIssue ? subjectIssue.message : null
          }));
          continue;
        }
        if(!targets.length){
          const laterTarget = /优先[^。；\n]{0,14}第\s*[一二两三四五六七八九十百零〇\d]+\s*条/.test(afterRaw);
          if(limited && emptyTarget && laterTarget) continue;
          edges.push(Object.assign({}, base, {
            from:subject.ok ? subject.meta.cl.index : null,
            to:null, generic:false, resolved:false,
            reason:subjectIssue ? subjectIssue.message : (limited ? '优先范围没有指向可定位的条款' : '优先对象不明确')
          }));
          continue;
        }
        targets.forEach(t => {
          if(t.generic){
            edges.push(Object.assign({}, base, {
              from:subject.ok ? subject.meta.cl.index : null,
              to:'all', generic:true, resolved:subject.ok,
              reason:subjectIssue ? subjectIssue.message : null
            }));
            return;
          }
          edges.push(Object.assign({}, base, {
            from:subject.ok ? subject.meta.cl.index : null,
            to:t.ok ? t.meta.cl.index : null, generic:false,
            resolved:subject.ok && t.ok,
            reason:!subject.ok ? (subjectIssue ? subjectIssue.message : '优先主体不明确') : (!t.ok ? t.message : null),
            targetMeta:t.meta || null
          }));
        });
      }
      return edges;
    };
    const priorityEdges = [];
    metas.forEach(m => parsePriorityEdges(m).forEach(e => priorityEdges.push(e)));
    const priorityState = (pMeta, cMeta) => {
      const P = pMeta.cl.index, C = cMeta.cl.index;
      const pEdges = priorityEdges.filter(e => e.source === P);
      const issues = [];
      const unresolved = pEdges.find(e => !e.resolved);
      if(unresolved) issues.push(unresolved.reason || '优先对象不明确');
      const adj = new Map();
      const allAdj = new Map();
      const addAdj = (map, from, to) => {
        if(from == null || to == null) return;
        if(!map.has(from)) map.set(from, []);
        if(!map.get(from).includes(to)) map.get(from).push(to);
      };
      priorityEdges.forEach(e => {
        if(e.negative || !e.resolved || e.from == null) return;
        const compatible = e.scope !== 'fee' && e.scope !== 'other';
        if(e.generic){
          addAdj(allAdj, e.from, C);
          if(compatible) addAdj(adj, e.from, C);
        }else if(e.to != null){
          addAdj(allAdj, e.from, e.to);
          if(compatible) addAdj(adj, e.from, e.to);
        }
      });
      const reachable = new Set([P]);
      const allQueue = [P];
      while(allQueue.length){
        const n = allQueue.shift();
        (allAdj.get(n) || []).forEach(nx => {
          if(!reachable.has(nx)){ reachable.add(nx); allQueue.push(nx); }
        });
      }
      const badScope = priorityEdges.find(e => !e.negative && e.resolved && e.from != null &&
        (e.scope === 'fee' || e.scope === 'other') && reachable.has(e.from) && (e.generic || e.to === C));
      if(badScope) issues.push(badScope.scope === 'fee' ? '优先范围仅覆盖费用项目，不覆盖本笔预付款' : '优先范围仅覆盖另一门课程，不覆盖本笔预付款');
      const unresolvedReach = priorityEdges.find(e => !e.resolved && !e.negative && e.from != null && reachable.has(e.from));
      if(unresolvedReach && unresolvedReach !== unresolved) issues.push(unresolvedReach.reason || '优先链条中存在无法定位的条款');
      const negativeBlock = priorityEdges.find(e => e.negative && e.resolved && e.from != null &&
        reachable.has(e.from) && (e.generic || e.to === C));
      const reverseBlock = priorityEdges.some(e => !e.negative && e.resolved && e.from === C &&
        (e.to === P || e.generic) && e.scope !== 'fee' && e.scope !== 'other');
      let pathFound = false;
      const queue = [P];
      const seen = new Set([P]);
      while(queue.length){
        const n = queue.shift();
        if(n === C){ pathFound = true; break; }
        (adj.get(n) || []).forEach(nx => {
          if(!seen.has(nx)){ seen.add(nx); queue.push(nx); }
        });
      }
      let cycle = false;
      const color = new Map();
      const dfs = n => {
        color.set(n, 1);
        (adj.get(n) || []).forEach(nx => {
          if(color.get(nx) === 1){ cycle = true; return; }
          if(!color.has(nx)) dfs(nx);
        });
        color.set(n, 2);
      };
      dfs(P);
      if(cycle) issues.push('优先关系存在循环引用或互相优先');
      if(reverseBlock && (pathFound || pEdges.some(e => e.resolved && e.generic && !e.negative && e.from === P))) issues.push('拒退条款反向优先于承诺条款，不能确认覆盖');
      if(negativeBlock && (pathFound || pEdges.some(e => e.resolved && e.generic && !e.negative && e.from === P))) issues.push('优先关系同时存在相反约定');
      if(issues.length) return {state:'conflict', reason:issues[0], issues};
      if(pathFound || pEdges.some(e => e.resolved && e.generic && !e.negative && e.from === P)) return {state:'cover'};
      if(!pEdges.length){
        if(reverseBlock) return {state:'excluded', reason:'拒退条款反向优先于承诺条款'};
        return {state:'unclear', reason:'承诺条款未写明优先关系'};
      }
      return {state:'excluded', reason:'优先对象不含拒退条款或明确排除拒退条款'};
    };
    const namedCourseTokens = text => {
      const s = String(text || '');
      const out = new Set();
      const re = /([\u4e00-\u9fa5A-Za-z0-9]{2,20}(?:课程|课|培训|班|套餐))/g;
      let m;
      while((m = re.exec(s))){
        const tok = m[1];
        const after = s.slice(m.index + m[0].length, m.index + m[0].length + 4);
        if(/(?:中心|公司|机构|平台|学校|学院)/.test(after)) continue;
        if(/(?:其他|另一|不同|新增|本课程|该课程|全部课程|所有课程|此类|相同|同类)/.test(tok)) continue;
        if(/^(?:本|该|此|其他|另一|不同|上述|前述|全部|所有|每|多|一门|两门|三门|这门|哪门|免费|线上|线下|直播|录播|培训|课程|购买|推销|或|如|并|且|及|与|将|可|应|能|由|向|对|为|在|被|把|从|到|的)/.test(tok)) continue;
        if(/(?:直播课|录播课|培训课程|全部|所有)$/.test(tok)) continue;
        if(/(?:甲方|乙方|丙方|丁方|生成|预收|交付|视为|提供|购买|停课|上课|开课|退还|返还|付款|支付|签署|约定|合同|金额|剩余|已上|完整|推广|模板|账号|才能|以后|放弃|转往|上调|违约|经营者|消费者|借款|贷款|收到|录入|不用|另付)/.test(tok)) continue;
        if(tok.length < 3) continue;
        out.add(tok);
      }
      for(const x of s.matchAll(/(?:课程|套餐|订单|班次)\s*([A-Za-z0-9一二三四五六七八九十]{1,8})/g)){
        const tok = x[0].replace(/\s+/g,'');
        if(!/^(?:课程|套餐|订单|班次)$/.test(tok)) out.add(tok);
      }
      for(const x of s.matchAll(/(?:课程名称|课程|培训项目|套餐名称|套餐|订单)[：:为]?\s*[“"《]([^”"》]{2,20})[”"》]/g)) out.add(x[1]);
      return out;
    };
    const globalCourseNames = namedCourseTokens(ctx.text);
    const packageIds = text => {
      const out = new Set();
      for(const m of String(text || '').matchAll(/(?:套餐|订单(?:号|编号)?|班次)[：:\s]*(?:为|是)?\s*([A-Za-z0-9][A-Za-z0-9_-]{1,20})/g)) out.add(m[1]);
      return out;
    };
    const globalPackageIds = packageIds(ctx.text);
    const prepayAmounts = (() => {
      const out = [];
      const re = /(?:预收[^。；\n]{0,14}|课程价款|课程款|借款本金|贷款本金)[^。；\n]{0,14}?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*(万元|元)/g;
      let m;
      while((m = re.exec(ctx.text))){
        let n = +m[1].replace(/,/g,'');
        if(m[2] === '万元') n *= 10000;
        if(Number.isFinite(n) && n > 0 && !out.some(v => Math.abs(v - n) < 0.01)) out.push(n);
      }
      return out;
    })();
    const refundPromise = text => {
      if(!/(?:退还|返还|退款)/.test(text)) return null;
      const targetWords = '(预付款(?:本金)?|课程款|课程价款|学费|培训费(?:用)?|课程费用|教材费|资料费|材料费|书本费|平台费|平台服务费|技术服务费|风险管理费|手续费|服务费|管理费|(?:借款|贷款)本金)';
      const objects = new Set();
      const canon = s => /预付款|课程款|课程价款|学费|培训费|课程费用/.test(s) ? 'prepay'
        : /教材费|资料费|材料费|书本费/.test(s) ? 'materials'
          : /平台费|平台服务费|技术服务费|风险管理费|服务费|利息|罚息|违约金|手续费|管理费/.test(s) ? 'fee'
            : /借款本金|贷款本金/.test(s) ? 'loan' : null;
      const addTarget = s => { const o = canon(s); if(o) objects.add(o); };
      const forward = new RegExp(`(?:退还|返还|退款|退)[^。；\\n]{0,8}${targetWords}`, 'g');
      const backward = new RegExp(`${targetWords}[^。；\\n]{0,12}(?:全额|全部|可|应当|应|予以)?[^。；\\n]{0,8}(?:退还|返还|退款)`, 'g');
      let m;
      while((m = forward.exec(text))) addTarget(m[1]);
      while((m = backward.exec(text))) addTarget(m[1]);
      if(!objects.size) return null;
      const partial = /(?:部分退款|部分退还|部分返还|剩余|余额|按[^。；\n]{0,8}(?:课时|比例|进度)[^。；\n]{0,8}折算|扣除[^。；\n]{0,10}(?:课时|费用|已上|已消费))/.test(text);
      const full = /(?:全额|全部|100\s*%|预付款本金|全部预付款|全部课程款)/.test(text);
      const windowMatch = text.match(/(?:自|从)[^。；\n]{0,14}(?:付款|支付|缴费)[^。；\n]{0,6}?(?:之日起|起|后)[^。；\n]{0,8}?([一二两三四五六七八九十百\d]+)\s*(?:日|天)\s*(?:内|以内)/) ||
        text.match(/(?:付款|支付|缴费)[^。；\n]{0,6}?(?:之日起|起|后)[^。；\n]{0,8}?([一二两三四五六七八九十百\d]+)\s*(?:日|天)\s*(?:内|以内)/) ||
        text.match(/(?:付款后|支付后|缴费后)[^。；\n]{0,8}?([一二两三四五六七八九十百\d]+)\s*(?:日|天)/);
      const days = windowMatch ? (/^\d+$/.test(windowMatch[1]) ? +windowMatch[1] : cnNum(windowMatch[1])) : null;
      const anytime = /(?:随时|任何时候|任意时间)[^。；\n]{0,10}(?:可|可以|有权)[^。；\n]{0,8}(?:退款|退还|返还)/.test(text);
      const unconditional = /(?:无理由|无条件)/.test(text);
      const conditionsClear = (days != null && days > 0) || anytime || unconditional;
      const moreFavorable = full && (days != null ? days > 7 : (anytime || unconditional));
      const otherCourse = /(?:其他|另一|另行|新增|不同|别的|第[二三四五六七八九十\d]+门)[^。；\n]{0,10}(?:课程|课|培训|服务|费用)/.test(text);
      const noStateLimit = /(?:无论|不论)[^。；\n]{0,8}是否(?:已)?(?:开课|上课|消费|使用)|(?:无论|不论)[^。；\n]{0,8}(?:均已|均不|一律)/.test(text);
      const stateLimit = !noStateLimit && /(?:未|尚未|没有)[^。；\n]{0,8}(?:开课|上课|使用|消费|登录)/.test(text);
      const attendedLimit = /(?:已|已经)[^。；\n]{0,8}(?:开课|上课|消费|使用)[^。；\n]{0,12}(?:不退|不予|扣除|折算)/.test(text);
      const restricted = partial || stateLimit || attendedLimit;
      const restrictedReason = partial ? '退款只覆盖剩余/部分款项，需核对实际退款权益'
        : stateLimit ? '退款附加了未开课或未使用等上课状态限制，需人工比较适用条件'
          : attendedLimit ? '已上课或已消费后的退款受限，需人工比较适用条件' : null;
      const amountMatch = [...String(text).matchAll(/(?:退还|返还|退款)[^。；\n]{0,24}?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*(万元|元)/g)].pop();
      let amount = null;
      if(amountMatch){
        amount = +amountMatch[1].replace(/,/g,'');
        if(amountMatch[2] === '万元') amount *= 10000;
        if(!Number.isFinite(amount)) amount = null;
      }
      return {objects, full, days, anytime, unconditional, conditionsClear, moreFavorable, otherCourse, restricted, restrictedReason, amount, text:String(text)};
    };
    const objectRelation = (p, pText) => {
      if(p.otherCourse) return {status:'different', reason:'承诺指向另一门课程或其他服务'};
      const pNames = namedCourseTokens(pText);
      const cNames = namedCourseTokens(currentMeta.text);
      const sameMark = /(?:同一笔|该笔|本笔|这笔|同一订单|该订单|本订单|原订单|同一套餐|本套餐|该套餐|本课程|该课程|本培训|该培训|上述课程|原课程)/.test(pText);
      const pPkg = packageIds(pText), cPkg = packageIds(currentMeta.text);
      if(pPkg.size && cPkg.size && ![...pPkg].some(x => cPkg.has(x))) return {status:'different', reason:'承诺与拒退条款指向不同套餐或订单'};
      if(pNames.size && cNames.size){
        const same = [...pNames].some(x => cNames.has(x));
        return same ? {status:'same'} : {status:'different', reason:'承诺与拒退条款指向不同课程'};
      }
      if(pNames.size && !cNames.size){
        if(sameMark) return {status:'same'};
        if(globalCourseNames.size === 1 && globalCourseNames.has([...pNames][0])) return {status:'same'};
        if(globalCourseNames.size > 1 || pPkg.size || globalPackageIds.size > 1) return {status:'ambiguous', reason:'合同存在多门课程或套餐，承诺只写课程/学费，无法确认与拒退条款是同一笔付款'};
        return {status:'same'};
      }
      if(!pNames.size && cNames.size){
        if(sameMark) return {status:'same'};
        if(globalCourseNames.size > 1 || globalPackageIds.size > 1) return {status:'ambiguous', reason:'合同存在多门课程或套餐，承诺未写明课程名称，无法确认是同一笔付款'};
        return {status:'same'};
      }
      if(pPkg.size && !cPkg.size && globalPackageIds.size > 1 && !sameMark) return {status:'ambiguous', reason:'承诺写有套餐/订单，但拒退条款未写明，无法确认是同一笔付款'};
      if(cPkg.size && !pPkg.size && globalPackageIds.size > 1 && !sameMark) return {status:'ambiguous', reason:'拒退条款写有套餐/订单，但承诺未写明，无法确认是同一笔付款'};
      if(sameMark) return {status:'same'};
      if(globalCourseNames.size > 1 || globalPackageIds.size > 1) return {status:'ambiguous', reason:'合同存在多门课程或套餐，仅凭“学费”或金额不能确认为同一笔付款'};
      return {status:'same'};
    };
    const amountIssue = p => {
      if(p.amount == null) return null;
      if(!prepayAmounts.length) return '承诺写明的退款金额无法与合同预付款对应';
      if(!prepayAmounts.some(v => Math.abs(v - p.amount) < 0.01)) return `承诺写明的退款金额 ${p.amount} 元与合同预付款 ${prepayAmounts.map(v => v.toLocaleString('en-US')).join(' / ')} 元不一致`;
      return null;
    };
    let crossCover = null, crossConflict = null;
    if(refusal && !favorable){
      const c2Objects = refundObjectSet(t2);
      for(const meta of metas){
        if(meta.cl.index === c2.index) continue;
        const p = refundPromise(meta.body || '');
        if(!p || (!p.full && !p.restricted)) continue;
        if(!p.moreFavorable && p.conditionsClear && !p.restricted) continue;
        if(p.otherCourse) continue;
        if(![...p.objects].some(o => c2Objects.has(o))) continue;
        if(c2Objects.has('prepay') && !p.objects.has('prepay')) continue;
        const obj = objectRelation(p, meta.body || '');
        if(obj.status === 'different') continue;
        const pr = priorityState(meta, currentMeta);
        if(pr.state === 'excluded') continue;
        const reasons = [];
        if(obj.status === 'ambiguous') reasons.push(obj.reason);
        if(!p.conditionsClear) reasons.push('退款期限或条件不明确');
        if(p.restricted) reasons.push(p.restrictedReason);
        const ai = amountIssue(p);
        if(ai) reasons.push(ai);
        if(day != null && p.days != null && p.days < day) reasons.push(`承诺期限短于拒退条款所涉第${day}日`);
        if(meta.num == null || currentMeta.num == null) reasons.push('条款未编号或缺附件条号，无法确认条号与证据位置');
        if(pr.state !== 'cover') reasons.push(pr.reason);
        if(reasons.length){
          crossConflict = crossConflict || {clause:meta.cl, promise:p, meta, reason:reasons[0], priority:pr, obj};
        }else{
          crossCover = {clause:meta.cl, promise:p, meta, priority:pr, obj};
          break;
        }
      }
    }
    if(refusal && !favorable){
      const history = priorSame
        ? '合同明确此前已从本经营者或者其他经营者获得过相同商品或者服务，属于第十四条七日退款规则的法定例外。'
        : noPrior
          ? '合同明确此前未从本经营者或者其他经营者获得过相同服务，不属于法定例外。'
          : '合同未明确此前是否获得过相同商品或者服务；若此前未从本经营者或者其他经营者获得过相同服务，则不属于法定例外。';
      if(!crossCover){
      if(!priorSame && !beyond && day == null){
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'gray',ruleName:'七日退款需核对付款后提出解除的时间',
          short:'七日退款时间待核对',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQ ? sevenQ.quote : '',range:sevenQ||null,
          consequence:`合同约定账号生成视为全部交付并拒绝退款，但没有写明付款后提出解除的具体日期。${history}若在付款后七日内提出，消费者可依第十四条请求返还预付款本金；若已超过七日，则不能仅按该条主张七日无理由退款。账号生成不能代替真实开课或者实际服务；七日退款不以“未开课”为前提，“未开课”只是独立事实。`,
          ask:'机构：我是在付款后第几天提出解除？此前是否从其他经营者获得过相同服务？',counter:'按实际付款日期和实际服务提供情况核算；未超过七日且无除外情形的，返还预付款本金。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
      }else if(priorSame){
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'gray',ruleName:'七日退款存在法定例外',
          short:'此前已获得相同服务',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQ ? sevenQ.quote : '',range:sevenQ||null,
          consequence:`合同约定账号生成视为交付并拒绝退款。${history}因此不能仅依据第十四条主张七日无理由退款；但账号生成不等于实际课程交付，拒绝退款仍应作为独立风险审查。`,
          ask:'机构：此前获得相同服务的证据是什么？账号生成对应哪些实际课程交付？',counter:'如不属于法定例外，返还预付款本金；如存在例外，也应按实际履行情况处理退款和违约责任。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
      }else if(beyond || (day != null && day > 7)){
        const dayText = day != null ? `第${day}日` : '超过七日';
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'gray',ruleName:'付款后已超过七日，不能主张七日无理由退款',
          short:'已超过七日退款期',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQ ? sevenQ.quote : '',range:sevenQ||null,
          consequence:`合同写明付款后${dayText}才提出解除，已经超过七日。不能仅依据第十四条主张七日无理由退款；但账号生成不等于实际课程交付，拒绝退款仍应作为独立风险审查，其他法定解除或者违约救济不受影响。`,
          ask:'机构：超过七日后的退款依据是什么？账号生成对应哪些实际课程交付？',counter:'按实际服务提供、合同约定和法定解除情形核算退款，不接受以账号生成替代真实交付。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
      }else{
        const dayLabel = day != null ? `第${day}日` : '七日内';
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'red',ruleName:'付款后七日内可请求返还预付款',
          short:'七日内拒退预付款',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQ ? sevenQ.quote : '',range:sevenQ||null,
          consequence:`合同把生成学习账号直接视为全部课程交付，并约定付款后${dayLabel}提出解除也概不退还。${firstPurchase ? '合同明确本次为首次购买，' : ''}${history}付款后七日内可依第十四条请求返还预付款本金；账号生成不能代替真实开课或者实际服务交付。七日退款不以“未开课”为前提，“未开课”只是独立事实。`,
          ask:'机构：付款后七日内为什么拒绝返还预付款？生成账号对应哪些真实课程交付？',counter:'按实际付款时间和实际服务提供情况核算；未超过七日且无除外情形的，返还预付款本金。',
          basis:LAW.PREPAY14,confidence:'高',loss:0
        });
      }
      }
      if(crossCover){
        const fc = crossCover.clause;
        const coverQ = qFilter(fc, /(?:优先适用|优先于|全额|退还|返还)/) || qAny(fc, /(?:退款|退还|返还)/);
        const coverQuote = coverQ ? coverQ.quote : '';
        const sevenQuote = sevenQ ? sevenQ.quote : '';
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'green',ruleName:'更有利退款条款优先适用',
          short:'更有利退款条款已覆盖拒退约定',clauseIndex:fc.index,location:clauseLabel(fc,fc.index),
          quote:coverQuote,range:coverQ||null,
          consequence:`${clauseLabel(fc,fc.index)}针对同一笔预付款承诺了更有利的退款条件，并明确优先于${clauseLabel(c2,c2.index)}的拒退约定；被覆盖的七日拒退提示不再显示。${clauseLabel(c2,c2.index)}原文：“${sevenQuote}”；本承诺原文：“${coverQuote}”。账号生成视为全部交付等独立风险仍保留。`,
          ask:'机构：该更有利退款条款是否适用于本笔预付款？',counter:'按明确优先适用的更有利退款约定处理。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
        }else if(crossConflict){
        const fc = crossConflict.clause;
        const conflictQ = qFilter(fc, /(?:优先适用|优先于|全额|退还|返还)/) || qAny(fc, /(?:退款|退还|返还)/);
        const conflictQuote = conflictQ ? conflictQ.quote : '';
        const sevenQuote = sevenQ ? sevenQ.quote : '';
        const reason = crossConflict.reason || '优先关系不明确';
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'gray',ruleName:'更有利退款承诺与拒退条款冲突',
          short:'两条退款约定需核对',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQuote,range:sevenQ||null,
          consequence:`${clauseLabel(c2,c2.index)}拒绝退款，${clauseLabel(fc,fc.index)}又针对同一笔预付款承诺更有利的退款条件，但未明确该条优先于拒退约定：${reason}。${clauseLabel(c2,c2.index)}原文：“${sevenQuote}”；${clauseLabel(fc,fc.index)}原文：“${conflictQuote}”。两条原文存在冲突，不能仅凭该承诺撤掉七日拒退风险；请核对两条原文的适用条件和优先关系。`,
          ask:'机构：更有利退款条款是否优先适用于本笔预付款？',counter:'明确优先关系并按更有利约定处理；如无优先关系，按原约定和法定规则审查。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'gray',ruleName:'退款承诺与拒退条款存在冲突',
          short:'承诺条款与拒退条款需核对',clauseIndex:fc.index,location:clauseLabel(fc,fc.index),
          quote:conflictQuote,range:conflictQ||null,
          consequence:`${clauseLabel(fc,fc.index)}承诺更有利退款，但不能据此撤掉${clauseLabel(c2,c2.index)}的拒退风险：${reason}。${clauseLabel(fc,fc.index)}原文：“${conflictQuote}”；${clauseLabel(c2,c2.index)}原文：“${sevenQuote}”。请核对两条原文的适用条件和优先关系。`,
          ask:'机构：更有利退款条款是否优先适用于本笔预付款？',counter:'明确优先关系并按更有利约定处理；如无优先关系，按原约定和法定规则审查。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
      }
      if(accountDeemed){
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'red',ruleName:'账号生成视为交付并拒绝退款',
          short:'账号生成后就不退预付款',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:accountQ ? accountQ.quote : '',range:accountQ||null,
          consequence:'合同把生成学习账号直接视为全部课程交付，并据此拒绝退款。账号生成不等于实际课程交付，也不能单独排除消费者依法解除、退款或者追究违约责任的权利；相关格式条款可依第九条审查。',
          ask:'机构：生成账号对应哪些实际课程和服务？为什么账号生成后就不能退款？',counter:'按实际开课、实际提供课时和服务结算；删除以账号生成替代真实交付并拒绝退款的条款。',
          basis:LAW.PREPAY9,confidence:'高',loss:0
        });
      }
      if(crossCover){
        const fc = crossCover.clause;
        const coverQ = qFilter(fc, /(?:优先适用|优先于|全额|退还|返还)/) || qAny(fc, /(?:退款|退还|返还)/);
        const coverQuote = coverQ ? coverQ.quote : '';
        const sevenQuote = sevenQ ? sevenQ.quote : '';
        addItem(ctx,{
          base:'R33',ruleId:'R33',verdict:'green',ruleName:'拒退条款已被更有利退款条款覆盖',
          short:'拒退约定已被覆盖',clauseIndex:c2.index,location:clauseLabel(c2,c2.index),
          quote:sevenQuote,range:sevenQ||null,
          consequence:`${clauseLabel(c2,c2.index)}的七日拒退约定已被${clauseLabel(fc,fc.index)}覆盖。${clauseLabel(c2,c2.index)}原文：“${sevenQuote}”；${clauseLabel(fc,fc.index)}原文：“${coverQuote}”。可分别定位两条原文核对；账号生成视为交付等独立风险仍保留。`,
          ask:'机构：该更有利退款条款是否适用于本笔预付款？',counter:'按明确优先适用的更有利退款约定处理。',
          basis:LAW.PREPAY14,confidence:'中',loss:0
        });
      }
    }
  }

  const c3 = ctx.clauses.find(cl => /单方[^。；\n]{0,40}(?:录播|上调)[^。；\n]{0,24}(?:课程|价款|价格)/.test(clauseFull(cl)));
  if(c3 && /(不得解除|不得退款|不返还|不得要求返还)/.test(clauseFull(c3))){
    const q = qFilter(c3, /(?:单方[^。；\n]{0,40}(?:录播|上调)|不得解除|不得要求返还)/) || qAny(c3, /(单方|解除|返还)/);
    addItem(ctx,{
      base:'R33',ruleId:'R33',verdict:'red',ruleName:'单方变更课程并排除解除退款',
      short:'直播改录播还不能退',clauseIndex:c3.index,location:clauseLabel(c3,c3.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'把直播课改为录播或者上调课程价款，属于未经同意变更服务实质内容。消费者可依第十二条要求经营者按照原约定履行并承担违约责任，而不是只能接受变更；合同又禁止解除和返还余额，相关限制可依第九条审查。',
      ask:'机构：课程形式和价格为什么可以单方变更？不同意为什么不能解除退款？',counter:'实质变更须经消费者同意；应按原约定履行并承担违约责任，同时删除排除解除和退款的格式条款。',
      basis:LAW.PREPAY12,confidence:'高',loss:0
    });
  }

  const c4 = ctx.clauses.find(cl => /(?:关闭|迁移|停业)[^。；\n]{0,26}(?:服务点|网点|场所)|改由[^。；\n]{0,26}(?:外省|跨省)/.test(clauseFull(cl)));
  if(c4 && /(余款不退|不退|放弃剩余)/.test(clauseFull(c4))){
    const q = qFilter(c4, /(?:关闭|迁移|停业)[^。；\n]{0,32}(?:服务点|网点|场所)|改由[^。；\n]{0,32}(?:外省|跨省)|余款不退/) || qAny(c4, /(余款|服务点|外省)/);
    addItem(ctx,{
      base:'R33',ruleId:'R33',verdict:'red',ruleName:'迁址或转第三方明显不便仍拒绝退款',
      short:'跨省迁址也不退余款',clauseIndex:c4.index,location:clauseLabel(c4,c4.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'关闭原服务点、改由外省合作方提供服务，即使消费者接受服务明显不便，也只允许转往新点或放弃剩余课时，余款不退；迁址或未经同意转第三方导致明显不便的，消费者可主张解除并核对未消费余额。',
      ask:'机构：迁址或转第三方后我明显不便，为什么不能解除并退余款？',counter:'允许消费者选择继续履行或解除；解除时按未消费课时退还余额，转第三方须经同意。',
      basis:LAW.PREPAY13,confidence:'高',loss:0
    });
  }

  const c5 = ctx.clauses.find(cl => /甲方违约[^。；\n]{0,24}(?:停课|停止提供)/.test(clauseFull(cl)) && /(虚列原价|提成|补足)/.test(clauseFull(cl)));
  if(c5){
    const t5 = clauseFull(c5);
    if(/虚列原价/.test(t5)){
      const q = qFilter(c5, /虚列原价/) || qAny(c5, /(原价|冲抵)/);
      addItem(ctx,{
        base:'R34',ruleId:'R34',verdict:'red',ruleName:'违约退款按虚列原价倒扣',
        short:'用虚列原价压低退款',clauseIndex:c5.index,location:clauseLabel(c5,c5.index),
        quote:q ? q.quote : '',range:q||null,
        consequence:'机构违约停课后，已上课程却按虚列原价倒扣，容易把应退余额压低；非因消费者原因退款时，已经提供的课程应当按照约定的优惠价或者优惠比例折算，虚列原价不能作为当然扣减依据。',
        ask:'机构：退款为什么按虚列原价而不是实际成交价核算？',counter:'按合同约定的优惠价或者优惠比例和已实际提供课时结算，列明计算过程。',
        basis:LAW.PREPAY18,confidence:'高',loss:0
      });
    }
    if(/提成/.test(t5)){
      const q = qFilter(c5, /提成/) || qAny(c5, /(提成|扣)/);
      addItem(ctx,{
        base:'R34',ruleId:'R34',verdict:'yellow',ruleName:'员工销售提成计入退款扣减',
        short:'退款还要扣销售提成',clauseIndex:c5.index,location:clauseLabel(c5,c5.index),
        quote:q ? q.quote : '',range:q||null,
        consequence:'销售人员的预付款提成属于经营者自身销售成本，不是消费者应负担的服务成本；从退款中扣除该提成不合理。',
        ask:'机构：销售提成为什么由消费者承担？对应哪项实际服务？',counter:'删除提成扣减；退款只扣已实际提供服务和合理成本。',
        basis:LAW.PREPAY15,confidence:'高',loss:0
      });
    }
    if(/余款不足[^。；\n]{0,16}(?:补足|另行补足)/.test(t5)){
      const q = qFilter(c5, /余款不足/) || qAny(c5, /(补足|余款)/);
      addItem(ctx,{
        base:'R34',ruleId:'R34',verdict:'red',ruleName:'退款不足反向要求消费者补足',
        short:'退款不够还要倒补钱',clauseIndex:c5.index,location:clauseLabel(c5,c5.index),
        quote:q ? q.quote : '',range:q||null,
        consequence:'机构违约停课导致退款不足时，还要求消费者另行补足，等于把经营者的违约风险和扣减结果转回消费者；该安排缺少合理依据。',
        ask:'机构：为什么机构停课退款不足还要我补钱？依据是什么？',counter:'删除反向补足条款；按实际服务结算，不足部分由经营者自行承担。',
        basis:LAW.PREPAY15,confidence:'高',loss:0
      });
    }
  }

  const c14 = ctx.clauses.find(cl => /课程补偿券/.test(clauseFull(cl)) && /(划扣|扣款|退款|结清)/.test(clauseFull(cl)));
  if(c14){
    const t14 = clauseFull(c14);
    if(/(从不|未|不)[^。；\n]{0,14}(?:返还|协助结清)/.test(t14) && /(划扣|扣款)/.test(t14)){
      const q = qFilter(c14, /课程补偿券/) || qAny(c14, /(补偿券|划扣)/);
      addItem(ctx,{
        base:'R34',ruleId:'R34',verdict:'red',ruleName:'课程券不能替代退款和贷款结清',
        short:'只发课程券，贷款继续扣',clauseIndex:c14.index,location:clauseLabel(c14,c14.index),
        quote:q ? q.quote : '',range:q||null,
        consequence:'培训机构只发课程补偿券，不向贷款人返还预付款也不协助结清，贷款平台仍按原计划划扣；课程券不等于退款，退款和贷款结清是两个流程，不能据此假设退课会自动停止扣款。以课程券替代退款并限制消费者退款权利，相关格式条款可依第九条审查。',
        ask:'机构：退课后贷款为什么还继续划扣？课程券如何折抵本金？',counter:'分别办理培训退款和贷款结清；向贷款人书面申请暂停或结清并保留证据，不能以课程券代替退款。',
        basis:LAW.PREPAY9,confidence:'高',loss:0
      });
    }
    if(/放弃其他退款请求/.test(t14)){
      const q = qFilter(c14, /放弃其他退款请求/) || qAny(c14, /(放弃|退款请求)/);
      addItem(ctx,{
        base:'R34',ruleId:'R34',verdict:'yellow',ruleName:'收到课程券即放弃其他退款请求',
        short:'收券就放弃退款权利',clauseIndex:c14.index,location:clauseLabel(c14,c14.index),
        quote:q ? q.quote : '',range:q||null,
        consequence:'约定收到课程补偿券即视为两类争议均已解决并放弃其他退款请求，属于用格式条款限制消费者主要权利；课程券到账也不能当然消灭贷款债务或全部退款请求权。该概括放弃条款可依第九条审查。',
        ask:'机构：为什么收券就视为放弃全部退款请求？',counter:'删除概括放弃条款；退款和贷款结清分别确认，保留消费者法定救济。',
        basis:LAW.PREPAY9,confidence:'中',loss:0
      });
    }
  }

  const c6 = ctx.clauses.find(cl => {
    const t = clauseFull(cl);
    return (/设备[^。；\n]{0,26}(?:人身伤害|人身损害)/.test(t) && /(不赔|不承担|免责)/.test(t))
      || (/故意[^。；\n]{0,12}重大过失[^。；\n]{0,30}(?:损坏|财产损失|电脑)/.test(t) && /(不赔|不承担|免责)/.test(t));
  });
  if(c6){
    const injuryQ = qFilter(c6, /设备[^。；\n]{0,26}(?:人身伤害|人身损害)/) || qAny(c6, /(人身伤害|不赔偿)/);
    if(injuryQ){
      addItem(ctx,{
        base:'R35',ruleId:'R35',verdict:'red',ruleName:'人身伤害免责无效',
        short:'设备致伤也不赔',clauseIndex:c6.index,location:clauseLabel(c6,c6.index),
        quote:injuryQ.quote,range:injuryQ,
        consequence:'线下补课中因经营者设备问题造成消费者人身伤害却约定一律不赔，属于造成对方人身损害的免责条款，依法无效；仍可主张相应赔偿责任。',
        ask:'机构：设备造成人身伤害为什么全部不赔？',counter:'删除人身伤害免责；按民法典和侵权责任规则承担。',
        basis:LAW.C506,confidence:'高',loss:0
      });
    }
    const propQ = qFilter(c6, /故意[^。；\n]{0,12}重大过失[^。；\n]{0,30}(?:损坏|财产损失|电脑)/) || qAny(c6, /(故意|重大过失|电脑)/);
    if(propQ){
      addItem(ctx,{
        base:'R35',ruleId:'R35',verdict:'red',ruleName:'故意或重大过失财产损失免责无效',
        short:'故意损坏也不赔',clauseIndex:c6.index,location:clauseLabel(c6,c6.index),
        quote:propQ.quote,range:propQ,
        consequence:'因经营者故意或重大过失损坏消费者自带电脑却约定不承担赔偿责任，属于因故意或者重大过失造成对方财产损失的免责条款，依法无效。',
        ask:'机构：故意或重大过失损坏我的电脑为什么也不赔？',counter:'删除该类免责；故意或重大过失造成财产损失应依法赔偿。',
        basis:LAW.C506,confidence:'高',loss:0
      });
    }
  }

  const c17 = ctx.clauses.find(cl => /(?:只能|仅能)[^。；\n]{0,24}(?:赴|到|前往)[^。；\n]{0,24}(?:两千公里|指定地点|外地)|距常住地[^。；\n]{0,14}(?:两千公里|公里)/.test(clauseFull(cl)) && /(不得|不允许)[^。；\n]{0,20}(?:投诉|起诉|行政|法院)/.test(clauseFull(cl)));
  if(c17){
    const q = qFilter(c17, /(?:只能|仅能)[^。；\n]{0,40}(?:两千公里|指定地点)|不得[^。；\n]{0,24}(?:投诉|起诉)/) || qAny(c17, /(申诉|投诉|起诉)/);
    addItem(ctx,{
      base:'R35',ruleId:'R35',verdict:'yellow',ruleName:'异地申诉前置并限制投诉起诉',
      short:'先跑两千公里再投诉',clauseIndex:c17.index,location:clauseLabel(c17,c17.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'要求消费者只能赴距常住地很远的指定地点线下申诉，不允许远程、邮寄或委托，并在投诉、起诉前设置前置障碍；这会不合理增加维权成本并限制投诉、诉讼等法定救济。',
      ask:'机构：为什么只能去远地线下申诉？为什么不能先向行政机关投诉或起诉？',counter:'删除异地申诉前置和限制投诉、起诉条款；提供远程、邮寄和委托等合理渠道。',
      basis:LAW.PREPAY9,confidence:'高',loss:0
    });
  }

  const c15 = ctx.clauses.find(cl => /人脸/.test(clauseFull(cl)) && /(短信验证码|验证码)/.test(clauseFull(cl)) && /(长期保留|永久保存|推广)/.test(clauseFull(cl)));
  if(c15){
    const q = qFilter(c15, /人脸/) || qAny(c15, /(人脸|验证码)/);
    const qPromo = qFilter(c15, /(?:长期保留|永久保存|推广)/) || q;
    addItem(ctx,{
      base:'R36',ruleId:'R36',verdict:'red',ruleName:'已有同等验证仍强制人脸',
      short:'有短信验证还强制人脸',clauseIndex:c15.index,location:clauseLabel(c15,c15.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'已经部署的一次性短信验证码能达到同等身份核验效果，却仍要求必须录入人脸模板才能上课，且不能单独选择；实现相同目的存在其他方式时，人脸识别不得作为唯一验证方式，应提供合理替代。',
      ask:'机构：短信验证码已经够用，为什么还强制人脸？不同意人脸能否上课？',counter:'提供短信验证等替代方式；人脸识别只在必要且取得单独同意时使用。',
      basis:LAW.FACE10,confidence:'高',loss:0
    });
    addItem(ctx,{
      base:'R36',ruleId:'R36',verdict:'yellow',ruleName:'人脸模板长期留存推广且无单独同意',
      short:'人脸长期留存做推广',clauseIndex:c15.index,location:clauseLabel(c15,c15.index),
      quote:qPromo ? qPromo.quote : '',range:qPromo||null,
      consequence:'签培训合同即概括授权采集人脸，模板由平台长期保留并用于以后推广课程；人脸属于敏感个人信息，处理目的、保存期限和必要性应单独说明并取得单独同意，概括授权不能替代。',
      ask:'机构：人脸模板保存多久？用于推广时如何单独取得我的同意？',counter:'明确保存期限和营销使用范围；敏感信息取得单独同意，并提供删除和替代验证渠道。',
      basis:LAW.PI28,confidence:'高',loss:0
    });
  }

  const c16 = ctx.clauses.find(cl => /合作商/.test(clauseFull(cl)) && /(姓名|手机号|学习记录)/.test(clauseFull(cl)) && /(交给|提供给|共享)/.test(clauseFull(cl)));
  if(c16){
    const q = qFilter(c16, /(?:合作商|学习记录|姓名|手机号)/) || qAny(c16, /(合作商|营销)/);
    addItem(ctx,{
      base:'R36',ruleId:'R36',verdict:'red',ruleName:'营销共享未披露接收方且无单独同意',
      short:'学习记录交给不明合作商',clauseIndex:c16.index,location:clauseLabel(c16,c16.index),
      quote:q ? q.quote : '',range:q||null,
      consequence:'为推销其他课程，把姓名、手机号、学习记录交给自行决定营销用途的合作商，却不告知合作商名称和联系方式，并以签署主合同概括视为同意；向第三方提供个人信息应告知接收方、目的、方式和信息种类并取得单独同意。',
      ask:'机构：合作商是谁？联系方式是什么？共享哪些学习记录、用于什么营销？',counter:'逐项告知接收方和处理目的并取得单独同意；提供拒绝和撤回渠道。',
      basis:LAW.PI23,confidence:'高',loss:0
    });
  }
}

function buildPending(ctx){
  const items = ctx.items;
  const has = re => items.some(it => re.test(it.ruleName || '') || re.test(it.short || ''));
  const list = [];
  const push = arr => (arr || []).forEach(p => { if(p && !list.includes(p) && list.length < 5) list.push(p); });
  const packs = ctx.packs && ctx.packs.length ? ctx.packs : [ctx.docType];
  packs.forEach(pack => {
    if(pack === 'labor'){
      if(has(/试用期/)) push(['用人单位所在地的最低工资标准（核对试用期工资是否另触最低线）']);
      if(has(/竞业/)) push(['你的岗位是否属于竞业限制适用人员，补偿标准怎么定']);
      if(has(/押金|保证金/)) push(['保证金是否已经实际交纳、有没有收据']);
      if(has(/加班|工时|调休/)) push(['公司实行标准工时、综合工时还是不定时工时？是否经过审批？']);
      if(has(/工资|绩效|扣款/)) push(['工资构成、绩效规则、发薪日与实际扣款记录']);
      if(has(/社保|公积金/)) push(['社保参保地、缴费基数和公积金缴存比例']);
      if(has(/年假|休假|病假|产假|婚育/)) push(['年假天数、病假工资和婚育假期与当地规定的对应关系']);
      if(has(/保密|成果归属|兼职/)) push(['保密信息范围、成果归属边界与个人作品例外']);
      if(has(/离职|交接|证明/)) push(['离职证明出具时间、工资结算日、档案和社保转移流程']);
      if(has(/合同文本|先签|空白|试用期后/)) push(['是否已拿到盖章的书面合同原件，空白处是否填写完整']);
      push(['公司是否另有培训协议、保密协议或补充协议（当前文本里没有）','合同主体名称是否与营业执照、录取通知一致']);
    }else if(pack === 'intern'){
      push(['学校是否统一购买实习责任保险或意外伤害保险','这是学校组织的顶岗实习，还是你自行联系的实习','实习补贴是否达到学校实习备案或协议模板的要求','这份实习是否实际按员工管理（考勤、绩效、固定工资）——可能被认定为劳动关系']);
    }else if(pack === 'loan'){
      const licensedClaim = /(持牌消费金融(?:机构|公司)?|消费金融(?:股份)?有限公司|消费金融公司)/.test(ctx.text);
      if(licensedClaim){
        push(['核实贷款人声称的持牌消费金融资质（以监管许可或工商信息为准）','签约日前是否已向借款人展示完整综合融资成本明示表','各项费用的收取主体、金额、频次与正常履约年化综合融资成本']);
      }else{
        push(['放款机构的全称与放贷资质（持牌机构与民间借贷适用的利率规则不同）','合同成立当月的一年期 LPR','含服务费的年化综合成本与提前结清规则']);
      }
      if(/(培训|课程|学员|直播课|录播)/.test(ctx.text)){
        push(['是否为首次购买相同培训服务，付款后七日内是否实际开课','迁址、转第三方或课程形式变更时，未消费课时余额如何退还','课程退款与贷款结清分别由谁办理、能否书面暂停划扣']);
      }
    }else if(pack === 'three-party'){
      push(['学校就业办对解约的办理要求与流程','单位能够证明的实际招聘支出','升学、考公、参军等情形是否可免责解约']);
    }else if(pack === 'probation' && !packs.includes('labor')){
      push(['这份文件的合同期限、试用期工资和转正工资（试用期规则需要这三项才能完整核对）']);
    }
  });
  if(!list.length) push(['合同主体、金额、附件和口头承诺仍要人工核对']);
  ctx.pending = list.slice(0,5);
}

function makeOneLiner(items,counts){
  const top = items.find(it => it.verdict !== 'green');
  let s;
  if(counts.red){
    s = `红线 ${counts.red} 处，最重的是「${top.short}」；先要求删改，再谈签不签。`;
  }else if(counts.yellow){
    s = `没有红线，但有 ${counts.yellow} 处不利条款，最重的是「${top.short}」；能谈，别默认接受。`;
  }else if(counts.gray){
    s = `没有明显红线；${counts.gray} 件事要确认，先看「${top.short}」。`;
  }else{
    s = `这 ${RULE_LIBRARY.length} 类规则没有扫到明显风险；金额、合同主体和附件仍要人工核对。`;
  }
  return s.length > 60 ? s.slice(0,58) + '…' : s;
}

function firstLinesOf(text, n){
  return String(text || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, n || 5).join('\n');
}
function hasLaborSignals(text, primaryKey){
  const t = String(text || '');
  const head = firstLinesOf(t, 5);
  if(/(不构成劳动关系|不属于劳动关系|实习关系|劳务关系)/.test(t) && !/劳动合同/.test(head)) return false;
  if(/劳动合同/.test(head)) return true;
  if(primaryKey === 'three-party' || hasThreePartySignals(text)) return false;
  if(/(甲方[（(]用人单位[）)]|乙方[（(]劳动者[）)])/.test(t)) return true;
  return /劳动者/.test(t) && /用人单位/.test(t) && /(工资|劳动报酬|社会保险|试用期|解除|离职|竞业限制|服务期)/.test(t);
}
function hasInternSignals(text){
  const t = String(text || '');
  const head = firstLinesOf(t, 5);
  if(/(实习协议|实习合同|实习协议书)/.test(head)) return true;
  if(/(实习单位|实习学生|实习生)/.test(t)) return true;
  return /实习/.test(head) && /(学校|补贴|实习证明|实习内容)/.test(t);
}
function hasLoanSignals(text){
  const t = String(text || '');
  if(/(培训贷|教育分期|分期贷款|培训分期|助学贷款|学费分期)/.test(t)) return true;
  return /(培训|教育|课程|学员|学费|技能)/.test(t) && /(分期|贷款|放款|还款|月供|平台服务费|征信)/.test(t);
}
function hasThreePartySignals(text){
  const t = String(text || '');
  const head = firstLinesOf(t, 5);
  if(/(三方协议|三方协议书|毕业生就业协议|就业协议书)/.test(head)) return true;
  return /毕业生/.test(head) && /学校/.test(t) && /用人单位/.test(t);
}
function resolveRulePacks(text, primaryKey){
  const packs = [];
  const add = key => { if(key && key !== 'other' && !packs.includes(key)) packs.push(key); };
  if(primaryKey === 'labor') add('labor');
  else if(primaryKey === 'intern') add('intern');
  else if(primaryKey === 'loan') add('loan');
  else if(primaryKey === 'three-party') add('three-party');
  else if(primaryKey === 'probation') add('probation');
  const laborSignals = hasLaborSignals(text, primaryKey);
  if(laborSignals) add('labor');
  const trialLike = /(试用期|试岗期|见习期|适应期)/.test(text);
  if(trialLike && (primaryKey !== 'intern' || laborSignals)) add('probation');
  if(primaryKey === 'other' && trialLike && !packs.length) add('probation');
  if(hasInternSignals(text)) add('intern');
  if(hasLoanSignals(text)) add('loan');
  if(hasThreePartySignals(text)) add('three-party');
  return packs;
}

function fmtPageList(list){
  if(!list || !list.length) return '';
  const parts = [];
  let start = list[0], prev = list[0];
  for(let i = 1; i <= list.length; i++){
    const n = list[i];
    if(n != null && n === prev + 1){ prev = n; continue; }
    parts.push(start === prev ? String(start) : `${start}-${prev}`);
    start = prev = n;
  }
  return parts.join('、');
}

function summarizePdfImport(pageTexts, options){
  const pages = Array.isArray(pageTexts) ? pageTexts : [];
  const maxPages = options && Number.isFinite(options.maxPages) ? options.maxPages : 80;
  const totalPages = options && Number.isFinite(options.totalPages) ? options.totalPages : pages.length;
  const readPages = [], unreadPages = [], skippedPages = [], parts = [];
  pages.forEach((page, i) => {
    const pageNo = i + 1;
    if(pageNo > maxPages){ skippedPages.push(pageNo); return; }
    const text = typeof page === 'string' ? page : (page && page.text) || '';
    if(text.trim().length >= 2){
      readPages.push(pageNo);
      parts.push(`【第 ${pageNo} 页】\n${text.trim()}`);
    }else{
      unreadPages.push(pageNo);
    }
  });
  for(let pageNo = pages.length + 1; pageNo <= totalPages; pageNo++){
    if(pageNo > maxPages) skippedPages.push(pageNo);
  }
  const text = parts.join('\n\n');
  const problems = [];
  if(!totalPages) problems.push('没有可读取的页面');
  if(unreadPages.length) problems.push(`第 ${fmtPageList(unreadPages)} 页没有可提取文字，可能是扫描页、图片页或空白页`);
  if(skippedPages.length) problems.push(`超过单次处理上限 ${maxPages} 页，第 ${fmtPageList(skippedPages)} 页未处理`);
  if(totalPages && !text) problems.push('整份文件没有提取到有效正文');
  const complete = totalPages > 0 && !unreadPages.length && !skippedPages.length;
  return {
    text,totalPages,maxPages,
    readPages,unreadPages,skippedPages,readPageCount:readPages.length,
    complete,
    problems,
    reason:problems.join('；')
  };
}

function buildScopeInfo(scope, importInfo){
  const raw = ['full','excerpt','unknown'].includes(scope) ? scope : 'unknown';
  const importIncomplete = !!(importInfo && (importInfo.unreadPages && importInfo.unreadPages.length || importInfo.skippedPages && importInfo.skippedPages.length || importInfo.complete === false));
  const key = raw === 'full' && importIncomplete ? 'unknown' : raw;
  const label = key === 'full' ? '全文' : key === 'excerpt' ? '条款摘录' : '范围未确认';
  let note = key === 'full'
    ? '已按全文范围审阅；必备条款缺项检查只针对已提供的文本。'
    : key === 'excerpt'
      ? '当前只审阅条款摘录，未做全文必备条款缺项检查。'
      : '未确认输入是否为完整合同，未做全文缺项检查；结果只覆盖已出现的条款。';
  if(importInfo && importInfo.totalPages){
    note += ` 本次导入共 ${importInfo.totalPages} 页，成功提取 ${importInfo.readPageCount != null ? importInfo.readPageCount : (importInfo.readPages || []).length} 页`;
    if(importInfo.unreadPages && importInfo.unreadPages.length) note += `；第 ${fmtPageList(importInfo.unreadPages)} 页未能提取文字`;
    if(importInfo.skippedPages && importInfo.skippedPages.length) note += `；第 ${fmtPageList(importInfo.skippedPages)} 页因超过处理上限未读取`;
    note += '。';
  }
  return {scope:key,label,note,full:key==='full',requested:raw,importInfo:importInfo||null};
}

function shouldAcceptInput(text, options){
  const t = String(text || '').trim();
  const opts = options || {};
  if(!t) return {accept:false,docKey:'other',reason:'没有可分析的文本'};
  const forced = opts.docType && DOC_LABEL[opts.docType] ? opts.docType : null;
  if(forced){
    return {accept:true,docKey:forced,forced:true,packs:resolveRulePacks(t, forced)};
  }
  const detected = detectDocType(t);
  const packs = resolveRulePacks(t, detected);
  if(packs.length) return {accept:true,docKey:detected === 'other' ? packs[0] : detected,packs};
  if(/(试用期|试岗期|见习期|适应期)/.test(t)) return {accept:true,docKey:'probation',packs:['probation']};
  if(looksLikeContract(t)) return {accept:true,docKey:detected,packs};
  return {accept:false,docKey:detected,packs,reason:'没有识别到劳动合同、实习、培训分期或三方协议条款。如果这是合同摘录，请先选择文档类型；如果是普通文本，请粘贴合同条款。'};
}

function analyzeContract(text, options){
  const clean = String(text).replace(/\r\n?/g,'\n').trim();
  const detectedKey = detectDocType(clean);
  const forcedKey = options && DOC_LABEL[options.docType] ? options.docType : null;
  let primaryKey = forcedKey || detectedKey;
  let packs = resolveRulePacks(clean, primaryKey);
  if(primaryKey === 'other' && packs.length){
    const promoted = packs.find(k => k === 'labor' || k === 'intern' || k === 'three-party' || k === 'loan' || k === 'probation');
    if(promoted){
      primaryKey = promoted;
      packs = resolveRulePacks(clean, primaryKey);
    }
  }
  const scopeInfo = buildScopeInfo(options && options.scope, options && options.importInfo);
  const ctx = {
    text:clean,
    clauses:extractClauses(clean),
    docType:primaryKey,
    detectedKey,
    packs,
    scope:scopeInfo.full ? 'full' : 'unknown',
    items:[],pending:[],seq:{},step:0
  };
  if(packs.includes('probation')){ runR1(ctx);runR2(ctx);runR3(ctx); }
  if(packs.includes('labor')){ runR4(ctx);runR5(ctx);runR6(ctx);runR7(ctx);runR11(ctx);runR12(ctx);runR13(ctx);runR14(ctx);runR15(ctx);runR16(ctx);runR17(ctx);runR18(ctx);runR19(ctx);runR21(ctx);runR22(ctx);runR23(ctx);runR24(ctx);runR25(ctx);runR26(ctx);runR27(ctx);runR28(ctx);runR29(ctx);runR30(ctx);runLaborGreens(ctx); }
  if(packs.includes('intern')){ runR10(ctx);runR27(ctx);runR29(ctx);runR30(ctx); }
  if(packs.includes('loan')){ runR9(ctx);runR20(ctx);runLoanConsumer(ctx); }
  if(packs.includes('three-party')){ runR8(ctx);runR29(ctx);runR30(ctx); }
  ctx.items.sort((a,b) => (VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]) || ((b.loss || 0) - (a.loss || 0)) || (a.seq - b.seq));
  const counts = {red:0,yellow:0,gray:0,green:0};
  ctx.items.forEach(it => counts[it.verdict]++);
  buildPending(ctx);
  const numbered = ctx.clauses.filter(cl => cl.numbered).length;
  const substantive = ctx.clauses.filter(cl => (cl.kind === 'clause' || cl.kind === 'body') && (cl.body || '').trim().length >= 6);
  const firstLine = clean.split('\n')[0].trim();
  const title = firstLine.length <= 30 && /(合同|协议)/.test(firstLine) && !/^第[一二三四五六七八九十百零〇\d]+条/.test(firstLine)
    ? firstLine
    : (DOC_LABEL[ctx.docType] || '协议');
  return {
    docKey:ctx.docType,
    docType:DOC_LABEL[ctx.docType] || '其他',
    detectedDocKey:detectedKey,
    detectedDocType:DOC_LABEL[detectedKey] || '其他',
    forced:!!forcedKey,
    packs:ctx.packs,
    packLabels:ctx.packs.map(k => PACK_LABEL[k]).filter(Boolean),
    extraPackLabels:ctx.packs.filter(k => k !== ctx.docType).map(k => PACK_LABEL[k]).filter(Boolean),
    title,
    clauses:ctx.clauses,
    numberedCount:numbered,
    clauseCount:substantive.length,
    charCount:clean.length,
    items:ctx.items,
    counts,
    pending:ctx.pending,
    scope:scopeInfo.scope,
    scopeInfo,
    importInfo:scopeInfo.importInfo,
    oneLiner:makeOneLiner(ctx.items,counts),
    topVerdict:counts.red ? 'red' : counts.yellow ? 'yellow' : counts.gray ? 'gray' : 'green',
    insufficient:substantive.length < 3
  };
}



function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function buildExportHTML(analysis){
  const now = new Date().toLocaleString('zh-CN',{hour12:false});
  const items = (analysis.items || []).map(it => `
    <article class="item v-${escapeHtml(it.verdict)}">
      <div class="item-top"><span class="tag">${escapeHtml(VERDICT_LABEL[it.verdict] || it.verdict)}</span><strong>${escapeHtml(it.ruleName)}</strong><span class="loc">${escapeHtml(it.location)}</span></div>
      <p class="cons"><b>最坏会发生：</b>${escapeHtml(it.consequence)}</p>
      ${it.quote ? `<p class="quote">原文：“${escapeHtml(it.quote)}”</p>` : ''}
      ${it.basis ? `<div class="basis"><b>依据：</b>${escapeHtml(it.basis.law)} ${escapeHtml(it.basis.article === '需核对' ? '（条文序号需核对）' : it.basis.article)}<br>${escapeHtml(it.basis.text)}</div>` : ''}
      ${it.ask ? `<p><b>问谁 · 问什么：</b>${escapeHtml(it.ask)}</p>` : ''}
      ${it.counter ? `<p><b>可以怎么改：</b>${escapeHtml(it.counter)}</p>` : ''}
      <p class="meta">规则 ${escapeHtml(it.ruleId)} · 把握：${escapeHtml(it.confidence)}</p>
    </article>`).join('');
  const pending = analysis.pending && analysis.pending.length ? `<section class="pending"><h2>还要确认 ${analysis.pending.length} 件事</h2><ol>${analysis.pending.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ol></section>` : '';
  const scope = analysis.scopeInfo || buildScopeInfo(analysis.scope, analysis.importInfo);
  const riskCount = (analysis.items || []).filter(it => it.verdict !== 'green').length;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>签约前风险提示 · ${escapeHtml(analysis.docType)}</title>
  <style>
    @page{margin:16mm 14mm}
    *{box-sizing:border-box}
    body{margin:0;color:#20251F;font-family:"Noto Serif SC","Songti SC","SimSun",serif;font-size:11pt;line-height:1.75}
    .head{border-bottom:1.5pt solid #20251F;padding-bottom:10pt;margin-bottom:12pt;display:flex;justify-content:space-between;align-items:flex-end;gap:20pt}
    h1{font-size:20pt;margin:0;letter-spacing:.06em}
    .sub{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:9pt;color:#5F6257;text-align:right;line-height:1.7}
    .one{font-size:13pt;font-weight:700;line-height:1.6;border-left:3pt solid #A33327;padding-left:8pt;margin:0 0 8pt}
    .counts{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:9.5pt;color:#5F6257;margin:0 0 8pt}
    .scope{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:9pt;color:#5F6257;border:0.6pt solid #DCD5C3;border-radius:3pt;padding:6pt 8pt;margin:0 0 14pt;line-height:1.65}
    .item{border:0.6pt solid #DCD5C3;border-left:2.5pt solid #777;border-radius:3pt;padding:8pt 10pt;margin:0 0 8pt;break-inside:avoid;page-break-inside:avoid}
    .item.v-red{border-left-color:#A33327}.item.v-yellow{border-left-color:#9A6E1E}.item.v-gray{border-left-color:#5F6B72}.item.v-green{border-left-color:#2F5A41}
    .item-top{display:flex;align-items:baseline;gap:6pt;flex-wrap:wrap;margin-bottom:4pt}
    .tag{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:8pt;border:0.6pt solid #C9C0AB;border-radius:2pt;padding:0 3pt;color:#5F6257}
    .item-top strong{font-size:11.5pt}
    .loc{margin-left:auto;font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:8pt;color:#5F6257}
    p{margin:3pt 0}
    .cons{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:9.5pt;line-height:1.7}
    .quote{color:#42483F;font-size:10pt;padding-left:7pt;border-left:1.5pt solid #DCD5C3}
    .basis{font-size:8.5pt;color:#5F6257;line-height:1.65;margin-top:4pt}
    .meta{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:8pt;color:#5F6257}
    .pending{border:0.6pt solid #DCD5C3;border-radius:3pt;padding:8pt 10pt;margin-top:12pt;break-inside:avoid}
    .pending h2{font-size:11pt;margin:0 0 4pt}
    .pending ol{margin:4pt 0 0 16pt;padding:0;font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:9pt;line-height:1.7}
    .foot{margin-top:14pt;border-top:0.6pt solid #DCD5C3;padding-top:7pt;font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;font-size:8pt;color:#5F6257;line-height:1.7}
    .brand{font-size:9pt;letter-spacing:.12em;color:#153B32}
  </style></head><body>
    <header class="head">
      <div><h1>签约前风险提示</h1><p class="brand">红笔 · 签字前 5 分钟</p></div>
      <div class="sub">${escapeHtml(analysis.docType)} · ${analysis.numberedCount || (analysis.clauses || []).length} 条 · 约 ${Number(analysis.charCount || 0).toLocaleString('zh-CN')} 字<br>应用规则：${escapeHtml((analysis.packLabels || []).join(' / '))}${analysis.forced ? '（手动指定类型）' : ''}<br>生成时间：${escapeHtml(now)}</div>
    </header>
    <p class="one">${escapeHtml(analysis.oneLiner)}</p>
    <p class="counts">红线 ${analysis.counts.red} · 黄线 ${analysis.counts.yellow} · 灰线 ${analysis.counts.gray} · 绿线 ${analysis.counts.green}${riskCount ? '' : ' · 本次规则未命中风险'}</p>
    <p class="scope"><b>审阅范围：${escapeHtml(scope.label)}。</b>${escapeHtml(scope.note)}</p>
    ${items || '<p>没有命中规则。</p>'}
    ${pending}
    <footer class="foot">以上为签约前风险提示，基于你提供的文本和你所在地区的通用规定，不构成法律意见。涉及金额较大或已产生争议，请拨打 12348 公共法律服务热线或联系学校法律援助中心。<br>本报告由本地规则引擎生成，未调用外部服务；规则匹配不能替代律师审阅。</footer>
  </body></html>`;
}

return {
  LAW,
  RULE_LIBRARY,
  SAMPLES,
  VERDICT_ORDER,
  VERDICT_LABEL,
  DOC_LABEL,
  PACK_LABEL,
  analyzeContract,
  resolveRulePacks,
  summarizePdfImport,
  buildScopeInfo,
  shouldAcceptInput,
  buildExportHTML,
  clauseLabel,
  detectDocType,
  extractClauses,
  looksLikeContract,
  guessTextKind,
  parseAmount,
  parsePercent,
  cnNum,
  fmtYuan,
  fmtWan,
  parseProbation,
  parseContractTerm,
  sentenceList,
  qFilter
};
});
