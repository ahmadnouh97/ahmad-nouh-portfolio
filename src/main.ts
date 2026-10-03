import './style.css';
import { readEvents } from './stream.ts';
import { chatRequest } from './chat-limits.ts';
import { answerBlocks } from './chat-format.ts';
import { retryAfterSeconds, retryMessage } from './chat-retry.ts';

const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const themeSwitch = document.querySelector<HTMLButtonElement>('#theme')!;
const systemTheme = document.querySelector<HTMLButtonElement>('#system-theme')!;
function syncTheme() {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;
  themeSwitch.setAttribute('aria-checked', String(dark));
  themeSwitch.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  systemTheme.textContent = root.dataset.theme ? 'Use device theme' : 'Device theme · on';
}
themeSwitch.addEventListener('click', () => {
  const theme = themeSwitch.getAttribute('aria-checked') === 'true' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('portfolio-theme', theme); } catch { /* Page preference still works. */ }
  syncTheme();
});
systemTheme.addEventListener('click', () => {
  delete root.dataset.theme;
  try { localStorage.removeItem('portfolio-theme'); } catch { /* Follow the device on this page. */ }
  syncTheme();
});
systemDark.addEventListener('change', syncTheme);
syncTheme();
const motionToggle = document.querySelector<HTMLButtonElement>('#motion-toggle')!;
const motionReduced = () => root.dataset.motion === 'paused' || (reducedMotion.matches && root.dataset.motion !== 'on');
function syncMotion() {
  const paused = motionReduced();
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = reducedMotion.matches && !root.dataset.motion ? 'Enable motion' : paused ? 'Resume motion' : 'Pause motion';
}
motionToggle.addEventListener('click', () => {
  root.dataset.motion = motionReduced() ? 'on' : 'paused';
  try {
    if (root.dataset.motion === 'on') localStorage.setItem('portfolio-motion', 'on');
    else localStorage.removeItem('portfolio-motion');
  } catch { /* Page preference still works. */ }
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
syncMotion();
document.querySelectorAll<HTMLElement>('.case-section, .system-diagram, .contact > div, #lead-form').forEach(element => element.dataset.reveal = '');
const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
}), { threshold: .08 });
root.classList.add('motion-ready');
document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));

