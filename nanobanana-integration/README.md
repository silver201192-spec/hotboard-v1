# Nano Banana integration scaffold

这是给 OpenClaw 后续接入图像生成能力准备的最小骨架，当前优先兼容 Nano Banana 和 Seedream。

## 当前阶段

当前只完成这三件事：

- 统一配置位
- 本地调用脚本
- 使用说明与下一步接线点

还没有把它真正接成 OpenClaw 的一等工具，也还没有写入任何真实 API Key。

## 文件说明

- `config.example.json`：配置示例
- `scripts/generate.mjs`：最小调用脚本
- `prompts/style-presets.json`：后续可扩展的风格预设
- `.env.local`：本地密钥，不进提交

## 预期调用方式

Seedream 文生图：

```bash
cd nanobanana-integration
ARK_API_KEY=你的key node scripts/generate.mjs --provider seedream --prompt "一只安静的白猫坐在雨夜窗边" --preset anime --ratio 16:9
```

Nano Banana 文生图：

```bash
cd nanobanana-integration
NANOBANANA_API_KEY=你的key node scripts/generate.mjs --provider nanobanana --prompt "一只安静的白猫坐在雨夜窗边" --ratio 16:9
```

图生图：

```bash
cd nanobanana-integration
ARK_API_KEY=你的key node scripts/generate.mjs --provider seedream --prompt "让这张图更像胶片电影剧照" --ref https://example.com/a.jpg
```

## 接入建议

后面正式接 OpenClaw 时，我建议走这条路径：

1. 保留这个脚本作为底层适配器
2. 再包一层本地插件或命令工具
3. 最后把自然语言请求映射成统一参数

这样后续换图像服务也不会把上层逻辑打碎。
