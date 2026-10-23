// 下载教育部2025全国高等学校名单（普通 + 成人）XLS
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const urls = [
  ['http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202506/W020250729615142156867.xls', 'data/putong.xls'],
  ['http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202506/W020250627301230143042.xls', 'data/chengren.xls']
];
(async () => {
  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  for (const [u, rel] of urls) {
    const out = path.join(ROOT, rel);
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, redirect: 'follow' });
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(out, buf);
      console.log('OK', rel, 'status=' + res.status, 'bytes=' + buf.length, 'type=' + (res.headers.get('content-type') || ''));
    } catch (e) {
      console.error('ERR', rel, e.message);
    }
  }
})();