interface Config { siteKey: string; chat: boolean; lead: boolean }
type Message = { role: 'user' | 'assistant'; content: string };
type Turnstile = { render: (container: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile } }
let config: Promise<Config> | undefined;
const getConfig = () => config ??= fetch('/api/config', { signal: AbortSignal.timeout(10000) }).then(async response => {
  if (!response.ok) throw new Error('Forms are temporarily unavailable. Please email ahmadnouh428@gmail.com.');
  return response.json() as Promise<Config>;
}).catch(error => { config = undefined; throw error; });
let turnstileScript: Promise<void> | undefined;
const widgetIds: Partial<Record<'chat' | 'lead', string>> = {};
async function securityToken(action: 'chat' | 'lead', siteKey: string, signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted();
  turnstileScript ??= new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = setTimeout(() => { script.remove(); reject(new Error('The security check timed out. Please try again.')); }, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('The security check could not load. Please email Ahmad.')); };
    document.head.append(script);
  }).catch(error => { turnstileScript = undefined; throw error; });
  await turnstileScript;
  signal?.throwIfAborted();
  const container = document.querySelector<HTMLElement>(`#${action}-challenge`)!;
  if (widgetIds[action]) window.turnstile!.remove(widgetIds[action]!);
  container.replaceChildren();
  return new Promise((resolve, reject) => {
    const finish = (error?: Error, token?: string) => {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(token!);
    };
    const abort = () => {
      if (widgetIds[action]) window.turnstile!.remove(widgetIds[action]!);
      delete widgetIds[action];
      finish(new DOMException('Response stopped.', 'AbortError'));
    };
    const timer = setTimeout(() => finish(new Error('The security check expired. Please try again.')), 120000);
    signal?.addEventListener('abort', abort, { once: true });
    widgetIds[action] = window.turnstile!.render(container, {
      sitekey: siteKey, action, theme: 'auto', appearance: 'interaction-only',
      callback: (token: string) => finish(undefined, token),
      'error-callback': () => finish(new Error('The security check failed. Please try again.')),
      'expired-callback': () => finish(new Error('The security check expired. Please try again.')),
    });
  });
}
async function post<T>(path: string, data: unknown): Promise<T> {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(40000) });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || 'The request failed. Please try again.');
  return result;
}
const errorText = (error: unknown) => error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The request timed out. Please try again or email Ahmad.';
const dialog = document.querySelector<HTMLDialogElement>('#twin')!;
const chatInput = document.querySelector<HTMLTextAreaElement>('#chat-input')!;
const chatForm = document.querySelector<HTMLFormElement>('#chat-form')!;
const chatStatus = document.querySelector<HTMLElement>('#chat-status')!;
const announcement = document.querySelector<HTMLElement>('#chat-announcement')!;
const log = document.querySelector<HTMLElement>('#chat-log')!;
const initialGreeting = log.innerHTML;
const sendButton = document.querySelector<HTMLButtonElement>('#send-chat')!;
const stopButton = document.querySelector<HTMLButtonElement>('#stop-chat')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-chat')!;
let messages: Message[] = [];
let chatBusy = false, closing = false;
let retryUntil = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
function updateRetry() {
  clearTimeout(retryTimer);
  const remaining = retryUntil - Date.now();
  sendButton.disabled = remaining > 0;
  if (remaining > 0) retryTimer = setTimeout(updateRetry, Math.min(remaining, 60000));
  else if (retryUntil) {
    retryUntil = 0;
    if (!chatBusy) chatStatus.textContent = 'You can try sending your question again.';
  }
}
let activeRequest: AbortController | undefined;
let openingButton: HTMLElement | undefined;
const animateDialog = (opening: boolean) => {
  if (motionReduced()) return Promise.resolve();
  return dialog.animate(opening ? [{ opacity: 0, transform: 'translateY(35px) scale(.95)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }] : [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(20px) scale(.97)' }], { duration: opening ? 360 : 180, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.catch(() => {});
};
document.querySelectorAll<HTMLButtonElement>('[data-open-twin]').forEach(button => button.addEventListener('click', () => {
  if (dialog.open || closing) return;
  openingButton = button;
  dialog.showModal();
  void animateDialog(true);
  if (button.dataset.context) chatInput.value = button.dataset.context;
  chatInput.focus({ preventScroll: true });
}));
async function closeChat() {
  if (closing || !dialog.open) return;
  closing = true; activeRequest?.abort(); dialog.classList.add('closing');
  await animateDialog(false);
  dialog.close(); dialog.classList.remove('closing'); closing = false;
}
document.querySelector('#close-twin')!.addEventListener('click', () => void closeChat());
dialog.addEventListener('cancel', event => { event.preventDefault(); void closeChat(); });
dialog.addEventListener('close', () => openingButton?.focus({ preventScroll: true }));
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea:not(:disabled)')].filter(element => element.offsetParent !== null);
  const first = controls[0]; const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) void closeChat();
});
document.querySelector('#chat-contact')!.addEventListener('click', async () => { await closeChat(); document.querySelector<HTMLInputElement>('#lead-form input')?.focus(); });
dialog.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-question]');
  if (button) { chatInput.value = button.dataset.question!; chatInput.focus(); }
});
clearButton.addEventListener('click', () => {
  if (chatBusy) return;
  messages = []; log.innerHTML = initialGreeting; chatStatus.textContent = retryUntil > Date.now() ? retryMessage(Math.ceil((retryUntil - Date.now()) / 1000)) : ''; announcement.textContent = ''; chatInput.value = ''; chatInput.focus();
});
stopButton.addEventListener('click', () => activeRequest?.abort());
function appendMessage(role: Message['role'], content: string) {
  log.querySelector('.chat-welcome')?.remove();
  const message = document.createElement('div'); message.className = `message ${role}`;
  const author = document.createElement('span'); author.className = 'message-author'; author.textContent = role === 'user' ? 'You' : 'Ahmad’s AI Twin';
  const text = document.createElement('div'); text.className = 'message-content'; text.textContent = content;
  message.append(author, text); log.append(message); log.scrollTop = log.scrollHeight;
  return { message, text };
}
chatInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!chatBusy) chatForm.requestSubmit(); }
});
chatForm.addEventListener('submit', async event => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (chatBusy || !question) return;
  if (retryUntil > Date.now()) { chatStatus.textContent = retryMessage(Math.ceil((retryUntil - Date.now()) / 1000)); return; }
  chatBusy = true; activeRequest = new AbortController();
  const signal = activeRequest.signal;
  sendButton.hidden = true; stopButton.hidden = false; clearButton.disabled = true;
  appendMessage('user', question); chatInput.value = ''; announcement.textContent = '';
  const reply = appendMessage('assistant', '');
  reply.message.classList.add('streaming');
  const dots = document.createElement('span'); dots.className = 'typing-dots'; dots.setAttribute('aria-hidden', 'true'); dots.innerHTML = '<i></i><i></i><i></i>';
  reply.message.append(dots);
  let answer = '', done = false, truncated = false;
  const showToken = (text: string) => {
    const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 70;
    dots.remove(); answer += text; reply.text.textContent = answer;
    if (follow) log.scrollTop = log.scrollHeight;
  };
  try {
    chatStatus.textContent = 'Connecting…';
    const settings = await getConfig();
    signal.throwIfAborted();
    if (!settings.chat) throw new Error('The AI Twin is not connected yet. Please email ahmadnouh428@gmail.com.');
    chatStatus.textContent = 'Checking your connection…';
    const token = await securityToken('chat', settings.siteKey, signal);
    signal.throwIfAborted();
    chatStatus.textContent = 'Preparing your answer…';
    // ponytail: page-memory history only; the last two completed turns keep requests small.
    const payload = chatRequest(messages, question, token);
    const history = payload.messages;
    const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) });
    if (!response.ok) {
      if (response.status === 429) {
        const seconds = retryAfterSeconds(response.headers.get('Retry-After'));
        if (seconds !== undefined) { retryUntil = Date.now() + seconds * 1000; updateRetry(); }
      }
      const result = await response.json() as { error?: string };
      throw new Error(result.error || 'The Twin is temporarily unavailable. Please try again.');
    }
    if (response.headers.get('Content-Type')?.includes('text/event-stream') && response.body) {
      for await (const frame of readEvents(response.body)) {
        signal.throwIfAborted();
        const data = JSON.parse(frame.data) as { text?: string; error?: string; truncated?: boolean };
        if (frame.event === 'error') throw new Error(data.error || 'The response was interrupted.');
        if (frame.event === 'token' && typeof data.text === 'string') { showToken(data.text); chatStatus.textContent = 'Writing…'; }
        if (frame.event === 'done') { done = true; truncated = data.truncated === true; break; }
      }
      if (!done || !answer) throw new Error('The response was interrupted. Please try again.');
    } else {
      const result = await response.json() as { answer?: string; truncated?: boolean };
      if (!result.answer) throw new Error('The Twin could not complete an answer. Please try again.');
      showToken(result.answer); done = true; truncated = result.truncated === true;
    }
    reply.text.replaceChildren(...answerBlocks(answer).map(block => {
      const element = document.createElement(block.kind === 'heading' ? 'h4' : block.kind === 'list' ? 'ul' : block.kind === 'table' ? 'div' : 'p');
      if (block.kind === 'table') {
        element.className = 'chat-table'; element.tabIndex = 0; element.setAttribute('role', 'region'); element.setAttribute('aria-label', 'Response comparison');
        const table = document.createElement('table');
        block.lines.forEach((line, index) => {
          const row = document.createElement('tr');
          line.trim().split('|').slice(1, -1).forEach(value => { const cell = document.createElement(index === 0 ? 'th' : 'td'); if (index === 0) cell.setAttribute('scope', 'col'); cell.textContent = value.trim(); row.append(cell); });
          table.append(row);
        });
        element.append(table);
      } else if (block.kind === 'list') element.append(...block.lines.map(line => {
        const item = document.createElement('li'); item.textContent = line;
        if (/^https:\/\/[^\s]+$/.test(line)) {
          const link = document.createElement('a'); link.href = line; link.textContent = line; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.replaceChildren(link);
        }
        return item;
      }));
      else element.textContent = block.lines[0];
      return element;
    }));
    if (!truncated) messages = [...history, { role: 'assistant', content: answer }];
    chatStatus.textContent = truncated ? 'Response limit reached. Ask a more specific follow-up for more detail.' : '';
    announcement.textContent = `AI Twin: ${answer}`;
  } catch (error) {
    chatStatus.textContent = signal.aborted ? 'Response stopped. You can send another question.' : errorText(error);
    if (!chatInput.value) chatInput.value = question;
    if (!answer) reply.message.remove();
  } finally {
    dots.remove(); reply.message.classList.remove('streaming');
    if (answer && (!done || truncated)) {
      const note = document.createElement('small'); note.className = 'message-note'; note.textContent = truncated ? 'Response limit reached' : 'Response incomplete'; reply.message.append(note);
      announcement.textContent = `Partial AI Twin response: ${answer}`;
    }
    chatBusy = false; activeRequest = undefined; sendButton.hidden = false; stopButton.hidden = true; clearButton.disabled = false;
    if (dialog.open && !closing) chatInput.focus({ preventScroll: true });
  }
});

