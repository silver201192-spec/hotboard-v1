const { chromium } = require('playwright-core');
(async() => {
  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const userDataDir = process.env.TMP_PROFILE;
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath,
    headless: true,
    args: ['--profile-directory=Default']
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://search.bilibili.com/all?keyword=%E5%8D%8E%E5%BC%BA%E4%B9%B0%E7%93%9C', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(5000);
  const result = await page.evaluate(() => {
    const selectors = [
      '.bili-video-card__info--tit',
      'a[title*="华强"]',
      'a[title]',
      '.title',
      'h3'
    ];
    let found = [];
    for (const sel of selectors) {
      const arr = Array.from(document.querySelectorAll(sel)).map(el => ({
        text: (el.getAttribute('title') || el.innerText || el.textContent || '').trim(),
        href: el.href || (el.closest('a') && el.closest('a').href) || '',
        sel
      })).filter(x => x.text);
      if (arr.length) { found = arr; break; }
    }
    return {
      pageTitle: document.title,
      url: location.href,
      first: found[0] || null,
      sample: found.slice(0, 10),
      textSnippet: (document.body && document.body.innerText || '').slice(0, 1200)
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await context.close();
})().catch(err => {
  console.error('ERR:', err && (err.stack || err.message || String(err)));
  process.exit(1);
});
