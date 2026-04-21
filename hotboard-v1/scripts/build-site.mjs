import fs from 'node:fs/promises';
import path from 'node:path';

const dataPath = path.resolve('data/hotspots.json');
const publicDir = path.resolve('public');
const payload = JSON.parse(await fs.readFile(dataPath, 'utf8'));

const categoryOrder = ['technology', 'entertainment', 'military', 'politics'];
const categoryTitle = payload.categories;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>热点聚合看板</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#0b1020; color:#e8edf7; }
    .wrap { max-width: 1280px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    .sub { color:#9ba7bd; margin-bottom: 24px; }
    .note { padding: 14px 16px; border:1px solid #2a3550; background:#121a31; border-radius:14px; color:#b9c3d8; margin-bottom: 28px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap:18px; }
    .card { background:#121a31; border:1px solid #25314d; border-radius:18px; overflow:hidden; }
    .card h2 { margin: 0; padding: 18px 18px 12px; font-size: 20px; }
    ol { margin:0; padding:0 18px 18px 38px; }
    li { margin: 0 0 14px; }
    a { color:#f3f6ff; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .meta { margin-top:4px; font-size: 12px; color:#95a2bb; }
    .footer { margin-top: 26px; color:#7d8aa5; font-size: 13px; }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; background:#1c2743; margin-right:6px; }
    code { color:#9ad1ff; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>互联网热点聚合看板</h1>
    <div class="sub">更新时间 ${escapeHtml(payload.generatedAt)}，聚合展示科技、娱乐、军事、政治四个垂类。</div>
    <div class="note">
      本页是<strong>热点聚合看板</strong>，不是事实核验后的新闻站。内容来自公开热榜与公开资讯接口，仅用于快速浏览和跳转原链接，不代表真实性判断。
    </div>
    <div class="grid">
      ${categoryOrder.map((key) => renderCategory(key, categoryTitle[key], payload.items[key] || [])).join('')}
    </div>
    <div class="footer">
      共聚合 <code>${payload.total}</code> 条内容。
      ${payload.failures?.length ? `当前有 ${payload.failures.length} 个源抓取失败。` : '当前所有已配置源抓取成功。'}
    </div>
  </div>
</body>
</html>`;

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, 'index.html'), html, 'utf8');
await fs.writeFile(path.join(publicDir, 'hotspots.json'), JSON.stringify(payload, null, 2), 'utf8');
console.log('site built');

function renderCategory(key, label, items) {
  return `<section class="card"><h2>${escapeHtml(label)}</h2><ol>${items.map((item) => `<li><a href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a><div class="meta"><span class="pill">${escapeHtml(item.source)}</span>${item.hot ? `<span class="pill">热度 ${escapeHtml(String(item.hot))}</span>` : ''}</div></li>`).join('')}</ol></section>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
