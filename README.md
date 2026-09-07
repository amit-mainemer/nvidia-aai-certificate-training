# NCP-AAI Academy

A free, self-paced learning platform for the **NVIDIA-Certified Professional: Agentic AI (NCP-AAI)** exam.

**Live site:** https://amit-mainemer.github.io/nvidia-aai-certificate-training/

Built as a single-page React app with no backend — all progress lives in your browser's local storage.

---

## What's inside

| | |
|---|---|
| **31 written lessons** | Across all ten official exam domains, sized to the published weights |
| **116 glossary terms** | Every technical term is clickable/hoverable inline, with a definition *and* a note on how it's tested |
| **88 module quiz questions** | Immediate feedback, full explanations and distractor analysis ("why the others fail") |
| **66-question mock exam** | A separate bank, blueprint-weighted, on a 120-minute clock, scored per domain |
| **Study plans** | 4-week, 8-week and 12-week schedules |
| **Curated resources** | Official NVIDIA DLI courses, platform docs, protocols and the papers behind the patterns |

### Exam facts (verify on the [official page](https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/))

- **Code:** NCP-AAI · **Level:** Professional
- **Format:** 60–70 questions, 120 minutes, online remotely proctored (Certiverse)
- **Price:** $200 USD · **Validity:** 2 years · **Pass mark:** ~70%

### Blueprint coverage

| # | Domain | Weight | Module |
|---|---|---|---|
| 1 | Agent Architecture and Design | 15% | `m01-architecture` |
| 2 | Agent Development | 15% | `m02-development` |
| 3 | Evaluation and Tuning | 13% | `m03-evaluation` |
| 4 | Deployment and Scaling | 13% | `m04-deployment` |
| 5 | Cognition, Planning, and Memory | 10% | `m05-cognition` |
| 6 | Knowledge Integration and Data Handling | 10% | `m06-knowledge` |
| 7 | NVIDIA Platform Implementation | 7% | `m07-platform` |
| 8 | Run, Monitor, and Maintain | 5% | `m08-operations` |
| 9 | Safety, Ethics, and Compliance | 5% | `m09-safety` |
| 10 | Human-AI Interaction and Oversight | 5% | `m10-human` |

---

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173/nvidia-aai-certificate-training/
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Requires Node 18+. Dependencies: React 18, React Router, Vite. Nothing else.

## Deployment

Pushing to `master` (or `main`) triggers `.github/workflows/deploy.yml`, which builds and publishes
`dist/` to GitHub Pages.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment**
and set **Source** to **GitHub Actions**.

The app uses `HashRouter`, so deep links (`/#/module/architecture/agent-loop`) work on Pages
without any server-side rewrite. The Vite `base` in `vite.config.js` must match the repository
name if you fork this.

---

## Project layout

```
src/
├── data/
│   ├── exam.js               exam metadata + the ten weighted domains
│   ├── glossary.js           116 terms: definition + "on the exam" note
│   ├── examBank.js           66 mock-exam questions (separate from module quizzes)
│   ├── resources.js          official courses, docs, study plans, exam-day technique
│   └── modules/
│       ├── m01-architecture.js … m10-human.js
│       └── index.js          aggregates modules, lessons and the question pool
├── components/
│   ├── Blocks.jsx            renders the lesson content block format
│   ├── RichText.jsx          inline markup: [[term]], **bold**, `code`, [link](url)
│   ├── GlossaryTerm.jsx      the hover/click term popup
│   ├── Quiz.jsx              study mode and timed exam mode
│   ├── ScoreRing.jsx  BlueprintChart.jsx  Layout.jsx
├── pages/                    Home, Roadmap, Module, Lesson, Practice, MockExam, Glossary, Resources
├── lib/                      progress store (localStorage) + shuffling
└── styles/global.css         the whole design system — CSS variables, dark/light themes
```

### Authoring content

Lessons are plain data. A lesson is `{ id, title, minutes, blocks: [...] }`, where each block is one of:

```js
{ t: 'lede',    x: 'Opening paragraph' }
{ t: 'h2',      x: 'Section heading' }          // also feeds the on-page table of contents
{ t: 'p',       x: 'Body text with [[react|ReAct]] term links' }
{ t: 'ul',      items: ['…'] }                  // or 'ol'
{ t: 'code',    lang: 'python', title: '…', x: '…' }
{ t: 'callout', kind: 'exam'|'tip'|'warn'|'trap', title: '…', x: '…' | ['…'] }
{ t: 'table',   head: ['…'], rows: [['…']] }
{ t: 'vs',      cards: [{ h: '…', items: ['…'] }] }
{ t: 'flow',    steps: [{ b: 'Label', s: 'Description' }] }
{ t: 'specs',   rows: [['Key', 'Value']] }
```

Inline markup available everywhere: `[[term-id]]`, `[[term-id|display text]]`, `**bold**`,
`` `code` `` and `[label](https://url)`. Term ids must exist in `src/data/glossary.js`.

Quiz questions are `{ id, domain, scenario?, q, opts: [4], a: <index>, why, distract }`.
Options are shuffled at runtime, so `a` is the index into the authored order.

---

## A note on accuracy

Content was written against the official NVIDIA blueprint plus NVIDIA's platform documentation
(NIM, NeMo microservices, NeMo Agent Toolkit, TensorRT-LLM, Dynamo) and the primary papers behind
the agent patterns. Questions are original, written in the style of the exam — they are **not**
real exam items, and no exam content is reproduced here.

Exam blueprints change. Always confirm the current domains, weights and format on the
[official exam page](https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/)
before booking.

This project is independent and is **not affiliated with or endorsed by NVIDIA**.
NVIDIA, NIM, NeMo and related marks belong to NVIDIA Corporation.
