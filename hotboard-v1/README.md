# hotboard-v1

一个先跑起来的互联网热点聚合看板。

## 功能

- 聚合公开热榜/资讯接口
- 分类展示：科技、财经、社会、国际、娱乐、体育、游戏、军事
- 输出静态多页面静态站点，适合后续部署到 Vercel / Cloudflare Pages
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

- 工作流文件应放在仓库根目录：`.github/workflows/update-hotboard.yml`
- 当前仓库根目录实际是整个 workspace，不是 `hotboard-v1/` 子目录
- 因此 workflow 放在根目录，但执行命令时要把 `working-directory` 指到 `hotboard-v1/`
- 频率：每 12 小时自动执行一次
- 行为：自动抓取最新热点、重建静态页面、仅在 `hotboard-v1/data` 或 `hotboard-v1/public` 有变化时提交更新

推荐部署方式：

1. 将整个仓库连接到 GitHub
2. 在 Vercel 中把该仓库绑定为项目源码
3. 将 Root Directory 设为 `hotboard-v1`
4. GitHub Actions 每 12 小时自动提交更新
5. Vercel 收到新 commit 后自动重新部署

这样就不需要依赖本地电脑常驻在线。

## 说明

v1 重点是稳定上线，不直接做高风险平台深度爬虫。
后续可以逐步增强为更接近平台原生热榜的数据管道。

## 排障提示

- 如果首页内容已更新，但点击分类后仍像旧页面，先检查 `vercel.json` 是否把所有路径都 rewrite 到 `/index.html`。这是多页面静态站点最容易踩到的坑之一。
- 如果遇到 Vercel 多项目 / 多域名 / 多 deployment 混在一起的情况，先确认三件事：当前查看的是哪个项目、域名挂在哪个项目、Production 当前指向哪条 deployment，再去判断缓存或构建问题。
