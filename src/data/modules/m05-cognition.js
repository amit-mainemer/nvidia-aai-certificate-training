export default {
  id: 'cognition',
  n: 5,
  domain: 'cognition',
  weight: 10,
  title: 'Cognition, Planning, and Memory',
  blurb: 'Reasoning strategies and their cost, task decomposition and replanning, and the four memory types an agent needs to work across steps, sessions and users.',
  hours: '3–4 h',
  lessons: [
    {
      id: 'reasoning-strategies',
      title: 'Reasoning strategies and what each one costs',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Six named techniques, each with a distinguishing phrase and a cost multiplier. Questions in this domain present four of them as options and expect you to match the phrase in the stem.' },

        { t: 'table', head: ['Technique', 'Mechanism', 'Cost vs. baseline', 'The phrase that gives it away'], rows: [
          ['[[cot|Chain-of-Thought]]', 'One linear reasoning path before the answer', '~1.2–2×', '"show reasoning steps", "think step by step"'],
          ['[[self-consistency|Self-consistency]]', 'Sample N chains, take the majority vote', 'N×', '"sample multiple chains and vote"'],
          ['[[tot|Tree-of-Thoughts]]', 'Branch, score intermediate states, search, backtrack', '5–20×', '"explore alternatives", "backtrack", "evaluate partial solutions"'],
          ['[[cove|Chain-of-Verification]]', 'Draft → generate verification questions → answer → revise', '3–4×', '"reduce factual errors in the drafted answer"'],
          ['[[reflexion|Reflexion]]', 'Verbal self-critique after failure, stored in memory across trials', '2× per attempt', '"learn from previous failed attempts"'],
          ['[[debate|Debate]]', 'Agents argue positions; a judge decides', '5–10×', '"multiple perspectives", "adversarial review"'],
        ]},

        { t: 'callout', kind: 'exam', title: 'Two conditions for Tree-of-Thoughts', x: 'ToT is correct only when **both** hold: the task genuinely benefits from exploring multiple branches, **and** the model can score partial states. If intermediate states cannot be evaluated there is nothing to search on, and ToT degenerates into expensive random sampling. It is always the wrong answer for a latency-sensitive lookup.' },

        { t: 'h2', x: 'When simple reasoning is enough' },
        { t: 'p', x: 'Modern reasoning models perform much of this internally, so bolting an explicit CoT prompt onto a reasoning model can actively hurt — you are duplicating work and consuming budget. The correct move on a straightforward retrieval-and-answer task is no reasoning scaffold at all. Options that add sophistication to a simple problem are distractors.' },

        { t: 'h2', x: 'Reasoning budget as a control' },
        { t: 'p', x: 'Treat reasoning effort as a routed decision rather than a constant. Easy requests get a direct answer; medium requests get CoT; only genuinely hard requests get self-consistency or ToT. A confidence estimate or a small classifier decides which lane a request takes — the same [[router|routing]] idea that governs model selection, applied to reasoning depth.' },

        { t: 'callout', kind: 'trap', title: 'Reasoning does not fix missing knowledge', x: 'No amount of reasoning invents a fact the model does not have. If the failure is "the model does not know our internal policy", the answer is [[rag|retrieval]], not Tree-of-Thoughts. Questions deliberately offer an expensive reasoning technique where the real problem is grounding.' },
      ],
    },

    {
      id: 'planning',
      title: 'Task decomposition, planning and replanning',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'Planning is the part of an agent that turns a goal into an executable, dependency-aware sequence — and, just as importantly, the part that notices when the plan has stopped being valid.' },

        { t: 'h2', x: 'Decomposition' },
        { t: 'p', x: 'A usable plan step is independently executable, verifiable ("how would I know this succeeded?") and appropriately sized. Two failure modes bracket it: over-decomposition creates twenty trivial steps whose coordination costs more than the work; under-decomposition creates a step so large the agent cannot execute it in one action.' },
        { t: 'p', x: 'The dependency structure is what determines the execution shape. Independent steps can run **concurrently**, which is the entire performance argument for [[plan-execute|Plan-and-Execute]] over [[react|ReAct]]. A plan expressed as a DAG rather than a list makes that parallelism explicit and schedulable.' },

        { t: 'code', lang: 'json', title: 'A plan as a dependency graph', x: `{
  "goal": "Assess vendor Acme for renewal",
  "steps": [
    {"id": "s1", "task": "Fetch contract terms",         "tool": "contracts_db", "deps": []},
    {"id": "s2", "task": "Pull 12-month incident history","tool": "incident_api", "deps": []},
    {"id": "s3", "task": "Retrieve spend by quarter",     "tool": "finance_api",  "deps": []},
    {"id": "s4", "task": "Compare SLA vs. actual uptime", "tool": "analysis",     "deps": ["s1","s2"]},
    {"id": "s5", "task": "Draft renewal recommendation",  "tool": "llm",          "deps": ["s3","s4"]}
  ]
}
// s1, s2, s3 run in parallel -> s4 -> s5.
// Wall-clock is the critical path, not the sum of all five steps.` },

        { t: 'h2', x: 'Replanning triggers' },
        { t: 'p', x: 'A plan is a hypothesis. Name the conditions that invalidate it, because "when does the agent replan?" is a genuine exam question:' },
        { t: 'ul', items: [
          'A step failed and retries are exhausted.',
          'A result contradicts an assumption the plan was built on.',
          'New information makes remaining steps unnecessary — stop, do not execute them out of momentum.',
          'The budget (steps, cost, time) will not cover the remaining plan.',
          'The user changed the goal mid-run.',
        ]},
        { t: 'callout', kind: 'warn', title: 'Bound the replanning', x: 'Unbounded replanning is a loop with extra steps. Cap the number of replans, require that each new plan differ meaningfully from the last, and [[escalation|escalate to a human]] when the cap is hit rather than trying a third variation of a strategy that has already failed twice.' },

        { t: 'h2', x: 'Who plans' },
        { t: 'p', x: 'Planning is the highest-leverage LLM call in the system, so it is normal — and usually correct — to use the strongest available model for planning and a cheaper one for execution. A bad plan cannot be rescued by good execution, whereas a mediocre executor following a good plan usually still succeeds.' },
      ],
    },

    {
      id: 'memory-systems',
      title: 'Memory: four types and how to build them',
      minutes: 13,
      blocks: [
        { t: 'lede', x: 'The context window is working memory, and it is not enough. Production agents need persistent memory, and the exam expects you to name the four types and place a requirement in the right one.' },

        { t: 'h2', x: 'The taxonomy' },
        { t: 'table', head: ['Type', 'Holds', 'Lives in', 'Retrieved when'], rows: [
          ['[[short-term-memory|Working]]', 'Current goal, recent turns, last observations', 'The context window', 'Always — it is the prompt'],
          ['[[semantic-memory|Semantic]]', 'Durable facts and preferences ("prefers metric units")', 'Vector store or key-value store', 'Semantically relevant to the current request'],
          ['[[episodic-memory|Episodic]]', 'Specific past events and trajectories with outcomes', 'Vector store keyed by situation', 'A similar situation recurs'],
          ['[[procedural-memory|Procedural]]', 'Learned how-to: effective tool sequences, prompt patterns', 'Prompt library or skill registry', 'The task type matches a known skill'],
        ]},
        { t: 'callout', kind: 'exam', title: 'Placement questions', x: '"Remember that this user is on the enterprise plan" → semantic. "Recall how we resolved a similar outage last quarter" → episodic. "Reuse the query pattern that worked for this report type" → procedural. "What did the user just say?" → working. Expect a stem that describes one of these and offers all four.' },

        { t: 'h2', x: 'Writing to memory is the hard part' },
        { t: 'p', x: 'Storing every turn produces a store full of noise that degrades retrieval. Memory needs a **write policy**: extract only durable, generalisable facts; deduplicate against what is already stored; and handle contradiction explicitly — when a new fact conflicts with an old one, supersede it with a timestamp rather than storing both and letting retrieval return a coin flip.' },
        { t: 'code', lang: 'python', title: 'A memory write with conflict resolution', x: `def remember(user_id: str, turn: str):
    facts = extract_durable_facts(turn)      # LLM call, schema-constrained
    for f in facts:
        if f.confidence < 0.7:
            continue                          # do not store guesses
        similar = store.search(f.text, user_id=user_id, k=3, threshold=0.88)
        if similar and contradicts(similar[0], f):
            store.supersede(similar[0].id, f, reason="updated by user")
        elif similar:
            store.reinforce(similar[0].id)    # seen again -> raise confidence
        else:
            store.add(f, user_id=user_id, ts=now())` },

        { t: 'h2', x: 'Forgetting is a feature' },
        { t: 'p', x: 'Memory that only grows becomes slower, more expensive and less accurate. Age out unused entries, decay confidence over time for facts that are never reinforced, and **honour deletion requests end to end** — under GDPR a user\'s right to erasure covers the agent\'s memory store, not just your primary database. That means memory must be partitioned by user with hard tenant isolation on every read.' },

        { t: 'callout', kind: 'warn', title: 'Memory is an injection surface', x: 'If an agent writes user-supplied text into memory and later reads it back into a prompt, an attacker can plant instructions today that fire tomorrow — persistent [[prompt-injection|indirect prompt injection]]. Sanitise on write, mark memory content as untrusted data on read, and never let retrieved memory grant tool permissions.' },

        { t: 'h2', x: 'Working-memory management inside a run' },
        { t: 'p', x: 'Within a single long run the techniques are: [[context-compaction|summarisation buffers]] that replace old turns with a running summary; **structured state** holding goal, plan and findings as typed fields that survive compaction; **observation digests** that store a large tool result externally and put a summary plus a reference in context; and **position discipline**, placing the most important evidence at the start and end of the prompt because of [[context-rot|mid-context recall degradation]].' },
      ],
    },
  ],

  quiz: [
    { id: 'c1', domain: 'cognition',
      q: 'Which pattern adds verbal self-reflection after failed attempts and stores it in memory for subsequent trials?',
      opts: ['Reflexion', 'ReAct', 'Toolformer', 'Tree-of-Thoughts'],
      a: 0,
      why: 'Reflexion has the agent write a natural-language critique of a failed attempt and persist it in episodic memory, so the reflection is available on the next trial. The distinguishing pair of ideas is "verbal self-reflection" plus "carried across attempts".',
      distract: '**ReAct** interleaves reasoning and acting within one attempt. **Toolformer** is about a model learning when to call APIs during training. **Tree-of-Thoughts** searches branches within a single attempt and does not persist critiques.' },

    { id: 'c2', domain: 'cognition',
      q: 'What is the primary advantage of Plan-and-Execute over ReAct on a multi-step task with independent sub-tasks?',
      opts: [
        'The full plan is drafted upfront, so independent steps can be executed in parallel and the expensive model is called once',
        'It removes the need for tools',
        'It guarantees no hallucination',
        'It removes the need for a system prompt'],
      a: 0,
      why: 'Planning upfront exposes the dependency structure, so independent steps run concurrently — wall-clock time becomes the critical path rather than the sum of steps — and the strong planner model is invoked once rather than at every step.',
      distract: 'Plan-and-Execute still uses tools, still hallucinates, and still needs a system prompt. Only the first option describes a real property of the pattern.' },

    { id: 'c3', domain: 'cognition',
      q: 'When is Tree-of-Thoughts the right choice over Chain-of-Thought?',
      opts: [
        'When the task benefits from exploring multiple reasoning branches AND the model can score intermediate states',
        'When latency on a simple lookup matters',
        'When the model cannot evaluate partial solutions',
        'When the tool list is empty'],
      a: 0,
      why: 'ToT is a search procedure. It needs both something worth searching over (genuinely alternative approaches) and an evaluation signal on partial states to guide the search. Without the scoring function there is nothing to search on.',
      distract: 'ToT multiplies cost and latency, so it is never the answer for a simple low-latency lookup, and it is specifically unsuited to tasks where partial states cannot be evaluated.' },

    { id: 'c4', domain: 'cognition',
      q: 'How does self-consistency decoding improve reasoning accuracy?',
      opts: [
        'It samples several independent reasoning chains and returns the most common answer',
        'It performs a single greedy decode with a longer prompt',
        'It replaces the LLM with a rule-based parser',
        'It trains a new model for each query'],
      a: 0,
      why: 'Sampling N chains at non-zero temperature produces different reasoning paths; correct reasoning tends to converge on the same answer while errors scatter, so majority voting boosts accuracy on tasks with a single verifiable answer. It costs N times the tokens.',
      distract: 'The other options describe unrelated mechanisms. Self-consistency requires multiple samples by definition, which rules out a single greedy decode.' },

    { id: 'c5', domain: 'cognition',
      scenario: 'A support agent should recall that a given customer is on the enterprise plan and prefers email over phone, across sessions weeks apart.',
      q: 'Which memory type is this?',
      opts: ['Semantic memory', 'Episodic memory', 'Procedural memory', 'Working memory'],
      a: 0,
      why: 'These are durable facts about the user that hold independently of when they were learned. Semantic memory stores exactly that kind of time-independent fact, retrieved when relevant to the current request.',
      distract: '**Episodic** memory would store a specific past interaction ("on 3 March they reported X"). **Procedural** memory stores learned how-to skills. **Working** memory is the current context window and does not survive the session.' },

    { id: 'c6', domain: 'cognition',
      scenario: 'An agent stores every conversational turn verbatim into a vector store. After a few months, retrieved "memories" are mostly irrelevant and answers have got worse.',
      q: 'What is the correct fix?',
      opts: [
        'Add a write policy — extract only durable facts, deduplicate, supersede contradictions with timestamps, and age out unused entries',
        'Increase the retrieval top-k so more memories are returned',
        'Switch to a larger embedding model',
        'Store memories in a relational database instead'],
      a: 0,
      why: 'The store is full of noise because everything was written. Memory quality is governed by the write path: extract generalisable facts rather than raw turns, deduplicate, resolve contradictions explicitly, and forget what is never reinforced.',
      distract: '**Higher top-k** returns more noise. A **bigger embedding model** retrieves noise more accurately. Changing the **storage engine** does not change what was written into it.' },

    { id: 'c7', domain: 'cognition',
      q: 'Which condition should NOT trigger replanning in a Plan-and-Execute agent?',
      opts: [
        'A step succeeded exactly as the plan anticipated',
        'A step failed after its retries were exhausted',
        'A result contradicted an assumption the plan relied on',
        'Remaining budget is insufficient to finish the plan'],
      a: 0,
      why: 'Replanning is triggered by invalidation of the plan. A step completing as expected confirms the plan; replanning there wastes an expensive planner call and risks churn.',
      distract: 'The other three are exactly the standard replanning triggers: exhausted retries, contradicted assumptions, and budget exhaustion.' },

    { id: 'c8', domain: 'cognition',
      q: 'An agent must not repeat a diagnostic approach that failed on the same class of incident last month. Which memory type supports this?',
      opts: ['Episodic memory', 'Semantic memory', 'Working memory', 'Procedural memory'],
      a: 0,
      why: 'Episodic memory stores specific past events with their outcomes, keyed so that a similar situation retrieves them. "This approach was tried on this kind of incident and failed" is an episode, and it is what Reflexion writes.',
      distract: '**Semantic** memory holds time-independent facts. **Working** memory does not persist across incidents. **Procedural** memory holds skills that worked, not the record of a specific failed attempt.' },

    { id: 'c9', domain: 'cognition',
      q: 'An agent is deployed on a reasoning-optimised model, and the team adds an explicit "think step by step, show all reasoning" instruction to every prompt. Latency doubles with no accuracy gain. Why?',
      opts: [
        'The model already performs internal reasoning; the added scaffold duplicates it and consumes budget without adding signal',
        'The instruction disables the model\'s tool calling',
        'Chain-of-Thought always reduces accuracy',
        'The prompt exceeded the context window'],
      a: 0,
      why: 'Reasoning models allocate internal reasoning already. Layering an explicit CoT scaffold on top duplicates that work and spends tokens and latency for no gain. Match the reasoning scaffold to the model and the task difficulty rather than applying it universally.',
      distract: 'CoT does not disable tool calling, is generally helpful on non-reasoning models, and a short instruction does not overflow the window.' },

    { id: 'c10', domain: 'cognition',
      q: 'An agent writes user-supplied text into long-term memory and reads it back into later prompts. What is the main risk?',
      opts: [
        'Persistent indirect prompt injection — planted instructions fire in a later session',
        'The vector store will run out of disk space',
        'Embeddings will drift out of date',
        'The context window will shrink'],
      a: 0,
      why: 'Memory that is written from untrusted input and later read into a prompt is a durable injection surface: an attacker can plant instructions today that execute against the agent tomorrow. Sanitise on write, treat memory as untrusted data on read, and never let memory content grant tool permissions.',
      distract: 'Storage capacity and embedding drift are real operational concerns but are not the main security risk here, and the context window size is unaffected.' },
  ],
}
