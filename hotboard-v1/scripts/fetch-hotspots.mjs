import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const OUT_FILE = path.join(DATA_DIR, 'hotspots.json');

const SOURCES = [
  {
    key: 'weibo',
    name: '微博',
    endpoint: 'https://weibo.com/ajax/side/hotSearch',
    map: async () => {
      const json = await fetchJson('https://weibo.com/ajax/side/hotSearch', {
        headers: {
          Referer: 'https://weibo.com/',
          'User-Agent': browserUA,
        },
      });
      const items = json?.data?.realtime ?? [];
      return items.slice(0, 20).map((item, index) => {
        const title = item.word || item.word_scheme || `微博热搜 ${index + 1}`;
        return {
          id: item.mid || item.word_scheme || `weibo-${index}`,
          title,
          url: `https://s.weibo.com/weibo?q=${encodeURIComponent(title)}`,
          hot: item.num || null,
          summary: `微博热搜词条：${title}。当前为榜单级聚合，可点击查看原始讨论与延展内容。`,
          rawCategory: 'social',
          source: '微博',
        };
      });
    },
  },
  {
    key: 'douyin',
    name: '抖音',
    map: async () => {
      const cookieRes = await fetch('https://www.douyin.com/passport/general/login_guiding_strategy/?aid=6383', {
        headers: { 'User-Agent': browserUA },
      });
      const setCookie = cookieRes.headers.get('set-cookie') || '';
      const match = setCookie.match(/passport_csrf_token=([^;]+)/);
      const token = match?.[1] || '';
      const json = await fetchJson('https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1', {
        headers: {
          Cookie: `passport_csrf_token=${token}`,
          'User-Agent': browserUA,
          Referer: 'https://www.douyin.com/',
        },
      });
      const items = json?.data?.word_list ?? [];
      return items.slice(0, 20).map((item) => ({
        id: item.sentence_id,
        title: item.word,
        url: `https://www.douyin.com/hot/${item.sentence_id}`,
        hot: item.hot_value || null,
        summary: `抖音热点：${item.word}。当前展示为热榜条目，可点进原链接查看短视频内容与评论走向。`,
        rawCategory: 'social',
        source: '抖音',
      }));
    },
  },
  {
    key: 'bilibili-tech',
    name: 'B站科技',
    map: async () => {
      const json = await fetchJson('https://api.bilibili.com/x/web-interface/ranking/v2?rid=188&type=all');
      const items = json?.data?.list ?? [];
      return items.slice(0, 20).map((item) => ({
        id: item.bvid,
        title: item.title,
        url: item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid}`,
        hot: item.stat?.view || null,
        summary: cleanSummary(item.desc) || `B站科技热点视频：${item.title}。可进入原视频页查看完整内容。`,
        rawCategory: 'technology',
        source: 'B站',
      }));
    },
  },
  {
    key: 'bilibili-ent',
    name: 'B站娱乐',
    map: async () => {
      const json = await fetchJson('https://api.bilibili.com/x/web-interface/ranking/v2?rid=5&type=all');
      const items = json?.data?.list ?? [];
      return items.slice(0, 20).map((item) => ({
        id: item.bvid,
        title: item.title,
        url: item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid}`,
        hot: item.stat?.view || null,
        summary: cleanSummary(item.desc) || `B站娱乐热点视频：${item.title}。可进入原视频页查看完整内容。`,
        rawCategory: 'entertainment',
        source: 'B站',
      }));
    },
  },
  {
    key: 'thepaper',
    name: '澎湃',
    map: async () => {
      const json = await fetchJson('https://cache-tpcache.app.thepaper.cn/contentapi/wwwIndex/rightSidebar');
      const lists = [
        ...(json?.data?.hotNews ?? []),
        ...(json?.data?.hotTopicNews ?? []),
      ];
      return lists.slice(0, 20).map((item, index) => ({
        id: item.contId || item.topicId || `thepaper-${index}`,
        title: item.name || item.title,
        url: item.shareUrl || item.url || 'https://www.thepaper.cn/',
        hot: item.pv || null,
        summary: cleanSummary(item.summary || item.digest || item.name || item.title),
        rawCategory: 'politics',
        source: '澎湃',
      }));
    },
  },
  {
    key: 'qq-news',
    name: '腾讯新闻',
    map: async () => {
      const json = await fetchJson('https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=20');
      const items = json?.idlist?.[0]?.newslist ?? json?.data?.hot_list ?? [];
      return items.slice(0, 20).map((item, index) => ({
        id: item.id || item.cms_id || `qq-${index}`,
        title: item.title || item.short_title,
        url: item.url || item.open_url || 'https://news.qq.com/',
        hot: item.hotEvent?.hotScore || item.hotScore || null,
        summary: cleanSummary(item.abstract || item.intro || item.short_intro || item.title || item.short_title),
        rawCategory: guessCategory(item.title || item.short_title || ''),
        source: '腾讯新闻',
      }));
    },
  },
];

const CATEGORY_LABELS = {
  technology: '科技',
  entertainment: '娱乐',
  military: '军事',
  politics: '政治',
};

const browserUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

function cleanSummary(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  return value.length > 88 ? `${value.slice(0, 88)}...` : value;
}

function guessCategory(title) {
  const t = String(title);
  if (/(芯片|ai|人工智能|科技|手机|电脑|数码|机器人|互联网|软件|开源|大模型|gpu|半导体)/i.test(t)) return 'technology';
  if (/(明星|综艺|电影|电视剧|娱乐|演唱会|偶像|艺人|票房|动画|番剧)/i.test(t)) return 'entertainment';
  if (/(军|导弹|战机|航母|演训|空军|海军|陆军|国防|武器|部队)/i.test(t)) return 'military';
  return 'politics';
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': browserUA,
      Accept: 'application/json,text/plain,*/*',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function normalize(items) {
  return items
    .filter((item) => item?.title && item?.url)
    .map((item) => ({
      ...item,
      category: CATEGORY_LABELS[item.rawCategory] ? item.rawCategory : guessCategory(item.title),
    }));
}

const results = [];
const failures = [];
for (const source of SOURCES) {
  try {
    const items = normalize(await source.map());
    results.push(...items.map((item) => ({ ...item, sourceKey: source.key })));
  } catch (error) {
    failures.push({ source: source.key, error: String(error.message || error) });
  }
}

const grouped = Object.keys(CATEGORY_LABELS).reduce((acc, key) => {
  acc[key] = results.filter((item) => item.category === key).slice(0, 24);
  return acc;
}, {});

const payload = {
  generatedAt: new Date().toISOString(),
  categories: CATEGORY_LABELS,
  total: results.length,
  failures,
  items: grouped,
};

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
console.log(`saved ${OUT_FILE}, total=${results.length}, failures=${failures.length}`);
