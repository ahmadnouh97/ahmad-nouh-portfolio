// Shared by the browser and API so detailed answers remain valid follow-up context.
export const MAX_ANSWER_CHARS = 8000;
export const MAX_CONVERSATION_CHARS = 10500;

export function chatRequest(prior: { role: 'user' | 'assistant'; content: string }[], question: string, token: string) {
  const messages = [...prior.slice(-4), { role: 'user' as const, content: question }];
  const payload = { messages, token, stream: true };
  // Retain complete turns and leave room for UTF-8 text and the security token.
  while (messages.length > 1 && (messages.reduce((n, m) => n + m.content.length, 0) > MAX_CONVERSATION_CHARS || new TextEncoder().encode(JSON.stringify(payload)).byteLength > 16000)) messages.splice(0, 2);
  return payload;
}
