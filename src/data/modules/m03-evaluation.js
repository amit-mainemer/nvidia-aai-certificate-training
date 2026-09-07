export default {
  id: 'evaluation',
  n: 3,
  domain: 'evaluation',
  weight: 13,
  title: 'Evaluation and Tuning',
  blurb: 'How to measure a system whose output is not a single right answer: component-level metrics, trajectory evaluation, LLM-as-a-judge and its biases, and choosing between prompting, RAG and fine-tuning.',
  hours: '3–4 h',
  lessons: [
    {
      id: 'eval-strategy',
      title: 'Evaluating agents: what to measure and where',
      minutes: 13,
      blocks: [
        { t: 'lede', x: 'A single end-to-end accuracy number tells you that something is wrong and nothing about where. Agent evaluation is layered by design, and knowing which layer a symptom belongs to is the core exam skill in this domain.' },

        { t: 'h2', x: 'The four layers' },
        { t: 'table', head: ['Layer', 'What it measures', 'Typical metrics'], rows: [
          ['Component', 'Each piece in isolation', 'Retrieval [[retrieval-metrics|recall@k, MRR, nDCG]]; tool-call validity; classifier F1'],
          ['Step', 'Each decision the agent makes', 'Tool-selection accuracy, argument correctness, plan quality'],
          ['[[trajectory-eval|Trajectory]]', 'The path taken as a whole', 'Step efficiency, redundant calls, recovery after failure, budget adherence'],
          ['Outcome', 'Did the task actually get done', '[[task-success|Task success rate]], pass^k, groundedness, human rating, cost per resolved task'],
        ]},
        { t: 'callout', kind: 'exam', title: 'The distinguishing feature of agent evaluation', x: '[[trajectory-eval|Trajectory evaluation]] is what separates agent evaluation from model evaluation. An agent that reaches the right answer through six redundant tool calls and one lucky guess has passed the outcome check and failed the reliability check. Scenario questions test whether you know that final-answer accuracy alone is insufficient.' },

        { t: 'h2', x: 'RAG metrics and how to read them' },
        { t: 'p', x: 'The [[ragas|four standard RAG metrics]] form a diagnostic grid. Learn to read the combinations — this is examined directly.' },
        { t: 'table', head: ['Context recall', 'Faithfulness', 'Diagnosis', 'Fix'], rows: [
          ['Low', 'Any', 'Retrieval never fetched the evidence', 'Chunking, embedding model, top-k, [[hybrid-search|hybrid search]], query rewriting'],
          ['High', 'Low', 'Evidence was present; the model ignored or contradicted it', 'Grounding prompt, [[reranker|reranking]] to cut noise, stronger model, verification pass'],
          ['High', 'High, answer relevancy low', 'Grounded but answering a different question', 'Query understanding, prompt clarity, better [[query-rewriting|rewriting]]'],
          ['High', 'High, context precision low', 'Right answer buried in noisy context', 'Rerank and trim top-k; irrelevant chunks raise cost and [[context-rot|dilute attention]]'],
        ]},
        { t: 'callout', kind: 'tip', title: 'Always evaluate retrieval separately', x: 'Build a retrieval-only test set of query → relevant-document-id pairs, and measure recall@k before the generator ever runs. Retrieval failures are invisible in end-to-end scores and are the most common root cause of "the model hallucinated".' },

        { t: 'h2', x: 'Golden datasets' },
        { t: 'p', x: 'A [[regression-suite|golden dataset]] is the backbone of the whole practice. It must be versioned alongside the code, representative of real production traffic, and deliberately include the hard cases: ambiguous queries, out-of-scope requests, questions the corpus cannot answer, adversarial [[prompt-injection|injection]] payloads, multi-hop questions and tool failures.' },
        { t: 'p', x: 'Source it from three places: real production traffic (the most valuable), synthetic generation to cover thin areas, and expert-written adversarial cases. Then run it in CI on every prompt, model, tool or retrieval change.' },

        { t: 'h2', x: 'Statistical thinking' },
        { t: 'p', x: 'Agents are stochastic, so a single run proves nothing. Report success over repeated runs and be explicit about which measure you mean: **pass@k** (at least one of k succeeded) is a capability measure used in research; **pass^k** (all k succeeded) is the reliability measure production cares about. A 30-case suite gives roughly ±18 percentage points of confidence interval — far too wide to justify a release decision, which is why suites need hundreds of cases before you gate on small deltas.' },

        { t: 'h2', x: 'Offline, shadow, online' },
        { t: 'flow', steps: [
          { b: 'Offline eval', s: 'Golden dataset in CI. Fast, cheap, repeatable. Gates every change.' },
          { b: '[[canary|Shadow]]', s: 'Mirror live traffic to the candidate; do not serve its output. Real distribution, zero user risk.' },
          { b: '[[canary|Canary]] / A-B', s: 'A small traffic slice sees the candidate. Measures real user outcomes.' },
          { b: 'Full rollout', s: 'With continuous monitoring and a fast rollback path.' },
        ]},
        { t: 'callout', kind: 'exam', title: 'Zero-risk validation on real traffic', x: 'When a stem says "validate a new model against real production traffic without any risk to users", the answer is **shadow deployment** — mirrored requests, responses discarded and scored offline. Canary already exposes some users.' },
      ],
    },

    {
      id: 'llm-judge',
      title: 'LLM-as-a-judge: power and pitfalls',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'Most agent outputs have no single correct string, so you need a scalable scorer. Judges work — provided you know exactly how they fail.' },

        { t: 'h2', x: 'When a judge is the right tool' },
        { t: 'p', x: 'Use [[llm-as-judge|LLM-as-a-judge]] when quality is real but not string-matchable: summary quality, tone, helpfulness, completeness against a rubric, or groundedness of a claim in a source. Do **not** use one where a deterministic check exists — schema validity, numeric equality, whether the tests passed, whether the correct tool was called. Deterministic checks are cheaper, faster and unbiased, and questions that offer a code-based check against a judge usually want the code.' },

        { t: 'h2', x: 'The four biases you must be able to name' },
        { t: 'table', head: ['Bias', 'Behaviour', 'Mitigation'], rows: [
          ['Position bias', 'Systematically favours the first (or last) option presented', 'Randomise order; score both orders and average'],
          ['Verbosity bias', 'Rates longer answers higher regardless of quality', 'Rubric that scores information density; control for length'],
          ['Self-preference', 'Prefers text generated by itself or its own family', 'Use a different model family as judge than the one under test'],
          ['Score compression', 'Clusters everything at 7–8 on a 1–10 scale', 'Prefer pairwise comparison or a short discrete rubric to a 10-point scale'],
        ]},

        { t: 'h2', x: 'Designing a judge that holds up' },
        { t: 'ol', items: [
          '**Pairwise beats absolute.** "Which of these two is better, and why?" is far more reliable than "score this 1–10".',
          '**Give a concrete rubric with anchors.** Define what a 1, a 3 and a 5 look like, with an example of each.',
          '**Force reasoning before the score.** Order the output schema so the justification comes first; scoring first turns the rationale into post-hoc justification.',
          '**Calibrate against humans.** Have experts label 100–200 cases and measure agreement (Cohen\'s kappa). A judge that agrees with humans 60% of the time is measuring something else.',
          '**Pin the judge version.** A silent provider upgrade changes your entire metric history. Treat the judge as a versioned dependency.',
        ]},
        { t: 'callout', kind: 'warn', title: 'Never let the judge be the model under test', x: 'Self-preference is strong and well documented. Using GPT-family output judged by a GPT-family judge inflates scores. Use a different family, or a human-calibrated ensemble.' },

        { t: 'h2', x: 'NeMo Evaluator' },
        { t: 'p', x: '[[nemo-evaluator|NeMo Evaluator]] is NVIDIA\'s microservice for this: it runs academic benchmarks, custom dataset evaluations and LLM-as-a-judge configurations against a target model or pipeline, storing comparable scored runs. Its role in the [[data-flywheel|data flywheel]] is to answer the only question that matters after a fine-tune — did the customised model actually beat the incumbent on the tasks we care about?' },
      ],
    },

    {
      id: 'tuning-choices',
      title: 'Prompting vs. RAG vs. fine-tuning',
      minutes: 13,
      blocks: [
        { t: 'lede', x: 'This is the highest-frequency decision question in the whole exam, and it has a clean rule: RAG for knowledge, fine-tuning for behaviour, prompting for everything you can get away with.' },

        { t: 'h2', x: 'The decision rule' },
        { t: 'vs', cards: [
          { h: 'Use RAG when…', items: ['Facts change (prices, policies, inventory, tickets)', 'Answers must cite sources', 'The corpus is large or per-tenant', 'You need to add or revoke knowledge instantly', 'Access control varies by user'] },
          { h: 'Use fine-tuning when…', items: ['You need a consistent format, tone or persona', 'Domain vocabulary and reasoning style must be internalised', 'You want a small model to match a big one on a narrow task', 'Reliable tool-call syntax matters', 'Prompt length must shrink for latency or cost'] },
        ]},
        { t: 'callout', kind: 'exam', title: 'The classic trap', x: '"Our chatbot gives outdated product prices — should we fine-tune on the new price list?" **No.** Prices change; fine-tuning bakes them into weights and you would retrain on every change, with no citation and no way to revoke. [[rag|RAG]] over the live catalogue is the answer. Fine-tuning teaches *how to answer*, retrieval supplies *what is true right now*.' },
        { t: 'p', x: 'The two compose well: fine-tune a small model for your format and domain style, then feed it retrieved context at inference. That is how teams get large-model quality at small-model cost.' },

        { t: 'h2', x: 'The fine-tuning methods' },
        { t: 'table', head: ['Method', 'What it needs', 'What it teaches', 'Cost'], rows: [
          ['[[sft|SFT]] (full)', 'Curated prompt/response pairs', 'Format, style, domain behaviour', 'Highest — all weights, full memory'],
          ['[[lora|LoRA / PEFT]]', 'Same data, far less compute', 'The same, with ~0.1–1% trainable parameters', 'Low; many adapters share one base'],
          ['[[dpo|DPO]]', 'Chosen/rejected preference pairs', 'Judgement calls with no single right answer', 'Medium; no reward model needed'],
          ['RLHF (PPO)', 'Preferences + a trained reward model', 'Nuanced alignment', 'High and operationally complex'],
          ['[[rft|RFT]]', 'A programmatic verifier or reward function', 'Verifiable agentic skills — valid tool calls, passing tests', 'Medium–high; needs a reliable verifier'],
          ['[[distillation|Distillation]]', 'Teacher outputs on your traffic', 'Compresses a large model\'s behaviour into a small one', 'Medium; large inference savings after'],
        ]},
        { t: 'p', x: '[[lora|LoRA]] deserves special attention: because the base weights are frozen, one deployed base model can serve many adapters simultaneously — the standard answer for "we need a customised variant per customer on a limited GPU budget". NIM supports serving multiple LoRA adapters over a single base deployment.' },

        { t: 'h2', x: 'Data quality dominates data quantity' },
        { t: 'p', x: 'A thousand carefully curated, deduplicated, correctly-formatted examples routinely beat a hundred thousand scraped ones. That is why [[nemo-curator|NeMo Curator]] exists: GPU-accelerated cleaning, quality filtering, exact/fuzzy/semantic deduplication and PII redaction before a single training step runs. Duplicate examples cause memorisation; inconsistent formatting teaches inconsistency; leaked evaluation data invalidates every number you produce afterwards.' },

        { t: 'callout', kind: 'warn', title: 'Catastrophic forgetting', x: 'Fine-tuning on a narrow dataset degrades unrelated capabilities — [[catastrophic-forgetting|catastrophic forgetting]]. Mitigate with LoRA rather than full fine-tuning, by mixing general instruction data into the training mix, and by evaluating on a **broad** held-out suite rather than only on the new task. A fine-tune that improves your metric and silently breaks everything else is a common and expensive outcome.' },

        { t: 'h2', x: 'The data flywheel' },
        { t: 'flow', steps: [
          { b: '1 · Capture', s: 'Log production traces, tool calls, outcomes and user feedback.' },
          { b: '2 · Curate', s: '[[nemo-curator|Curator]]: filter, deduplicate, redact PII, build the dataset.' },
          { b: '3 · Customise', s: '[[nemo-customizer|Customizer]]: LoRA/SFT/DPO on the curated set — often distilling a large model into a small one.' },
          { b: '4 · Evaluate', s: '[[nemo-evaluator|Evaluator]]: does the candidate beat the incumbent on the golden set?' },
          { b: '5 · Guard & deploy', s: '[[nemo-guardrails|Guardrails]] + [[nim|NIM]]; promote via shadow → canary; then repeat.' },
        ]},
        { t: 'p', x: 'The characteristic outcome the exam wants you to recognise: a much smaller model, fine-tuned on real production traffic, matching the large model\'s accuracy on your narrow task at a fraction of the cost and latency. That is the standard NVIDIA answer to "reduce inference cost without sacrificing accuracy".' },
      ],
    },
  ],

  quiz: [
    { id: 'e1', domain: 'evaluation',
      scenario: 'A RAG assistant scores 0.91 context recall but only 0.52 faithfulness on the evaluation set.',
      q: 'What does this combination indicate?',
      opts: [
        'Retrieval is fetching the right evidence, but the generator is not staying grounded in it',
        'The retriever is missing most relevant documents',
        'The embedding model needs to be replaced',
        'The chunk size is too small'],
      a: 0,
      why: 'High context recall means the necessary evidence was retrieved. Low faithfulness means the answer is not supported by that evidence. The failure is therefore in generation: weak grounding instructions, too much noise in the context, or a model that is over-relying on parametric knowledge.',
      distract: 'Every other option describes a retrieval fix, but retrieval is already scoring 0.91 — changing it cannot address an ungrounded generator.' },

    { id: 'e2', domain: 'evaluation',
      q: 'What distinguishes trajectory evaluation from outcome evaluation for agents?',
      opts: [
        'Trajectory evaluation scores the path — tool selection, argument correctness, step efficiency and recovery — not only the final answer',
        'Trajectory evaluation measures GPU utilisation during the run',
        'Trajectory evaluation only applies to multi-agent systems',
        'They are two names for the same measurement'],
      a: 0,
      why: 'An agent can reach the right answer through a wasteful or lucky path. Trajectory evaluation scores the decisions themselves, which is what predicts reliability under distribution shift. It is the defining addition that agent evaluation makes over model evaluation.',
      distract: 'It is not an infrastructure metric, and it applies equally to single-agent systems.' },

    { id: 'e3', domain: 'evaluation',
      q: 'A team uses GPT-family outputs judged by a GPT-family judge and sees suspiciously high scores. Which bias is most likely, and what is the fix?',
      opts: [
        'Self-preference bias — use a judge from a different model family, and calibrate against human labels',
        'Position bias — present the options in a fixed order',
        'Verbosity bias — instruct the judge to prefer shorter answers',
        'Score compression — switch to a 100-point scale'],
      a: 0,
      why: 'Judges systematically favour text produced by themselves or their own family. The mitigation is to use a different family as judge and to validate agreement against human-labelled cases before trusting the metric.',
      distract: '**Position bias** is fixed by randomising order, not fixing it. **Verbosity bias** is fixed with a density-aware rubric, not a blanket preference for brevity. **Score compression** gets worse on finer scales; pairwise comparison is the fix.' },

    { id: 'e4', domain: 'evaluation',
      scenario: 'A customer-support bot quotes outdated product prices. Prices change weekly and every answer must cite its source.',
      q: 'What is the correct approach?',
      opts: [
        'Retrieve prices from the live catalogue at query time and cite the source',
        'Fine-tune the model weekly on the current price list',
        'Increase the context window and paste the whole catalogue into the system prompt',
        'Use DPO on preference pairs of correct and incorrect prices'],
      a: 0,
      why: 'Volatile facts plus a citation requirement is the textbook RAG case. Retrieval gives instant updates, per-source attribution and the ability to revoke information immediately — none of which fine-tuning provides.',
      distract: '**Weekly fine-tuning** is expensive, slow to propagate and offers no citations. **Pasting the catalogue** wastes context on every request and still goes stale between deployments. **DPO** tunes preferences, not facts.' },

    { id: 'e5', domain: 'evaluation',
      q: 'A team must validate a new model against real production traffic with zero risk to users. Which deployment strategy fits?',
      opts: [
        'Shadow deployment — mirror live requests to the candidate and score its responses offline without serving them',
        'Canary release to 5% of users',
        'Blue-green cutover during a maintenance window',
        'A/B test with a 50/50 split'],
      a: 0,
      why: 'Shadow deployment sends real traffic to the candidate but discards its responses, so users are never exposed while you get the true production input distribution. It is the only zero-user-risk option listed.',
      distract: '**Canary** and **A/B** both expose real users. **Blue-green** swaps everyone at once, which is the largest exposure of all.' },

    { id: 'e6', domain: 'evaluation',
      q: 'Which is the best use of LoRA rather than full fine-tuning?',
      opts: [
        'Serving many customer-specific model variants from one base deployment on a constrained GPU budget',
        'Adding this week\'s pricing data to the model',
        'Reducing model inference latency to under 50 ms',
        'Eliminating the need for an evaluation suite'],
      a: 0,
      why: 'LoRA freezes the base weights and trains small low-rank matrices, so one base model in GPU memory can serve many adapters. That is exactly the multi-tenant customisation case, and NIM supports multi-LoRA serving over a single base deployment.',
      distract: 'Volatile data belongs in RAG. LoRA does not by itself deliver a latency target, and no tuning method removes the need for evaluation.' },

    { id: 'e7', domain: 'evaluation',
      q: 'After fine-tuning on a narrow support-ticket dataset, the model performs better on tickets but noticeably worse on general reasoning. What happened, and what mitigates it?',
      opts: [
        'Catastrophic forgetting — use LoRA instead of full fine-tuning, mix in general instruction data, and evaluate on a broad held-out suite',
        'Overfitting to the validation set — increase the learning rate',
        'Data leakage — remove the test set from training',
        'Quantisation error — retrain in FP32'],
      a: 0,
      why: 'Narrow fine-tuning degrades unrelated capabilities. Parameter-efficient methods limit the damage by leaving base weights frozen, mixing general data preserves broad behaviour, and a broad evaluation suite is what makes the regression visible before release.',
      distract: 'The described symptom is a capability regression, not validation overfitting, leakage or a precision issue.' },

    { id: 'e8', domain: 'evaluation',
      q: 'Which metric best captures whether an agent is reliable enough for production?',
      opts: [
        'pass^k — the fraction of tasks that succeed on all k repeated runs',
        'pass@k — whether at least one of k runs succeeded',
        'BLEU score against reference answers',
        'Average tokens generated per run'],
      a: 0,
      why: 'Agents are stochastic, so reliability means succeeding consistently. pass^k requires every one of k runs to succeed, which is the property a production workflow actually needs.',
      distract: '**pass@k** measures capability, not reliability — one lucky run of ten still counts. **BLEU** is unsuited to open-ended agent outputs, and **token count** is a cost signal, not a quality one.' },

    { id: 'e9', domain: 'evaluation',
      q: 'Which task should NOT be scored by an LLM judge?',
      opts: [
        'Whether the emitted tool call conforms to its JSON Schema',
        'Whether a summary captures the key points of a document',
        'Whether an answer is grounded in the retrieved context',
        'Whether a response maintains the required professional tone'],
      a: 0,
      why: 'Schema conformance is deterministically checkable in code — faster, cheaper, perfectly reliable and free of judge bias. Reserve LLM judges for qualities that genuinely require language understanding.',
      distract: 'Summary quality, groundedness and tone all lack a single correct string and are legitimate judge tasks with a good rubric.' },

    { id: 'e10', domain: 'evaluation',
      q: 'In the NVIDIA data flywheel, which component answers "did the customised model actually beat the model it is replacing?"',
      opts: ['NeMo Evaluator', 'NeMo Curator', 'NeMo Customizer', 'NeMo Guardrails'],
      a: 0,
      why: 'Evaluator runs benchmarks, custom datasets and LLM-as-a-judge configurations against models and pipelines and returns comparable scored runs — the promotion gate in the flywheel.',
      distract: '**Curator** prepares data, **Customizer** performs the fine-tuning, and **Guardrails** enforces runtime safety policy. None of them compare candidate against incumbent.' },
  ],
}
