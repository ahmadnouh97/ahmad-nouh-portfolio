import { profile } from '../../src/content.ts';
import { body, fail, field, HttpError, json, verifyTurnstile } from './_shared.ts';
import type { Context } from './_shared.ts';

export async function onRequest({ request, env }: Context) {
  try {
    const data = await body(request, env);
    if (!env.RESEND_API_KEY || !env.LEAD_FROM || !env.TURNSTILE_SITE_KEY) throw new HttpError(503, 'The contact form is not connected yet. Please email Ahmad directly.');
    if (data.website) throw new HttpError(400, 'The submission could not be accepted.');
    const name = field(data.name, 'name', 100);
    const email = field(data.email, 'email', 254);
    const company = field(data.company, 'company', 140);
    const message = field(data.message, 'message', 3000, 10);
    const submissionId = field(data.submissionId, 'submission identifier', 36);
    if (/[\r\n]/.test(name + email + company) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter valid contact details.');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) throw new HttpError(400, 'Please refresh and submit again.');
    await verifyTurnstile(data.token, 'lead', env);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `portfolio-${submissionId}` },
      body: JSON.stringify({ from: env.LEAD_FROM, to: [profile.email], reply_to: email, subject: `Portfolio inquiry from ${name} at ${company}`, text: `New portfolio inquiry\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}` }),
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 429) throw new HttpError(429, 'The email service has reached its current limit. Please email Ahmad directly.');
    if (!response.ok) throw new HttpError(503, 'The message could not be confirmed. Please retry without editing it, or email Ahmad directly.');
    return json({ sent: true });
  } catch (error) { return fail(error); }
}
