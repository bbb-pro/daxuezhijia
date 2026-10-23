// 整合：CollegesChat 域名(官网) + open-edu(985/211) + 双一流规则 + 985补丁
const fs = require('fs');
const ROOT = 'C:/Users/Administrator/WorkBuddy/大学导航页';
const uni = JSON.parse(fs.readFileSync(ROOT + '/data/universities.json', 'utf8'));
const oe = JSON.parse(fs.readFileSync(ROOT + '/data/open_edu.json', 'utf8'));
const cc = JSON.parse(fs.readFileSync(ROOT + '/data/collegeschat.json', 'utf8'));

const norm = s => s.replace(/[\s（）()]/g, '');
const patch985 = ['国防科技大学'];
const addedDouble = ['南方科技大学','上海科技大学','中国科学院大学','湘潭大学','山西大学','南京医科大学',
  '华南农业大学','广州医科大学','河南大学','宁波大学','首都师范大学','成都中医药大学','天津工业大学',
  '上海海洋大学','西南石油大学','成都理工大学','广州中医药大学','天津中医药大学','上海中医药大学',
  '南京中医药大学','中央美术学院','中央戏剧学院','中央音乐学院','中国音乐学院','中国美术学院',
  '上海体育学院','外交学院','中国人民公安大学','南京邮电大学','南京信息工程大学','南京林业大学','北京协和医学院'];

// open-edu 索引
const oeByName = {}, oeByNorm = {};
for (const o of oe) { oeByName[o.name.trim()] = o; oeByNorm[norm(o.name)] = o; }

// CollegesChat 索引（优先 confirmed）
const ccByName = {}, ccByNorm = {};
for (const c of cc) {
  const rec = { domain: (c.domain && c.domain[0]) || '', confirmed: c.confirmed };
  const k = c.name.trim(), nk = norm(c.name);
  if (!ccByName[k] || (rec.confirmed && !ccByName[k].confirmed)) ccByName[k] = rec;
  if (!ccByNorm[nk] || (rec.confirmed && !ccByNorm[nk].confirmed)) ccByNorm[nk] = rec;
}
const makeWeb = d => !d ? '' : (d.startsWith('www.') ? 'https://' + d : 'https://www.' + d);

let total = 0, webCC = 0, webOE = 0;
for (const prov of uni.provinces) {
  for (const sch of prov.schools) {
    total++;
    const nm = sch.name.trim();
    const c = ccByName[nm] || ccByNorm[norm(nm)];
    if (c && c.domain) { sch.website = makeWeb(c.domain); webCC++; }
    else if (!sch.website) {
      const o = oeByName[nm] || oeByNorm[norm(nm)];
      if (o && o.website) { sch.website = o.website; webOE++; }
    }
    const o = oeByName[nm] || oeByNorm[norm(nm)];
    if (o) { if (o.project_985) sch.tags.push('985'); if (o.project_211) sch.tags.push('211'); }
    if (patch985.includes(nm) && !sch.tags.includes('985')) sch.tags.push('985');
    if (sch.tags.includes('985') || sch.tags.includes('211') || addedDouble.includes(nm) || addedDouble.includes(norm(nm))) {
      if (!sch.tags.includes('双一流')) sch.tags.push('双一流');
    }
    const order = { '985': 0, '211': 1, '双一流': 2 };
    sch.tags.sort((a, b) => (order[a] ?? 9) - (order[b] ?? 9));
  }
}

// 手动/搜索补全的官网补丁（最高优先级，覆盖 CollegesChat/open-edu）
let patched = 0;
try {
  const patch = JSON.parse(fs.readFileSync(ROOT + '/data/website_patch.json', 'utf8'));
  for (const prov of uni.provinces) for (const sch of prov.schools) {
    if (patch[sch.name] && !sch.website) { sch.website = patch[sch.name]; patched++; }
  }
  console.log('官网补丁应用:', patched);
} catch (e) { /* 无补丁文件则跳过 */ }

const all = uni.provinces.flatMap(p => p.schools);
const withWeb = all.filter(s => s.website).length;
const c985 = all.filter(s => s.tags.includes('985')).length;
const c211 = all.filter(s => s.tags.includes('211')).length;
const cdf = all.filter(s => s.tags.includes('双一流')).length;
const cPriv = all.filter(s => s.nature === '民办').length;
uni.meta.tagsNote = '985/211 来自 open-edu-data + 国防科大补丁；双一流=985∪211∪新增非211双一流；官网来自 CollegesChat 域名库(confirmed优先)';
fs.writeFileSync(ROOT + '/universities.json', JSON.stringify(uni, null, 2));

console.log('总校数:', total);
console.log('官网覆盖:', withWeb, '(' + (withWeb / total * 100).toFixed(1) + '%)  其中CollegesChat:', webCC, ' open-edu兜底:', webOE);
console.log('985:', c985, ' 211:', c211, ' 双一流:', cdf, ' 民办:', cPriv);
const noWeb = all.filter(s => !s.website).map(s => s.name).slice(0, 20);
console.log('无官网样本:', noWeb.join('、'));
