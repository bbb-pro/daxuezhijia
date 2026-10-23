// 提取 CollegesChat 域名数据，查看结构
const fs = require('fs');
const ROOT = 'C:/Users/Administrator/WorkBuddy/大学导航页';
const p = 'C:/Users/Administrator/.workbuddy/projects/c-Users-Administrator-WorkBuddy-大学导航页/b46d010f-f631-4982-95f2-1ebb18e62f19/tool-results/mcp-github-get_file_contents-1792661702523-31b91a.txt';
const raw = fs.readFileSync(p, 'utf8');
const blocks = JSON.parse(raw);
let text = '';
for (const b of blocks) {
  if (b.type === 'resource') {
    const r = b.resource || {};
    if (typeof r.text === 'string') text += r.text;
    else if (typeof r.blob === 'string') text += Buffer.from(r.blob, 'base64').toString('utf8');
  } else if (b.type === 'text' && b.text && !/successfully downloaded/i.test(b.text)) {
    text += b.text;
  }
}
let data;
try { data = JSON.parse(text); }
catch (e) { try { data = JSON.parse(Buffer.from(text.trim(), 'base64').toString('utf8')); } catch (e2) { console.error('PARSE FAIL', e2.message, text.slice(0, 200)); process.exit(1); } }
fs.writeFileSync(ROOT + '/data/collegeschat.json', JSON.stringify(data, null, 2));
if (Array.isArray(data)) {
  console.log('数组, 长度', data.length, '字段', Object.keys(data[0] || {}));
  console.log('样本', JSON.stringify(data.slice(0, 3), null, 2));
} else if (typeof data === 'object') {
  const keys = Object.keys(data);
  console.log('对象, 键数', keys.length);
  console.log('前5键:', keys.slice(0, 5));
  console.log('样本值:', JSON.stringify(keys.slice(0, 5).map(k => [k, data[k]]), null, 2));
}
