import { cases, profile, skills, otherProjects, education, languages, certifications, codeExperts, knowledgeNotes } from './content.ts';
import { MAX_ANSWER_CHARS } from './chat-limits.ts';

const thirdPerson = (text: string) => text.replace(/\bI have\b/g, 'Ahmad has').replace(/\bI build\b/g, 'Ahmad builds').replace(/\bI work\b/g, 'Ahmad works').replace(/\bI\b/g, 'Ahmad').replace(/\bMy\b/g, 'His').replace(/\bmy\b/g, 'his');
const passage = (id: string, title: string, text: string, source = '') => ({ id, title, text: thirdPerson(text), source });

export const recruiterPrompts = [
  ['Experience', 'Tell me about Ahmad’s professional experience.', 'recruiter-experience'],
  ['Technical skills', 'What are Ahmad’s strongest technical skills?', 'recruiter-skills'],
  ['Results', 'What has Ahmad delivered, and what results did he achieve?', 'recruiter-results'],
  ['Role fit', 'How does Ahmad’s experience fit an AI/ML Engineer role?', 'recruiter-fit'],
] as const;

// The model selects passages, never writes visitor-facing career claims.
// Keep qualifications with their claims; both come from the pages' public facts.
export const chatPassages = [
  passage('conversation-greeting', 'Greeting', 'Hello! Ask me about Ahmad’s professional experience, technical skills, projects, or results. What would you like to know?'),
  passage('conversation-thanks', 'Thanks', 'You’re welcome! Feel free to ask a follow-up about Ahmad’s work, or share a job description to explore how his experience relates to the role.'),
  passage('recruiter-experience', 'Recruiter answer · Professional experience', `Ahmad is an AI Engineer with approximately six years of professional AI engineering experience through July 2026. His career spans Arabic NLP, LLM applications, recommendations, and the Python services that bring AI features into products.

### Blink · Nov 2025–Jul 2026

In a remote role, he delivered attendee matchmaking and session recommendations using Python/FastAPI, PostgreSQL, pgvector, and RabbitMQ, taking the features through automated tests and staged releases. He also built OCR-assisted flight-ticket and hotel document extraction with Docling and Gemini 2.5 Flash, and designed and evaluated a separate five-tool LangGraph flight-creation agent in feature-flagged beta.

### MENT · Oct 2023–Oct 2025

Working in a hybrid role in Istanbul, he developed LLM extraction and profile-enrichment services. Parallel asynchronous extraction with Python mapping and validation reduced a core pipeline from about 15 minutes to under 3. His other contributions included profile attribution, Neo4j relationship modeling, and n8n multi-agent enrichment with MCP tools.

### Lableb · Aug 2020–Sep 2023

In a hybrid role in Damascus, he built a production B2B spam-classification service handling up to 30,000 requests per day and filtering about 90% of spam queries. Alongside service delivery, he researched and evaluated Arabic spelling correction, NER, POS tagging, and transliteration.

Earlier, he worked in web development at Code Experts from October 2018 to January 2020 and completed an AI engineering internship at Lableb from April to July 2020. He is based in Istanbul and open to opportunities across EMEA.`, '/#work'),
  passage('recruiter-skills', 'Recruiter answer · Strongest technical skills', `Ahmad’s strongest combination is Python backend engineering, LLM application development, retrieval and recommendations, and Arabic NLP. The evidence is in systems he delivered professionally and applications he built independently.

### Python services around AI

At Blink, he built FastAPI services supporting recommendation features, with PostgreSQL, RabbitMQ, automated tests, and staged releases. At MENT, his work included Python microservices, Celery workers, and asynchronous LLM extraction with mapping and validation.

### LLM applications and structured extraction

His professional work includes Azure OpenAI integrations and enrichment at MENT, a five-tool LangGraph flight-creation agent in beta at Blink, and OCR-assisted extraction from PDFs and images using Docling and Gemini 2.5 Flash. These examples connect model APIs and tool workflows with product and backend requirements.

### Retrieval and recommendations

He delivered content-based attendee and session recommendations using pgvector at Blink and built a Neo4j relationship graph at MENT. In his personal Second Memory application, he combined vector and full-text search with Reciprocal Rank Fusion, account-scoped filtering, and a tool-using assistant.

### Arabic NLP and ML evaluation

At Lableb, he combined production spam classification with research into spelling correction, NER, POS tagging, and transliteration. His personal Topic Classification project adds MLflow training, tuning, and class/slice evaluation; SILA-4B adds hands-on QLoRA training and controlled base-versus-adapter evaluation.

This makes his experience particularly relevant where Python services, language models, retrieval, and evaluation need to work together.`, '/#skills'),
  passage('recruiter-results', 'Recruiter answer · Delivered work & results', `Three professional examples show how Ahmad connects AI work with delivery and measurable outcomes: faster enrichment at MENT, production spam filtering at Lableb, and recommendation features at Blink.

### MENT · Faster extraction and clearer attribution

He reduced a core AI pipeline from about 15 minutes to under 3 by parallelizing asynchronous LLM calls for different schema sections, then handling mapping and validation in Python.

Separately, he improved data-to-profile attribution by approximately 33% versus the prior system, addressing ambiguity between similar or identical names. This is the reported attribution improvement; it is separate from the extraction timing and his Neo4j graph work.

### Lableb · Production spam classification

He built a B2B spam-classification service handling up to 30,000 requests per day and detecting/filtering about 90% of spam queries. The percentage refers specifically to spam queries filtered. The work combined classification with production service engineering and attention to false positives on legitimate traffic.

### Blink · Delivered recommendation features

He delivered content-based attendee matchmaking and session recommendations using Python/FastAPI, PostgreSQL, and pgvector, integrated through RabbitMQ. Delivery included automated tests, CI/CD, and development, staging, and production releases, with collaboration across product and engineering teams.`, '/#work'),
  passage('recruiter-fit', 'Recruiter answer · AI/ML Engineer role fit', `Ahmad’s experience is particularly relevant to applied AI/ML Engineer roles that combine model-driven features with Python backend delivery. His professional work connects language models, retrieval, data processing, and service engineering; his independent projects add end-to-end implementation and evaluation examples.

### LLM applications and AI backend work

For roles involving structured extraction, tool workflows, and model APIs, MENT and Blink provide direct examples: asynchronous LLM enrichment, Azure OpenAI integrations, a beta LangGraph agent, and OCR-assisted document extraction. His FastAPI services, Celery workers, RabbitMQ integration, tests, and staged releases provide the engineering context around those AI features.

### Retrieval, search, and recommendations

For retrieval-oriented roles, he brings delivered pgvector recommendations at Blink and Neo4j relationship modeling at MENT. His personal Second Memory application adds hybrid vector/full-text search, RRF ranking, filtered retrieval, and a LangGraph assistant, alongside a FastAPI backend and Flutter client.

### ML/NLP implementation and evaluation

Lableb provides professional experience in production spam classification and Arabic NLP research. Topic Classification demonstrates an MLflow training, tuning, prediction, and evaluation pipeline. SILA-4B demonstrates resource-constrained QLoRA experimentation and controlled base-versus-adapter evaluation, including transparent reporting of experimental outcomes.

The clearest matches are applied AI/ML Engineer, LLM Application Engineer, NLP/Search Engineer, and AI Backend Engineer roles. A specific job description would allow a closer comparison against the required stack and responsibilities.`, '/#work'),
  passage('profile', 'Ahmad’s background', `${profile.about}\n\n${profile.intro}\n\n${profile.location}. ${profile.availability}.`),
  passage('experience', 'Experience & scope', knowledgeNotes.experience),
  passage('working-style', 'Working style', profile.style),
  ...cases.flatMap(c => [
    passage(`${c.slug}-overview`, `${c.name} · Overview`, `${c.role} · ${c.period} · ${c.location}. ${c.headquarters ? `Company headquarters: ${c.headquarters}. ` : ''}${c.intro}\n\n${c.summary}`, `/work/${c.slug}/`),
    ...c.sections.map((s, i) => passage(`${c.slug}-${i}`, `${c.name} · ${s.title}`, c.slug === 'blink' && i === 1 ? s.paragraphs[0] : s.paragraphs.join('\n\n'), `/work/${c.slug}/`)),
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

export const selectionFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'portfolio_passages', strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['ids', 'unanswered'],
      properties: {
        ids: { type: 'array', items: { type: 'string', enum: chatPassages.map(p => p.id) } },
        unanswered: { type: 'boolean' },
      },
    },
  },
};

