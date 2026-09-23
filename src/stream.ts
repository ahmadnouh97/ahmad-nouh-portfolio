// Shared SSE decoding for Groq and the browser; handles split UTF-8 and CRLF frames.
export async function* readEvents(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '', event = 'message', data: string[] = [], size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      let end: number;
      while ((end = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, end).replace(/\r$/, '');
        buffer = buffer.slice(end + 1);
        size += line.length;
        if (size > 32768) throw new Error('Stream event too large.');
        if (!line) {
          if (data.length) yield { event, data: data.join('\n') };
          event = 'message'; data = []; size = 0;
        } else if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
      }
      if (buffer.length > 32768) throw new Error('Stream event too large.');
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
