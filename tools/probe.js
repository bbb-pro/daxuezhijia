// 探查教育部2025高校名单页面，提取 XLS 下载链接
(async () => {
  const url = 'https://gaokao.chsi.com.cn/gkxx/gzdt/202506/20250627/2293393227.html';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    console.log('STATUS', res.status, 'LEN', html.length);
    const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']+\.xls[^"']*)["']/gi)].map(m => m[1]);
    console.log('HREF_XLS', JSON.stringify([...new Set(hrefs)], null, 2));
    const any = [...html.matchAll(/([^"'<>()\s]+\.xls)/gi)].map(m => m[1]);
    console.log('ANY_XLS', JSON.stringify([...new Set(any)], null, 2));
  } catch (e) {
    console.error('ERR', e.message);
  }
})();
