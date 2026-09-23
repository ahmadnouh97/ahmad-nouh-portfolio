// Public, reviewed facts only. Shared by the static pages and AI Twin.
// Confirmed facts from 2026-09-08 override the portfolio draft.
export const profile = {
  name: 'Ahmad Nouh', role: 'AI Engineer', location: 'Istanbul, Turkey',
  headline: 'Useful AI, built for the real world.',
  intro: 'I build LLM applications, retrieval and recommendation systems, Arabic NLP, and the Python services behind them.',
  availability: 'Open to opportunities across EMEA',
  email: 'ahmadnouh428@gmail.com',
  github: 'https://github.com/ahmadnouh97',
  linkedin: 'https://www.linkedin.com/in/ahmad-nouh/',
  about: 'I work at the point where machine-learning experiments become usable software. I care about model behavior, data quality, latency, failure handling, and the engineering work needed to move a feature into a product.',
  style: 'I work best with clear outcomes, technical ownership, focused execution, and purposeful collaboration across product and engineering teams.',
};

export const cases = [
  {
    slug: 'blink', name: 'Blink', number: '01', period: 'Nov 2025 — Jul 2026',
    role: 'AI Engineer · Remote', category: 'Recommendations & agent workflows',
    title: 'Making the right connections.',
    summary: 'Attendee matchmaking, session recommendations, and the Python services behind them.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'LangGraph'],
    intro: 'At Blink, I delivered recommendation features that helped connect attendees and surface relevant sessions. Alongside that work, I designed and evaluated a separate beta workflow for flight creation.',
    sections: [
      { title: 'Recommendations, delivered', label: 'Product engineering', paragraphs: ['I delivered attendee matchmaking and session recommendations using PostgreSQL/pgvector and Python/FastAPI services. The work included automated tests, CI/CD, and staged deployments.', 'I worked with product, frontend, mobile, QA, and backend colleagues to bring the AI features into the product.'] },
      { title: 'A flight-creation agent in beta', label: 'Beta · Feature-flagged', paragraphs: ['I designed and evaluated a feature-flagged LangGraph agent with five tools covering booking, attendee search, location lookup, and document parsing. This was a beta agent workflow.', 'A Docling and Gemini 2.5 Flash extraction workflow converted flight and hotel PDFs and images into structured data. The recommendation features above were delivered; this agent remained an evaluated beta.'] },
      { title: 'Evaluating self-hosted inference', label: 'Feasibility evaluation', paragraphs: ['I evaluated Gemma 3 12B with Ollama on AWS EC2 G5 GPUs. I measured time to first token, throughput, latency, memory, and GPU utilization to assess self-hosting feasibility.'] },
    ],
  },
  {
    slug: 'ment', name: 'MENT', number: '02', period: 'Oct 2023 — Oct 2025',
    role: 'AI Engineer · Remote', category: 'Enrichment & relationship intelligence',
    title: 'From scattered data to useful context.',
    summary: 'Faster extraction, better profile attribution, and enrichment services that connect the dots.',
    stack: ['Python', 'Celery', 'n8n', 'MCP', 'Neo4j', 'RabbitMQ'],
    intro: 'At MENT, my work covered extraction pipelines, data-to-profile attribution, enrichment workflows, and relationship insights. Each addressed a different part of turning source data into useful context.',
    sections: [
      { title: 'A shorter path through extraction', label: 'Pipeline improvement', paragraphs: ['I reduced a core AI pipeline from about 15 minutes to under 3. Asynchronous LLM calls extracted different schema sections in parallel, with mapping and validation handled in Python.'] },
      { title: 'Matching data to the right person', label: 'Attribution improvement', paragraphs: ['I improved data-to-profile attribution by approximately 33% compared with the prior system, with particular emphasis on people who had identical or similar names. This is an attribution result, separate from the pipeline timing measurement.'] },
      { title: 'Contributing to multi-agent enrichment', label: 'Workflow contribution', paragraphs: ['I contributed to n8n multi-agent enrichment workflows, including Model Context Protocol tool integration, RabbitMQ integration and retries, and Grafana tracing.', 'I also built Python microservices and Celery workers for enrichment workloads, and integrated Azure OpenAI into retrieval and conversational services.'] },
      { title: 'Relationships that support insights', label: 'Knowledge graph', paragraphs: ['I designed and implemented a Neo4j relationship graph for shared-interest, employer, and multi-hop network insights.'] },
    ],
  },
  {
    slug: 'lableb', name: 'Lableb', number: '03', period: 'Aug 2020 — Sep 2023',
    role: 'AI Engineer · Remote', category: 'Arabic NLP research & services',
    title: 'Working with the complexity of Arabic.',
    summary: 'Spelling-correction research, language-model evaluation, and a production spam service.',
    stack: ['Python', 'KenLM', 'DVC', 'Azure ML', 'Go'],
    intro: 'At Lableb, I worked across Arabic NLP research and service engineering. I joined as an AI engineering intern from April to July 2020, before moving into the full-time role in August 2020.',
    sections: [
      { title: 'Researching better spelling correction', label: 'Research & engineering', paragraphs: ['I compared n-gram and neural noisy-channel approaches through iterative spelling-correction experiments. KenLM improved runtime while giving comparable results; I versioned related spelling artifacts with DVC.'] },
      { title: 'Training and evaluating Arabic models', label: 'Model research', paragraphs: ['I researched, trained, and evaluated named entity recognition, part-of-speech tagging, transliteration, and spelling-correction models in Azure Machine Learning. Evaluation included task-appropriate measures such as F1, precision, recall, and accuracy.'] },
      { title: 'A spam service in production', label: 'Separate production outcome', paragraphs: ['I built a B2B spam-classification service that handled up to 30,000 requests per day and filtered about 90% of spam queries.', 'My service engineering work included NLP microservices built with Python, Go, Flask, Spring Boot, and Go Fiber.'] },
    ],
  },
  {
    slug: 'second-memory', name: 'Second Memory', number: '04', period: 'Personal project',
    role: 'Design & engineering', category: 'Personal knowledge assistant',
    title: 'Save it now. Find it when it matters.',
    summary: 'A self-hosted home for saved web content, with hybrid search and a grounded assistant.',
    stack: ['FastAPI', 'LangGraph', 'pgvector', 'Flutter', 'Docker Compose'],
    source: 'https://github.com/ahmadnouh97/my-second-memory',
    intro: 'Second Memory saves and organizes content from URLs, then helps you find it again through filters, hybrid retrieval, and an AI assistant. It supports videos, posts, repositories, and articles.',
    sections: [
      { title: 'From a URL to a saved item', label: 'Saving flow', paragraphs: ['The saving flow adds AI-assisted metadata extraction, summaries, and reusable tags. A Flutter client supports web and Android, including Android share intents.', 'Saved content can be filtered by tag, content type, and date. JSON and CSV import/export include duplicate handling.'] },
      { title: 'Two ways to retrieve, one ranked result', label: 'Hybrid search', paragraphs: ['The Python/FastAPI backend uses PostgreSQL and pgvector. Search combines cosine-similarity vector retrieval with PostgreSQL full-text search, then merges the results using Reciprocal Rank Fusion.'] },
      { title: 'An assistant with tools and references', label: 'LangGraph assistant', paragraphs: ['The LangGraph assistant uses search and listing tools to answer questions about saved content. Responses stream to the client and include clickable references to saved items.', 'The engineering focus includes tool boundaries, typed APIs, asynchronous streaming, and user data isolation.'] },
      { title: 'Self-hosting the application', label: 'Delivery', paragraphs: ['Docker Compose and database migrations support self-hosting. The documented configuration uses hosted Groq inference and Gemini embeddings, so the application still depends on external model APIs.'] },
    ],
  },
];

