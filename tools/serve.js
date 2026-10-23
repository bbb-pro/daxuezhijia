// 零依赖静态服务器，用于本地预览大学之家
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const PORT = process.env.PORT || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404); res.end('404 Not Found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('大学之家预览: http://localhost:' + PORT));
