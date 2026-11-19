/* Red Pen rule engine: rules, samples and pure analysis functions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RedPenEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

const LAW = {
  L19:{law:'《中华人民共和国劳动合同法》',article:'第十九条',text:'劳动合同期限三个月以上不满一年的，试用期不得超过一个月；劳动合同期限一年以上不满三年的，试用期不得超过二个月；三年以上固定期限和无固定期限的劳动合同，试用期不得超过六个月。同一用人单位与同一劳动者只能约定一次试用期。以完成一定工作任务为期限的劳动合同或者劳动合同期限不满三个月的，不得约定试用期。试用期包含在劳动合同期限内。劳动合同仅约定试用期的，试用期不成立，该期限为劳动合同期限。'},
  L20:{law:'《中华人民共和国劳动合同法》',article:'第二十条',text:'劳动者在试用期的工资不得低于本单位相同岗位最低档工资或者劳动合同约定工资的百分之八十，并不得低于用人单位所在地的最低工资标准。'},
  L21:{law:'《中华人民共和国劳动合同法》',article:'第二十一条',text:'在试用期中，除劳动者有本法第三十九条和第四十条第一项、第二项规定的情形外，用人单位不得解除劳动合同。用人单位在试用期解除劳动合同的，应当向劳动者说明理由。'},
  L22:{law:'《中华人民共和国劳动合同法》',article:'第二十二条',text:'用人单位为劳动者提供专项培训费用，对其进行专业技术培训的，可以与该劳动者订立协议，约定服务期。劳动者违反服务期约定的，应当按照约定向用人单位支付违约金。违约金的数额不得超过用人单位提供的培训费用。用人单位要求劳动者支付的违约金不得超过服务期尚未履行部分所应分摊的培训费用。用人单位与劳动者约定服务期的，不影响按照正常的工资调整机制提高劳动者在服务期期间的劳动报酬。'},
  L23:{law:'《中华人民共和国劳动合同法》',article:'第二十三条',text:'用人单位与劳动者可以在劳动合同中约定保守用人单位的商业秘密和与知识产权相关的保密事项。对负有保密义务的劳动者，用人单位可以在劳动合同或者保密协议中与劳动者约定竞业限制条款，并约定在解除或者终止劳动合同后，在竞业限制期限内按月给予劳动者经济补偿。劳动者违反竞业限制约定的，应当按照约定向用人单位支付违约金。'},
  L24:{law:'《中华人民共和国劳动合同法》',article:'第二十四条',text:'竞业限制的人员限于用人单位的高级管理人员、高级技术人员和其他负有保密义务的人员。竞业限制的范围、地域、期限由用人单位与劳动者约定，竞业限制的约定不得违反法律、法规的规定。在解除或者终止劳动合同后，前款规定的人员到与本单位生产或者经营同类产品、从事同类业务的有竞争关系的其他用人单位，或者自己开业生产或者经营同类产品、从事同类业务的竞业限制期限，不得超过二年。'},
  L25:{law:'《中华人民共和国劳动合同法》',article:'第二十五条',text:'除本法第二十二条和第二十三条规定的情形外，用人单位不得与劳动者约定由劳动者承担违约金。'},
  L26:{law:'《中华人民共和国劳动合同法》',article:'第二十六条',text:'下列劳动合同无效或者部分无效：（一）以欺诈、胁迫的手段或者乘人之危，使对方在违背真实意思的情况下订立或者变更劳动合同的；（二）用人单位免除自己的法定责任、排除劳动者权利的；（三）违反法律、行政法规强制性规定的。对劳动合同的无效或者部分无效有争议的，由劳动争议仲裁机构或者人民法院确认。'},
  L37:{law:'《中华人民共和国劳动合同法》',article:'第三十七条',text:'劳动者提前三十日以书面形式通知用人单位，可以解除劳动合同。劳动者在试用期内提前三日通知用人单位，可以解除劳动合同。'},
  L09:{law:'《中华人民共和国劳动合同法》',article:'第九条',text:'用人单位招用劳动者，不得扣押劳动者的居民身份证和其他证件，不得要求劳动者提供担保或者以其他名义向劳动者收取财物。'},
  C585:{law:'《中华人民共和国民法典》',article:'第五百八十五条',text:'当事人可以约定一方违约时应当根据违约情况向对方支付一定数额的违约金，也可以约定因违约产生的损失赔偿额的计算方法。约定的违约金低于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以增加；约定的违约金过分高于造成的损失的，人民法院或者仲裁机构可以根据当事人的请求予以适当减少。当事人就迟延履行约定违约金的，违约方支付违约金后，还应当履行债务。'},
  C497:{law:'《中华人民共和国民法典》',article:'第四百九十七条',text:'有下列情形之一的，该格式条款无效：（一）具有本法第一编第六章第三节和本法第五百零六条规定的无效情形；（二）提供格式条款一方不合理地免除或者减轻其责任、加重对方责任、限制对方主要权利；（三）提供格式条款一方排除对方主要权利。'},
  C562:{law:'《中华人民共和国民法典》',article:'第五百六十二条',text:'当事人协商一致，可以解除合同。当事人可以约定一方解除合同的事由。解除合同的事由发生时，解除权人可以解除合同。'},
  C470:{law:'《中华人民共和国民法典》',article:'第四百七十条',text:'合同的内容由当事人约定，一般包括下列条款：（一）当事人的姓名或者名称和住所；（二）标的；（三）数量；（四）质量；（五）价款或者报酬；（六）履行期限、地点和方式；（七）违约责任；（八）解决争议的方法。'},
  LPR25:{law:'《最高人民法院关于审理民间借贷案件适用法律若干问题的规定》',article:'第二十五条',text:'出借人请求借款人按照合同约定利率支付利息的，人民法院应予支持，但是双方约定的利率超过合同成立时一年期贷款市场报价利率四倍的除外。前款所称“一年期贷款市场报价利率”，是指中国人民银行授权全国银行间同业拆借中心自2019年8月20日起每月发布的一年期贷款市场报价利率。'},
  R10:{law:'《职业学校学生实习管理规定》',article:'需核对',text:'该规定要求实习单位为学生投保实习责任保险；具体条文序号需核对原文。'}
};

const RULE_LIBRARY = [
  {id:'R1',name:'试用期期限',cite:'《劳动合同法》第十九条',gist:'3 个月–1 年最多 1 个月，1–3 年最多 2 个月，3 年以上最多 6 个月；同一单位只能约定一次。'},
  {id:'R2',name:'试用期工资',cite:'《劳动合同法》第二十条',gist:'不低于同岗位最低档工资或约定工资的 80%，且不低于当地最低工资。'},
  {id:'R3',name:'试用期解除',cite:'《劳动合同法》第二十一条',gist:'试用期解除也要说明理由，不能只写「不合格」了事。'},
  {id:'R4',name:'违约金法定情形',cite:'《劳动合同法》第二十五条',gist:'除服务期与竞业限制外，不得约定由劳动者承担违约金。'},
  {id:'R5',name:'服务期违约金上限',cite:'《劳动合同法》第二十二条',gist:'只能为有凭证的专项培训约定服务期，违约金不得超过培训费用，并按未履行部分分摊。'},
  {id:'R6',name:'竞业限制',cite:'《劳动合同法》第二十三条、第二十四条',gist:'限于高管、高技与负保密义务人员；期限不超过 2 年；须按月支付补偿。'},
  {id:'R7',name:'无效条款',cite:'《劳动合同法》第二十六条',gist:'免除单位法定责任、排除劳动者权利的条款无效，例如放弃社保、单方调岗降薪。'},
  {id:'R8',name:'三方协议违约金',cite:'《民法典》第五百八十五条',gist:'三方协议属民事协议，违约金一般有效；过分高于实际损失的可请求调减。'},
  {id:'R9',name:'培训贷与分期',cite:'民间借贷司法解释第二十五条',gist:'年利率含各项费用超过签约时一年期 LPR 四倍的部分不受保护；放款主体与退费规则要写清。'},
  {id:'R10',name:'实习协议保障',cite:'《职业学校学生实习管理规定》（条文序号需核对）',gist:'报酬、工时、意外险与解除条件要写清；缺意外伤害保险是常见缺口。'},
  {id:'R11',name:'押金与扣证',cite:'《劳动合同法》第九条',gist:'不得扣押身份证等证件，不得要求担保或以其他名义收取财物。'},
  {id:'R12',name:'解除与通知期',cite:'《劳动合同法》第三十七条',gist:'提前 30 日书面通知即可解除；试用期内提前 3 日通知。'}
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
const DOC_LABEL = {labor:'劳动合同',intern:'实习协议','three-party':'三方协议',loan:'培训贷'};
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
  let m = s.match(/试用期(?:限|期限|时间)?\s*(?:为|是|：|:|共)?\s*(\d{1,3}|[一二两三四五六七八九十]{1,4})\s*个?月/);
  if(m){
    const n = cnNum(m[1]);
    if(Number.isFinite(n) && n > 0) return n;
  }
  m = s.match(/试用期(?:限|期限|时间)?\s*(?:为|是|：|:|共)?\s*半年/);
  if(m) return 6;
  m = s.match(/试用期[^。；\n]{0,30}?(?:自\s*)?(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,12}?至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if(m){
    const d1 = new Date(+m[1], +m[2]-1, +m[3]);
    const d2 = new Date(+m[4], +m[5]-1, +m[6]);
    const months = Math.round((d2 - d1) / (1000*60*60*24*30.4375));
    if(months > 0) return months;
  }
  return null;
}
function parseTermMonths(text){
  const s = String(text || '');
  let m = s.match(/(?:自\s*)?(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,16}?至\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if(!m) m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})[\s\S]{0,12}?(?:至|到|—|-)[\s\S]{0,4}?(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if(m){
    const d1 = new Date(+m[1], +m[2]-1, +m[3]);
    const d2 = new Date(+m[4], +m[5]-1, +m[6]);
    const months = Math.round((d2 - d1) / (1000*60*60*24*30.4375));
    if(months > 0){
      const label = months >= 11.5 ? `${Math.max(1,Math.round(months/12))} 年` : `${Math.max(1,months)} 个月`;
      return {months,label};
    }
  }
  m = s.match(/(?:合同期限|合同期|劳动合同期限|期限|有效期)(?:为|是|：|:)?\s*([一二两三四五六七八九十\d]{1,3})\s*年/);
  if(m){
    const y = cnNum(m[1]);
    if(y > 0) return {months:y*12,label:`${y} 年`};
  }
  m = s.match(/(?:合同期限|合同期|劳动合同期限|期限|有效期)(?:为|是|：|:)?\s*([一二两三四五六七八九十\d]{1,3})\s*个?月/);
  if(m){
    const mo = cnNum(m[1]);
    if(mo > 0) return {months:mo,label:`${mo} 个月`};
  }
  return null;
}
function parseContractTerm(text){
  const t = String(text || '');
  const noFixed = t.split(/[。；\n]/).find(s => /无固定期限/.test(s) && /(本合同|合同期限|期限为|约定为|订立|签订)/.test(s) && !/(可以|可订立|协商|续订|再次|期满后)/.test(s));
  if(noFixed) return {months:9999,label:'无固定期限'};
  if(/以完成一定工作任务为期限/.test(t)) return {months:0,label:'以完成一定工作任务为期限'};
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
    const before = text.slice(Math.max(0, i-8), i);
    const atStart = i === 0 || /(^|\n)[ \t　]*$/.test(before) || /[。；][ \t　]*$/.test(before);
    if(!atStart) continue;
    const after = text.slice(i + m[0].length, i + m[0].length + 1);
    const afterFew = text.slice(i + m[0].length, i + m[0].length + 8);
    if(/[款项项目]/.test(after)) continue;
    if(!/[ \t　、：:．.]/.test(after) && /^(规定|约定|的约定|之规定|所称)/.test(afterFew)) continue;
    const lineEnd = text.indexOf('\n', i);
    const lineLen = (lineEnd < 0 ? text.length : lineEnd) - i;
    if(!/[ \t　、：:．.]/.test(after) && lineLen > 32) continue;
    add(i, m[0].length, 'article');
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
function addPending(ctx,list){
  (list || []).forEach(p => { if(p && !ctx.pending.includes(p)) ctx.pending.push(p); });
}

/* R1 试用期期限 */
function runR1(ctx){
  const c = ctx.clauses.find(cl => /试用期/.test(clauseFull(cl)) && parseProbation(clauseFull(cl)));
  if(!c) return;
  const prob = parseProbation(clauseFull(c));
  const term = parseContractTerm(ctx.text);
  const q = qAny(c,/(试用期[^。；\n]{0,40}?(?:个月|月))/) || qAny(c,/试用期/);
  const loc = clauseLabel(c,c.index);
  if(!term){
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'gray',ruleName:'试用期期限无法核对',
      short:`试用期 ${prob} 个月未对应期限`,clauseIndex:c.index,location:loc,
      quote:q ? q.quote : '',range:q,consequence:`约定试用期 ${prob} 个月，但文本里没有写合同期限；无法核对法定上限，先让 HR 把起止日期写清。`,
      ask:'HR：合同期限是多久？试用期为什么定这个长度？',counter:'写明合同起止日期，并按期限对应的上限改短试用期。',
      basis:LAW.L19,confidence:'中',loss:0
    });
    return;
  }
  const max = term.months < 3 ? 0 : term.months < 12 ? 1 : term.months < 36 ? 2 : 6;
  if(prob > max){
    const excess = prob - max;
    const cons = max === 0
      ? `合同期限约 ${term.label}，依法不得约定试用期，这里却写了 ${prob} 个月；这段期间应按正常工资标准支付。`
      : `合同期限约 ${term.label}，试用期上限 ${max} 个月，这里写了 ${prob} 个月；多出的 ${excess} 个月工资差额可主张补足。`;
    addItem(ctx,{
      base:'R1',ruleId:'R1',verdict:'red',ruleName:'试用期超过法定上限',
      short:`试用期超上限 ${excess} 个月`,clauseIndex:c.index,location:loc,
      quote:q ? q.quote : '',range:q,consequence:cons,
      ask:`HR：${term.label}合同为什么约定 ${prob} 个月试用期？`,counter:`按上限改为 ${max} 个月，并写明合同起止日期。`,
      basis:LAW.L19,confidence:'高',loss:0
    });
  }else{
    addGreen(ctx,c,'试用期期限',/试用期/,`试用期 ${prob} 个月，未超过约 ${term.label} 合同对应的上限。`);
  }
}

