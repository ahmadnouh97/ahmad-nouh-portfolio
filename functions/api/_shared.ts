export interface Env {
  SITE_ORIGIN: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  GROQ_API_KEY?: string;
  RESEND_API_KEY?: string;
  LEAD_FROM?: string;
}
export interface Context { request: Request; env: Env }
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
} });
export const fail = (error: unknown) => json({ error: error instanceof HttpError ? error.message : 'The service is temporarily unavailable. Please email Ahmad.' }, error instanceof HttpError ? error.status : 503);

export function field(value: unknown, name: string, max: number, min = 1): string {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new HttpError(400, `Please enter a valid ${name}.`);
  return value.trim();
}

export async function body(request: Request, env: Env): Promise<Record<string, unknown>> {
  if (request.method !== 'POST') throw new HttpError(405, 'Use POST for this endpoint.');
  if (!env.SITE_ORIGIN || new URL(request.url).origin !== env.SITE_ORIGIN || request.headers.get('Origin') !== env.SITE_ORIGIN) throw new HttpError(403, 'Please submit from the portfolio website.');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new HttpError(403, 'Cross-site submissions are not accepted.');
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Send a JSON request.');
  if (Number(request.headers.get('Content-Length')) > 16000) throw new HttpError(413, 'The message is too long.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'A request body is required.');
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16000) { await reader.cancel(); throw new HttpError(413, 'The message is too long.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch { throw new HttpError(400, 'The request is not valid JSON.'); }
}

export async function verifyTurnstile(token: unknown, action: 'chat' | 'lead', env: Env) {
  const response = field(token, 'security check', 2048);
  if (!env.TURNSTILE_SECRET_KEY) throw new HttpError(503, 'This form is not connected yet. Please email Ahmad.');
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response }),
    signal: AbortSignal.timeout(10000),
  });
  if (!result.ok) throw new HttpError(503, 'The security check is unavailable. Please try again.');
  const data = await result.json() as { success?: boolean; hostname?: string; action?: string };
  if (!data.success || data.hostname !== new URL(env.SITE_ORIGIN).hostname || data.action !== action) throw new HttpError(403, 'The security check expired or failed. Please try again.');
}
