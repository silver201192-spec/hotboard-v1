import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
await loadDotEnv(path.join(cwd, '.env.local'));
const config = JSON.parse(await fs.readFile(path.join(cwd, 'config.example.json'), 'utf8'));
const presets = JSON.parse(await fs.readFile(path.join(cwd, 'prompts/style-presets.json'), 'utf8'));

const args = parseArgs(process.argv.slice(2));
if (!args.prompt) {
  console.error('Usage: node scripts/generate.mjs --prompt "..." [--provider seedream|nanobanana] [--ratio 16:9] [--mode sync] [--preset anime] [--ref https://... ]');
  process.exit(1);
}

const provider = args.provider || config.provider || 'nanobanana';
const preset = presets[args.preset || 'default'] || presets.default;
const finalPrompt = [args.prompt, preset?.suffix].filter(Boolean).join('，');

let res;
let payload;
if (provider === 'seedream') {
  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    console.error('Missing ARK_API_KEY');
    process.exit(1);
  }
  payload = {
    model: args.model || 'doubao-seedream-5-0-260128',
    prompt: finalPrompt,
    size: normalizeSeedreamSize(args.ratio || preset?.aspectRatio || config.defaultAspectRatio),
    response_format: 'url',
    watermark: false,
  };
  if (args.ref.length) {
    payload.image = args.ref.length === 1 ? args.ref[0] : args.ref;
  }
  res = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
} else {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    console.error('Missing NANOBANANA_API_KEY');
    process.exit(1);
  }
  payload = {
    prompt: finalPrompt,
    selectedModel: args.model || config.model,
    aspectRatio: args.ratio || preset?.aspectRatio || config.defaultAspectRatio,
    mode: args.mode || config.defaultMode,
  };
  if (args.ref.length) {
    payload.referenceImageUrls = args.ref;
  }
  res = await fetch(`${config.baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
}

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  console.error(text);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.resolve(cwd, config.outputDir);
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, `${stamp}.json`), JSON.stringify({ request: payload, response: json }, null, 2), 'utf8');

console.log(JSON.stringify({ ok: res.ok, status: res.status, saved: path.join(outDir, `${stamp}.json`), response: json }, null, 2));

function normalizeSeedreamSize(ratio) {
  const map = {
    '1:1': '2048x2048',
    '4:3': '2304x1728',
    '3:4': '1728x2304',
    '16:9': '2560x1440',
    '9:16': '1440x2560',
    default: '2048x2048',
  };
  return map[ratio] || map.default;
}

async function loadDotEnv(file) {
  try {
    const text = await fs.readFile(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {}
}

function parseArgs(argv) {
  const result = { prompt: '', ratio: '', mode: '', model: '', preset: '', provider: '', ref: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--prompt') {
      result.prompt = value || '';
      i += 1;
    } else if (key === '--ratio') {
      result.ratio = value || '';
      i += 1;
    } else if (key === '--mode') {
      result.mode = value || '';
      i += 1;
    } else if (key === '--model') {
      result.model = value || '';
      i += 1;
    } else if (key === '--preset') {
      result.preset = value || '';
      i += 1;
    } else if (key === '--provider') {
      result.provider = value || '';
      i += 1;
    } else if (key === '--ref') {
      if (value) result.ref.push(value);
      i += 1;
    }
  }
  return result;
}
