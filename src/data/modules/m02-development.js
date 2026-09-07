export default {
  id: 'development',
  n: 2,
  domain: 'development',
  weight: 15,
  title: 'Agent Development',
  blurb: 'Tool contracts that models actually call correctly, guaranteed-parseable outputs, the framework landscape including NeMo Agent Toolkit, prompt and context engineering, and how to test something non-deterministic.',
  hours: '4–5 h',
  lessons: [
    {
      id: 'tool-design',
      title: 'Tool design: the contract between model and system',
      minutes: 15,
      blocks: [
        { t: 'lede', x: 'When an agent misbehaves, the cause is a badly-specified tool far more often than a weak model. Tool descriptions and schemas are the highest-leverage code in an agent.' },

        { t: 'h2', x: 'What a tool call actually is' },
        { t: 'p', x: 'The model never executes anything. In [[tool-calling|tool calling]] it emits a structured request — a tool name and a JSON argument object conforming to a declared schema — and your runtime validates, authorises and executes it, then returns the result as a new observation. That split is the foundation of every security control in an agent: authorisation belongs in the runtime, never in the prompt.' },

        { t: 'h2', x: 'Why strict JSON Schema typing matters' },
        { t: 'p', x: 'A [[json-schema|JSON Schema tool definition]] gives you three things a free-text description cannot:' },
        { t: 'ul', items: [
          '**Deterministic validation.** A malformed call is rejected by code before execution, and the validation error is returned to the model as an observation it can correct — no wasted side effects, no exception mid-run.',
          '**Constrained generation.** Providers and inference servers can use the schema to [[constrained-decoding|constrain decoding]] so the emitted arguments are structurally valid by construction.',
          '**Self-documentation.** `enum`, `minimum`, `format` and `required` communicate the valid space to the model far more reliably than prose ever will.',
        ]},
        { t: 'callout', kind: 'trap', title: 'What schemas do not do', x: 'A common distractor claims strict typing "eliminates hallucination". It does not. It guarantees the call is **well-formed**, not that it is **the right call with sensible values**. The model can still pass a syntactically perfect but semantically wrong customer ID.' },

        { t: 'h2', x: 'Writing a description the model can act on' },
        { t: 'p', x: 'The description is a prompt, and it is read at exactly the moment the model is choosing between tools. Say what the tool does, when to use it, when **not** to use it, and what it returns.' },
        { t: 'code', lang: 'python', title: 'Weak vs. strong tool definitions', x: `# WEAK — vague, overlapping, no boundaries
{"name": "search", "description": "Search for information",
 "parameters": {"type": "object", "properties": {"q": {"type": "string"}}}}

# STRONG — scope, negative scope, units, constraints, return shape
{
  "name": "search_internal_kb",
  "description": (
      "Semantic search over the internal engineering knowledge base "
      "(runbooks, postmortems, architecture decision records). "
      "Use for questions about how OUR systems work. "
      "Do NOT use for public documentation of third-party products — "
      "use search_web for that. "
      "Returns up to 'top_k' passages, each with title, url and a relevance score 0-1."
  ),
  "parameters": {
    "type": "object",
    "properties": {
      "query":  {"type": "string",
                 "description": "Natural-language question. Do not include boolean operators."},
      "top_k":  {"type": "integer", "minimum": 1, "maximum": 20, "default": 5},
      "since":  {"type": "string", "format": "date",
                 "description": "Only return documents updated on or after this ISO-8601 date."},
      "system": {"type": "string", "enum": ["billing", "auth", "search", "any"], "default": "any"}
    },
    "required": ["query"]
  }
}` },

        { t: 'callout', kind: 'exam', title: 'Tool-design rules that show up as answer options', x: [
          '**Name the negative scope.** "Do NOT use for X — use Y instead" is the single most effective fix for tools that get confused with each other.',
          '**Use enums instead of free strings** wherever the value space is closed. It removes a whole class of invalid calls.',
          '**Put units and formats in the schema**, not in the prose. `"format": "date"` beats "pass a date".',
          '**Return structured, compact results.** Dumping a 40k-token API response into the transcript destroys the context budget — return a digest plus a reference.',
        ]},

        { t: 'h2', x: 'Granularity: too many tools, or too few?' },
        { t: 'p', x: '[[tool-overload|Selection accuracy degrades as the tool count grows]], mostly because near-duplicate descriptions blur together. But collapsing everything into one mega-tool with a `mode` parameter just moves the ambiguity into an argument the model gets wrong instead.' },
        { t: 'p', x: 'The escalation ladder, in order of what to try first:' },
        { t: 'ol', items: [
          'Sharpen descriptions and add explicit negative scope. Fixes most confusion at low cost.',
          'Merge genuinely overlapping tools; split tools that do two unrelated things.',
          'Group tools into namespaces or toolkits, exposing a category first and the specific tool second.',
          'Retrieve tools dynamically — embed the tool descriptions and expose only the top-k relevant to this request.',
          'Route to specialist sub-agents, each holding a small, coherent tool set.',
        ]},

        { t: 'h2', x: 'Side effects, retries and idempotency' },
        { t: 'p', x: 'Agents retry. Networks time out. If a "create_order" call times out after the order was created, a naive retry creates two orders. [[idempotency|Idempotency keys]] — a client-generated token the server dedupes on — are the standard fix, and they are the correct answer whenever a scenario involves an agent performing a duplicated side effect.' },
        { t: 'p', x: 'Related rules: separate read tools from write tools so read-only agents can be granted a safe subset; make destructive tools require confirmation or a [[hitl|human approval]] interrupt; and design errors to be **actionable** — "invalid date format, expected YYYY-MM-DD, got 03/04/26" lets the model fix itself, while "400 Bad Request" does not.' },

        { t: 'callout', kind: 'tip', title: 'Error messages are prompts too', x: 'Every error string your tool returns will be read by a language model that is trying to recover. Write them for that reader: state what was wrong, what was expected, and what to try next.' },

        { t: 'h2', x: 'Authorisation belongs in the tool' },
        { t: 'p', x: 'Never rely on the system prompt to restrict what an agent may do. Propagate the end user\'s identity into every tool invocation and check permissions server-side, per call, under that identity. This is the [[least-privilege|least-privilege]] principle, and it is the only defence that survives a successful [[prompt-injection|prompt injection]].' },
      ],
    },

    {
      id: 'structured-output',
      title: 'Structured output and constrained decoding',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'An agent is a program. Programs need parseable values, not prose that usually parses. There is a spectrum of techniques here, and the exam expects you to know which one gives a guarantee.' },

        { t: 'h2', x: 'Four ways to get JSON, in ascending order of reliability' },
        { t: 'table', head: ['Technique', 'Guarantee', 'Cost', 'Use when'], rows: [
          ['Prompt-and-hope ("reply in JSON")', 'None', 'Free', 'Prototyping only.'],
          ['Prompt + validate + retry', 'Eventually, usually', 'Extra round trips; can still fail', 'The provider offers nothing better.'],
          ['Provider JSON / schema mode', 'Valid JSON matching the schema', 'None extra', 'The API supports it — the common production default.'],
          ['[[constrained-decoding|Constrained decoding]] (grammar / logit masking)', 'Structurally guaranteed by construction', 'Slight decode overhead', 'You control the serving stack and need a hard guarantee.'],
        ]},
        { t: 'p', x: '[[constrained-decoding|Constrained decoding]] works by masking the token distribution at every decoding step so only tokens that keep the output valid under the grammar can be sampled. It is the only option that makes invalid output *impossible* rather than *unlikely*. NVIDIA\'s serving stack supports guided decoding through TensorRT-LLM and NIM, with backends such as XGrammar and Outlines.' },

        { t: 'callout', kind: 'exam', title: 'The canonical question', x: '"An agent must select exactly one of 50 registered tool names, and occasionally invents one that does not exist. What guarantees a valid selection?" The answer is **constrained/structured decoding** over an enum of the valid names. Retry loops, lower temperature and better prompts all reduce the rate; only constrained decoding eliminates it.' },

        { t: 'h2', x: 'Schema-first development' },
        { t: 'code', lang: 'python', title: 'Pydantic as the single source of truth', x: `from pydantic import BaseModel, Field
from typing import Literal

class RiskAssessment(BaseModel):
    risk_level: Literal["low", "medium", "high", "critical"]
    score: float = Field(ge=0.0, le=1.0)
    factors: list[str] = Field(min_length=1, max_length=5)
    requires_human_review: bool
    rationale: str = Field(max_length=500)

# One model definition drives three things:
#   1. the JSON Schema sent to the LLM (RiskAssessment.model_json_schema())
#   2. runtime validation of what comes back
#   3. static types for every downstream consumer
result: RiskAssessment = llm.with_structured_output(RiskAssessment).invoke(prompt)

if result.requires_human_review or result.risk_level in ("high", "critical"):
    escalate(result)` },
        { t: 'p', x: 'Note the design detail worth stealing: `requires_human_review` is a **field the model fills in**, so the [[escalation|escalation]] decision is part of the structured contract rather than a fragile string match on prose.' },

        { t: 'h2', x: 'Designing schemas that improve reasoning' },
        { t: 'ul', items: [
          '**Order fields so reasoning precedes conclusions.** Put `rationale` before `risk_level` and the model reasons then decides; reverse them and it rationalises a decision it already committed to.',
          '**Prefer enums to free text** for anything you will branch on.',
          '**Include an explicit uncertainty or abstention field** so "I do not know" is representable — otherwise the schema forces a confident guess.',
          '**Keep schemas shallow.** Deeply nested optional structures raise the error rate; flatten where you can.',
        ]},
        { t: 'callout', kind: 'warn', title: 'Structured output constrains form, not truth', x: 'A perfectly valid `RiskAssessment` can still be wrong. Schema conformance is a parsing guarantee. Factual correctness needs grounding, evaluation and — where it matters — human review.' },
      ],
    },

    {
      id: 'frameworks',
      title: 'The framework landscape and NeMo Agent Toolkit',
      minutes: 14,
      blocks: [
        { t: 'lede', x: 'You will not be asked to write LangGraph from memory. You will be asked which tool fits a stated need — and specifically what NVIDIA\'s NeMo Agent Toolkit adds on top of whatever you already use.' },

        { t: 'h2', x: 'What each framework is actually for' },
        { t: 'table', head: ['Framework', 'Core abstraction', 'Strongest at', 'Watch out for'], rows: [
          ['LangChain', 'Chains, tools, runnables (LCEL)', 'Breadth of integrations; fast prototyping', 'Abstraction depth can obscure the actual prompt sent'],
          ['LangGraph', 'Stateful graph: nodes, edges, typed state, checkpointers', 'Cycles, branching, durable state, human-in-the-loop interrupts, time travel', 'More upfront design than a linear chain'],
          ['LlamaIndex', 'Indices, query engines, retrievers', 'Data ingestion and retrieval-centric applications', 'Agent layer is thinner than its retrieval layer'],
          ['CrewAI', 'Roles, tasks, crews, processes', 'Role-based multi-agent teams, expressed declaratively', 'Less control over low-level flow'],
          ['AutoGen / Semantic Kernel', 'Conversational agents; skills and planners', 'Multi-agent conversation; enterprise .NET/Python integration', 'Conversation-driven control can be hard to bound'],
          ['[[nemo-agent-toolkit|NeMo Agent Toolkit]]', 'Typed functions + YAML workflows', 'Wrapping the above; profiling, evaluation and observability across frameworks', 'It composes frameworks rather than replacing them'],
        ]},

        { t: 'h2', x: 'LangGraph, because state machines are the honest model' },
        { t: 'p', x: 'LangGraph models an agent as a graph over a typed state object. Nodes mutate state; edges — including conditional edges — decide what runs next; a checkpointer persists state after every node. That last property is what enables [[state-checkpoint|durable execution]]: resume after a crash, replay a run for debugging, and pause mid-graph for [[hitl|human approval]].' },
        { t: 'code', lang: 'python', title: 'A bounded ReAct loop as an explicit graph', x: `from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END

class S(TypedDict):
    messages: Annotated[list, add_messages]
    steps: int

def agent(s):  return {"messages": [llm.bind_tools(TOOLS).invoke(s["messages"])],
                       "steps": s["steps"] + 1}

def route(s):
    if s["steps"] >= 12:                      return "give_up"   # hard budget in the graph
    if s["messages"][-1].tool_calls:          return "tools"
    return END

g = StateGraph(S)
g.add_node("agent", agent); g.add_node("tools", ToolNode(TOOLS)); g.add_node("give_up", bail)
g.set_entry_point("agent")
g.add_conditional_edges("agent", route, {"tools": "tools", "give_up": "give_up", END: END})
g.add_edge("tools", "agent")

app = g.compile(checkpointer=PostgresSaver(...),        # durable state
                interrupt_before=["tools"])              # human approval before any tool runs` },
        { t: 'p', x: 'Two things to notice: the step budget lives in the routing function, so it is part of the architecture rather than a hopeful instruction in a prompt; and `interrupt_before` turns human approval into a first-class graph feature instead of bespoke plumbing.' },

        { t: 'h2', x: 'NeMo Agent Toolkit' },
        { t: 'p', x: 'The [[nemo-agent-toolkit|NeMo Agent Toolkit]] (formerly AgentIQ) is NVIDIA\'s framework-agnostic layer. Its premise is that you already have agents in LangChain, LangGraph, CrewAI or AutoGen, and what you lack is a consistent way to compose, profile, evaluate and observe them.' },
        { t: 'ul', items: [
          '**Everything is a function.** Tools, agents, whole workflows and LLM calls are all typed, composable functions — so an entire agent can be exposed as a tool to another agent.',
          '**Declarative YAML workflows.** Components are wired in configuration, so changing a model or swapping an agent type is a config edit rather than a code change.',
          '**Built-in agent types.** [[react|ReAct]], [[rewoo|ReWOO]], tool-calling, reasoning and [[router|router]] agents ship with the toolkit.',
          '**Profiler.** Per-step token usage, latency and cost attribution, with bottleneck identification across the whole workflow.',
          '**Evaluation harness.** Dataset-driven evaluation with built-in and custom evaluators, runnable in CI.',
          '**[[otel|OpenTelemetry]] observability.** Spans exported to Phoenix, W&B Weave, Langfuse or any OTel collector.',
          '**MCP support**, in both directions — consume MCP servers, and expose toolkit functions as an MCP server.',
        ]},
        { t: 'code', lang: 'yaml', title: 'A NeMo Agent Toolkit workflow', x: `llms:
  main:
    _type: nim
    model_name: meta/llama-3.3-70b-instruct
  cheap:
    _type: nim
    model_name: meta/llama-3.1-8b-instruct

functions:
  internal_search:
    _type: nemo_retriever_rag
    collection: engineering-kb
    top_k: 20
    reranker: nvidia/nv-rerankqa-mistral-4b-v3
  ticket_lookup:
    _type: mcp_tool_wrapper
    url: http://mcp-servicedesk:8080/sse
    tool_name: get_ticket

workflow:
  _type: react_agent
  llm_name: main
  tool_names: [internal_search, ticket_lookup]
  max_iterations: 10
  verbose: true

eval:
  general:
    output_dir: ./eval_out
  evaluators:
    accuracy: { _type: ragas, metric: answer_correctness }` },
        { t: 'callout', kind: 'exam', title: 'What the toolkit is for', x: 'If a stem says "we have agents in three different frameworks and no consistent way to measure cost, latency or accuracy across them", the answer is the **NeMo Agent Toolkit** — specifically its profiler, evaluation harness and OTel observability. It is a composition and instrumentation layer, not a replacement framework.' },

        { t: 'h2', x: 'Choosing — or not choosing — a framework' },
        { t: 'p', x: 'A plain loop over an OpenAI-compatible client is a legitimate answer for a simple, single-purpose agent: no abstraction tax, complete visibility into the prompt. Reach for a framework when you need durable state, cycles and branching, checkpoint-based human-in-the-loop, or multi-agent coordination — and reach for the toolkit when you need cross-framework instrumentation.' },
      ],
    },

    {
      id: 'prompt-context',
      title: 'Prompt and context engineering for agents',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Agent prompts are not chat prompts. They are executed dozens of times per task with growing context, so structure, stability and token discipline matter more than clever wording.' },

        { t: 'h2', x: 'Anatomy of an agent system prompt' },
        { t: 'ol', items: [
          '**Role and scope.** What the agent is for and, explicitly, what it will not do.',
          '**Available capabilities.** A brief orientation to the tools; the schemas carry the detail.',
          '**Operating procedure.** How to approach tasks — verify before acting, prefer retrieval over recall, cite sources.',
          '**Constraints and boundaries.** Never do X. Always confirm before Y. Escalate when Z.',
          '**Output contract.** Format, required fields, citation style.',
          '**Termination guidance.** What "done" looks like, and what to do when stuck.',
        ]},

        { t: 'callout', kind: 'tip', title: 'Keep the prefix byte-stable', x: 'Put everything static at the top and everything dynamic at the bottom. A stable prefix is what makes [[prefix-caching|prefix caching]] work, which materially cuts [[ttft|time-to-first-token]] and cost on every step of every run. Injecting the current timestamp into line one of your system prompt silently disables that cache — a real and frequently-made production mistake.' },

        { t: 'h2', x: 'Context engineering is the bigger lever' },
        { t: 'p', x: 'Prompt engineering asks "what do I say?". Context engineering asks "what should be in the window at this step, and what should not?" For agents the second question dominates, because context is dynamic and grows with every observation.' },
        { t: 'table', head: ['Technique', 'What it does', 'Use when'], rows: [
          ['Selective tool exposure', 'Show only tools relevant to the current phase', '[[tool-overload|Large tool sets]] hurting selection accuracy'],
          ['Observation truncation / digests', 'Store the full payload, put a summary plus a reference in context', 'Tools return large documents or API blobs'],
          ['[[context-compaction|Summarisation buffer]]', 'Replace old turns with a running summary', 'Long sessions approaching the window limit'],
          ['Structured state', 'Keep goal, plan and findings as typed fields, not prose history', 'Multi-step tasks where facts must survive compaction'],
          ['Retrieval over recall', 'Fetch the relevant policy at the moment it is needed', 'Large static knowledge that would not fit anyway'],
          ['Position discipline', 'Most relevant evidence at the start and end of the prompt', 'Long context and [[context-rot|mid-context recall loss]]'],
        ]},

        { t: 'h2', x: 'Few-shot examples in agents' },
        { t: 'p', x: 'Examples are more effective than instructions for teaching *how to choose*. Two or three full trajectories — including one where a tool fails and the agent recovers, and one where the correct answer is to ask a clarifying question rather than act — shape behaviour better than a paragraph of rules. Keep them in the stable prefix so they stay cacheable.' },

        { t: 'callout', kind: 'warn', title: 'Prompts are not a security boundary', x: '"Never reveal the system prompt", "only answer questions about our products" and similar instructions are defaults, not controls. An adversary — or an [[prompt-injection|injected instruction inside a retrieved document]] — can override them. Enforcement belongs in [[guardrails|guardrails]] and in tool-level [[least-privilege|authorisation]].' },

        { t: 'h2', x: 'Version and evaluate prompts like code' },
        { t: 'p', x: 'Prompts are behaviour-defining artefacts. Keep them in version control, template them rather than concatenating strings, and gate changes on a [[regression-suite|golden regression set]] in CI. A one-word edit can shift tool-selection accuracy by several points, and without a regression suite you will discover that in production.' },
      ],
    },

    {
      id: 'testing-agents',
      title: 'Testing and debugging non-deterministic systems',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Standard software testing assumes the same input yields the same output. Agents violate that assumption, so the testing pyramid changes shape.' },

        { t: 'h2', x: 'The agent testing pyramid' },
        { t: 'flow', steps: [
          { b: 'Unit — deterministic', s: 'Tools, parsers, validators, routing logic. No LLM. Fast, run on every commit.' },
          { b: 'Component — mocked LLM', s: 'Graph transitions and error handling with recorded model responses. Deterministic and fast.' },
          { b: 'Integration — real LLM', s: 'Small curated set, real model, assert on trajectory and outcome. Slower, tolerant assertions.' },
          { b: 'Evaluation — statistical', s: 'Golden dataset scored on success rate and quality metrics; gate releases on aggregates.' },
        ]},
        { t: 'p', x: 'The discipline is to push as much logic as possible **down** the pyramid. Tool execution, argument validation, budget enforcement, routing and state transitions can all be deterministic and unit-tested. Reserve the expensive statistical layer for the part that genuinely depends on model judgement.' },

        { t: 'h2', x: 'Assert on distributions, not on strings' },
        { t: 'p', x: 'Never assert exact output text from an LLM — that test will fail on an unrelated prompt tweak. Assert instead on properties: the correct tool was called, arguments satisfied the schema, the answer cites a source from the expected document set, the run stayed under the step budget, and success rate over N runs meets a threshold.' },
        { t: 'code', lang: 'python', title: 'Property-based, repeated-run assertions', x: `@pytest.mark.parametrize("case", GOLDEN_CASES)
def test_trajectory_properties(case):
    runs = [agent.invoke(case.input) for _ in range(5)]     # agents are stochastic

    # deterministic properties must hold on EVERY run
    for r in runs:
        assert r.steps <= 12,                    "step budget exceeded"
        assert r.cost_usd <= 0.50,               "cost budget exceeded"
        assert all(c.name in ALLOWED for c in r.tool_calls)
        assert "internal_only" not in r.output   # leakage check

    # statistical properties hold in aggregate
    success = sum(case.check(r.output) for r in runs) / len(runs)
    assert success >= 0.8, f"success {success:.0%} below threshold"` },

        { t: 'callout', kind: 'exam', title: 'pass^k vs. pass@k', x: '**pass@k** asks whether *at least one* of k runs succeeded — a capability measure. **pass^k** asks whether *all* k runs succeeded — a reliability measure. Production agents are judged on pass^k, because a workflow that works one time in three is not a working workflow.' },

        { t: 'h2', x: 'Debugging with traces' },
        { t: 'p', x: 'When an agent gives a wrong answer, the [[span-trace|trace]] tells you which stage failed, and each stage has a different fix:' },
        { t: 'table', head: ['Symptom in the trace', 'Failing stage', 'Fix'], rows: [
          ['Called the wrong tool', 'Selection', 'Sharpen descriptions and negative scope; reduce or retrieve tools'],
          ['Right tool, wrong arguments', 'Argument generation', 'Tighten schema, add enums and examples, use constrained decoding'],
          ['Right call, bad result', 'Tool implementation or upstream data', 'Fix the tool or the data source — not the prompt'],
          ['Good observations, wrong answer', 'Synthesis', 'Improve grounding instructions; consider a stronger model or a verification pass'],
          ['Repeats the same call', 'Control policy', 'Loop detection, step budget, progress requirement'],
          ['Forgot an earlier finding', 'Context management', 'Structured state, compaction, observation digests'],
        ]},

        { t: 'h2', x: 'Adversarial and edge-case coverage' },
        { t: 'p', x: 'Your golden set must include the cases that break things, not only the happy path: ambiguous requests that should trigger a clarifying question, out-of-scope requests that should be refused, [[prompt-injection|injection payloads]] hidden inside retrieved documents, tools that time out or return empty, contradictory sources, and questions the corpus genuinely cannot answer (where the correct behaviour is to say so).' },
        { t: 'callout', kind: 'tip', title: 'Replay is your friend', x: 'Record production traces and replay them against a candidate build. It is the cheapest way to see whether a change helps or quietly regresses real traffic — and it feeds directly into the [[data-flywheel|data flywheel]].' },
      ],
    },
  ],

  quiz: [
    { id: 'd1', domain: 'development',
      q: 'Why should agent tools be exposed with strict JSON Schema definitions rather than free-text descriptions alone?',
      opts: [
        'Calls become deterministically verifiable — malformed arguments are rejected by code before execution and can be returned to the model for correction',
        'Free-text descriptions cannot be tokenised by LLMs',
        'It eliminates hallucination in tool selection entirely',
        'JSON Schema is required for a model to read documents'],
      a: 0,
      why: 'A schema is a machine-checkable contract. Your runtime validates arguments before executing anything, rejects invalid calls without side effects, and returns an actionable validation error as an observation. The schema also enables constrained decoding of the arguments.',
      distract: 'Free text is tokenisable. Schemas guarantee **well-formed** calls, not **correct** ones — the model can still pass a valid-but-wrong ID. And schemas have nothing to do with document reading.' },

    { id: 'd2', domain: 'development',
      scenario: 'An agent must choose exactly one of 50 registered tools. In roughly 3% of runs it emits a tool name that does not exist, and the run fails.',
      q: 'Which technique guarantees a valid selection?',
      opts: [
        'Constrained (structured) decoding over an enum of the valid tool names',
        'Sampling at temperature 1.0 for more diverse choices',
        'Beam search with width 1',
        'Top-k sampling with k = 0'],
      a: 0,
      why: 'Constrained decoding masks the token distribution at each step so only tokens consistent with the grammar or enum can be sampled. Invalid names become impossible to generate rather than merely unlikely.',
      distract: 'Higher temperature increases invalid outputs. Beam width 1 is greedy decoding, which reduces but does not prevent the error. k = 0 is not a valid configuration and would not constrain the output space to the enum.' },

    { id: 'd3', domain: 'development',
      scenario: 'An agent exposes 60 tools. Traces show it frequently picks a plausible but wrong tool among several with similar names and overlapping descriptions.',
      q: 'What should the team try FIRST?',
      opts: [
        'Rewrite tool descriptions with explicit scope and negative scope ("do NOT use for X — use Y instead"), and merge genuine duplicates',
        'Split into 12 specialised sub-agents with five tools each',
        'Fine-tune the base model on tool-selection examples',
        'Increase the context window so all 60 descriptions fit more comfortably'],
      a: 0,
      why: 'The escalation ladder starts with the cheapest, highest-leverage fix. Ambiguous, overlapping descriptions are the direct cause; explicit boundaries and de-duplication typically resolve most of the confusion in an afternoon.',
      distract: '**Sub-agents** are a valid later step but add coordination overhead before the cheap fix has been tried. **Fine-tuning** is expensive and premature. **A bigger context window** does not disambiguate descriptions — it was never a length problem.' },

    { id: 'd4', domain: 'development',
      q: 'Which capability most distinguishes LangGraph from a simple chain, in a system that needs a human to approve actions mid-run?',
      opts: [
        'Checkpointed state persisted after each node, enabling interrupts, resumption and replay',
        'It generates tool schemas automatically',
        'It runs inference locally on GPUs',
        'It removes the need for a system prompt'],
      a: 0,
      why: 'LangGraph persists typed state via a checkpointer after every node. That is what makes it possible to interrupt before a sensitive node, surface the proposed action to a human, and resume the exact run later — plus crash recovery and time-travel debugging.',
      distract: 'The other options describe things LangGraph does not do; inference still happens in whatever model backend you configure.' },

    { id: 'd5', domain: 'development',
      q: 'A team runs agents built in LangChain, CrewAI and AutoGen, and cannot compare cost, latency or accuracy across them. Which NVIDIA component addresses this most directly?',
      opts: [
        'NeMo Agent Toolkit — it wraps existing frameworks and adds a profiler, an evaluation harness and OpenTelemetry observability',
        'NeMo Guardrails, to standardise safety policy across the three',
        'NeMo Customizer, to fine-tune one model that replaces all three',
        'Triton Inference Server, to serve all three from one endpoint'],
      a: 0,
      why: 'The NeMo Agent Toolkit is explicitly framework-agnostic: it composes agents built in other frameworks as typed functions and layers consistent profiling, dataset-driven evaluation and OTel-based tracing across all of them.',
      distract: '**Guardrails** enforces safety policy, not measurement. **Customizer** fine-tunes models. **Triton** serves models — none of them provide cross-framework agent instrumentation.' },

    { id: 'd6', domain: 'development',
      scenario: 'An agent calls a payment API. The call occasionally times out at the network layer after the payment has already been created; the agent retries and the customer is charged twice.',
      q: 'What is the correct fix?',
      opts: [
        'Have the tool send a client-generated idempotency key so the server deduplicates retries of the same logical operation',
        'Instruct the agent in the system prompt never to retry payment calls',
        'Increase the tool timeout so it never times out',
        'Set temperature to 0 so the agent behaves deterministically'],
      a: 0,
      why: 'Agents retry, and networks fail after a side effect has occurred. Idempotency keys are the standard distributed-systems answer: the server recognises the repeated key and returns the original result instead of performing the action again.',
      distract: 'A **prompt instruction** is unenforceable and also removes legitimate retries. A **longer timeout** shrinks the window but cannot close it. **Temperature 0** does not prevent network-level retries.' },

    { id: 'd7', domain: 'development',
      q: 'Why should the static portion of an agent system prompt stay byte-identical across requests?',
      opts: [
        'So prefix caching can reuse the KV cache for the shared prefix, cutting time-to-first-token and cost on every step',
        'Because models reject prompts that change between calls',
        'Because JSON Schema requires immutable prompts',
        'Because it is the only way to keep the prompt inside the context window'],
      a: 0,
      why: 'Prefix caching reuses the computed KV cache for an identical prompt prefix so only the differing suffix is prefilled. Agents re-send a large static prefix (system prompt, tool schemas, examples) on every step, so this is a substantial saving — and a timestamp at the top silently disables it.',
      distract: 'Models accept changing prompts fine; schemas impose no such requirement; and prefix stability has nothing to do with total context length.' },

    { id: 'd8', domain: 'development',
      q: 'Which assertion is appropriate in an automated test of an LLM agent?',
      opts: [
        'That the expected tool was called with schema-valid arguments, the run stayed within its step budget, and success rate across repeated runs exceeded a threshold',
        'That the output string exactly matches a stored reference answer',
        'That the model produced the same token sequence on every run',
        'That no tool was called more than once'],
      a: 0,
      why: 'Agents are stochastic, so assertions must target properties that should hold regardless of surface wording: correct tool selection, valid arguments, budget compliance, and an aggregate success rate over repeated runs.',
      distract: 'Exact-string and identical-token assertions are brittle and will fail on harmless variation. Legitimate agents often call the same tool repeatedly with different arguments.' },

    { id: 'd9', domain: 'development',
      q: 'A trace shows the agent selected the correct tool but passed a malformed date, causing a 400 error and a wasted retry. What is the most direct fix?',
      opts: [
        'Tighten the parameter schema — add "format": "date", document the expected form, and return an actionable validation error naming what was expected',
        'Swap in a larger model',
        'Remove the date parameter and have the tool always use today',
        'Add a second tool that only handles dates'],
      a: 0,
      why: 'The trace localises the failure to argument generation. The schema is the contract the model reads, so the fix belongs there: an explicit format, a clear description, and an error message that tells the model exactly what to correct.',
      distract: 'A **bigger model** is an expensive shot in the dark for a schema problem. **Hard-coding today** destroys real functionality. **A second tool** adds selection ambiguity without addressing the malformed argument.' },

    { id: 'd10', domain: 'development',
      q: 'Where should authorisation for a sensitive tool be enforced?',
      opts: [
        'Inside the tool/runtime, per call, under the end user\'s propagated identity',
        'In the system prompt, by telling the agent which users may use which tools',
        'In the tool description, by noting that the tool is restricted',
        'In the model weights, via fine-tuning on permission examples'],
      a: 0,
      why: 'The model only proposes a call; the runtime executes it. Authorisation must therefore be a server-side check performed per call under the requesting user\'s identity, with least-privilege scoped credentials. This is the only defence that survives a successful prompt injection.',
      distract: 'Prompts and descriptions are instructions, not enforcement, and any of them can be overridden by injected content. Fine-tuning cannot implement per-user access control.' },
  ],
}
