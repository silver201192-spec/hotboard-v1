import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const config = JSON.parse(await fs.readFile(path.join(cwd, 'config.example.json'), 'utf8'));
const presets = JSON.parse(await fs.readFile(path.join(cwd, 'prompts/style-presets.json'), 'utf8'));

const args = parseArgs(process.argv.slice(2));
const apiKey = process.env.NANOBANANA_API_KEY;
if (!apiKey) {
  console.error('Missing NANOBANANA_API_KEY');
  process.exit(1);
}
if (!args.prompt) {
  console.error('Usage: node scripts/generate.mjs --prompt "..." [--ratio 16:9] [--mode sync] [--preset anime] [--ref https://... ]');
  process.exit(1);
}

const preset = presets[args.preset || 'default'] || presets.default;
const finalPrompt = [args.prompt, preset?.suffix].filter(Boolean).join('，');
const payload = {
  prompt: finalPrompt,
  selectedModel: args.model || config.model,
  aspectRatio: args.ratio || preset?.aspectRatio || config.defaultAspectRatio,
  mode: args.mode || config.defaultMode,
};

if (args.ref.length) {
  payload.referenceImageUrls = args.ref;
}

const res = await fetch(`${config.baseUrl}/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(config.timeoutMs),
});

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

function parseArgs(argv) {
  const result = { prompt: '', ratio: '', mode: '', model: '', preset: '', ref: [] };
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
    } else if (key === '--ref') {
      if (value) result.ref.push(value);
      i += 1;
    }
  }
  return result;
}