/* R2 试用期工资 */
function runR2(ctx){
  const probationClauses = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /试用期/.test(t) && (parseProbation(t) || /试用期[^。；\n]{0,16}(工资|月薪|薪资|报酬)|试用期[^。；\n]{0,30}(元|%|％|百分之)/.test(t));
  });
  if(!probationClauses.length) return;
  const salaryClauses = probationClauses.filter(cl => /(工资|薪资|月薪|报酬)/.test(clauseFull(cl)));
  const c = salaryClauses.find(cl => parseAmount(clauseFull(cl)) || parsePercent(clauseFull(cl)) || /(转正后|转正|正式)/.test(clauseFull(cl))) || salaryClauses[0] || probationClauses[0];
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
  const regMatch = full.match(/(?:转正后|转正|正式|录用后|合同约定)(?:工资|月薪|薪资|报酬)?\s*(?:为|按|是|：|:)?\s*(?:每月|月)?\s*(?:人民币)?\s*([\d,]+(?:\.\d+)?|[一二两三四五六七八九十百千万]+)\s*(?:元|千元|万元)/);
  let reg = regMatch ? parseAmount(regMatch[0]) : null;
  if(!reg){
    const globalReg = ctx.text.match(/(?:转正后|转正|正式|录用后)(?:工资|月薪|薪资|报酬)?\s*(?:为|按|是|：|:)?\s*(?:每月|月)?\s*(?:人民币)?\s*([\d,]+(?:\.\d+)?|[一二两三四五六七八九十百千万]+)\s*(?:元|千元|万元)/);
    if(globalReg) reg = parseAmount(globalReg[0]);
  }
  const q = qAny(c,/(试用期[^。；\n]{0,40}(?:元|%|％|百分之[一二两三四五六七八九十百]+|[一二两三四五六七八九十]+成))/)
    || qAny(c,/(试用期[^。；\n]{0,40}(?:工资|薪资|月薪|报酬))/)
    || qAny(c,/试用期/);
  const loc = clauseLabel(c,c.index);
  const months = parseProbation(ctx.text);
  const floor = reg != null ? reg * 0.8 : null;
  const amountTooLow = probPay != null && floor != null && probPay < floor - 0.5;
  const percentTooLow = probPercent != null && probPercent < 80;

  if(amountTooLow || percentTooLow){
    const diff = amountTooLow ? floor - probPay : 0;
    const cons = amountTooLow
      ? `转正工资 ${fmtYuan(reg)} 元，试用期最低应 ${fmtYuan(floor)} 元；现按 ${fmtYuan(probPay)} 元发，每月少 ${fmtYuan(diff)} 元${months ? `，合同写的 ${months} 个月共少 ${fmtYuan(diff*months)} 元` : ''}${percentTooLow ? `。条款还另写了 ${probPercent}% 的比例，低于 80% 下限` : ''}。`
      : `合同把试用期工资写成转正工资的 ${probPercent}%${reg ? `（法定下限 ${fmtYuan(floor)} 元/月）` : ''}，低于法定 80% 下限${probPay != null ? `；虽然另写了 ${fmtYuan(probPay)} 元，但按低比例执行的风险仍在` : ''}。`;
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
    addGreen(ctx,c,'试用期工资',/(试用期[^。；\n]{0,40}元)/,`试用期工资 ${fmtYuan(probPay)} 元，不低于转正工资 ${fmtYuan(reg)} 元的 80%（${fmtYuan(floor)} 元）。`);
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

  if(reg){
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
}

/* R3 试用期解除 */
function runR3(ctx){
  const matches = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /试用期/.test(t) && /(解除|辞退|终止|不予录用)/.test(t) &&
      /(不合格|不符合录用条件|不能胜任|考核不通过|考核不合格)/.test(t) &&
      !/(?:^|[^无])(?:应|需|必须|要)[^。；\n]{0,4}说明理由/.test(t);
  });
  matches.forEach(c => {
    const t = clauseFull(c);
    const explicit = /(无需|无须|不需|不必|不用)[^。；\n]{0,4}理由|不(?:再|另行)?说明理由/.test(t);
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
  const penaltyRe = /(违约金|赔偿|罚款|扣除[^。；\n]{0,8}工资)/;
  const exitRe = /(提前(?:离职|辞职|解除|终止)|未满[^。；\n]{0,12}(?:离职|辞职|解除)|擅自(?:离职|辞职|离岗)|(?:辞职|离职)[^。；\n]{0,24}(?:违约金|赔偿|罚款|扣除|扣发)|(?:违约金|赔偿|罚款|扣除|扣发)[^。；\n]{0,16}(?:辞职|离职)|(?:乙方|劳动者)[^。；\n]{0,8}解除[^。；\n]{0,6}(?:合同|协议|劳动关系))/;
  const legalRe = /(服务期|专项培训|竞业限制|竞业|保密协议)/;
  const hits = [];
  ctx.clauses.forEach(c => {
    if(!penaltyRe.test(clauseFull(c))) return;
    const sentences = sentenceList(c.body || '');
    for(const s of sentences){
      if(legalRe.test(s.quote)) continue;
      if(!penaltyRe.test(s.quote) || !exitRe.test(s.quote)) continue;
      hits.push({clause:c, sentence:s});
      break;
    }
  });
  hits.forEach(({clause:c, sentence:s}) => {
    const pm = penaltyRe.exec(s.quote);
    const q = pm
      ? {quote:clipQuote(s.quote, pm.index, pm.index + pm[0].length), raw:s.quote, start:s.start, end:s.end}
      : {quote:clipQuote(s.quote, 0, 1), raw:s.quote, start:s.start, end:s.end};
    const amt = maxAmountAfter(s.quote, /(违约金|赔偿|罚款|扣除)/) ?? parseAmount(s.quote);
    const deduct = /(扣除|扣减|扣发)[^。；\n]{0,12}(工资|薪资)/.test(s.quote);
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
}

/* R5 服务期违约金 */
function runR5(ctx){
    const feeM = ctx.text.match(/培训费(?:用)?(?:共计|合计|总计|为|是|：|:)?[^。；\n]{0,24}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
  const fee = feeM ? parseAmount(feeM[0]) : null;
  const matches = ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return /服务期/.test(t) && /(违约金|赔偿)/.test(t) && /(提前|离职|解除|未满|违反)/.test(t);
  });
  matches.forEach(c => {
    const q = qAny(c,/(服务期|违约金|赔偿)/);
    const penSentence = sentenceOf(c.body,/(违约金|赔偿)/);
    let penalty = null;
    if(penSentence){
      const raw = penSentence.quote;
      const penM = raw.slice(Math.max(0, raw.search(/(违约金|赔偿)/))).match(/(违约金|赔偿)[^。；\n]{0,24}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
      if(penM) penalty = parseAmount(penM[2] + penM[3]);
    }
    if(penalty == null) penalty = parseAmount(c.body);
    if(penalty == null && penSentence && fee){
      const mult = penSentence.quote.match(/([一二两三四五六七八九十\d]+)\s*倍/);
      const n = mult ? cnNum(mult[1]) : NaN;
      if(Number.isFinite(n) && n > 0) penalty = fee * n;
    }
    const loc = clauseLabel(c,c.index);
    if(!fee){
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'red',ruleName:'服务期缺少专项培训依据',
        short:'服务期缺培训费依据',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`写了服务期违约金${penalty ? ` ${fmtYuan(penalty)} 元` : ''}，但文本里没有专项培训费用；公司拿不出培训费凭证时，这笔钱没有依据，但离职时你可能先被索赔。`,
        ask:'HR：专项培训费用是多少？有发票或支付凭证吗？',counter:'删除服务期违约金，或按实际培训费用写明并只按未履行部分分摊。',
        basis:LAW.L22,confidence:'中',loss:penalty || 0
      });
    }else if(penalty && penalty > fee){
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'red',ruleName:'服务期违约金超过培训费',
        short:'服务期违约金超培训费',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`服务期违约金 ${fmtYuan(penalty)} 元，高于 ${fmtYuan(fee)} 元培训费；超过部分以及未履行期限之外的分摊，可以拒绝承担。`,
        ask:'HR：培训费凭证和分摊算法能提供吗？',counter:'把违约金上限写成实际培训费用，按未履行期限分摊。',
        basis:LAW.L22,confidence:'高',loss:penalty
      });
    }else{
      addItem(ctx,{
        base:'R5',ruleId:'R5',verdict:'yellow',ruleName:'服务期约束',
        short:'服务期与培训费挂钩',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`服务期与 ${fmtYuan(fee)} 元培训费挂钩；签了就要在服务期内受约束，违约金最多按未履行部分分摊。`,
        ask:'HR：服务期多久？培训费凭证和分摊算法能提供吗？',counter:'写明培训费总额与凭证，并约定按未履行期限分摊。',
        basis:LAW.L22,confidence:'中',loss:penalty || 0
      });
    }
  });
}

