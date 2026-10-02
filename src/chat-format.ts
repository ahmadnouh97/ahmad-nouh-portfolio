// A small display formatter for the headings and bullets the Twin uses.
// Everything is rendered through textContent, including HTML-looking input.
export function answerBlocks(answer: string) {
  const clean = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  const separated = answer.replace(/^(#{1,6}\s+[^\n]+)$/gm, '\n\n$1\n\n').replace(/^(\s*[-*]\s+[^\n]+(?:\n\s*[-*]\s+[^\n]+)*)/gm, '\n\n$1\n\n');
  return separated.trim().split(/\n\s*\n/).filter(Boolean).map(block => {
    const lines = block.split('\n');
    // ponytail: simple pipe tables only; use a full Markdown parser if nested syntax becomes necessary.
    if (lines.length >= 2 && lines[0].trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[1])) return { kind: 'table' as const, lines: lines.filter((_, i) => i !== 1).map(clean) };
    if (lines.length === 1 && (/^#{1,6}\s+/.test(block) || /^\*\*[^*]+\*\*\s*$/.test(block))) return { kind: 'heading' as const, lines: [clean(block.replace(/^#{1,6}\s+/, ''))] };
    if (lines.every(line => /^\s*[-*]\s+/.test(line))) return { kind: 'list' as const, lines: lines.map(line => clean(line.replace(/^\s*[-*]\s+/, ''))) };
    return { kind: 'paragraph' as const, lines: [clean(block)] };
  });
}
