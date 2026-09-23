import { json } from './_shared.ts';
import type { Context } from './_shared.ts';

export function onRequest({ request, env }: Context) {
  if (request.method !== 'GET') return json({ error: 'Use GET for this endpoint.' }, 405);
  const security = new URL(request.url).origin === env.SITE_ORIGIN && Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
  return json({ siteKey: security ? env.TURNSTILE_SITE_KEY : '', chat: security && Boolean(env.GROQ_API_KEY), lead: security && Boolean(env.RESEND_API_KEY && env.LEAD_FROM) });
}
