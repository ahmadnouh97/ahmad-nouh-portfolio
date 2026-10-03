import { cases, profile, skills, otherProjects, education, languages, certifications, codeExperts, knowledgeNotes, timeline } from './content.ts';
import { MAX_ANSWER_CHARS } from './chat-limits.ts';

const thirdPerson = (text: string) => text.replace(/\bI have\b/g, 'Ahmad has').replace(/\bI build\b/g, 'Ahmad builds').replace(/\bI work\b/g, 'Ahmad works').replace(/\bI\b/g, 'Ahmad').replace(/\bMy\b/g, 'His').replace(/\bmy\b/g, 'his');
const passage = (id: string, title: string, text: string, source = '') => ({ id, title, text: thirdPerson(text), source });

export const recruiterPrompts = [
  ['Experience', 'Tell me about Ahmad’s professional experience.'],
  ['Technical skills', 'What are Ahmad’s strongest technical skills?'],
  ['Results', 'What has Ahmad delivered, and what results did he achieve?'],
  ['Role fit', 'How does Ahmad’s experience fit an AI/ML Engineer role?'],
] as const;

// Shared public evidence for generation and independent answer review.
export const chatPassages = [
  passage('profile', 'Ahmad’s background', `${profile.about}\n\n${profile.intro}\n\n${profile.location}. ${profile.availability}.`),
  passage('experience', 'Experience & scope', knowledgeNotes.experience),
  passage('career-history', 'Career timeline, including earlier work and internship', timeline.map(row => row.join(' · ')).join('\n'), '/#work'),
  passage('boundaries', 'Undocumented expertise & boundaries', knowledgeNotes.boundaries),
  passage('working-style', 'Working style', profile.style),
  ...cases.flatMap(c => [
    passage(`${c.slug}-overview`, `${c.name} · Overview`, `${c.role} · ${c.period} · ${c.location}. ${c.headquarters ? `Company headquarters: ${c.headquarters}. ` : ''}${c.intro}\n\n${c.summary}`, `/work/${c.slug}/`),
    ...c.sections.map((s, i) => passage(`${c.slug}-${i}`, `${c.name} · ${s.title}`, `${c.role} · ${c.period} · ${c.location}.\n\n${c.slug === 'blink' && i === 1 ? s.paragraphs[0] : s.paragraphs.join('\n\n')}`, `/work/${c.slug}/`)),
  ]),
  passage('blink-ocr', 'Blink · OCR-assisted document extraction', knowledgeNotes.blinkExtraction, '/work/blink/'),
  ...skills.map((s, i) => passage(`skills-${i}`, s.name, `${s.description}\n\nContext: ${s.context}. Tools used across that work: ${s.tools.join(', ')}.`, '/#skills')),
  ...otherProjects.map((p, i) => passage(`project-${i}`, `${p.name} · ${p.status}`, `${p.description}\n\n${p.result}\n\nTools: ${p.stack.join(', ')}.`, p.url)),
  passage('sila-results', 'SILA-4B · Evaluation & follow-up', knowledgeNotes.sila, otherProjects[0].url),
  passage('topic-scope', 'Topic Classification · Pipeline & evaluation scope', knowledgeNotes.topicClassification, otherProjects[1].url),
  passage('independent-limits', 'Personal demo evaluation scope', knowledgeNotes.independentProjectLimits, '/#projects'),
  passage('memory-limits', 'Second Memory · Documented boundaries', knowledgeNotes.secondMemoryLimits, '/work/second-memory/'),
  passage('earlier-work', 'Code Experts · Earlier web development', `${codeExperts.role} · ${codeExperts.period} · ${codeExperts.location}. ${codeExperts.description}\n\nTools: ${codeExperts.stack.join(', ')}.`, '/#work'),
  passage('education', 'Education & certifications', `${education}\n\n${certifications.join('\n')}`),
  passage('languages', 'Languages', `${languages.join('\n')}\n\n${knowledgeNotes.language}`),
  passage('contact', 'Contact Ahmad', `Email: ${profile.email}\nLinkedIn: ${profile.linkedin}\nGitHub: ${profile.github}\nYou can also use the portfolio contact form.`, '/#contact'),
];

// Short routing labels retain tool names and delivery/evaluation scope without sending passage previews.
const topicLabels = new Map<string, string>([
  ...skills.map((group, index) => [`skills-${index}`, `${group.name}; ${group.tools.join(', ')}`] as const),
  ...cases.flatMap(c => c.sections.map((section, index) => {
    const id = `${c.slug}-${index}`;
    const text = chatPassages.find(p => p.id === id)!.text;
    const tools = c.stack.filter(tool => text.includes(tool));
    return [id, `${c.name} · ${section.title} (${section.label})${tools.length ? '; ' + tools.join(', ') : ''}`] as const;
  })),
]);
export const retrievalCatalog = chatPassages.map(({ id, title }) => `${id}: ${topicLabels.get(id) ?? title}`).join('\n');

export const evidenceFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'portfolio_evidence', strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['ids'],
      properties: { ids: { type: 'array', maxItems: 6, items: { type: 'string', enum: chatPassages.map(p => p.id) } } },
    },
  },
};

// Free-form JSON avoids observed strict-schema clipping of answer text; validateDraft enforces its shape.
export const answerFormat = { type: 'json_object' } as const;

export const reviewFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'portfolio_review', strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['issues', 'valid'],
      properties: { issues: { type: 'array', items: { type: 'string' } }, valid: { type: 'boolean' } },
    },
  },
};

export function evidenceFor(ids: unknown) {
  if (!Array.isArray(ids) || ids.length > 6) throw new Error('Invalid evidence.');
  return [...new Set(ids)].map(id => {
    const found = typeof id === 'string' && chatPassages.find(p => p.id === id);
    if (!found) throw new Error('Unknown evidence.');
    return found;
  });
}

export function selectedEvidence(ids: unknown) {
  if (!Array.isArray(ids)) throw new Error('Invalid evidence.');
  // Resolve every ID before capping the context; unknown IDs must never be silently discarded.
  return [...new Set(ids)].map(id => evidenceFor([id])[0]).slice(0, 6);
}

export function validateDraft(value: unknown): { answer: string; ids: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid answer.');
  const { answer, ids } = value as Record<string, unknown>;
  if (Object.keys(value).length !== 2 || typeof answer !== 'string' || !answer.trim() || answer.length > MAX_ANSWER_CHARS || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(answer)) throw new Error('Invalid answer.');
  return { answer: answer.trim(), ids: evidenceFor(ids).map(p => p.id) };
}

export function groundedAnswer(draft: { answer: string; ids: string[] }): string {
  const sources = [...new Set(chatPassages.filter(p => draft.ids.includes(p.id)).map(p => p.source).filter(Boolean))].slice(0, 3);
  // Short factual and conversational replies need no automatic link block.
  const answer = draft.answer.split(/\s+/).length < 100 || !sources.length ? draft.answer
    : `${draft.answer}\n\n### Explore the work\n\n${sources.map(s => `- ${s.startsWith('/') ? `https://me.nouhlab.com${s}` : s}`).join('\n')}`;
  if (answer.length > MAX_ANSWER_CHARS) throw new Error('Answer exceeds limit.');
  return answer;
}
