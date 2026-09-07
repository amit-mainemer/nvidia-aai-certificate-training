export default {
  id: 'architecture',
  n: 1,
  domain: 'architecture',
  weight: 15,
  title: 'Agent Architecture and Design',
  blurb: 'How much autonomy a system actually needs, the loop every agent runs, the four single-agent patterns and the five multi-agent topologies — plus how to pick between them under real constraints.',
  hours: '4–5 h',
  lessons: [
    {
      id: 'agency-spectrum',
      title: 'Workflows vs. agents: the agency spectrum',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Almost every architecture question on this exam reduces to one judgement: how much of the control flow should the model decide? Get that calibration right and a large share of the 15% domain answers itself.' },

        { t: 'h2', x: 'The definition that the exam uses' },
        { t: 'p', x: '[[agentic-ai|Agentic AI]] is not "an LLM with a nice prompt". The operational test is simple: **who decides what happens next?** In a workflow, a human wrote the control flow in code and the model fills in slots. In an agent, the model chooses the next step at runtime, based on what it just observed.' },
        { t: 'p', x: 'That single distinction produces the [[agency-spectrum|agency spectrum]], and every real system sits somewhere on it:' },

        { t: 'flow', steps: [
          { b: '1 · Fixed chain', s: 'Prompt → parse → prompt. Zero model-decided control flow. Fully deterministic, fully testable.' },
          { b: '2 · Router', s: 'The model classifies the request; code picks the branch. One decision, bounded set of outcomes.' },
          { b: '3 · Tool-calling loop', s: 'The model picks tools and arguments repeatedly until it decides it is done. A real agent.' },
          { b: '4 · Multi-agent', s: 'Several specialised agents delegate, hand off or debate. Emergent control flow.' },
        ]},

        { t: 'callout', kind: 'exam', title: 'The single most useful heuristic', x: 'Choose the **least agency that meets the requirement**. NVIDIA-style scenario questions reward the cheapest, most deterministic design that satisfies the stated constraints. If a scenario describes a fixed five-step business process with a known order, the correct answer is a deterministic pipeline — not a ReAct agent, and definitely not a multi-agent swarm.' },

        { t: 'h2', x: 'What each step up the spectrum costs you' },
        { t: 'p', x: 'Autonomy is bought with latency, tokens, variance and debuggability. Being able to price that trade is the actual skill being tested.' },

        { t: 'table', head: ['Level', 'Latency', 'Cost / request', 'Determinism', 'When it is the right answer'], rows: [
          ['Fixed chain', 'Lowest — 1–2 calls', 'Lowest, predictable', 'High', 'The steps are known, ordered and stable. Extraction, classification, templated summarisation.'],
          ['Router', 'Low — 1 small + 1 large call', 'Low', 'High per branch', 'A handful of distinct intents with different downstream handling.'],
          ['Tool-calling loop', 'Variable — N calls', 'Unbounded without caps', 'Low; same input can take different paths', 'The path genuinely depends on intermediate results you cannot know in advance.'],
          ['Multi-agent', 'Highest', 'Highest', 'Lowest', 'Genuinely separable specialities, conflicting context needs, or parallelisable independent sub-tasks.'],
        ]},

        { t: 'callout', kind: 'trap', title: 'The trap answer', x: 'Distractors love "use a multi-agent system" for problems a single agent with three tools solves. Multi-agent adds coordination overhead, message-passing latency, error compounding across handoffs and a much harder debugging story. It is justified by **separation of concerns or parallelism**, never by "it sounds more advanced".' },

        { t: 'h2', x: 'Where agents genuinely beat workflows' },
        { t: 'p', x: 'Reach for agency when at least one of these is true:' },
        { t: 'ul', items: [
          '**The step count is unknown in advance.** Debugging a failing test may take one tool call or fifteen; you cannot write that as a chain.',
          '**The next action depends on an observation.** A retrieval returns nothing useful, so the agent must rewrite the query and try a different index.',
          '**The input space is too wide to enumerate.** An open-ended support inbox will not fit a decision tree you can maintain.',
          '**Recovery matters.** A tool errors, and you want the system to try a different route rather than fail the request.',
        ]},
        { t: 'p', x: 'And stay deterministic when: the process is regulated and must be reproducible, latency budgets are tight (sub-second), the same input must always produce the same output, or the cost per request must be knowable in advance.' },

        { t: 'h2', x: 'The hybrid answer is usually the best answer' },
        { t: 'p', x: 'Production systems are rarely pure. The strong design is a deterministic outer skeleton with agentic pockets: fixed stages for intake, validation, policy checks and persistence, with a bounded agent loop only inside the step that genuinely needs to improvise. That gives you SLA-able latency on the deterministic parts and adaptability where it pays.' },

        { t: 'callout', kind: 'tip', title: 'Answering scenario questions', x: 'Read the scenario for **constraints before capabilities**. Words like "sub-second", "audited", "regulated", "reproducible", "fixed process" push you down the spectrum. Words like "open-ended", "varies per case", "must recover from failures", "unknown number of steps" push you up.' },
      ],
    },

    {
      id: 'agent-loop',
      title: 'The agent loop and its control policies',
      minutes: 14,
      blocks: [
        { t: 'lede', x: 'Every agent, in every framework, is the same loop with different decorations. Learn the loop and its five control policies and you can reason about any architecture question from first principles.' },

        { t: 'h2', x: 'The loop' },
        { t: 'flow', steps: [
          { b: 'Perceive', s: 'Assemble state: goal, history, retrieved context, last observation.' },
          { b: 'Reason', s: 'The LLM decides: call a tool, delegate, ask a human, or finish.' },
          { b: 'Act', s: 'The runtime validates and executes the chosen tool.' },
          { b: 'Observe', s: 'The result is appended to state as a new observation.' },
        ]},
        { t: 'p', x: 'The [[agent-loop|agent loop]] repeats until a stop condition fires. Note who does what: **the model only proposes**. It emits a name and arguments; your runtime decides whether that call is allowed, executes it, and decides what comes back. Every security and reliability control lives in the runtime half, never in the model half.' },

        { t: 'code', lang: 'python', title: 'The loop, with nothing hidden', x: `state = {"goal": goal, "messages": [system, user], "steps": 0, "cost": 0.0}

while True:
    # --- termination policy: checked BEFORE spending another call ---
    if state["steps"] >= MAX_STEPS:        return give_up(state, "step budget")
    if state["cost"] >= MAX_COST:          return give_up(state, "cost budget")
    if time.time() - t0 >= MAX_WALLCLOCK:  return give_up(state, "timeout")

    decision = llm.invoke(state["messages"], tools=TOOL_SCHEMAS)
    state["cost"] += price(decision.usage)
    state["steps"] += 1

    if decision.finish:
        return decision.answer

    for call in decision.tool_calls:
        # --- authorization + validation happen in YOUR code, not the model's ---
        if not authorized(user, call.name, call.args):
            observation = "DENIED: not permitted for this user"
        else:
            try:
                observation = TOOLS[call.name](**validate(call.name, call.args))
            except ToolError as e:
                observation = f"ERROR: {e}"          # feed the error back; let it re-plan
        state["messages"].append(tool_message(call.id, observation))` },

        { t: 'callout', kind: 'exam', title: 'Errors are observations', x: 'A frequently-tested design point: when a tool fails, do **not** crash the run. Return the error to the model as an observation so it can correct arguments or pick a different tool. Uncaught exceptions turn a recoverable step into a failed task. Bound the retries, though — the same failing call three times means escalate, not retry forever.' },

        { t: 'h2', x: 'The five control policies' },
        { t: 'p', x: 'A complete architecture answer names all five. Missing ones are exactly what scenario questions probe.' },

        { t: 'specs', rows: [
          ['1 · Termination', 'When does the loop stop? Explicit finish tool, max steps, token/cost budget, wall-clock timeout, or confidence threshold. See [[termination|stop conditions]].'],
          ['2 · Tool exposure', 'Which tools are visible on this turn? All of them, a retrieved top-k, or a role-scoped subset. Governs [[tool-overload|selection accuracy]].'],
          ['3 · State management', 'What carries forward? Full transcript, a compacted summary, structured state, or externalised [[state-checkpoint|checkpoints]].'],
          ['4 · Error handling', 'Retry with backoff, fall back to another tool, degrade gracefully, or escalate to a human.'],
          ['5 · Escalation', 'When does a human take over? Low confidence, repeated failure, irreversible action, out-of-scope request. See [[hitl|human-in-the-loop]].'],
        ]},

        { t: 'h2', x: 'Budgets are not optional' },
        { t: 'p', x: 'An unbounded agent loop is a production incident waiting to happen: a model that keeps calling the same failing tool can burn thousands of dollars in an afternoon. Every loop needs at minimum a step cap, a cost cap and a wall-clock timeout, and hitting a cap must be an observable event that alerts, not a silent failure.' },

        { t: 'callout', kind: 'warn', title: 'Loops that never terminate', x: 'The classic pathologies: (1) the model re-calls a tool that returns the same unhelpful result; (2) two agents hand a task back and forth; (3) a reflection loop that never reaches "good enough". The fixes are, in order: a hard step cap, loop detection on repeated identical calls, and a monotonic progress requirement (each iteration must change state).' },

        { t: 'h2', x: 'State: the part people get wrong' },
        { t: 'p', x: 'Naively, state is "the message list". That works for five steps and collapses at fifty: the [[context-window|context window]] fills, [[context-rot|middle-of-context recall degrades]], cost per step grows quadratically with the transcript, and the [[kv-cache|KV cache]] balloons.' },
        { t: 'p', x: 'The production pattern separates **structured state** from **conversation**. Keep the goal, current plan, accumulated findings and completed steps as typed fields; keep only a recent window of raw messages; and [[context-compaction|compact]] older turns into a summary. Large tool outputs go to a store, and the agent gets a reference plus a short digest instead of the whole payload.' },

        { t: 'callout', kind: 'tip', title: 'Recognising it in the answer options', x: 'When a question describes "the agent works well for short tasks but degrades on long ones", the answer is almost always context management — summarisation buffers, structured state, or offloading large observations — not a bigger model and not more retries.' },
      ],
    },

    {
      id: 'single-agent-patterns',
      title: 'Single-agent patterns: ReAct, Plan-and-Execute, ReWOO, Reflection',
      minutes: 16,
      blocks: [
        { t: 'lede', x: 'Four patterns cover the overwhelming majority of single-agent exam questions. You need the mechanism, the giveaway keyword, and the exact conditions under which each one wins.' },

        { t: 'h2', x: 'ReAct — reason and act, interleaved' },
        { t: 'p', x: '[[react|ReAct]] alternates a reasoning trace with a tool action inside a single loop. The plan is never written down in full; it emerges one step at a time, each step conditioned on the previous observation.' },
        { t: 'code', lang: 'text', title: 'A ReAct trajectory', x: `Thought: I need this quarter's churn figure before I can compare it.
Action: sql_query({"q": "SELECT churn FROM metrics WHERE q='2026Q2'"})
Observation: 4.7%

Thought: Now the prior quarter for a delta.
Action: sql_query({"q": "SELECT churn FROM metrics WHERE q='2026Q1'"})
Observation: 3.1%

Thought: Churn rose 1.6pp. The user also asked why — check support ticket themes.
Action: search_tickets({"since": "2026-04-01", "cluster": true})
Observation: top cluster = "billing page errors" (38% of tickets)

Thought: I have enough to answer.
Final Answer: Churn rose from 3.1% to 4.7% (+1.6pp); the dominant new ticket theme is billing page errors.` },
        { t: 'vs', cards: [
          { h: 'ReAct strengths', items: ['Adapts to surprises — the third step is chosen after seeing the second result', 'Simple to implement and to trace', 'Naturally recovers from tool errors', 'Best default when the path is genuinely unknown'] },
          { h: 'ReAct weaknesses', items: ['Strictly sequential — cannot parallelise independent calls', 'One LLM call per step; the growing transcript makes every step more expensive', 'Can wander or loop without hard caps', 'Latency scales linearly with step count'] },
        ]},

        { t: 'h2', x: 'Plan-and-Execute — decide the whole route first' },
        { t: 'p', x: '[[plan-execute|Plan-and-Execute]] splits the roles. A planner (usually the strongest model) writes the complete step list up front. An executor (often a cheaper, faster model, or plain code) runs the steps — **independent steps can run in parallel**. A replanner is invoked only when a step fails or returns something the plan did not anticipate.' },
        { t: 'p', x: 'Three concrete wins: independent steps execute concurrently, so wall-clock latency drops; the expensive model is used once rather than per step; and the plan is a reviewable artefact a human can approve before anything executes — which is exactly what regulated workflows need.' },

        { t: 'h2', x: 'ReWOO — the token-efficient variant' },
        { t: 'p', x: '[[rewoo|ReWOO]] (Reasoning WithOut Observation) takes Plan-and-Execute further. The planner writes every tool call up front using **variable placeholders** for results it has not seen yet. A worker executes them all with no LLM involvement. A solver then composes the final answer. That is roughly three LLM calls regardless of how many tools are used, versus N calls for ReAct.' },
        { t: 'code', lang: 'text', title: 'A ReWOO plan with variable substitution', x: `Plan: find the CEO of the company that acquired GitHub.
#E1 = Search["company that acquired GitHub"]
#E2 = Search["CEO of #E1"]          <- #E1 substituted at execution time, no LLM call
#E3 = Wiki["#E2 tenure"]
Solver: compose the answer from #E1, #E2, #E3.` },
        { t: 'callout', kind: 'exam', title: 'The keyword mapping', x: 'A question that stresses **reducing token consumption or LLM call count** on a multi-tool task is pointing at ReWOO. A question that stresses **parallel execution or an approvable plan** is pointing at Plan-and-Execute. A question that stresses **adapting to what you find** is pointing at ReAct. The NeMo Agent Toolkit ships all three as first-class agent types.' },

        { t: 'h2', x: 'Reflection and Reflexion — self-correction' },
        { t: 'p', x: 'A [[reflection|reflection loop]] adds a critic: the generator produces a candidate, the critic scores it against a rubric and lists specific defects, and the generator revises. It is the standard answer for output quality on tasks with a checkable rubric — code that must compile, a report that must cover required sections.' },
        { t: 'p', x: '[[reflexion|Reflexion]] is the distinct, more specific idea: after a **failed attempt**, the agent writes a natural-language self-critique and stores it in [[episodic-memory|episodic memory]], so the reflection carries across attempts rather than within one. That is the "learns from previous failed trials" answer.' },
        { t: 'callout', kind: 'trap', title: 'Do not confuse the self-improvement family', x: '[[reflexion|Reflexion]] = verbal self-critique stored in memory across trials. [[self-consistency|Self-consistency]] = sample N chains, take the majority vote. [[cove|Chain-of-Verification]] = draft, generate verification questions, answer them, revise. [[tot|Tree-of-Thoughts]] = branch, score intermediate states, search and backtrack. All four appear as options in the same question, so the distinguishing phrase in the stem is what you match on.' },

        { t: 'h2', x: 'The comparison table to memorise' },
        { t: 'table', head: ['Pattern', 'LLM calls', 'Parallel?', 'Adapts mid-run', 'Choose it when'], rows: [
          ['ReAct', 'One per step (N)', 'No', 'Yes — fully', 'The path depends on what you discover; error recovery matters.'],
          ['Plan-and-Execute', 'Plan + replans', 'Yes', 'Only on replan', 'Steps are independent; you need speed or a human-approvable plan.'],
          ['ReWOO', '~3 total', 'Yes', 'No', 'Token cost dominates and the tool sequence is predictable from the question.'],
          ['Reflection / Reflexion', '2× per attempt', 'No', 'Yes, across attempts', 'Output quality is checkable against a rubric; failures should teach the next attempt.'],
        ]},

        { t: 'callout', kind: 'tip', title: 'They compose', x: 'Real systems mix them: plan up front, execute each step as a small bounded ReAct loop, and run one reflection pass over the final artefact. If an answer option describes a sensible composition and the others describe a single pattern being forced onto a poorly-fitting problem, the composition is usually right.' },
      ],
    },

    {
      id: 'multi-agent-topologies',
      title: 'Multi-agent topologies and when each one wins',
      minutes: 15,
      blocks: [
        { t: 'lede', x: 'Multi-agent systems are worth their coordination overhead in exactly three situations: genuine specialisation, context isolation, and parallelism. Everything else is a single agent wearing a costume.' },

        { t: 'h2', x: 'The three legitimate reasons to split into multiple agents' },
        { t: 'ol', items: [
          '**Specialisation.** Different sub-tasks need different system prompts, different tool sets, different models, or different privilege levels. A code-writing agent and a compliance-reviewing agent should not share a prompt — or a permission set.',
          '**Context isolation.** Each agent keeps its own window. A researcher can churn through 200k tokens of sources and hand back a 2k-token brief, so the orchestrator never carries that weight.',
          '**Parallelism.** Five independent sub-questions can be answered concurrently, cutting wall-clock time to roughly that of the slowest branch.',
        ]},
        { t: 'callout', kind: 'warn', title: 'The costs you are accepting', x: 'Coordination latency on every handoff; error compounding (agent B works from agent A\'s mistakes, and 90% accuracy over four sequential agents is about 66% end to end); token duplication as context is re-serialised between agents; and a materially harder debugging story. Multi-agent is a considered trade, not an upgrade.' },

        { t: 'h2', x: 'The five topologies' },

        { t: 'h3', x: '1 · Supervisor (hierarchical)' },
        { t: 'p', x: 'A [[supervisor|supervisor]] agent owns the task, routes sub-tasks to specialist workers, collects their results and decides what happens next. Workers do not talk to each other. This is the default correct answer for the classic "Researcher, Coder, Reviewer" scenario: clear accountability, one place to enforce policy, and the cleanest traces.' },
        { t: 'p', x: 'Its weakness is that the supervisor is both a bottleneck and a single point of failure, and every worker result round-trips through it. For deep hierarchies you nest supervisors — a supervisor whose "workers" are themselves supervisors of sub-teams.' },

        { t: 'h3', x: '2 · Swarm (peer-to-peer handoff)' },
        { t: 'p', x: 'In a [[swarm|swarm]], each agent can hand control directly to another when it judges the task belongs elsewhere; shared state travels with the handoff. There is no central coordinator. Lower latency than a supervisor (no round trip), but harder to trace and to bound — a handoff cycle between two agents is a real failure mode. The giveaway phrase is "peer-to-peer handoffs without a central supervisor".' },

        { t: 'h3', x: '3 · Sequential pipeline' },
        { t: 'p', x: 'Agents run in a fixed order, each consuming the previous one\'s output: extract → analyse → draft → review. Deterministic flow with specialised stages. Simple and traceable; the whole chain stalls on any failed stage, and errors propagate forward.' },

        { t: 'h3', x: '4 · Blackboard / shared workspace' },
        { t: 'p', x: 'With the [[blackboard|blackboard pattern]], agents read from and write to a shared structured workspace rather than messaging each other. A controller picks who acts next based on board state. This is the answer for many specialists incrementally building one evolving artefact — an incident timeline, a design document, a research synthesis — where any agent may contribute when it has something to add.' },

        { t: 'h3', x: '5 · Debate / ensemble' },
        { t: 'p', x: '[[debate|Multi-agent debate]] runs several agents arguing distinct positions across rounds, with a judge selecting the winner. It measurably improves reasoning on ambiguous judgement calls, at several times the cost and latency. Only correct when accuracy on hard judgement clearly outweighs cost.' },

        { t: 'table', head: ['Topology', 'Control', 'Latency', 'Traceability', 'Best fit'], rows: [
          ['Supervisor', 'Centralised', 'Medium — round trips', 'Excellent', 'Distinct specialities needing accountability and policy enforcement.'],
          ['Swarm', 'Distributed', 'Low', 'Poor', 'Fluid handoffs where the right specialist is only known at runtime.'],
          ['Pipeline', 'Fixed order', 'Predictable', 'Excellent', 'A known ordered process with stage-specific expertise.'],
          ['Blackboard', 'Shared state', 'Medium', 'Good', 'Many contributors incrementally building one artefact.'],
          ['Debate', 'Judge', 'High', 'Good', 'Ambiguous judgement calls where accuracy dominates cost.'],
        ]},

        { t: 'h2', x: 'Communication mechanics' },
        { t: 'p', x: 'How agents exchange information matters as much as the topology. Passing raw transcripts is expensive and noisy; passing **typed, structured artefacts** — a schema-validated findings object, not a wall of prose — keeps token cost down and makes handoffs verifiable. Within a process, frameworks give you shared graph state. Across processes or vendors, [[a2a|A2A]] is the emerging standard, while [[mcp|MCP]] standardises how any of these agents reaches tools.' },
        { t: 'callout', kind: 'exam', title: 'MCP vs. A2A', x: 'This pair is tested directly. **MCP connects an agent to tools, resources and prompts.** **A2A connects an agent to other agents**, with capability discovery via Agent Cards. If the stem says "standardise how our agents discover and call tools across vendors", the answer is MCP. If it says "let our agent delegate to a partner\'s agent", it is A2A.' },

        { t: 'h2', x: 'Failure modes specific to multi-agent systems' },
        { t: 'ul', items: [
          '**Handoff loops** — A delegates to B, B decides it belongs with A. Fix with a global step budget and a handoff-history check.',
          '**Diffused responsibility** — every agent assumes another verified something. Fix by making verification an explicit owned step.',
          '**Context loss on handoff** — the receiving agent lacks the reasoning behind the request. Fix with a structured handoff object that carries goal, constraints, what has been tried and why.',
          '**Cost explosion** — N agents × M steps each. Fix with a shared global budget, not per-agent budgets.',
        ]},
      ],
    },

    {
      id: 'design-decisions',
      title: 'Choosing an architecture under real constraints',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Scenario questions give you constraints and ask for a design. This lesson is the decision procedure — run it on the stem, and the distractors usually eliminate themselves.' },

        { t: 'h2', x: 'The procedure' },
        { t: 'ol', items: [
          '**Extract the hard constraints first.** Latency SLO, cost ceiling, data residency, auditability, accuracy floor. These eliminate options before you consider elegance.',
          '**Ask whether the step sequence is knowable in advance.** Yes → deterministic pipeline or Plan-and-Execute. No → a tool-calling loop.',
          '**Ask whether sub-tasks are independent.** Yes → parallel execution, and possibly multiple agents. No → sequential, single agent.',
          '**Ask what has to be isolated.** Different privileges, different context volumes or different models per sub-task → separate agents. Otherwise, one agent with more tools.',
          '**Name the termination and escalation policy.** An architecture answer without a stop condition and a human-handoff rule is incomplete.',
        ]},

        { t: 'h2', x: 'Worked example 1 — regulated claims processing' },
        { t: 'p', x: '*"An insurer processes claims. The steps are fixed by regulation: validate the policy, check coverage, detect fraud signals, compute payout, generate a decision letter. Every decision must be reconstructable for an auditor. Volume is 50k/day."*' },
        { t: 'p', x: 'Fixed regulated steps plus full auditability plus high volume points to a **deterministic pipeline with LLM components inside stages**, not an agent. Each stage is a versioned, individually-evaluated unit; every stage input and output is written to an [[audit-trail|audit trail]]; fraud detection may itself be an LLM classifier with a confidence threshold that [[escalation|escalates]] to a human adjuster. Answer options proposing an autonomous agent that "decides how to process each claim" are wrong on both reproducibility and auditability.' },

        { t: 'h2', x: 'Worked example 2 — competitive intelligence brief' },
        { t: 'p', x: '*"Analysts need a brief on any named competitor: recent funding, product launches, hiring trends, sentiment. Sources are heterogeneous. Ten minutes is acceptable; quality matters more than speed."*' },
        { t: 'p', x: 'Four independent research threads, a generous latency budget and heavy per-source context make this the textbook **supervisor with parallel research workers**: the supervisor decomposes into four sub-questions, four workers run concurrently each with its own [[context-window|context window]] and source-specific tools, each returns a structured summary with citations, and the supervisor synthesises. A single ReAct agent would work sequentially and drown in context.' },

        { t: 'h2', x: 'Worked example 3 — real-time support deflection' },
        { t: 'p', x: '*"A chat widget must answer product questions in under two seconds, handle 500 concurrent sessions, and hand off to a human when unsure."*' },
        { t: 'p', x: 'A two-second budget rules out multi-step loops. The right shape is **[[rag|RAG]] with a router and a confidence gate**: a small classifier routes the intent, a single retrieval + generation pass answers from grounded context, and a groundedness or retrieval-score threshold triggers [[escalation|handoff]] to a human with full conversation context. Add [[prefix-caching|prefix caching]] for the static system prompt to protect [[ttft|TTFT]].' },

        { t: 'callout', kind: 'exam', title: 'Pattern-match the constraint language', x: 'Sub-second or hard SLO → no loops. Regulated / auditable → deterministic stages, immutable logging, human approval. Unknown step count → ReAct. Independent sub-tasks + time budget → parallel workers under a supervisor. Cost-sensitive at high volume → router to a small model, ReWOO, caching, distillation.' },

        { t: 'h2', x: 'Non-functional requirements are part of the architecture' },
        { t: 'p', x: 'A complete design answer covers: where state lives (and whether the service is [[statelessness|stateless]]); how failures are contained ([[circuit-breaker|timeouts, circuit breakers, bulkheads]]); how the system is observed ([[observability|per-step traces]]); how it is evaluated before and after release ([[regression-suite|golden set in CI]]); and where a human sits in the loop. Options that only describe the happy path are usually the distractor.' },
      ],
    },
  ],

  quiz: [
    { id: 'a1', domain: 'architecture',
      q: 'Which agent pattern alternates between reasoning and tool use within a single loop, deciding each next action from the most recent observation?',
      opts: ['ReAct (Reason + Act)', 'Plan-and-Execute', 'ReWOO', 'Chain-of-Verification'],
      a: 0,
      why: 'ReAct interleaves a reasoning trace ("Thought") with a tool action and its observation, repeating until the model emits a final answer. The plan is never written out in full — each step is chosen after seeing the previous result.',
      distract: '**Plan-and-Execute** drafts the whole plan before executing anything. **ReWOO** writes all tool calls up front with placeholders and executes them without further LLM calls. **Chain-of-Verification** is a hallucination-reduction technique applied to a draft answer, not a tool-use loop.' },

    { id: 'a2', domain: 'architecture',
      scenario: 'A logistics company must generate a daily report. The steps never change: pull yesterday\'s shipments from Postgres, compute five KPIs, summarise exceptions in prose, and email the result. The job must run in under 30 seconds and produce identical output for identical input.',
      q: 'What is the most appropriate architecture?',
      opts: [
        'A deterministic pipeline that calls an LLM only for the prose summary step',
        'A ReAct agent with SQL, calculator and email tools',
        'A supervisor agent delegating to database, analysis and communication agents',
        'A swarm of agents that hand off based on data characteristics'],
      a: 0,
      why: 'The step sequence is fixed and known, and reproducibility is an explicit requirement. That is the definition of a workflow, not an agent. Use code for control flow and the LLM only where language generation is genuinely needed. This is the "least agency that meets the requirement" principle.',
      distract: 'Every agentic option introduces model-decided control flow, which breaks the identical-output requirement and adds unpredictable latency against a 30-second budget, buying no capability the fixed sequence lacks.' },

    { id: 'a3', domain: 'architecture',
      q: 'A team needs an agent to answer a question requiring six independent lookups across six different APIs, and is being billed heavily for LLM tokens. Which pattern minimises LLM calls?',
      opts: ['ReWOO', 'ReAct', 'Tree-of-Thoughts', 'Multi-agent debate'],
      a: 0,
      why: 'ReWOO (Reasoning WithOut Observation) has the planner emit all six tool calls up front using variable placeholders, a worker executes them with no LLM involvement, and a solver composes the answer — roughly three LLM calls total regardless of tool count.',
      distract: '**ReAct** needs one LLM call per step (six or more). **Tree-of-Thoughts** and **debate** both multiply LLM calls to improve reasoning quality, which is the opposite of the stated goal.' },

    { id: 'a4', domain: 'architecture',
      q: 'Which multi-agent topology best fits a system with a Researcher, a Coder and a Reviewer, where a single component must be accountable for the final output and every decision must be traceable?',
      opts: [
        'Hierarchical supervisor orchestrating the three specialists',
        'A single ReAct loop holding all three roles in one prompt',
        'A peer-to-peer swarm with direct handoffs',
        'A stateless function-calling chain with no coordinator'],
      a: 0,
      why: 'A supervisor routes sub-tasks to the specialists, aggregates results and owns the final output. It gives you one place to enforce policy, clean per-worker traces, and unambiguous accountability — exactly what the requirement names.',
      distract: 'A **swarm** has no central accountability and is much harder to trace. One **ReAct loop** with three roles in a single prompt loses the specialisation and privilege separation the design exists for.' },

    { id: 'a5', domain: 'architecture',
      q: 'How do agents in a swarm topology primarily coordinate?',
      opts: [
        'Peer-to-peer handoffs of control, without a central supervisor',
        'By routing every message through one orchestrator',
        'By sharing a single context window across all agents',
        'By writing to shared GPU memory'],
      a: 0,
      why: 'In a swarm each agent decides when the task belongs to another agent and hands control directly across, carrying shared state with it. There is no central coordinator — that is the defining property versus a supervisor topology.',
      distract: 'Routing everything through one orchestrator is the supervisor pattern. Agents in a swarm keep separate contexts, and shared GPU memory is an infrastructure detail unrelated to agent coordination.' },

    { id: 'a6', domain: 'architecture',
      scenario: 'An agent occasionally enters a cycle: it calls the same search tool with nearly the same query, gets the same unhelpful result, and tries again. Some runs have consumed thousands of dollars before anyone noticed.',
      q: 'What is the most complete fix?',
      opts: [
        'Add an explicit termination policy — step cap, cost budget and wall-clock timeout — plus repeated-call loop detection, and alert when a cap is hit',
        'Upgrade to a larger model so it reasons better about when to stop',
        'Lower the temperature to zero so the agent stops repeating itself',
        'Remove the search tool from the agent entirely'],
      a: 0,
      why: 'Runaway loops are a control-policy failure, not a model-capability failure. The loop must be bounded structurally: a maximum step count, a cost budget and a timeout, all checked before each iteration, with loop detection on repeated identical calls and an alert when a cap fires so the failure is visible.',
      distract: 'A **larger model** reduces but does not eliminate the behaviour and raises cost. **Temperature 0** can actually make repetition worse by making the same unhelpful choice deterministic. **Removing the tool** eliminates the capability rather than the failure mode.' },

    { id: 'a7', domain: 'architecture',
      q: 'Which statement best captures the difference between MCP and A2A?',
      opts: [
        'MCP standardises how an agent discovers and calls tools and resources; A2A standardises how autonomous agents discover and delegate to each other',
        'MCP is NVIDIA-proprietary; A2A is the open equivalent',
        'MCP is for streaming tokens; A2A is for batch inference',
        'They are the same protocol under two names'],
      a: 0,
      why: 'Model Context Protocol connects an LLM application to external tools, resources and prompts through a standard interface. Agent2Agent connects independent agents to each other — capability discovery via Agent Cards, task delegation and artefact exchange across vendor boundaries.',
      distract: 'MCP is an open protocol, not NVIDIA-proprietary. Neither is a transport-layer or batching concern.' },

    { id: 'a8', domain: 'architecture',
      q: 'A team plans to split a working single agent into five specialised agents mainly because the architecture "will scale better". Which consideration most argues against the split?',
      opts: [
        'Each handoff adds latency and re-serialised context, and per-agent accuracy compounds multiplicatively across the chain',
        'Multi-agent systems cannot use tools',
        'Multi-agent systems require a GPU per agent',
        'LLMs cannot pass structured data to one another'],
      a: 0,
      why: 'Multi-agent decomposition is justified by specialisation, context isolation or parallelism — not by a vague scaling argument. Every handoff costs latency and tokens, and sequential agents compound error: four agents at 90% each yield roughly 66% end to end.',
      distract: 'The other options are simply false — agents use tools, share GPUs, and exchange structured data routinely.' },

    { id: 'a9', domain: 'architecture',
      q: 'A financial-operations agent proposes wire transfers. Which architectural control most directly addresses the risk of an irreversible incorrect action?',
      opts: [
        'A human-in-the-loop interrupt that persists state and requires explicit approval before the transfer tool executes',
        'A stronger system prompt telling the agent to be careful with money',
        'Running the agent at temperature 0',
        'Logging every transfer after it completes'],
      a: 0,
      why: 'For irreversible, high-impact actions the control must sit between the decision and the execution. The agent pauses at the tool boundary, checkpoints its state, surfaces the proposed action with its supporting reasoning, and only resumes on explicit approval.',
      distract: '**Prompt wording** is not an enforcement mechanism. **Temperature 0** makes behaviour repeatable, not correct. **Logging after the fact** gives you a record of the damage, not prevention.' },

    { id: 'a10', domain: 'architecture',
      q: 'An agent performs well on short tasks but degrades badly after roughly forty steps: it forgets earlier findings and repeats work. What is the correct fix?',
      opts: [
        'Manage context — keep structured state for goal/plan/findings, compact older turns into summaries, and offload large tool outputs to a store the agent references',
        'Increase the max-steps limit so it has more room to recover',
        'Raise the temperature to encourage more varied exploration',
        'Add more tools so it has more ways to find the information'],
      a: 0,
      why: 'This is context-window exhaustion and mid-context recall degradation. The fix is separating structured state from raw conversation, summarising older turns, and storing large observations externally so only a digest and a reference enter the prompt.',
      distract: 'A **higher step limit** worsens the problem it is meant to fix. **Temperature** and **more tools** do not address context saturation at all.' },
  ],
}