const normalizeQuestion = (text: string) => text.trim().toLowerCase().replace(/’/g, "'").replace(/[.!?]+$/, '').trim();

export function conversationSelection(question: string) {
  const text = normalizeQuestion(question);
  const id = /^(?:(?:hi|hello|hey)(?: there)?|good (?:morning|afternoon|evening))$/.test(text) ? 'conversation-greeting'
    : /^(?:thanks(?: a lot)?|thank you(?: so much)?)$/.test(text) ? 'conversation-thanks' : undefined;
  return id ? { ids: [id], unanswered: false } : undefined;
}

export function recruiterSelection(question: string) {
  const prompt = recruiterPrompts.find(([, text]) => normalizeQuestion(text) === normalizeQuestion(question));
  return prompt ? { ids: [prompt[2]], unanswered: false } : undefined;
}

export function groundedAnswer(selection: unknown, firstTurn: boolean): string {
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) throw new Error('Invalid passage selection.');
  const { ids, unanswered } = selection as Record<string, unknown>;
  if (Object.keys(selection).length !== 2 || !Array.isArray(ids) || ids.length > 6 || typeof unanswered !== 'boolean') throw new Error('Invalid passage selection.');
  const selected = [...new Set(ids)].map(id => {
    const found = chatPassages.find(p => p.id === id);
    if (!found) throw new Error('Unknown passage.');
    return found;
  });
  const parts = firstTurn ? ['I’m Ahmad’s AI assistant.'] : [];
  if (!selected.length) parts.push(`I don’t have documented information that answers that question. Please ask Ahmad directly at ${profile.email}.`);
  else {
    for (const p of selected) parts.push(/^(recruiter|conversation)-/.test(p.id) ? p.text : `### ${p.title}\n\n${p.text}`);
    if (unanswered) parts.push(`The documented information above does not establish every detail you asked about. Ahmad can clarify at ${profile.email}.`);
    const sources = [...new Set(selected.map(p => p.source).filter(Boolean))];
    if (sources.length) parts.push(`### Explore the work\n\n${sources.map(s => `- ${s.startsWith('/') ? `https://me.nouhlab.com${s}` : s}`).join('\n')}`);
  }
  const answer = parts.join('\n\n');
  // Never clip a passage away from the caveat that qualifies it.
  if (answer.length > MAX_ANSWER_CHARS) throw new Error('Selection exceeds answer limit.');
  return answer;
}
