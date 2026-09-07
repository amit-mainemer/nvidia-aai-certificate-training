export const officialTraining = [
  { name: 'Building RAG Agents With LLMs', price: '$90', hours: '8 h', mode: 'Self-paced (instructor-led available)',
    why: 'The core course behind the retrieval and agent portions of the blueprint. Covers LangChain/LangGraph agent construction, document loaders, vector stores, guardrails around retrieval and a full RAG agent build.',
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-15+V1' },
  { name: 'Building Agentic AI Applications With LLMs', price: '$90', hours: '8 h', mode: 'Self-paced (instructor-led available)',
    why: 'Structured outputs, tool/environment interfaces, multi-agent orchestration with LangGraph, concurrency, data flywheels and a scalable multi-tenant agent API as the final assessment.',
    url: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+C-FX-25+V1' },
  { name: 'Evaluating RAG and Semantic Search Systems', price: '$30', hours: '3 h', mode: 'Self-paced',
    why: 'Directly maps to the 13% Evaluation and Tuning domain: retrieval metrics, generation metrics, and building an evaluation harness you can trust.',
    url: 'https://www.nvidia.com/en-us/training/' },
  { name: 'Introduction to Deploying RAG Pipelines for Production at Scale', price: '$90', hours: '8 h', mode: 'Self-paced (instructor-led available)',
    why: 'Covers the 13% Deployment and Scaling domain — serving, Kubernetes, autoscaling and production RAG operations.',
    url: 'https://www.nvidia.com/en-us/training/' },
  { name: 'Adding New Knowledge to LLMs', price: '$500', hours: '8 h', mode: 'Instructor-led',
    why: 'Fine-tuning, PEFT/LoRA and knowledge injection — the tuning half of domain 3. The most expensive of the five; the self-paced courses cover more of the blueprint per dollar.',
    url: 'https://www.nvidia.com/en-us/training/' },
]

export const docs = [
  { group: 'Certification', items: [
    { name: 'Official NCP-AAI exam page and blueprint', url: 'https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/', note: 'The authoritative source for domains, weights, format and registration. Re-check it before booking — weights do change between revisions.' },
    { name: 'NVIDIA certification catalogue', url: 'https://www.nvidia.com/en-us/learn/certification/', note: 'All NVIDIA certifications, including the associate-level tracks if you want a stepping stone.' },
    { name: 'NVIDIA Deep Learning Institute', url: 'https://www.nvidia.com/en-us/training/', note: 'Course catalogue and the self-paced learning platform.' },
  ]},
  { group: 'NVIDIA platform documentation', items: [
    { name: 'NeMo Agent Toolkit docs', url: 'https://docs.nvidia.com/nemo/agent-toolkit/latest/index.html', note: 'Agent types (ReAct, ReWOO, tool-calling, router), YAML workflow config, profiler, evaluation and observability.' },
    { name: 'NeMo microservices docs', url: 'https://docs.nvidia.com/nemo/microservices/latest/about/index.html', note: 'Customizer, Evaluator, Guardrails, Retriever, Data Store, Entity Store and their APIs.' },
    { name: 'NeMo Guardrails (GitHub)', url: 'https://github.com/NVIDIA/NeMo-Guardrails', note: 'Colang syntax and the five rail types, with runnable examples.' },
    { name: 'NVIDIA NIM documentation', url: 'https://docs.nvidia.com/nim/index.html', note: 'Deployment, the OpenAI-compatible API surface, LoRA serving and configuration.' },
    { name: 'TensorRT-LLM', url: 'https://nvidia.github.io/TensorRT-LLM/', note: 'In-flight batching, paged KV cache, quantisation and speculative decoding — the engine inside NIM.' },
    { name: 'NVIDIA Dynamo', url: 'https://github.com/ai-dynamo/dynamo', note: 'Disaggregated prefill/decode, KV-aware routing and distributed serving.' },
    { name: 'build.nvidia.com', url: 'https://build.nvidia.com/', note: 'Try NIM-hosted models, embedders and rerankers free before you self-host. The fastest way to get hands-on.' },
    { name: 'NVIDIA Blueprints', url: 'https://build.nvidia.com/blueprints', note: 'Reference architectures — enterprise RAG, AI-Q research assistant — with code and Helm charts.' },
  ]},
  { group: 'Framework documentation', items: [
    { name: 'LangGraph', url: 'https://langchain-ai.github.io/langgraph/', note: 'State graphs, checkpointers, interrupts and human-in-the-loop — the concepts behind several exam questions.' },
    { name: 'Model Context Protocol', url: 'https://modelcontextprotocol.io/', note: 'Tool, resource and prompt standardisation. Know how it differs from A2A.' },
    { name: 'Agent2Agent (A2A)', url: 'https://a2a-protocol.org/', note: 'Agent Cards, capability discovery and cross-vendor task delegation.' },
    { name: 'Ragas', url: 'https://docs.ragas.io/', note: 'Faithfulness, answer relevancy, context precision and context recall — the metric definitions used in the evaluation domain.' },
    { name: 'OWASP Top 10 for LLM Applications', url: 'https://genai.owasp.org/', note: 'Prompt injection, excessive agency, insecure output handling — the vocabulary the safety domain uses.' },
  ]},
  { group: 'Papers worth reading once', items: [
    { name: 'ReAct: Synergizing Reasoning and Acting', url: 'https://arxiv.org/abs/2210.03629', note: 'The pattern the exam references most often.' },
    { name: 'Reflexion: Language Agents with Verbal Reinforcement Learning', url: 'https://arxiv.org/abs/2303.11366', note: 'Self-critique stored in episodic memory across trials.' },
    { name: 'ReWOO: Decoupling Reasoning from Observations', url: 'https://arxiv.org/abs/2305.18323', note: 'The token-efficient planner/worker/solver split.' },
    { name: 'Tree of Thoughts', url: 'https://arxiv.org/abs/2305.10601', note: 'Branching search with intermediate state evaluation.' },
    { name: 'Lost in the Middle', url: 'https://arxiv.org/abs/2307.03172', note: 'Why long contexts degrade and why reranking matters.' },
    { name: 'Self-Consistency Improves Chain of Thought Reasoning', url: 'https://arxiv.org/abs/2203.11171', note: 'Sample-and-vote decoding.' },
  ]},
]

export const studyPlans = [
  { name: '4-week sprint', per: '~10 h/week', for: 'You already build agents in production and need to close gaps.',
    weeks: [
      'Modules 1–2 (Architecture, Development). Take both module quizzes; anything below 80% gets re-read.',
      'Modules 3–4 (Evaluation, Deployment) plus a first full mock exam to find weak domains early.',
      'Modules 5–7 (Cognition, Knowledge, NVIDIA Platform). Build one small agent on build.nvidia.com with a NIM endpoint.',
      'Modules 8–10, then two mock exams. Review every wrong answer and its distractor analysis before the second.',
    ]},
  { name: '8-week thorough', per: '~6 h/week', for: 'You have AI/ML experience but limited hands-on agent work.',
    weeks: [
      'Module 1. Read every lesson; write your own summary of the agency spectrum.',
      'Module 2 plus build a two-tool ReAct agent yourself.',
      'Module 3. Build a small golden set for your agent and measure it.',
      'Module 4 plus deploy something behind a NIM endpoint. First mock exam.',
      'Modules 5 and 6. Add retrieval with reranking to your agent.',
      'Modules 7 and 8. Add OpenTelemetry tracing and read the traces.',
      'Modules 9 and 10. Add guardrails and a human approval step.',
      'Two mock exams plus a full glossary pass. Re-read the lessons behind every miss.',
    ]},
  { name: '12-week foundation', per: '~5 h/week', for: 'You are newer to agentic AI and want to genuinely learn it, not just pass.',
    weeks: [
      'Module 1, lessons 1–3.', 'Module 1, lessons 4–5 plus the quiz.',
      'Module 2, lessons 1–3.', 'Module 2, lessons 4–5. Build a tool-calling agent.',
      'Module 3 plus the DLI evaluation course.', 'Module 4 plus a deployment exercise.',
      'Module 5.', 'Module 6 plus build a RAG pipeline with hybrid search.',
      'Module 7 plus hands-on with NIM and NeMo Agent Toolkit.', 'Modules 8 and 9.',
      'Module 10 plus first mock exam.', 'Two more mock exams and targeted review.',
    ]},
]

export const examDayTips = [
  'The exam is scenario-heavy. Read the constraints in the stem before the options — latency, cost, regulation and reproducibility usually eliminate two options immediately.',
  'When two options both look correct, prefer the one that is complete: names the control, the enforcement point and the fallback. Partial answers are the standard distractor.',
  'Prefer the least agency and the least machinery that satisfies the requirement. "Add a multi-agent system" is rarely the answer to a problem one agent already solves.',
  'Anything enforced only by prompt wording is wrong when the stem is about security or compliance. Enforcement lives in the runtime.',
  'Volatile facts → retrieval. Behaviour, format and style → fine-tuning. This one rule resolves a surprising number of questions.',
  'Watch for absolute words in options — "eliminates", "guarantees", "always", "never". They are usually the giveaway of a wrong answer, except where a mechanism genuinely guarantees something (constrained decoding guarantees valid structure).',
  'Flag and move on. With 60–70 questions in 120 minutes you have roughly 1.8 minutes each; do not spend six on one scenario.',
  'For NVIDIA-component questions, match the requirement to the component\'s one job. If you can state that job in a sentence for each of NIM, Retriever, Customizer, Evaluator, Curator, Guardrails and the Agent Toolkit, this domain is free marks.',
]
