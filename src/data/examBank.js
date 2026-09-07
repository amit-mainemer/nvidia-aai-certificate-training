/**
 * A separate 66-question bank used for the timed mock exam, weighted to the
 * official NCP-AAI blueprint. These questions do not appear in module quizzes,
 * so a mock exam is a genuine test rather than a recall of what you just read.
 */
export const examBank = [
  /* ============ Agent Architecture and Design — 15% (10) ============ */
  { id: 'x01', domain: 'architecture',
    scenario: 'A media company wants an agent that takes a topic and produces a researched article. Research across five sources, drafting, fact-checking and SEO optimisation are all needed. Turnaround of a few minutes is acceptable.',
    q: 'Which architecture is most appropriate?',
    opts: [
      'A supervisor agent decomposing the task, with research workers running in parallel and sequential draft → fact-check → optimise stages',
      'A single ReAct agent with all tools, iterating until the article is complete',
      'A fixed chain that calls one LLM once with all five sources pasted in',
      'A swarm where each agent decides independently when to take over'],
    a: 0,
    why: 'Research across five sources is parallelisable and context-heavy, which argues for isolated workers. Drafting, fact-checking and optimisation are inherently ordered, which argues for a pipeline. A supervisor coordinating parallel research followed by sequential refinement matches both properties, and the generous latency budget makes the coordination overhead affordable.',
    distract: 'A **single ReAct agent** would work sequentially and accumulate all five sources in one context. A **fixed chain** cannot adapt to what research turns up. A **swarm** offers no accountability for a pipeline that has a required order.' },

  { id: 'x02', domain: 'architecture',
    q: 'Which is the strongest justification for splitting a working single agent into multiple agents?',
    opts: [
      'Sub-tasks need different tool sets and privilege levels, and several of them are independent enough to run concurrently',
      'The team wants the system to appear more sophisticated',
      'The single agent\'s prompt has grown past 500 words',
      'Multi-agent systems are inherently more accurate'],
    a: 0,
    why: 'Multi-agent decomposition is justified by specialisation (different prompts, tools, privileges or models), context isolation, or parallelism. Different privilege levels are a particularly strong reason, because permission separation cannot be achieved inside one agent.',
    distract: 'Prompt length alone is a refactoring concern, not an architectural one, and multi-agent systems are not inherently more accurate — sequential handoffs compound error.' },

  { id: 'x03', domain: 'architecture',
    scenario: 'An internal agent must respond within 800 ms at p95. Product questions are answered from a documentation corpus.',
    q: 'Which design meets the constraint?',
    opts: [
      'Single-pass RAG — retrieve, rerank a small candidate set, generate once — with prefix caching and a confidence gate for escalation',
      'A ReAct agent that may take up to eight tool-calling steps',
      'A plan-and-execute agent with a replanning loop',
      'A debate between three agents judged by a fourth'],
    a: 0,
    why: 'An 800 ms p95 budget allows roughly one retrieval and one generation. Any multi-step loop puts several sequential LLM calls in the critical path. Prefix caching protects TTFT, and a confidence gate handles the cases a single pass cannot answer by escalating rather than by looping.',
    distract: 'Every other option adds multiple sequential model calls, each of which alone can approach or exceed the entire latency budget.' },

  { id: 'x04', domain: 'architecture',
    q: 'An agent must handle a task whose number of steps cannot be predicted and where each step depends on the previous result. Which pattern fits?',
    opts: ['ReAct', 'ReWOO', 'A fixed sequential chain', 'A single router classification'],
    a: 0,
    why: 'ReAct chooses each action after observing the previous result, which is exactly what a genuinely unpredictable, dependency-chained task requires. The plan emerges rather than being fixed in advance.',
    distract: '**ReWOO** requires the tool sequence to be predictable from the question, since it plans all calls up front. A **fixed chain** and a **router** both presuppose a known structure.' },

  { id: 'x05', domain: 'architecture',
    q: 'What is the correct role of a supervisor agent in a hierarchical topology?',
    opts: [
      'Decompose the task, route sub-tasks to specialist workers, aggregate their results and own the final output',
      'Execute all tool calls itself while workers only reason',
      'Serve as a fallback when workers fail',
      'Validate the syntax of worker outputs only'],
    a: 0,
    why: 'The supervisor owns decomposition, routing, aggregation and accountability for the final result. Workers do not communicate directly, which is what makes the pattern traceable and gives one place to enforce policy.',
    distract: 'Workers execute their own tools; the supervisor is not merely a fallback or a syntax checker — it holds responsibility for the overall outcome.' },

  { id: 'x06', domain: 'architecture',
    scenario: 'Two agents in a swarm repeatedly hand a task back and forth: A decides it belongs with B, B decides it belongs with A. Runs eventually hit the cost cap.',
    q: 'Which combination fixes this?',
    opts: [
      'A global step budget shared across all agents, handoff-history tracking that blocks a repeat handoff, and a fallback to human escalation',
      'Per-agent step budgets so each agent has its own limit',
      'Adding a third agent to break the tie',
      'Increasing the cost cap so runs can complete'],
    a: 0,
    why: 'Handoff loops need a budget that spans the whole run rather than per-agent limits that reset on each hop, plus explicit detection of repeated handoffs between the same pair, plus a defined terminal behaviour when the loop is detected.',
    distract: '**Per-agent budgets** are exactly what allows a loop to continue indefinitely. A **third agent** enlarges the cycle. A **higher cap** raises the cost of the same failure.' },

  { id: 'x07', domain: 'architecture',
    q: 'Which control most directly bounds the worst-case cost of an autonomous agent run?',
    opts: [
      'A cost budget checked before each iteration, alongside a step cap and a wall-clock timeout',
      'Setting temperature to 0',
      'Using a smaller model',
      'Reducing the number of available tools'],
    a: 0,
    why: 'Worst-case cost is a product of steps and per-step cost, so it must be bounded structurally by checking accumulated spend, step count and elapsed time before each iteration and terminating deterministically when any is exceeded.',
    distract: 'Temperature does not bound iteration count. A smaller model and fewer tools reduce average cost but leave the worst case unbounded.' },

  { id: 'x08', domain: 'architecture',
    q: 'In which situation is a deterministic workflow clearly preferable to an agent?',
    opts: [
      'A regulated five-step process with a fixed order that must produce identical output for identical input',
      'An open-ended research task across heterogeneous sources',
      'Debugging a failing test suite where the number of steps is unknown',
      'Triaging support tickets that vary widely in nature'],
    a: 0,
    why: 'Fixed order plus reproducibility plus regulatory scrutiny is the definition of a workflow. Model-decided control flow would break reproducibility and complicate the audit story for no capability gain.',
    distract: 'The other three all involve an unknown number of steps or a path that depends on intermediate results, which is exactly what agency exists for.' },

  { id: 'x09', domain: 'architecture',
    q: 'Which structure makes parallel execution of a plan possible?',
    opts: [
      'Expressing the plan as a dependency graph so independent steps are identifiable',
      'Listing steps in the order the model generated them',
      'Increasing the number of agent replicas',
      'Raising the model temperature during planning'],
    a: 0,
    why: 'Parallelism requires knowing which steps do not depend on each other. A DAG makes that explicit and schedulable, so wall-clock time becomes the critical path rather than the sum of all steps.',
    distract: 'A flat ordered list hides dependencies. More replicas cannot parallelise a plan whose structure is unknown, and temperature has nothing to do with it.' },

  { id: 'x10', domain: 'architecture',
    q: 'An architecture proposal omits any statement of when the agent stops or when a human takes over. Why is this a significant gap?',
    opts: [
      'Termination and escalation are core control policies — without them the loop is unbounded in cost and has no defined behaviour on failure',
      'It only matters for multi-agent systems',
      'Frameworks supply safe defaults, so it is a documentation issue',
      'It only matters when using hosted model APIs'],
    a: 0,
    why: 'Termination and escalation are two of the five control policies every agent needs. Without them, runaway loops are possible and there is no defined path when the agent cannot succeed — both of which are production incidents rather than documentation gaps.',
    distract: 'These policies are equally necessary for single agents and self-hosted models, and framework defaults are generic rather than appropriate to your risk profile.' },

  /* ============ Agent Development — 15% (10) ============ */
  { id: 'x11', domain: 'development',
    scenario: 'An agent calls a tool that returns a 60,000-token API response. After two such calls the run fails on context length.',
    q: 'What is the correct fix?',
    opts: [
      'Store the full response externally and put a structured summary plus a reference identifier into the agent context, with a follow-up tool to fetch specific fields',
      'Switch to a model with a one-million-token context window',
      'Truncate the response to the first 5,000 tokens',
      'Increase the agent step limit'],
    a: 0,
    why: 'Large tool outputs should not enter the transcript. Persist the payload, give the agent a digest plus a handle, and expose a second tool that retrieves specific fields on demand. Cost, latency and mid-context recall all improve, not just the length limit.',
    distract: 'A **bigger window** delays the failure at high cost and worsens mid-context recall. **Blind truncation** may discard exactly the needed field. A **higher step limit** does not address context size.' },

  { id: 'x12', domain: 'development',
    q: 'Which practice most improves an agent\'s tool-selection accuracy at low cost?',
    opts: [
      'Writing tool descriptions with explicit positive and negative scope ("use for X; do NOT use for Y — use Z instead")',
      'Increasing the model temperature',
      'Providing more tools so there is always a good match',
      'Renaming tools to be shorter'],
    a: 0,
    why: 'The description is read at the exact moment of choosing, so explicit boundaries between similar tools are the highest-leverage, cheapest intervention available. Negative scope in particular resolves most confusion between overlapping tools.',
    distract: 'Higher temperature increases selection variance. More tools worsens overload. Shorter names remove information the model uses to discriminate.' },

  { id: 'x13', domain: 'development',
    q: 'How should a tool signal a failure back to an agent?',
    opts: [
      'Return an actionable error message as an observation, stating what was wrong and what was expected, so the agent can correct and retry',
      'Raise an exception that terminates the run',
      'Return an empty result silently',
      'Return the last successful result instead'],
    a: 0,
    why: 'Errors are observations the agent can act on. A message naming the problem and the expected form lets the agent fix its arguments or choose a different tool, converting a run-ending failure into a recoverable step.',
    distract: 'An **uncaught exception** turns a recoverable step into a failed task. **Silent empty results** cause the agent to reason from a false premise. **Returning stale data** is actively dangerous.' },

  { id: 'x14', domain: 'development',
    q: 'Why order a structured-output schema so the rationale field precedes the decision field?',
    opts: [
      'Autoregressive generation means the model reasons before committing, rather than producing a post-hoc justification for a decision it already made',
      'JSON parsers require string fields before enums',
      'It reduces the total token count',
      'It is required for constrained decoding to work'],
    a: 0,
    why: 'The model generates fields in order. Generating the reasoning first lets it condition the decision on that reasoning; generating the decision first means the rationale is written to justify an already-committed answer.',
    distract: 'Field order is irrelevant to parsers, does not reduce tokens, and constrained decoding works regardless of ordering.' },

  { id: 'x15', domain: 'development',
    q: 'What does the NeMo Agent Toolkit profiler provide?',
    opts: [
      'Per-step token usage, latency and cost attribution across a workflow, identifying bottlenecks',
      'Automatic prompt optimisation',
      'GPU kernel-level performance traces',
      'Automatic conversion between agent frameworks'],
    a: 0,
    why: 'The profiler attributes tokens, latency and cost to individual steps in an agent workflow, which is how you find the step that dominates cost or wall-clock time before optimising.',
    distract: 'It does not rewrite prompts, does not profile CUDA kernels, and does not translate between frameworks — it instruments workflows that compose them.' },

  { id: 'x16', domain: 'development',
    scenario: 'An agent occasionally emits tool arguments that fail schema validation, wasting a retry each time.',
    q: 'Which measure most reliably reduces this?',
    opts: [
      'Use provider schema mode or constrained decoding for the arguments, and tighten the schema with enums, formats and ranges',
      'Ask the model in the prompt to double-check its JSON',
      'Increase max output tokens',
      'Retry three times instead of once'],
    a: 0,
    why: 'Constraining generation to the schema removes the class of structurally invalid arguments, and tighter type constraints shrink the space of semantically invalid ones. Both act before the call rather than after.',
    distract: 'A **prompt reminder** reduces but does not eliminate the failures. **More tokens** are unrelated. **More retries** add latency and cost while treating the symptom.' },

  { id: 'x17', domain: 'development',
    q: 'Which is a legitimate reason to build an agent without an agent framework?',
    opts: [
      'The agent is simple and single-purpose, and full visibility into the exact prompt sent matters more than abstraction',
      'Frameworks cannot call tools',
      'Frameworks require GPU hardware',
      'Frameworks prevent the use of structured output'],
    a: 0,
    why: 'For a simple agent, a plain loop over an OpenAI-compatible client avoids abstraction overhead and keeps the exact prompt visible and debuggable. Frameworks earn their cost when you need durable state, cycles, checkpointed human-in-the-loop or multi-agent coordination.',
    distract: 'The other options are simply false claims about what frameworks do.' },

  { id: 'x18', domain: 'development',
    q: 'What is the purpose of exposing an entire agent as a callable tool to another agent?',
    opts: [
      'It lets a supervisor delegate to a specialist while keeping the specialist\'s internal reasoning and context isolated behind a typed interface',
      'It reduces the total number of GPUs required',
      'It removes the need for an LLM in the sub-agent',
      'It guarantees the sub-agent cannot fail'],
    a: 0,
    why: 'Treating an agent as a function gives a clean typed interface, isolates the sub-agent\'s context from the caller\'s, and enables composition. This is the core abstraction in the NeMo Agent Toolkit, where tools, agents and workflows are all functions.',
    distract: 'Composition changes neither hardware requirements nor the sub-agent\'s need for a model, and it certainly does not eliminate failure.' },

  { id: 'x19', domain: 'development',
    q: 'Which test belongs at the deterministic unit level of an agent test suite?',
    opts: [
      'Argument validation, budget enforcement, routing logic and tool implementations, all exercised without an LLM',
      'End-to-end task success rate across the golden set',
      'LLM-as-a-judge scoring of answer quality',
      'A/B comparison of two prompts on live traffic'],
    a: 0,
    why: 'Anything that does not require model judgement should be deterministic, fast and run on every commit. Pushing validation, budgets, routing and tool logic down to unit tests reserves the expensive statistical layers for what genuinely needs them.',
    distract: 'The other three are all statistical or online evaluations that are slow, costly and non-deterministic by nature.' },

  { id: 'x20', domain: 'development',
    q: 'An agent should ask a clarifying question rather than guess when a request is ambiguous. What most reliably produces this behaviour?',
    opts: [
      'Few-shot trajectories demonstrating clarification, plus an explicit ask_user tool the model can select like any other action',
      'A sentence in the system prompt saying "ask if unsure"',
      'Lowering the temperature',
      'Reducing the number of tools'],
    a: 0,
    why: 'Making clarification a first-class action gives the model a concrete option to select, and demonstrations teach when to select it. Behaviour that must be chosen among alternatives is taught far better by examples than by instructions.',
    distract: 'A **bare instruction** is weak against the model\'s strong prior to be helpful immediately. **Temperature** and **tool count** do not encode when clarification is appropriate.' },

  /* ============ Evaluation and Tuning — 13% (8) ============ */
  { id: 'x21', domain: 'evaluation',
    q: 'A golden evaluation set contains 25 cases and a candidate scores three points higher than the baseline. What is the correct conclusion?',
    opts: [
      'The difference is not statistically meaningful at that sample size — expand the set substantially before gating a release on it',
      'The candidate is better; promote it',
      'The candidate is worse; the metric must be inverted',
      'Re-run the same 25 cases until the result stabilises'],
    a: 0,
    why: 'Twenty-five cases give a very wide confidence interval — on the order of ±18 percentage points — so a three-point difference is indistinguishable from noise. Release gates on small deltas require hundreds of cases.',
    distract: 'Promoting on noise is the error being tested. Re-running identical cases does not increase the sample of *distinct* situations and so does not narrow the interval meaningfully.' },

  { id: 'x22', domain: 'evaluation',
    q: 'Which pair of metrics should be tracked separately to localise a RAG failure?',
    opts: [
      'Retrieval metrics (recall@k, nDCG) and generation metrics (faithfulness, answer relevancy)',
      'GPU utilisation and request throughput',
      'Token count and response length',
      'Model parameter count and context window size'],
    a: 0,
    why: 'End-to-end scores cannot tell you whether the evidence was missing or the generator ignored it. Measuring retrieval independently of generation is what makes the diagnosis actionable.',
    distract: 'The other pairs are infrastructure or configuration facts, not quality signals that localise a failure.' },

  { id: 'x23', domain: 'evaluation',
    q: 'Why should the judge model in an LLM-as-a-judge setup be pinned to a specific version?',
    opts: [
      'A silent provider upgrade changes the measuring instrument, invalidating comparisons against historical scores',
      'Older versions are always more accurate judges',
      'Pinned versions are cheaper to run',
      'Unpinned models cannot output structured scores'],
    a: 0,
    why: 'A judge is a measuring instrument. If it changes underneath you, score movements can no longer be attributed to changes in the system under test, and your entire metric history becomes incomparable.',
    distract: 'Older is not inherently better, pinning does not change price, and version pinning is unrelated to structured output support.' },

  { id: 'x24', domain: 'evaluation',
    scenario: 'A team wants a smaller, cheaper model to handle 80% of production traffic without losing accuracy on that traffic.',
    q: 'Which approach fits best?',
    opts: [
      'Distil the large model into a small one using curated production traces, evaluate the candidate against the incumbent, and route easy traffic to it',
      'Quantise the large model to INT4 and serve it to everyone',
      'Reduce the large model\'s max output tokens',
      'Prompt the large model to be more concise'],
    a: 0,
    why: 'This is the data flywheel: curate real traces, fine-tune or distil a small model on them, verify it matches the incumbent on the target traffic, then route that traffic to it. The large model remains available for the harder 20%.',
    distract: '**Blanket INT4** costs accuracy precisely on the hard requests. **Shorter outputs** and **conciser prompts** change the answer rather than the cost structure.' },

  { id: 'x25', domain: 'evaluation',
    q: 'Which evaluation approach best detects that an agent reached the right answer through an unreliable path?',
    opts: [
      'Trajectory evaluation — scoring tool selection, argument correctness, step efficiency and redundant calls',
      'Final-answer exact match',
      'BLEU against a reference answer',
      'Measuring total tokens consumed'],
    a: 0,
    why: 'Only trajectory evaluation examines the decisions themselves. An agent that reaches the right answer through redundant calls and a lucky guess passes every outcome-only check and will fail under any distribution shift.',
    distract: 'Exact match and BLEU score only the final string. Token count is a cost proxy that says nothing about decision quality.' },

  { id: 'x26', domain: 'evaluation',
    q: 'When is DPO the appropriate tuning method?',
    opts: [
      'When you have pairs of preferred and rejected responses for tasks with no single correct answer',
      'When you need to add this week\'s factual updates to the model',
      'When you need guaranteed JSON output',
      'When you need to reduce inference latency'],
    a: 0,
    why: 'Direct Preference Optimisation trains directly on chosen/rejected pairs without a separate reward model, which suits style, tone and judgement calls where no single reference string is correct.',
    distract: 'Fresh facts belong in RAG. JSON guarantees come from constrained decoding. Latency is a serving concern.' },

  { id: 'x27', domain: 'evaluation',
    q: 'Which cases must a production golden set include beyond typical successful queries?',
    opts: [
      'Ambiguous requests, out-of-scope requests, questions the corpus cannot answer, injection payloads, tool failures and multi-hop questions',
      'Only the highest-frequency queries, since they dominate traffic',
      'Only queries that previously failed',
      'Randomly generated strings to test robustness'],
    a: 0,
    why: 'The purpose of a golden set is to catch regressions on the cases that break things. Correct behaviour on an unanswerable question (saying so), on an out-of-scope request (refusing) and under injection (not complying) all need to be pinned by tests.',
    distract: 'Only-common or only-previously-failed sets leave large blind spots, and random strings test almost nothing users will actually send.' },

  { id: 'x28', domain: 'evaluation',
    q: 'A team quantises a deployed model from FP16 to INT4 and observes a large throughput gain. What must accompany this change?',
    opts: [
      'Re-running the evaluation suite to quantify the accuracy impact, particularly on reasoning and tool-calling tasks',
      'Nothing — quantisation is lossless',
      'Increasing the context window to compensate',
      'Switching to a larger batch size to offset the accuracy loss'],
    a: 0,
    why: 'Quantisation trades precision for speed and memory, and the cost is measurable and task-dependent. INT4 in particular can degrade reasoning and structured tool-call generation, so the accuracy delta must be measured on your own golden set.',
    distract: 'INT4 is not lossless. Neither context length nor batch size compensates for reduced numerical precision.' },

  /* ============ Deployment and Scaling — 13% (8) ============ */
  { id: 'x29', domain: 'deployment',
    q: 'Which signal is most appropriate for autoscaling an LLM inference service?',
    opts: [
      'Pending-request queue depth or a p95 latency SLO',
      'Container CPU utilisation',
      'Node memory usage',
      'Requests per second alone'],
    a: 0,
    why: 'Queue depth and latency directly reflect whether the service is keeping up with demand on the GPU. CPU is a poor proxy because it is mostly idle while the GPU works, and raw RPS ignores the wide variance in request cost between a short prompt and a long agent trajectory.',
    distract: 'CPU and node memory reflect the wrong resource. RPS alone treats a 200-token and a 30,000-token request as equivalent load.' },

  { id: 'x30', domain: 'deployment',
    scenario: 'A service must handle bursts of 10× normal traffic arriving within a minute. Inference pods take about three minutes to become ready.',
    q: 'Which combination handles this best?',
    opts: [
      'Keep a warm replica floor sized for a partial burst, pre-cache model artefacts, scale early on queue depth, and queue with backpressure and a graceful degradation path during the gap',
      'Enable scale-to-zero to save cost between bursts',
      'Set the HPA to scale at 95% utilisation',
      'Increase the per-pod batch size so each pod handles more traffic'],
    a: 0,
    why: 'When scale-up is slower than the burst, capacity must exist before demand arrives. A warm floor plus pre-cached artefacts shortens the gap, early scaling triggers ahead of saturation, and backpressure with a defined degraded response covers the residual window.',
    distract: '**Scale-to-zero** guarantees a cold start on every burst. **Scaling at 95%** starts three minutes too late. **Bigger batches** raise per-request latency exactly when the system is already stressed.' },

  { id: 'x31', domain: 'deployment',
    q: 'What is the main memory constraint on serving concurrent agent sessions with long trajectories?',
    opts: [
      'KV cache growth, which scales with batch size and sequence length and is resident for the whole run',
      'Model weight size, which grows with concurrency',
      'Tokeniser vocabulary size',
      'The number of tool definitions registered'],
    a: 0,
    why: 'Weights are loaded once and shared across requests; the KV cache is per-sequence and grows with every token. With long agent trajectories held open concurrently, the cache — not the weights — determines how many sessions fit on a GPU.',
    distract: 'Weights do not replicate per request, and vocabulary and tool-definition counts are negligible.' },

  { id: 'x32', domain: 'deployment',
    q: 'Which of these preserves output quality exactly while reducing latency?',
    opts: ['Speculative decoding', 'INT4 quantisation', 'Reducing top-k retrieval', 'Truncating the system prompt'],
    a: 0,
    why: 'Speculative decoding has a small draft model propose tokens that the target model verifies in one pass, keeping only accepted tokens. The resulting distribution matches the target model, so quality is preserved.',
    distract: 'Quantisation changes numerical precision and therefore output. Reducing retrieval and truncating the prompt both change the information available to the model.' },

  { id: 'x33', domain: 'deployment',
    q: 'Why is disaggregating prefill and decode across separate GPU pools beneficial at scale?',
    opts: [
      'They have different bottlenecks — prefill is compute-bound and decode is memory-bandwidth-bound — so each pool can be sized and scaled for its own constraint',
      'It removes the need for a KV cache',
      'It allows inference without GPUs',
      'It guarantees structured output'],
    a: 0,
    why: 'Co-locating the two phases means one always underutilises the resource the other needs. Independent pools let you provision compute for prefill and bandwidth for decode, with the KV cache transferred between them and cache-aware routing directing requests appropriately.',
    distract: 'Disaggregation depends on the KV cache rather than eliminating it, still requires GPUs, and has nothing to do with output format.' },

  { id: 'x34', domain: 'deployment',
    q: 'An agent service loses conversation state when pods are recycled during a rolling deployment. What is the fix?',
    opts: [
      'Externalise session state and agent checkpoints to a shared store so any replica can resume any conversation',
      'Disable rolling deployments and deploy only during maintenance windows',
      'Pin each user to a specific pod indefinitely',
      'Keep state in memory but increase the pod termination grace period'],
    a: 0,
    why: 'Externalised state makes replicas interchangeable, which is what allows rolling deployments, autoscaling and crash recovery to work without losing conversations. Checkpointing also allows an interrupted run to resume rather than restart.',
    distract: 'Avoiding rolling deploys sacrifices availability. Permanent pinning breaks on scale-down and node failure. A longer grace period only postpones the loss.' },

  { id: 'x35', domain: 'deployment',
    q: 'Which is the strongest argument for self-hosting models with NIM rather than calling a hosted API?',
    opts: [
      'Data residency requirements, predictable latency and cost at sustained high volume, with version pinning under your control',
      'Self-hosted models are always more accurate',
      'It eliminates the need for evaluation',
      'It removes the need for guardrails'],
    a: 0,
    why: 'Self-hosting addresses constraints hosted APIs cannot: keeping data inside a trust boundary, controlling latency and capacity directly, better unit economics at sustained volume, and preventing silent upstream model changes.',
    distract: 'Self-hosting does not change model accuracy, and evaluation and guardrails are required regardless of where the model runs.' },

  { id: 'x36', domain: 'deployment',
    q: 'A team reports "we reduced cost per token by 40%, but our monthly bill is unchanged". What most likely happened?',
    opts: [
      'The cheaper model fails more often and takes more steps per task, so token volume rose to offset the unit saving',
      'The provider changed its pricing',
      'The context window increased automatically',
      'Caching was disabled by the change'],
    a: 0,
    why: 'This is why cost per successfully resolved task is the right unit. A weaker model that needs more retries, more steps and more escalations can consume enough extra tokens to erase a large unit-price saving.',
    distract: 'The other explanations are possible but are not the systematic effect the scenario describes, which is a direct consequence of optimising the wrong metric.' },

  /* ============ Cognition, Planning, and Memory — 10% (7) ============ */
  { id: 'x37', domain: 'cognition',
    q: 'Which technique samples several reasoning paths and selects the majority answer?',
    opts: ['Self-consistency', 'Chain-of-Thought', 'ReAct', 'Reflexion'],
    a: 0,
    why: 'Self-consistency samples N independent chains at non-zero temperature and takes the modal answer, exploiting the tendency of correct reasoning to converge while errors scatter. It costs N times the tokens.',
    distract: '**CoT** produces one path. **ReAct** interleaves reasoning with tool use. **Reflexion** critiques failures and stores the critique in memory.' },

  { id: 'x38', domain: 'cognition',
    q: 'An agent must retain a user\'s stated accessibility preference across all future sessions. Which memory type and write policy apply?',
    opts: [
      'Semantic memory, written as an extracted durable fact with deduplication and supersession on change',
      'Working memory, kept in the context window',
      'Episodic memory, keyed to the session in which it was mentioned',
      'Procedural memory, stored as a reusable skill'],
    a: 0,
    why: 'A stable preference is a time-independent fact about the user, which is semantic memory. The write path should extract it as a fact rather than store the raw turn, deduplicate against existing entries, and supersede the old value with a timestamp if the preference changes.',
    distract: '**Working** memory does not persist. **Episodic** memory would tie it to one event rather than treat it as generally true. **Procedural** memory holds how-to skills.' },

  { id: 'x39', domain: 'cognition',
    q: 'What is the practical consequence of "lost in the middle" behaviour in long contexts?',
    opts: [
      'Place the most important evidence near the beginning or end of the prompt, and rerank aggressively to keep context short',
      'Always fill the context window completely to maximise available information',
      'Put the system prompt at the end of the context',
      'Disable retrieval when the context is long'],
    a: 0,
    why: 'Recall of material buried in the middle of a long context is measurably weaker. The engineering responses are positional discipline for the most important evidence and reranking down to a small number of highly relevant chunks.',
    distract: 'Filling the window maximises the amount of material in the weak-recall zone. Moving the system prompt to the end breaks prefix caching and reduces instruction adherence, and disabling retrieval removes the grounding entirely.' },

  { id: 'x40', domain: 'cognition',
    q: 'When should a Plan-and-Execute agent invoke its replanner?',
    opts: [
      'When a step fails after retries, a result contradicts a plan assumption, new information makes remaining steps unnecessary, or the budget will not cover the plan',
      'After every completed step, to keep the plan current',
      'Only when the user explicitly asks for a new plan',
      'Never — replanning defeats the purpose of planning'],
    a: 0,
    why: 'Replanning is triggered by invalidation of the plan\'s assumptions. Those four conditions are the standard set, and each represents a case where continuing to execute the existing plan wastes work or produces a wrong result.',
    distract: 'Replanning after every step degenerates into ReAct at planner-model cost. Waiting for the user ignores failures. Never replanning means the agent cannot recover.' },

  { id: 'x41', domain: 'cognition',
    q: 'Which memory design flaw most directly degrades retrieval quality over time?',
    opts: [
      'Writing every conversational turn verbatim without extraction, deduplication or supersession',
      'Storing memories with timestamps',
      'Partitioning memory by user',
      'Limiting each memory entry to a single fact'],
    a: 0,
    why: 'Unfiltered writes fill the store with noise and near-duplicates, so semantically relevant retrieval increasingly returns irrelevant or contradictory entries. Memory quality is determined mainly by the write policy.',
    distract: 'Timestamps, per-user partitioning and single-fact granularity are all good practices — the first supports supersession, the second is required for tenancy and erasure, and the third improves retrieval precision.' },

  { id: 'x42', domain: 'cognition',
    q: 'Why is Tree-of-Thoughts a poor choice for a simple factual lookup?',
    opts: [
      'It multiplies LLM calls to search branches that add nothing when there is one obvious path, inflating latency and cost',
      'It cannot access tools',
      'It requires a fine-tuned model',
      'It produces invalid JSON'],
    a: 0,
    why: 'ToT is a search over alternatives. Where there are no meaningful alternatives to search, the branching and scoring cost — often five to twenty times baseline — buys nothing.',
    distract: 'ToT can be combined with tools, needs no fine-tuning, and has no bearing on output formatting.' },

  { id: 'x43', domain: 'cognition',
    q: 'What is the primary purpose of a summarisation buffer in a long-running agent?',
    opts: [
      'Replace older turns with a compact running summary so the session stays within the context window while retaining salient state',
      'Reduce the number of tools available to the agent',
      'Speed up the vector database',
      'Improve the tokeniser\'s efficiency'],
    a: 0,
    why: 'A summarisation buffer bounds context growth without discarding the information the agent needs, addressing both the window limit and the cost and recall penalties of very long transcripts.',
    distract: 'It has no relationship to tool exposure, vector search performance or tokenisation.' },

  /* ============ Knowledge Integration — 10% (7) ============ */
  { id: 'x44', domain: 'knowledge',
    q: 'Which retrieval improvement most directly addresses conversational follow-up questions such as "and what about the other one?"',
    opts: [
      'Query rewriting that resolves references against the conversation history before searching',
      'Increasing the retrieval top-k',
      'Switching to a larger generation model',
      'Adding more documents to the corpus'],
    a: 0,
    why: 'The raw follow-up contains almost no searchable content. Rewriting it into a self-contained query using the prior turns is what makes retrieval possible at all; nothing downstream can compensate for an uninformative query.',
    distract: 'Higher top-k, a bigger generator and more documents all operate on or after a search that was doomed by its input.' },

  { id: 'x45', domain: 'knowledge',
    q: 'What is the "small-to-big" chunking strategy?',
    opts: [
      'Embed and search over small precise chunks, but return the surrounding parent section to the LLM for context',
      'Start with small documents and progressively ingest larger ones',
      'Use a small embedding model and a large generation model',
      'Retrieve a small top-k and then expand it if the answer is insufficient'],
    a: 0,
    why: 'Small chunks give precise embeddings and accurate matching; large chunks give the generator enough surrounding context to interpret what was matched. Small-to-big gets both by decoupling the search unit from the returned unit.',
    distract: 'The other options describe unrelated practices — an ingestion order, a model-size pairing, and an iterative retrieval loop.' },

  { id: 'x46', domain: 'knowledge',
    q: 'Which metadata should be attached to chunks at ingestion time?',
    opts: [
      'Source, section, effective date, version, and access-control attributes',
      'The embedding vector only',
      'The chunk\'s position in the original file only',
      'The name of the engineer who ran the ingestion job'],
    a: 0,
    why: 'Metadata drives pre-filtering for access control, recency-aware and authority-aware ranking, versioning and supersession, and citation. Without it you can only rank by similarity, which is blind to permissions, recency and authority.',
    distract: 'The vector is stored separately by definition, position alone supports little, and job attribution has no retrieval use.' },

  { id: 'x47', domain: 'knowledge',
    q: 'When is text-to-SQL the right pattern rather than vector retrieval?',
    opts: [
      'When the answer requires aggregation or precise filtering over structured relational data',
      'When documents are long and unstructured',
      'When the corpus contains many PDFs',
      'When the user asks an open-ended conceptual question'],
    a: 0,
    why: 'Aggregations, joins and exact filters over structured data are what SQL does correctly and what embedding table rows does badly. The guardrails are a restricted schema, read-only credentials, query validation, row limits and timeouts.',
    distract: 'Long unstructured documents, PDF corpora and conceptual questions are all retrieval cases.' },

  { id: 'x48', domain: 'knowledge',
    q: 'A hybrid search system must merge a BM25 ranking and a dense ranking whose scores are on different scales. What is the standard approach?',
    opts: [
      'Reciprocal Rank Fusion, which combines by rank position and needs no score normalisation',
      'Averaging the raw scores from both systems',
      'Discarding the lower-scoring list entirely',
      'Re-embedding the BM25 results and re-scoring them'],
    a: 0,
    why: 'RRF sums 1/(k + rank) across lists, so it depends only on ordering. That makes it robust to incomparable score distributions, which is exactly the problem when fusing lexical and dense retrieval.',
    distract: 'Averaging incomparable scores is meaningless. Discarding a list defeats the purpose of hybrid search. Re-embedding does not solve the fusion problem.' },

  { id: 'x49', domain: 'knowledge',
    q: 'What is the correct response when retrieved sources conflict on a policy detail?',
    opts: [
      'Surface the conflict, cite both with their effective dates and status, and identify which is currently authoritative',
      'Return the passage with the highest similarity score',
      'Average the two answers into a single statement',
      'Return neither and refuse to answer'],
    a: 0,
    why: 'Conflicts are real information. Metadata such as effective date and status lets the system identify the authoritative version, and disclosing the conflict lets the user verify rather than trust a silent choice.',
    distract: 'Similarity is blind to authority. Averaging contradictory policies produces a statement true of neither. Refusing discards a genuinely answerable question.' },

  { id: 'x50', domain: 'knowledge',
    q: 'Why must PII redaction be considered before documents are embedded, not only before display?',
    opts: [
      'Embeddings are derived from and partially invertible to the source text, so indexing sensitive content distributes it into the retrieval system',
      'Embedding models cannot process names',
      'Redaction improves embedding dimensionality',
      'Vector databases cannot store personal data'],
    a: 0,
    why: 'Once sensitive text is embedded and indexed, it lives in the vector store and can be surfaced by retrieval or partially recovered from the vectors. Redaction belongs at ingestion when the use case does not require the data.',
    distract: 'Embedding models handle names fine, redaction does not change dimensionality, and vector databases can technically store anything — the constraint is regulatory, not technical.' },

  /* ============ NVIDIA Platform — 7% (5) ============ */
  { id: 'x51', domain: 'platform',
    q: 'Which NVIDIA microservice family provides document extraction, embedding and reranking for RAG?',
    opts: ['NeMo Retriever', 'NeMo Customizer', 'NeMo Guardrails', 'NeMo Curator'],
    a: 0,
    why: 'NeMo Retriever covers the retrieval half of RAG with three capabilities: multimodal document extraction (nv-ingest), embedding NIMs, and reranking NIMs.',
    distract: '**Customizer** fine-tunes models, **Guardrails** enforces runtime policy, and **Curator** prepares training data.' },

  { id: 'x52', domain: 'platform',
    q: 'What does the NIM Operator provide on Kubernetes?',
    opts: [
      'Declarative lifecycle management of NIM and NeMo services, including model caching to reduce cold starts, deployment and scaling via CRDs',
      'A vector database for RAG',
      'Automatic prompt optimisation for agents',
      'A replacement for the Kubernetes scheduler'],
    a: 0,
    why: 'The NIM Operator manages NIM and NeMo microservices declaratively — caching model artefacts on persistent volumes so pods skip the download, and handling deployment, scaling and upgrades through custom resources.',
    distract: 'It is not a datastore, does not tune prompts, and works with the standard scheduler rather than replacing it.' },

  { id: 'x53', domain: 'platform',
    q: 'Which is the correct distinction between NIM and Triton Inference Server?',
    opts: [
      'NIM is a packaged model-specific microservice with a prebuilt optimised engine and an OpenAI-compatible API; Triton is a general multi-backend inference server you configure yourself',
      'NIM runs on CPU; Triton runs on GPU',
      'NIM is for training; Triton is for inference',
      'They are the same product under different names'],
    a: 0,
    why: 'NIM ships a specific model with a TensorRT-LLM engine selected for the detected GPU behind a standard OpenAI-compatible REST API. Triton is a general-purpose server supporting many backends, ensembles and custom models, which you assemble and tune yourself.',
    distract: 'Both are GPU inference technologies, and neither is a training system.' },

  { id: 'x54', domain: 'platform',
    q: 'A team wants a working enterprise RAG reference implementation quickly, with Helm charts and configuration they can then customise. What should they start from?',
    opts: ['An NVIDIA Blueprint', 'NeMo Curator', 'MIG partitioning', 'TensorRT-LLM directly'],
    a: 0,
    why: 'Blueprints are reference applications that wire NIM and NeMo microservices into a working solution, shipped with code and deployment charts — designed exactly for "get something running, then customise".',
    distract: '**Curator** is a data tool, **MIG** is GPU partitioning, and **TensorRT-LLM** is a low-level optimisation library rather than an application scaffold.' },

  { id: 'x55', domain: 'platform',
    q: 'What are the NeMo Data Store and Entity Store responsible for?',
    opts: [
      'Data Store holds datasets, model artefacts and evaluation results; Entity Store manages metadata entities such as namespaces, models, datasets and evaluation targets',
      'Both are vector databases for RAG retrieval',
      'Data Store serves models; Entity Store performs fine-tuning',
      'They provide guardrail policy enforcement'],
    a: 0,
    why: 'Data Store is the artefact and file layer with a HuggingFace-compatible API; Entity Store is the metadata and registry layer that tracks the entities those artefacts belong to.',
    distract: 'Neither is a vector database, an inference server, a training service or a policy engine.' },

  /* ============ Run, Monitor, Maintain — 5% (4) ============ */
  { id: 'x56', domain: 'operations',
    q: 'Which attributes must an agent trace span carry to be useful for debugging?',
    opts: [
      'Model and prompt version, token counts, latency, cost, tool name and arguments, result status, retry count, and run and session identifiers',
      'Only total request duration and HTTP status',
      'Only the final answer text',
      'Only GPU utilisation during the request'],
    a: 0,
    why: 'Without argument-level detail and versioning you cannot distinguish a wrong tool choice from a right tool called badly, nor reproduce the exact configuration that produced an output.',
    distract: 'Duration and status, final text alone, or infrastructure counters cannot localise a failure to a stage.' },

  { id: 'x57', domain: 'operations',
    q: 'What is the purpose of running the golden evaluation set on a schedule against production, not only in CI?',
    opts: [
      'To catch drift that no code change caused — upstream model updates, corpus changes and tool behaviour shifts',
      'To increase test coverage percentages',
      'To warm the model cache',
      'To generate training data automatically'],
    a: 0,
    why: 'CI catches regressions caused by your changes. Scheduled production evaluation catches degradation caused by everything around your system that changed without a deployment.',
    distract: 'It is not a coverage metric, cache warming is incidental, and evaluation is not a data-generation mechanism.' },

  { id: 'x58', domain: 'operations',
    q: 'Traces are being exported with full prompts and responses to a third-party observability platform. What must be addressed?',
    opts: [
      'PII redaction before export, retention limits, and access control on the trace backend, which now holds customer data',
      'Nothing — traces are internal telemetry',
      'Only the sampling rate, to control cost',
      'Only the trace ID format, for correlation'],
    a: 0,
    why: 'Full prompt and response capture makes the observability platform a store of customer data. It needs the same privacy controls as any other system holding that data: redaction, retention limits and access control.',
    distract: 'Treating traces as harmless telemetry is the error; cost and ID formats are real concerns but not the compliance issue.' },

  { id: 'x59', domain: 'operations',
    q: 'What should be versioned together so that any production output can be reproduced?',
    opts: [
      'Prompts, tool schemas, retrieval configuration, model identifiers and guardrail policies, with the composite version recorded on every trace',
      'Only the application code',
      'Only the model identifier',
      'Only the prompt templates'],
    a: 0,
    why: 'Agent behaviour is determined by all of these together. Recording the composite version on each trace is what lets you reproduce an output and attribute a behaviour change to a specific artefact.',
    distract: 'Any single one of these alone leaves the rest free to change silently, making outputs irreproducible.' },

  /* ============ Safety, Ethics, Compliance — 5% (4) ============ */
  { id: 'x60', domain: 'safety',
    q: 'Which NeMo Guardrails rail is best placed to strip sensitive content from documents before they enter the prompt?',
    opts: ['Retrieval rail', 'Input rail', 'Output rail', 'Dialog rail'],
    a: 0,
    why: 'Retrieval rails act on retrieved chunks before they reach the model, which is the earliest point at which retrieved sensitive content can be removed — and also where injected instructions inside documents should be screened.',
    distract: '**Input rails** act on the user message, not on retrieved content. **Output rails** are a useful backstop but the data has already entered the model context. **Dialog rails** govern conversational flow.' },

  { id: 'x61', domain: 'safety',
    q: 'What is the essential difference between an audit trail and application logging?',
    opts: [
      'An audit trail is immutable, tamper-evident, access-controlled and complete enough to reconstruct a specific decision, including all artefact versions in force',
      'Audit trails are stored in JSON; logs are plain text',
      'Audit trails are sampled; logs are complete',
      'Audit trails are only required for multi-agent systems'],
    a: 0,
    why: 'Regulatory audit requires reconstructability of an individual decision and assurance that the record has not been altered. Ordinary logs are mutable, often sampled, and rarely capture the full decision chain and versions.',
    distract: 'Format is irrelevant; audit records must be complete rather than sampled; and the requirement follows from the use case, not the agent count.' },

  { id: 'x62', domain: 'safety',
    q: 'Which is the most reliable defence against an agent being manipulated into exceeding a user\'s permissions?',
    opts: [
      'Propagate the end user\'s identity and enforce authorisation server-side on every tool call with short-lived scoped credentials',
      'Instruct the agent in its system prompt to respect user permissions',
      'Use a model fine-tuned on access-control policies',
      'Log all tool calls for later review'],
    a: 0,
    why: 'Authorisation must be enforced where execution happens, under the requesting user\'s identity. Then even a fully hijacked agent cannot exceed what that user is allowed to do — which is what defeats the confused-deputy problem.',
    distract: 'Prompts and fine-tuning are not enforcement mechanisms and can be overridden by injected content. Logging detects after the fact rather than preventing.' },

  { id: 'x63', domain: 'safety',
    q: 'A system makes consequential decisions about individuals. Which combination is required beyond accuracy?',
    opts: [
      'Subgroup-disaggregated evaluation, disclosure that AI is involved, human oversight, complete decision logging, and a documented appeal path',
      'A higher overall accuracy threshold',
      'A larger and more capable model',
      'A faster response time'],
    a: 0,
    why: 'High-impact decisions about people carry obligations that aggregate accuracy cannot satisfy: fairness must be measured per subgroup, the use must be disclosed, a human must be able to oversee and override, decisions must be reconstructable, and individuals must be able to contest an outcome.',
    distract: 'Accuracy, model size and latency are all orthogonal to fairness, transparency, oversight and recourse.' },

  /* ============ Human-AI Interaction — 5% (3) ============ */
  { id: 'x64', domain: 'human',
    q: 'Technically, how is a human-in-the-loop approval implemented in a graph-based agent?',
    opts: [
      'An interrupt before the sensitive node, with state persisted by a checkpointer so the exact run resumes after approval',
      'A blocking sleep in the tool function until a human responds',
      'Running the agent twice and comparing the outputs',
      'Rejecting the request and asking the user to email a human'],
    a: 0,
    why: 'The agent pauses before executing, its state is durably checkpointed, the proposed action and its reasoning are surfaced for review, and on approval the run resumes from exactly that point — surviving pod restarts and long human response times.',
    distract: 'A **blocking sleep** holds a worker and dies with the process. **Running twice** is not oversight. **Rejecting outright** discards the work already done.' },

  { id: 'x65', domain: 'human',
    q: 'Which escalation policy is best specified?',
    opts: [
      'Escalate when retrieval confidence falls below a calibrated threshold, when the same step fails twice, when transaction value exceeds a defined limit, or when the user requests a human',
      'Escalate whenever the agent is unsure',
      'Escalate every tenth conversation for quality control',
      'Escalate only when the user complains'],
    a: 0,
    why: 'Concrete, measurable triggers can be implemented, tested and tuned. "Unsure" is not a computable condition, sampling is quality assurance rather than escalation, and waiting for a complaint means the failure has already reached the user.',
    distract: 'The other options are either unimplementable, serve a different purpose, or are purely reactive.' },

  { id: 'x66', domain: 'human',
    q: 'What is the most valuable form of user feedback for improving an agent?',
    opts: [
      'Specific corrections tied to the trace id — "it cited the superseded policy version" — which localise the failure and feed the data flywheel',
      'Aggregate thumbs-up percentages',
      'Net Promoter Score for the product',
      'Total session duration'],
    a: 0,
    why: 'A specific correction linked to a trace identifies which pipeline stage failed and doubles as high-quality evaluation and training data. Human corrections are the best-quality signal available for the data flywheel.',
    distract: 'Aggregate ratings, NPS and duration all indicate that something is wrong without saying what or where.' },
]

export const bankByDomain = examBank.reduce((acc, q) => {
  ;(acc[q.domain] ||= []).push(q)
  return acc
}, {})