export const skills = [
  ['AI applications & retrieval', 'LangGraph, LangChain, Retrieval-Augmented Generation, Model Context Protocol, agent tool calling, structured outputs, embeddings, prompt engineering, n8n, semantic search, hybrid retrieval, Reciprocal Rank Fusion, knowledge graphs'],
  ['Backend engineering', 'Python, FastAPI, Flask, Django, REST APIs, SQL, asynchronous workflows, Celery, RabbitMQ, Redis, PostgreSQL, pgvector, Neo4j, microservices'],
  ['Machine learning & NLP', 'Arabic NLP, text classification, named entity recognition, part-of-speech tagging, spelling correction, transliteration, TensorFlow, Keras, Hugging Face, NumPy, Pandas, MLflow, DVC, ChromaDB'],
  ['Cloud & delivery', 'Azure OpenAI, Azure Machine Learning, AWS EC2 G5, Docker, Git, CI/CD, Grafana, Ollama, model evaluation, performance benchmarking'],
  ['Additional development experience', 'Go, Java, Spring Boot, Go Fiber, JavaScript, TypeScript, Node.js, Angular, Ionic, Streamlit, Flutter'],
];
export const timeline = [
  ['Nov 2025 — Jul 2026', 'Blink', 'AI Engineer · Remote'],
  ['Oct 2023 — Oct 2025', 'MENT', 'AI Engineer · Remote'],
  ['Aug 2020 — Sep 2023', 'Lableb', 'AI Engineer · Remote'],
  ['Apr 2020 — Jul 2020', 'Lableb', 'AI Engineer Intern · Remote'],
  ['Oct 2018 — Jan 2020', 'Code Experts', 'Web Developer · Damascus'],
];
export const education = "Bachelor’s degree in Information Technology Engineering, Artificial Intelligence specialization. Damascus University, 2015–2021.";
export const languages = ['Arabic — Native or bilingual proficiency', 'English — Professional working proficiency', 'Turkish — Elementary proficiency'];
export const certifications = ['DeepLearning.AI TensorFlow Developer · July 2021', 'Introduction to Machine Learning in Production · DeepLearning.AI', 'Natural Language Processing in TensorFlow · DeepLearning.AI · June 2021', 'Python for Data Science and AI · IBM · September 2020'];
export const otherProjects = [
  { name: 'Topic Classification', description: 'An MLflow pipeline for training, hyperparameter tuning, prediction, class and slice evaluation, and experiment tracking. Streamlit views for data, performance, and inference.', stack: 'Python · MLflow · Streamlit', url: 'https://github.com/ahmadnouh97/e2e-topic-classification' },
  { name: 'IMDb Semantic Search', description: 'Movie discovery by meaning, using all-MiniLM-L6-v2 sentence embeddings and ChromaDB to retrieve related movie metadata through a Streamlit interface.', stack: 'Python · ChromaDB · Sentence Transformers', url: 'https://github.com/ahmadnouh97/imdb-semantic-search' },
];
export const publicFacts = JSON.stringify({ profile, cases, skills, timeline, education, languages, certifications, otherProjects, codeExperts: 'Angular and Ionic interfaces for video-on-demand and taxi-booking products; Node.js backend contributions and a WebSocket chat feature connecting drivers and riders.' });
