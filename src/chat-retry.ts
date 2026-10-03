// Groq Retry-After values are seconds; ignore missing or malformed provider hints.
export function retryAfterSeconds(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 && Number.isSafeInteger(Math.ceil(seconds)) ? Math.ceil(seconds) : undefined;
}

export function retryMessage(seconds: number): string {
  const amount = seconds < 60 ? seconds : Math.ceil(seconds / 60);
  const unit = seconds < 60 ? 'second' : 'minute';
  const wait = `${amount} ${unit}${amount === 1 ? '' : 's'}`;
  return `The AI Twin has reached its current limit. Please try again in ${wait}, or email Ahmad.`;
}