/* R6 竞业限制 */
function runR6(ctx){
    const matches = ctx.clauses.filter(cl => /竞业/.test(clauseFull(cl)) && /(限制|禁止|不得|义务)/.test(clauseFull(cl)));
  if(!matches.length) return;
  const durM = ctx.text.match(/(?:竞业限制(?:期限|期)?|竞业期限|限制期限|离职后|离职之日起)[^。；\n]{0,26}?([一二两三四五六七八九十\d]{1,3})\s*(年|个月|月)/)
    || ctx.text.match(/([一二两三四五六七八九十\d]{1,3})\s*(年|个月|月)[^。；\n]{0,16}内?[^。；\n]{0,10}(?:不得|不能|禁止)[^。；\n]{0,10}(?:竞业|同类|竞争)/);
  const durNum = durM ? cnNum(durM[1]) : null;
  const durMonths = durNum && Number.isFinite(durNum) ? (durM[2] === '年' ? durNum * 12 : durNum) : null;
  const negCompGlobal = /(无需|不需|不用|不予|不支付|不再支付|没有|无)[^。；\n]{0,14}(经济补偿|补偿)/.test(ctx.text)
    || /(经济补偿|补偿)[^。；\n]{0,10}(没有|不支付|不予|无需)/.test(ctx.text);
  const compMention = /(竞业|离职后|限制期)[^。；\n]{0,40}(经济补偿|补偿)|(经济补偿|补偿)[^。；\n]{0,40}(竞业|离职后|限制期)/.test(ctx.text);
  const hasComp = compMention && !negCompGlobal;
  matches.forEach(c => {
    const q = qAny(c,/(竞业限制|竞业|经济补偿|补偿|不得从事)/);
    const loc = clauseLabel(c,c.index);
    if(durMonths && durMonths > 24){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'red',ruleName:'竞业限制超过两年上限',
        short:'竞业限制超过 2 年',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`竞业限制约 ${durMonths} 个月，超过法定 2 年上限；多出的 ${Math.ceil(durMonths/12)-2} 年约定不受支持，但可能吓退下家${!hasComp ? '，且没有写补偿' : ''}。`,
        ask:'HR：竞业限制为什么超过 2 年？范围包括哪些公司？',counter:'期限改为不超过 2 年，范围列明具体竞品，按月支付补偿。',
        basis:LAW.L24,confidence:'高',loss:0
      });
    }else if(!hasComp){
      addItem(ctx,{
        base:'R6',ruleId:'R6',verdict:'gray',ruleName:'竞业限制未约定补偿',
        short:'竞业限制没有补偿',clauseIndex:c.index,location:loc,
        quote:q ? q.quote : '',range:q||null,consequence:`离职后${durMonths ? ` ${durMonths} 个月内` : '竞业期内'}不能去同类公司，合同没写按月补偿；公司不付补偿时你可主张不受限制，但要先发函或申请仲裁确认。`,
        ask:'HR：竞业补偿按什么标准、离职后怎么发？',counter:'离职时另签竞业协议；按月补偿，期限不超过 2 年，范围写明具体竞品。',
        basis:LAW.L23,confidence:durMonths ? '高' : '中',loss:0
      });
    }else{
      addGreen(ctx,c,'竞业限制',/(竞业|补偿)/,`竞业限制${durMonths ? ` ${durMonths} 个月` : ''}并约定补偿，属常规安排；仍需确认你是否属于应签人员。`);
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
  const injuryRe = /(工伤|因工受伤|工伤事故)[^。；\n]{0,16}(自负|自理|自行承担|不负责|不承担|概不负责)/;
  ctx.clauses.filter(cl => injuryRe.test(clauseFull(cl))).forEach(c3 => {
    const q = qAny(c3, /(工伤|自负|自理|不承担)/);
    addItem(ctx,{
      base:'R7',ruleId:'R7',verdict:'red',ruleName:'工伤责任自负（无效）',
      short:'工伤责任自负',clauseIndex:c3.index,location:clauseLabel(c3,c3.index),
      quote:q ? q.quote : '',range:q||null,consequence:'公司把工伤责任推给你；这类免除单位法定责任的约定无效，但真出事时医疗费可能先由你垫付，再走认定和追偿。',
      ask:'HR：工伤申报和医疗费垫付由谁负责？',counter:'删除工伤自负条款，按工伤保险规定处理。',
      basis:LAW.L26,confidence:'高',loss:0
    });
  });
}

/* R8 三方协议违约金 */
function runR8(ctx){
    const studentSide = s => {
    const x = s.replace(/违约金/g, '赔偿金');
    return /(任何一方|双方)[^。；\n]{0,8}(违约|解约|解除)/.test(x)
      || /(乙方|学生|毕业生|本人)[^。；\n]{0,20}(提前(?:解除|离职|终止)|解约|违约|擅自|未按期|未按|不报到|拒绝|违反)/.test(x);
  };
  const skipRe = /不得(?:约定|要求)|无权|无效|不承担/;
  const employerSide = s => {
    const x = s.replace(/违约金/g, '赔偿金');
    return /(甲方|用人单位)[^。；\n]{0,12}(违约|违反)[^。；\n]{0,20}(向|给)?[^。；\n]{0,8}(乙方|学生|毕业生)/.test(x)
      && !/(乙方|学生|毕业生)[^。；\n]{0,12}(违约|解约|违反)/.test(x);
  };
  ctx.clauses.filter(cl => /违约金/.test(clauseFull(cl))).forEach(c => {
    let q = qFilter(c, /违约金/, s => skipRe.test(s) || employerSide(s) || !studentSide(s));
    if(!q && c.heading && /(乙方|学生|毕业生|任何一方)/.test(c.heading)
      && !sentenceList(c.body || '').some(s => employerSide(s.quote) || skipRe.test(s.quote))) q = qAny(c, /违约金/);
    if(!q) return;
    const amt = maxAmountAfter(q.raw || q.quote, /违约金/) ?? parseAmount(q.raw || q.quote);
    addItem(ctx,{
      base:'R8',ruleId:'R8',verdict:'yellow',ruleName:'三方协议解约违约金',
      short:amt ? `${fmtWan(amt)}解约违约金` : '三方解约违约金',clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:q.quote,range:q,consequence:amt
        ? `解约时单位可主张 ${fmtYuan(amt)} 元违约金；三方协议属民事约定，一般有效，若远超单位实际支出可请求调减（司法实践常以实际损失的 30% 作为参考），但你要先应对违约主张。`
        : '写了违约金但没有金额；解约时单位可能按实际损失索赔，金额和计算方式要让它写明。',
      ask:'就业办或单位：这笔违约金对应哪些实际损失？',counter:'把违约金降到有据可查的实际招聘支出，并写明解约流程。',
      basis:LAW.C585,confidence:'高',loss:amt || 0
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
function runR9(ctx){
    const feeSent = sentenceList(ctx.text).find(s => /(培训费|学费|课程费|教育服务费|总费用)/.test(s.quote) && parseAmount(s.quote) != null);
  const principal = feeSent ? parseAmount(feeSent.quote) : null;
  let payClauses = ctx.clauses.filter(cl => /(分\s*[一二两三四五六七八九十\d]{1,3}\s*期|每期(?:还款|应还|支付)?|月供|每月还款|还款计划)/.test(clauseFull(cl)));
  if(!payClauses.length){
    payClauses = ctx.clauses.filter(cl => /(分期|贷款|借款|放款)/.test(clauseFull(cl))).slice(0,1);
  }
  let primaryPay = null, primaryQ = null, primaryTotal = null;
  payClauses.forEach(cPay => {
    const t = clauseFull(cPay);
    let periods = null, per = null, feePer = null, perTotal = null, total = null, over = null;
    let m = t.match(/(?:分|共)?\s*([一二两三四五六七八九十\d]{1,3})\s*期/);
    if(m){ const n = cnNum(m[1]); if(Number.isFinite(n)) periods = n; }
    m = t.match(/(?:每期还款|每期应还|每期支付|每月还款|月供|每期)[^。；\n]{0,14}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
    if(m) per = parseAmount(m[0]);
    m = t.match(/(?:平台服务费|服务费|管理费|手续费)[^。；\n]{0,16}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/)
      || t.match(/([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)[^。；\n]{0,8}(?:平台服务费|服务费|管理费|手续费)/);
    if(m) feePer = parseAmount(m[0]);
    m = t.match(/(?:还款总额|共还|共计还款|总还款)[^。；\n]{0,14}?([\d,]+(?:\.\d+)?)\s*(万元|万|千元|千|元)/);
    if(m) total = parseAmount(m[0]);
    if(per != null) perTotal = per + (feePer || 0);
    if(!total && periods && perTotal) total = periods * perTotal;
    if(total && principal && total > principal) over = total - principal;
    const q = qFilter(cPay,/(平台服务费|服务费|管理费|分期|每期|月供)/) || qAny(cPay,/(分期|每期|月供)/);
    const cons = periods && perTotal
      ? `分 ${periods} 期、每期 ${fmtYuan(perTotal)} 元，共还 ${fmtYuan(total)} 元${over ? `，比 ${fmtYuan(principal)} 元本金多 ${fmtYuan(over)} 元` : ''}；放款主体和年化成本没写清。`
      : '把培训费拆成分期贷款，但没写清放款主体和年化综合成本；签了之后还款义务先落在你身上。';
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'分期贷款与信息披露',
      short:over ? `${periods} 期多付 ${fmtYuan(over)} 元` : '分期贷款信息不清',clauseIndex:cPay.index,location:clauseLabel(cPay,cPay.index),
      quote:q ? q.quote : '',range:q||null,consequence:cons,
      ask:'机构：放款人是谁？含服务费的年化综合成本是多少？',counter:'把放款主体、年化成本、提前结清和退费写进同一份协议。',
      basis:LAW.LPR25,confidence:periods && per ? '高' : '中',loss:over || 0
    });
    if(over && !primaryPay){ primaryPay = cPay; primaryQ = q; primaryTotal = {over,total,periods,perTotal}; }
  });
  if(primaryPay){
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'gray',ruleName:'利率是否超过司法上限',
      short:'利率可能超 LPR 四倍',clauseIndex:primaryPay.index,location:clauseLabel(primaryPay,primaryPay.index),
      quote:primaryQ ? primaryQ.quote : '',range:primaryQ||null,consequence:`按合同数字共多付 ${fmtYuan(primaryTotal.over)} 元；是否超过签约时一年期 LPR 四倍，要拿签约当月 LPR 和真实年化核算。`,
      ask:'签约当月一年期 LPR 是多少？真实年化多少？',counter:'要求按不高于 LPR 四倍重算，并写明年化综合成本。',
      basis:LAW.LPR25,confidence:'中',loss:primaryTotal.over
    });
  }
  ctx.clauses.filter(cl => /(逾期|罚息|滞纳金)/.test(clauseFull(cl)) && /(违约金|罚息|滞纳金)/.test(clauseFull(cl))).forEach(cP => {
    const q = qFilter(cP,/(逾期|罚息|滞纳金|违约金)/);
    const src = q ? q.raw : cP.body;
    const {rate,daily,monthly} = parseRate(src);
    if(rate != null){
      addItem(ctx,{
        base:'R9',ruleId:'R9',verdict:'yellow',ruleName:'逾期违约金过高',
        short:`逾期${daily ? '日息' : monthly ? '月' : ''} ${rate}%`,clauseIndex:cP.index,location:clauseLabel(cP,cP.index),
        quote:q ? q.quote : '',range:q||null,consequence:`逾期${daily ? '一天' : ''}加收未还金额的 ${rate}%${daily ? `，30 天就是 ${+(rate*30).toFixed(2)}%` : ''}；这笔违约金可请求调减，但催收和征信影响会先发生。`,
        ask:`机构：逾期违约金为什么按${daily ? '日 ' : ''}${rate}% 计？`,counter:'改为不超过 LPR 四倍折算的逾期利率，删除开口的费用条款。',
        basis:LAW.C585,confidence:'高',loss:0
      });
    }else{
      addItem(ctx,{
        base:'R9',ruleId:'R9',verdict:'gray',ruleName:'逾期费用未写上限',
        short:'逾期费用没写清',clauseIndex:cP.index,location:clauseLabel(cP,cP.index),
        quote:q ? q.quote : '',range:q||null,consequence:'写了逾期要收费，但没有写清比例或上限；一旦晚还，费用可能越滚越大，必须在签约前问明。',
        ask:'机构：逾期一天收多少？有没有封顶？',counter:'写明逾期利率和上限，且不超过司法保护范围。',
        basis:LAW.C585,confidence:'中',loss:0
      });
    }
  });
  ctx.clauses.filter(cl => /(不予退还|不退)/.test(clauseFull(cl)) || /(剩余|未付|未还)[^。；\n]{0,20}一次性结清/.test(clauseFull(cl))).forEach(cR => {
    const q = qAny(cR,/(不予退还|不退|一次性结清)/);
    addItem(ctx,{
      base:'R9',ruleId:'R9',verdict:'gray',ruleName:'退费与解约限制',
      short:'开课后不退费',clauseIndex:cR.index,location:clauseLabel(cR,cR.index),
      quote:q ? q.quote : '',range:q||null,consequence:`开课后不退费${/一次性结清/.test(cR.body) ? '，退学还要一次性结清剩余分期' : ''}；这类格式条款是否有效要看培训实际履行情况，退不成时先固定课时与服务证据。`,
      ask:'机构：开课前、开课后分别怎么退？剩余分期能否停止？',counter:'写明按已上课时比例退费；退学后未发生的贷款停止计息。',
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
    const feeRe = /(押金|保证金|抵押金|担保金|风险金|服装费|工装费|体检费|培训费|管理费|建档费|报名费|设备费|工具费|资料费)/;
  const payRe = /(交纳|缴纳|收取|交付|支付|交|扣)/;
  const employerPayRe = /(甲方|公司|用人单位)[^。；\n]{0,12}(承担|支付|提供|报销)/;
  ctx.clauses.filter(cl => {
    const t = clauseFull(cl);
    return feeRe.test(t) && payRe.test(t) && !employerPayRe.test(t);
  }).forEach(cDep => {
    const t = clauseFull(cDep);
    const kindM = t.match(feeRe);
    const kind = kindM ? kindM[1] : '费用';
    const deposit = /押金|保证金|抵押金|担保金|风险金/.test(kind);
    const amt = amountNear(cDep.body, feeRe);
    const q = qFilter(cDep, /(押金|保证金|抵押金|担保金|风险金|服装费|工装费|体检费|培训费|管理费|建档费|报名费|设备费|工具费|资料费|交纳|缴纳|收取)/) || qAny(cDep, feeRe);
    addItem(ctx,{
      base:'R11',ruleId:'R11',verdict:'red',ruleName:deposit ? '向劳动者收取押金或保证金' : '以其他名义向劳动者收费',
      short:amt ? `${fmtWan(amt)}${kind}` : `收取${kind}`,clauseIndex:cDep.index,location:clauseLabel(cDep,cDep.index),
      quote:q ? q.quote : '',range:q||null,consequence:deposit
        ? `入职先交 ${amt ? fmtYuan(amt) + ' 元' : ''}${kind}；离职时可能以各种理由不退，向劳动者收这笔钱本身不合法，追回要凭收据并投诉。`
        : `入职先交 ${amt ? fmtYuan(amt) + ' 元' : ''}${kind}；以其他名义向劳动者收费同样被禁止，这笔钱可能退不回来。`,
      ask:`HR：这笔${kind}依据什么规定收取？`,counter:`删除收取${kind}的条款；已交的出具收据并无条件退还。`,
      basis:LAW.L09,confidence:'高',loss:amt || 0
    });
  });
  const idRe = /(扣押|扣留|收走|收缴|保管)/;
  const certRe = /(身份证|毕业证|学位证|学历证|资格证|证件|证书)/;
  const keepCopyRe = /(乙方|本人)[^。；\n]{0,8}(自行|自己)[^。；\n]{0,4}保管|复印件|扫描件|影印件/;
  ctx.clauses.filter(cl => idRe.test(clauseFull(cl)) && certRe.test(clauseFull(cl))).forEach(cId => {
    const q = qFilter(cId, /(扣押|扣留|收走|收缴|保管|原件)/, keepCopyRe);
    if(!q) return;
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
  ctx.clauses.filter(cl => /提前[^。；\n]{0,10}(日|天|个?工作日|个月|月|周|星期)/.test(clauseFull(cl)) && noticeRe.test(clauseFull(cl))).forEach(c => {
    let found = null;
    sentenceList(c.body || '').forEach(s => {
      const re = /提前\s*([一二两三四五六七八九十百零〇\d]{1,4})\s*(个?工作日|日|天|个月|月|周|星期)/g;
      let m;
      while((m = re.exec(s.quote))){
        const n = cnNum(m[1]);
        if(!Number.isFinite(n)) continue;
        let days = n;
        if(m[2] === '个月' || m[2] === '月') days = n * 30;
        else if(m[2] === '周' || m[2] === '星期') days = n * 7;
        else if(m[2] === '工作日' || m[2] === '个工作日') days = Math.round(n * 7 / 5);
        if(days <= 30) continue;
        const subject = subjectOf(s.quote, c.heading, m.index);
        if(subject === 'employer') continue;
        if(subject === 'unknown' && !employeeLeaningRe.test(s.quote)) continue;
        if(!found || days > found.days){
          const ms = m.index;
          found = {days, quote:clipQuote(s.quote, ms, ms + m[0].length), raw:s.quote, start:s.start, end:s.end};
        }
      }
    });
    if(!found) return;
    addItem(ctx,{
      base:'R12',ruleId:'R12',verdict:'gray',ruleName:'离职通知期高于法定 30 天',
      short:`${found.days} 天离职通知期`,clauseIndex:c.index,location:clauseLabel(c,c.index),
      quote:found.quote,range:found,consequence:`合同要求你提前 ${found.days} 天通知离职，高于法定的 30 天；多出的时间可能拖住下家和入职，超出部分是否有效要个案判断。`,
      ask:'HR：这条通知期能否按法定 30 天执行？',counter:'改为提前 30 日书面通知，试用期内提前 3 日。',
      basis:LAW.L37,confidence:'中',loss:0
    });
  });
}

/* greens（劳动合同） */
function runLaborGreens(ctx){
  const cHours = ctx.clauses.find(cl => /(标准工时制|每日工作\s*8\s*小时|每周工作\s*40\s*小时)/.test(clauseFull(cl)));
  addGreen(ctx,cHours,'工作时间',/(标准工时制|每日工作|每周工作)/,'标准工时、每日 8 小时与每周 40 小时已写明。');
  const socialRed = ctx.items.some(it => it.ruleName === '放弃社保（无效）');
  if(!socialRed){
    const cSocial = ctx.clauses.find(cl => /(缴纳(社会保险|社保)|社会保险)/.test(clauseFull(cl)) && !/(放弃|不缴|自理|自行承担)/.test(clauseFull(cl)));
    addGreen(ctx,cSocial,'社会保险',/(社会保险|社保)/,'约定依法缴纳社会保险，属常规条款。');
  }
  const cDuty = ctx.clauses.find(cl => /(岗位|工作地点)/.test(clauseFull(cl)) && !/(调整|变更|违约金|试用期|保证金|押金)/.test(clauseFull(cl)));
  addGreen(ctx,cDuty,'岗位与工作地点',/(岗位|工作地点)/,'岗位与工作地点明确。');
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
      push(['公司是否另有培训协议、保密协议或补充协议（当前文本里没有）','合同主体名称是否与营业执照、录取通知一致']);
    }else if(pack === 'intern'){
      push(['学校是否统一购买实习责任保险或意外伤害保险','这是学校组织的顶岗实习，还是你自行联系的实习','实习补贴是否达到学校实习备案或协议模板的要求','这份实习是否实际按员工管理（考勤、绩效、固定工资）——可能被认定为劳动关系']);
    }else if(pack === 'loan'){
      push(['放款机构的全称与放贷资质（持牌机构与民间借贷适用的利率规则不同）','合同成立当月的一年期 LPR','含平台服务费的年化综合成本（按 IRR 核算）','提前结清、退费与征信影响的具体规则','目前是否已经实际放款（放款前后解约成本不同）']);
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
    s = '这 12 类规则没有扫到明显风险；金额、合同主体和附件仍要人工核对。';
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
  const laborSignals = hasLaborSignals(text, primaryKey);
  if(laborSignals) add('labor');
  if(/试用期/.test(text) && (primaryKey !== 'intern' || laborSignals)) add('probation');
  if(hasInternSignals(text)) add('intern');
  if(hasLoanSignals(text)) add('loan');
  if(hasThreePartySignals(text)) add('three-party');
  return packs;
}

function analyzeContract(text, options){
  const clean = String(text).replace(/\r\n?/g,'\n').trim();
  const detectedKey = detectDocType(clean);
  const forcedKey = options && DOC_LABEL[options.docType] ? options.docType : null;
  let primaryKey = forcedKey || detectedKey;
  let packs = resolveRulePacks(clean, primaryKey);
  if(primaryKey === 'other' && packs.length){
    const promoted = packs.find(k => k === 'labor' || k === 'intern' || k === 'three-party' || k === 'loan');
    if(promoted){
      primaryKey = promoted;
      packs = resolveRulePacks(clean, primaryKey);
    }
  }
  const ctx = {
    text:clean,
    clauses:extractClauses(clean),
    docType:primaryKey,
    detectedKey,
    packs,
    items:[],pending:[],seq:{},step:0
  };
  if(packs.includes('probation')){ runR1(ctx);runR2(ctx);runR3(ctx); }
  if(packs.includes('labor')){ runR4(ctx);runR5(ctx);runR6(ctx);runR7(ctx);runR11(ctx);runR12(ctx);runLaborGreens(ctx); }
  if(packs.includes('intern')) runR10(ctx);
  if(packs.includes('loan')) runR9(ctx);
  if(packs.includes('three-party')) runR8(ctx);
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
    oneLiner:makeOneLiner(ctx.items,counts),
    topVerdict:counts.red ? 'red' : counts.yellow ? 'yellow' : counts.gray ? 'gray' : 'green',
    insufficient:substantive.length < 3
  };
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
