// Send only the four service bindings to Cloudflare through stdin; never log values.
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';

const values = parseEnv(await readFile('.dev.vars', 'utf8'));
const keys = ['GROQ_API_KEY', 'RESEND_API_KEY', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'];
for (const key of keys) if (!values[key]?.trim()) throw new Error(`Missing ${key} in .dev.vars`);
const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'pages', 'secret', 'bulk', '--project-name', 'ahmad-nouh-portfolio'], { stdio: ['pipe', 'inherit', 'inherit'], env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
child.stdin.end(JSON.stringify(Object.fromEntries(keys.map(key => [key, values[key]]))));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