const leadForm = document.querySelector<HTMLFormElement>('#lead-form')!;
const leadStatus = document.querySelector<HTMLElement>('#lead-status')!;
let submissionId = crypto.randomUUID();
let lastPayload = '';
let leadBusy = false;
leadForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (leadBusy) return;
  const fields = Object.fromEntries(new FormData(leadForm)) as Record<string, string>;
  const payload = JSON.stringify(fields);
  if (payload !== lastPayload) submissionId = crypto.randomUUID();
  lastPayload = payload;
  const send = leadForm.querySelector<HTMLButtonElement>('button')!;
  leadBusy = true; send.disabled = true; send.setAttribute('aria-busy', 'true'); delete leadStatus.dataset.success;
  try {
    leadStatus.textContent = 'Connecting…';
    const settings = await getConfig();
    if (!settings.lead) throw new Error('The contact form is not connected yet. Please email ahmadnouh428@gmail.com directly.');
    leadStatus.textContent = 'Checking your connection…';
    const token = await securityToken('lead', settings.siteKey);
    leadStatus.textContent = 'Sending your message…';
    await post('/api/lead', { ...fields, token, submissionId });
    leadStatus.textContent = 'Your message has been sent to Ahmad. Thank you for getting in touch.';
    leadStatus.dataset.success = 'true'; leadForm.reset(); submissionId = crypto.randomUUID(); lastPayload = '';
  } catch (error) { leadStatus.textContent = errorText(error); }
  finally { leadBusy = false; send.disabled = false; send.removeAttribute('aria-busy'); }
});
