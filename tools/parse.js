// 解析教育部普通高等学校名单 -> data/universities.json（按省份分组）
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ROOT = path.resolve(__dirname, '..');

function readXls(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  const wb = XLSX.read(buf, { type: 'buffer' });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
}

function natureOf(remark) {
  if (remark.includes('民办')) return '民办';
  if (remark.includes('中外合作') || remark.includes('境外')) return '合作办学';
  return '公办';
}

function parse(rows) {
  const provinces = [];
  let cur = null;
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const cells = row.map(c => (c === null || c === undefined) ? '' : String(c).trim());
    const first = cells.find(c => c);
    const g = first && first.match(/^(.+?)\s*[（(]\s*(\d+)\s*所[）)]$/);
    if (g) {
      cur = { name: g[1].trim(), schools: [] };
      provinces.push(cur);
      continue;
    }
    const codeRaw = cells[2];
    if (codeRaw && /^\d{8,}(\.0+)?$/.test(codeRaw)) {
      const code = codeRaw.replace(/\.0+$/, '');
      const remark = cells[6] || '';
      const rec = {
        name: cells[1] || '',
        code,
        department: cells[3] || '',
        location: cells[4] || '',
        level: cells[5] || '',
        nature: natureOf(remark),
        tags: [],
        website: '',
        remark
      };
      if (!cur) { cur = { name: '未分组', schools: [] }; provinces.push(cur); }
      cur.schools.push(rec);
    }
  }
  return provinces;
}

const provinces = parse(readXls('data/putong.xls'));
const total = provinces.reduce((s, p) => s + p.schools.length, 0);
const out = {
  meta: {
    siteName: '大学之家',
    source: '教育部《全国高等学校名单》（截至2025年6月20日）',
    sourceUrl: 'http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202506/t20250627_1195683.html',
    total,
    generatedAt: new Date().toISOString().slice(0, 10)
  },
  provinces
};
fs.writeFileSync(path.join(ROOT, 'data', 'universities.json'), JSON.stringify(out, null, 2));
console.log('省份数:', provinces.length, ' 总数:', total);
provinces.forEach(p => console.log('  ', p.name, p.schools.length));
