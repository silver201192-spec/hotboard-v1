import fs from 'node:fs/promises';
import path from 'node:path';

const dataPath = path.resolve('data/hotspots.json');
const publicDir = path.resolve('public');
const payload = JSON.parse(await fs.readFile(dataPath, 'utf8'));

const categoryOrder = ['technology', 'entertainment', 'military', 'politics'];
const categoryTitle = payload.categories;

const landingHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hotboard</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #ecf4ff;
      background:
        radial-gradient(circle at top left, rgba(92, 137, 255, 0.22), transparent 30%),
        radial-gradient(circle at 80% 20%, rgba(63, 220, 255, 0.12), transparent 24%),
        linear-gradient(180deg, #08101f 0%, #050913 100%);
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(122, 162, 255, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(122, 162, 255, 0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.1));
      pointer-events: none;
    }
    .wrap {
      position: relative;
      z-index: 1;
      max-width: 1180px;
      margin: 0 auto;
      padding: 56px 24px 80px;
    }
    .hero {
      display: grid;
      gap: 18px;
      margin-bottom: 40px;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      padding: 8px 14px;
      border: 1px solid rgba(122, 162, 255, 0.28);
      border-radius: 999px;
      background: rgba(13, 23, 43, 0.68);
      color: #9db8ff;
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      backdrop-filter: blur(14px);
    }
    h1 {
      margin: 0;
      font-size: clamp(40px, 8vw, 78px);
      line-height: 0.96;
      letter-spacing: -0.04em;
    }
    .sub {
      max-width: 720px;
      margin: 0;
      color: #9db0d0;
      font-size: 16px;
      line-height: 1.8;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: #7e95b9;
      font-size: 13px;
    }
    .meta-chip {
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid rgba(106, 142, 255, 0.18);
      background: rgba(8, 15, 28, 0.55);
      backdrop-filter: blur(10px);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }
    .card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 220px;
      padding: 22px;
      border-radius: 24px;
      text-decoration: none;
      color: inherit;
      background: linear-gradient(180deg, rgba(18, 28, 48, 0.9), rgba(8, 14, 26, 0.88));
      border: 1px solid rgba(110, 140, 255, 0.16);
      box-shadow: 0 18px 60px rgba(2, 6, 18, 0.45);
      transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
      backdrop-filter: blur(14px);
    }
    .card::before {
      content: "";
      position: absolute;
      inset: auto -20% -35% 35%;
      height: 180px;
      background: radial-gradient(circle, var(--glow), transparent 65%);
      opacity: 0.55;
      pointer-events: none;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(126, 191, 255, 0.42);
      box-shadow: 0 24px 80px rgba(5, 12, 28, 0.62);
    }
    .card-top {
      display: grid;
      gap: 12px;
    }
    .card-kicker {
      color: #8ca0c4;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .card-title {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .card-desc {
      color: #9fb2d1;
      font-size: 14px;
      line-height: 1.75;
    }
    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      color: #bfd3ff;
      font-size: 13px;
    }
    .arrow {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      font-size: 18px;
    }
    .footer {
      margin-top: 24px;
      color: #6f83a6;
      font-size: 12px;
    }
    @media (max-width: 640px) {
      .wrap { padding-top: 40px; }
      .card { min-height: 190px; }
      .card-title { font-size: 26px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <div class="eyebrow">Hotboard / Signal Matrix</div>
      <h1>热点入口</h1>
      <p class="sub">先选垂类，再进入细分榜单。主页只保留方向，不在这里堆内容。</p>
      <div class="meta-row">
        <div class="meta-chip">4 个垂类</div>
        <div class="meta-chip">更新于 ${escapeHtml(formatDate(payload.generatedAt))}</div>
        <div class="meta-chip">极简入口</div>
      </div>
    </section>

    <section class="grid">
      ${categoryOrder.map((key, index) => renderLandingCard(key, categoryTitle[key], payload.items[key] || [], index)).join('')}
    </section>

    <div class="footer">内容详情已移入各垂类页面，主页仅作为导航入口。</div>
  </div>
</body>
</html>`;

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, 'index.html'), landingHtml, 'utf8');
await fs.writeFile(path.join(publicDir, 'hotspots.json'), JSON.stringify(payload, null, 2), 'utf8');
for (const key of categoryOrder) {
  await fs.writeFile(path.join(publicDir, `${key}.html`), renderCategoryPage(key, categoryTitle[key], payload.items[key] || []), 'utf8');
}
console.log('site built');

function renderLandingCard(key, label, items, index) {
  const accents = [
    'rgba(87, 138, 255, 0.42)',
    'rgba(0, 229, 194, 0.34)',
    'rgba(255, 120, 163, 0.32)',
    'rgba(255, 193, 92, 0.34)'
  ];
  const descMap = {
    technology: '设备、AI、产品与互联网动向',
    entertainment: '明星、影视、综艺与舆论热度',
    military: '军情、国防与国际安全相关',
    politics: '公共议题、政策与时事讨论'
  };
  return `<a class="card" href="/${escapeAttr(key)}.html" style="--glow:${accents[index % accents.length]}">
    <div class="card-top">
      <div class="card-kicker">Category 0${index + 1}</div>
      <div class="card-title">${escapeHtml(label)}</div>
      <div class="card-desc">${escapeHtml(descMap[key] || '')}</div>
    </div>
    <div class="card-bottom">
      <span>${items.length} 条已聚合</span>
      <span class="arrow">↗</span>
    </div>
  </a>`;
}

function renderCategoryPage(key, label, items) {
  const list = items.length
    ? items.map((item, idx) => `<article class="item"><div class="index">${String(idx + 1).padStart(2, '0')}</div><div class="content"><a href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}<div class="meta"><span>${escapeHtml(item.source)}</span>${item.hot ? `<span>热度 ${escapeHtml(String(item.hot))}</span>` : ''}</div></div></article>`).join('')
    : '<div class="empty">这一栏暂时还没有内容。</div>';

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(label)} | Hotboard</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #eaf1ff;
      background: linear-gradient(180deg, #07101f 0%, #04070f 100%);
    }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 40px 20px 72px; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom: 28px; }
    .back { color:#9ab2d8; text-decoration:none; font-size:14px; }
    .back:hover { color:#d9e6ff; }
    h1 { margin:0; font-size:42px; letter-spacing:-0.04em; }
    .sub { margin:12px 0 0; color:#8fa6cb; font-size:14px; }
    .panel {
      margin-top: 28px;
      padding: 18px;
      border-radius: 24px;
      border: 1px solid rgba(122, 162, 255, 0.14);
      background: rgba(10, 16, 29, 0.82);
      box-shadow: 0 20px 60px rgba(0,0,0,0.28);
    }
    .list { display:grid; gap:14px; }
    .item {
      display:grid;
      grid-template-columns: 48px 1fr;
      gap: 14px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .index {
      color:#6d83a8;
      font-size:13px;
      padding-top: 2px;
    }
    .content a {
      color:#f4f8ff;
      text-decoration:none;
      font-size:17px;
      line-height:1.5;
    }
    .content a:hover { color:#8cd3ff; }
    .content p {
      margin: 8px 0 0;
      color:#9baecb;
      font-size: 13px;
      line-height: 1.7;
    }
    .meta {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top: 10px;
      color:#7f96bc;
      font-size:12px;
    }
    .meta span {
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(120, 150, 255, 0.08);
      border: 1px solid rgba(120, 150, 255, 0.1);
    }
    .empty { color:#8092b1; padding: 8px 2px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <a class="back" href="/">← 返回主页</a>
    </div>
    <h1>${escapeHtml(label)}</h1>
    <p class="sub">进入具体垂类后，再看对应条目与来源。</p>
    <section class="panel">
      <div class="list">${list}</div>
    </section>
  </div>
</body>
</html>`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function escapeHtml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
