# hotboard-v1

一个先跑起来的互联网热点聚合看板。

## 功能

- 聚合公开热榜/资讯接口
- 分类展示：科技、娱乐、军事、政治
- 输出静态网页，适合后续部署到 Vercel / Cloudflare Pages
- 保留原始链接，不做真实性背书

## 本地运行

```bash
cd hotboard-v1
npm run update
npm run serve
```

然后访问：

- http://127.0.0.1:4321

## 自动更新

已为项目准备 GitHub Actions 工作流：

- 文件：`.github/workflows/update-hotboard.yml`
- 频率：每 12 小时自动执行一次
- 行为：自动抓取最新热点、重建静态页面、提交更新后的数据与页面文件

推荐部署方式：

1. 把 `hotboard-v1` 推到 GitHub 仓库
2. 在 Vercel 中将该仓库绑定为项目源码
3. GitHub Actions 每 12 小时自动提交更新
4. Vercel 收到新 commit 后自动重新部署

这样就不需要依赖本地电脑常驻在线。

## 说明

v1 重点是稳定上线，不直接做高风险平台深度爬虫。
后续可以逐步增强为更接近平台原生热榜的数据管道。
