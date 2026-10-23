// 从 MCP 结果文件提取 open-edu-data 真实 JSON 并落盘（处理 resource 块）
const fs = require('fs');
const ROOT = 'C:/Users/Administrator/WorkBuddy/大学导航页';
const p = 'C:/Users/Administrator/.workbuddy/projects/c-Users-Administrator-WorkBuddy-大学导航页/b46d010f-f631-4982-95f2-1ebb18e62f19/tool-results/mcp-github-get_file_contents-1792661392132-20f8f8.txt';
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
catch (e) {
  try { data = JSON.parse(Buffer.from(text.trim(), 'base64').toString('utf8')); }
  catch (e2) { console.error('PARSE FAIL', e2.message, '\n--- head ---\n', text.slice(0, 300)); process.exit(1); }
}
fs.writeFileSync(ROOT + '/data/open_edu.json', JSON.stringify(data, null, 2));
if (Array.isArray(data)) {
  console.log('OK 记录数:', data.length);
  console.log('字段:', Object.keys(data[0] || {}));
  console.log('样本:', JSON.stringify(data[0], null, 2));
} else {
  console.log('OK 对象, keys:', Object.keys(data));
}
