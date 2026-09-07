/**
 * Glossary powering the hover / click term popups across every article.
 * `id`   — the key used inside lesson text as [[id|display text]]
 * `exam` — why the term matters for NCP-AAI specifically
 */
export const glossary = [
  /* ---------------- Agent patterns & cognition ---------------- */
  { id: 'agentic-ai', term: 'Agentic AI', cat: 'Agent patterns',
    def: 'AI systems that pursue a goal over multiple steps by deciding for themselves what to do next — choosing tools, calling them, observing results and re-planning — rather than producing a single response to a single prompt.',
    exam: 'The whole exam is framed around the difference between a "workflow" (a human wrote the control flow) and an "agent" (the model decides the control flow). Watch for questions that ask which one a scenario actually needs.' },

  { id: 'agency-spectrum', term: 'Agency spectrum', cat: 'Agent patterns',
    def: 'The continuum from a fixed chain (zero agency) → router (model picks a branch) → tool-calling loop → fully autonomous multi-agent system. More agency means more capability but also more latency, cost and failure modes.',
    exam: 'Right-answer heuristic: pick the LEAST agency that solves the problem. NVIDIA-style questions reward the cheapest, most deterministic design that meets the requirement.' },

  { id: 'react', term: 'ReAct (Reason + Act)', cat: 'Agent patterns',
    def: 'An agent loop that interleaves a reasoning trace ("Thought") with a tool invocation ("Action") and its result ("Observation"), repeating until the model emits a final answer. The plan is formed incrementally, one step at a time.',
    exam: 'The single most-tested pattern. Key phrase: "interleaves reasoning and acting in one loop"; adapts to surprises, but cannot parallelise and burns tokens on long tasks.' },

  { id: 'plan-execute', term: 'Plan-and-Execute', cat: 'Agent patterns',
    def: 'The agent first drafts a complete multi-step plan, then executes the steps (often with a cheaper model, and often in parallel), optionally re-planning if a step fails.',
    exam: 'Choose it when steps are independent (parallelisable), when you want a plan a human can approve, or when you need to cut LLM calls. Contrast with ReAct on "known upfront vs. discovered as you go".' },

  { id: 'rewoo', term: 'ReWOO', cat: 'Agent patterns',
    def: 'Reasoning WithOut Observation — a planner writes the full tool plan with variable placeholders up front, a worker executes all tool calls without re-invoking the LLM, and a solver composes the final answer. Typically 3 LLM calls regardless of tool count.',
    exam: 'The token-efficiency answer. NeMo Agent Toolkit ships a ReWOO agent; expect it as the correct option when a question stresses "reduce LLM token usage / cost on multi-tool tasks".' },

  { id: 'reflexion', term: 'Reflexion', cat: 'Agent patterns',
    def: 'After a failed attempt the agent writes a natural-language self-critique and stores it in episodic memory; that reflection is prepended to the next attempt so the agent does not repeat the mistake.',
    exam: 'The keyword pair is "verbal self-reflection" + "stored in memory across trials". Distinguish from self-consistency (voting) and Chain-of-Verification (fact-checking).' },

  { id: 'reflection', term: 'Reflection / critic loop', cat: 'Agent patterns',
    def: 'A generator produces an answer and a separate critic (a second prompt or a second agent) scores it against a rubric; the generator revises. Loops are bounded by a max-iteration or score threshold.',
    exam: 'Always ask for the stopping condition — unbounded reflection loops are a classic runaway-cost trap in scenario questions.' },

  { id: 'cot', term: 'Chain-of-Thought (CoT)', cat: 'Agent patterns',
    def: 'Prompting the model to emit intermediate reasoning steps before the answer. A single linear reasoning path.',
    exam: 'Cheapest reasoning aid. Compare against ToT (branching) and self-consistency (sampling + vote).' },

  { id: 'tot', term: 'Tree-of-Thoughts (ToT)', cat: 'Agent patterns',
    def: 'Explores several candidate reasoning branches at each step, scores intermediate states with a value function, and searches (BFS/DFS) for the best path. Allows backtracking.',
    exam: 'Correct only when the task benefits from exploring alternatives AND the model can score partial states. Wrong answer for low-latency lookups — it multiplies cost.' },

  { id: 'self-consistency', term: 'Self-consistency decoding', cat: 'Agent patterns',
    def: 'Sample N independent chains of thought at non-zero temperature and take the majority-vote answer, instead of one greedy decode.',
    exam: 'Improves accuracy on tasks with a single verifiable answer (maths, classification). Does NOT help open-ended generation, and costs N× tokens.' },

  { id: 'cove', term: 'Chain-of-Verification (CoVe)', cat: 'Agent patterns',
    def: 'The model drafts an answer, generates verification questions about its own claims, answers them independently, then revises the draft — a hallucination-reduction technique.',
    exam: 'Pick it when the question is specifically about factual accuracy of a produced answer, not about tool selection.' },

  { id: 'supervisor', term: 'Supervisor / hierarchical topology', cat: 'Agent patterns',
    def: 'A central orchestrator agent receives the task, routes sub-tasks to specialist worker agents, and aggregates their results. Workers do not talk to each other directly.',
    exam: 'The default multi-agent answer for "Researcher + Coder + Reviewer" style scenarios: clear accountability, easy tracing, one place to enforce policy. Downside: the supervisor is a bottleneck and a single point of failure.' },

  { id: 'swarm', term: 'Swarm / peer-to-peer handoff', cat: 'Agent patterns',
    def: 'Agents hand control directly to one another based on their own judgement, with no central supervisor. Shared state travels with the handoff.',
    exam: 'Recognise it as "peer-to-peer handoffs without a central coordinator". Lower latency, harder to trace and to bound.' },

  { id: 'blackboard', term: 'Blackboard pattern', cat: 'Agent patterns',
    def: 'Agents read from and write to a shared structured workspace instead of messaging each other; a controller decides who acts next based on the board state.',
    exam: 'The answer when a scenario needs many specialists contributing partial results to one evolving artefact.' },

  { id: 'debate', term: 'Multi-agent debate', cat: 'Agent patterns',
    def: 'Two or more agents argue opposing positions across rounds and a judge (or majority) picks the winner, improving reasoning quality on hard judgement calls.',
    exam: 'High cost, high latency. Correct only when accuracy on ambiguous reasoning outweighs cost.' },

  { id: 'router', term: 'Router / routing agent', cat: 'Agent patterns',
    def: 'A lightweight classifier (often a small model) that sends each request to the right downstream workflow, model or agent.',
    exam: 'Model-routing questions: route easy traffic to a small NIM, hard traffic to a large one. It is the standard cost/latency optimisation answer.' },

  { id: 'agent-loop', term: 'Agent loop (perceive → reason → act)', cat: 'Agent patterns',
    def: 'The control cycle of an agent: read state/observations, decide on an action with the LLM, execute a tool, feed the result back, repeat until a stop condition.',
    exam: 'Every agent design question decomposes into this loop plus a termination policy (max steps, budget, confidence, explicit finish tool).' },

  { id: 'termination', term: 'Termination / stop condition', cat: 'Agent patterns',
    def: 'The rule that ends an agent loop: a finish tool call, a max-iteration cap, a token/cost budget, a wall-clock timeout, or a confidence threshold.',
    exam: 'If a scenario mentions runaway loops, infinite tool calls or unbounded spend, the fix is an explicit termination policy plus a budget guard — not a bigger model.' },

  /* ---------------- Memory & context ---------------- */
  { id: 'short-term-memory', term: 'Short-term (working) memory', cat: 'Memory & context',
    def: 'The content inside the current context window: system prompt, recent turns, tool results and scratchpad. Volatile and bounded by the model context length.',
    exam: 'Contrast with long-term memory, which is external and survives the session.' },

  { id: 'long-term-memory', term: 'Long-term memory', cat: 'Memory & context',
    def: 'Persistent knowledge stored outside the context window — usually a vector store, key-value store or database — and retrieved on demand into the prompt.',
    exam: 'Sub-types: semantic (facts), episodic (past interactions/trajectories), procedural (learned how-to / skills).' },

  { id: 'episodic-memory', term: 'Episodic memory', cat: 'Memory & context',
    def: 'A record of specific past events or trajectories — "on 3 March this user asked X and the fix was Y" — retrieved to inform similar situations.',
    exam: 'The memory type Reflexion writes to, and the right answer for "learn from previous failed runs".' },

  { id: 'semantic-memory', term: 'Semantic memory', cat: 'Memory & context',
    def: 'Durable facts and preferences about the world or the user, stored independently of when they were learned ("user prefers metric units").',
    exam: 'Distinguish from episodic (event-anchored) and procedural (skills).' },

  { id: 'procedural-memory', term: 'Procedural memory', cat: 'Memory & context',
    def: 'Learned how-to knowledge — reusable skills, prompt patterns or tool sequences the agent has found effective and can replay.',
    exam: 'Appears in questions on agents that "improve at a repeated task over time" without retraining weights.' },

  { id: 'context-window', term: 'Context window', cat: 'Memory & context',
    def: 'The maximum number of tokens the model can attend to in one call, covering prompt plus generated output.',
    exam: 'Long-context is not free: attention cost, "lost in the middle" degradation and KV-cache memory all grow with it. Summarise or retrieve instead of stuffing.' },

  { id: 'context-rot', term: 'Context degradation / "lost in the middle"', cat: 'Memory & context',
    def: 'Empirically, models attend most strongly to the beginning and end of a long context; facts buried in the middle are recalled less reliably.',
    exam: 'Justifies reranking down to a handful of chunks and placing the most relevant evidence at the edges of the prompt.' },

  { id: 'context-compaction', term: 'Context compaction / summarisation buffer', cat: 'Memory & context',
    def: 'Periodically replacing older turns with an LLM-generated summary so the running conversation stays inside the window while retaining salient state.',
    exam: 'The standard answer for long-running agents that exceed the context window mid-session.' },

  { id: 'scratchpad', term: 'Scratchpad', cat: 'Memory & context',
    def: 'A working area in the prompt (or an external file) where the agent accumulates intermediate thoughts, observations and partial results within a run.',
    exam: 'A ReAct trajectory is effectively a scratchpad; offloading it to a file is a context-management technique.' },

  { id: 'state-checkpoint', term: 'Checkpointing / durable state', cat: 'Memory & context',
    def: 'Persisting the agent graph state after each node so a run can be resumed, replayed, time-travelled or paused for human approval.',
    exam: 'LangGraph checkpointers are the canonical implementation; required for human-in-the-loop interrupts and for crash recovery.' },

  /* ---------------- Tools & protocols ---------------- */
  { id: 'tool-calling', term: 'Tool calling / function calling', cat: 'Tools & protocols',
    def: 'The model emits a structured call — a tool name plus JSON arguments matching a declared schema — which the runtime executes, returning the result as a new observation.',
    exam: 'The model never runs code itself. It only proposes a call; your runtime validates and executes it. That separation is where authz and sandboxing belong.' },

  { id: 'json-schema', term: 'JSON Schema tool definition', cat: 'Tools & protocols',
    def: 'A machine-readable contract for a tool: name, description, typed parameters, required fields, enums and constraints.',
    exam: 'Strict typing makes calls deterministically validatable before execution and lets you reject malformed calls without burning a model turn. Descriptions are the main lever on tool-selection accuracy.' },

  { id: 'structured-output', term: 'Structured output', cat: 'Tools & protocols',
    def: 'Forcing model output to conform to a schema (JSON Schema, Pydantic model, regex or grammar) so downstream code can parse it reliably.',
    exam: 'Prefer constrained decoding over "please answer in JSON" plus a retry loop; retries add latency and still fail.' },

  { id: 'constrained-decoding', term: 'Constrained / structured decoding', cat: 'Tools & protocols',
    def: 'Masking the token distribution at each decoding step so only tokens valid under a grammar or schema can be sampled. Guarantees syntactically valid output.',
    exam: 'The correct answer for "guarantee the model picks exactly one of 50 tool names" or "output must always parse as valid JSON". Implemented in TensorRT-LLM / NIM via guided decoding backends such as XGrammar or Outlines.' },

  { id: 'mcp', term: 'Model Context Protocol (MCP)', cat: 'Tools & protocols',
    def: 'An open protocol standardising how LLM applications discover and call external tools, resources and prompts from MCP servers, so one integration works across clients.',
    exam: 'The stock answer for "standardise tool discovery/integration across many agents and vendors". Distinguish sharply from A2A (agent-to-agent).' },

  { id: 'a2a', term: 'Agent2Agent (A2A) protocol', cat: 'Tools & protocols',
    def: 'An open protocol for autonomous agents from different vendors to discover each other (via Agent Cards), negotiate capabilities and exchange tasks and artefacts.',
    exam: 'MCP connects an agent to tools; A2A connects agents to other agents. Questions frequently swap the two.' },

  { id: 'tool-sandbox', term: 'Tool sandboxing', cat: 'Tools & protocols',
    def: 'Executing agent-generated code or commands inside an isolated environment (container, microVM, restricted interpreter) with no ambient credentials, capped CPU/memory and no unrestricted network egress.',
    exam: 'The correct control for "agent generates and runs Python". Prompt instructions are never an adequate substitute for isolation.' },

  { id: 'idempotency', term: 'Idempotency in tools', cat: 'Tools & protocols',
    def: 'Designing side-effecting tools so that repeating the same call with the same idempotency key does not repeat the effect.',
    exam: 'Agents retry. Without idempotency keys, a retried "send payment" tool sends twice — a favourite scenario-question trap.' },

  { id: 'tool-overload', term: 'Tool-set overload', cat: 'Tools & protocols',
    def: 'Selection accuracy degrades as the number of tools presented in one prompt grows, because near-duplicate descriptions confuse the model.',
    exam: 'Fixes, in order: sharpen descriptions → group tools behind a namespace/toolkit → retrieve the top-k relevant tools per request → route to specialist sub-agents.' },

  /* ---------------- RAG & retrieval ---------------- */
  { id: 'rag', term: 'Retrieval-Augmented Generation (RAG)', cat: 'RAG & retrieval',
    def: 'Retrieving relevant passages from an external corpus at query time and putting them in the prompt so the model answers from grounded evidence instead of parametric memory.',
    exam: 'Default answer for volatile, private or citation-required knowledge. Fine-tuning is the answer for behaviour, format and domain style — not for fresh facts.' },

  { id: 'agentic-rag', term: 'Agentic RAG', cat: 'RAG & retrieval',
    def: 'RAG where an agent controls retrieval: it rewrites queries, chooses among multiple indexes or tools, judges whether retrieved context is sufficient, and retrieves again if not.',
    exam: 'The upgrade path when single-shot RAG returns weak context. Keywords: query rewriting, retrieval grading, iterative retrieval.' },

  { id: 'embedding', term: 'Embedding model', cat: 'RAG & retrieval',
    def: 'A model mapping text (or images) into dense vectors where semantic similarity corresponds to geometric proximity. NVIDIA ships them as NeMo Retriever embedding NIMs (e.g. llama-3.2-nv-embedqa).',
    exam: 'Asymmetric QA embedders use separate query and passage prefixes/encoders — mixing them up silently destroys recall.' },

  { id: 'vector-db', term: 'Vector database', cat: 'RAG & retrieval',
    def: 'A store that indexes embeddings for approximate nearest-neighbour search (HNSW, IVF-PQ). Examples: Milvus, pgvector, Elasticsearch, FAISS-backed stores.',
    exam: 'Know the recall/latency/memory trade-off knobs: HNSW efSearch and M, IVF nlist/nprobe, and quantisation.' },

  { id: 'ann', term: 'Approximate nearest neighbour (ANN)', cat: 'RAG & retrieval',
    def: 'Sub-linear vector search that trades a little recall for a large speed-up versus exhaustive (flat) search.',
    exam: 'If a scenario reports "search got fast but answers got worse", suspect ANN parameters dropped recall — raise nprobe/efSearch.' },

  { id: 'chunking', term: 'Chunking strategy', cat: 'RAG & retrieval',
    def: 'How documents are split before embedding: fixed size, recursive by separator, semantic (embedding-similarity boundaries), or structure-aware (headings, tables, code blocks).',
    exam: 'Too small loses context; too large dilutes the embedding and wastes prompt budget. Structure-aware chunking plus small overlap is the usual best answer.' },

  { id: 'hybrid-search', term: 'Hybrid search', cat: 'RAG & retrieval',
    def: 'Combining lexical/sparse retrieval (BM25, SPLADE) with dense vector retrieval, then fusing the ranked lists — commonly with Reciprocal Rank Fusion.',
    exam: 'The correct fix for rare entities, product codes, error codes and acronyms that dense embeddings miss. Very high-frequency exam item.' },

  { id: 'rrf', term: 'Reciprocal Rank Fusion (RRF)', cat: 'RAG & retrieval',
    def: 'A score-free way to merge ranked lists: each document scores Σ 1/(k + rank) across lists. Robust because it needs no score normalisation.',
    exam: 'The standard fusion answer in hybrid-search questions.' },

  { id: 'reranker', term: 'Reranker (cross-encoder)', cat: 'RAG & retrieval',
    def: 'A model that scores each (query, passage) pair jointly and reorders candidates. Far more accurate than bi-encoder similarity but too slow to scan the whole corpus, so it runs on the top-N from first-stage retrieval.',
    exam: 'Canonical pipeline: retrieve top-50 → rerank → keep top-3-5. NVIDIA ships nv-rerankqa NIMs. Reranking raises precision, not recall — it cannot recover a document retrieval never returned.' },

  { id: 'query-rewriting', term: 'Query rewriting / expansion', cat: 'RAG & retrieval',
    def: 'Rewriting the user question before retrieval — resolving pronouns from chat history, splitting multi-part questions, or generating several paraphrases (multi-query).',
    exam: 'Best fix for conversational follow-ups like "and what about the other one?" where the raw turn is not searchable on its own.' },

  { id: 'hyde', term: 'HyDE', cat: 'RAG & retrieval',
    def: 'Hypothetical Document Embeddings — the model writes a plausible answer, that answer is embedded, and the embedding is used as the search vector, closing the style gap between short questions and long documents.',
    exam: 'Alternative to query expansion when queries and documents differ sharply in form.' },

  { id: 'knowledge-graph', term: 'Knowledge graph / GraphRAG', cat: 'RAG & retrieval',
    def: 'Representing entities and their relations explicitly, then traversing the graph to gather connected evidence — optionally combined with vector search.',
    exam: 'The right answer for multi-hop questions ("which suppliers of parts in the recalled batch also ship to region X") that flat chunk retrieval cannot join.' },

  { id: 'grounding', term: 'Grounding & citation', cat: 'RAG & retrieval',
    def: 'Constraining the answer to retrieved evidence and attaching source references so claims can be verified.',
    exam: 'Grounding plus a "say I do not know when context is insufficient" instruction plus a groundedness check is the standard anti-hallucination stack.' },

  { id: 'multimodal-extraction', term: 'Multimodal document extraction', cat: 'RAG & retrieval',
    def: 'Parsing PDFs and slides into text, tables, charts and images — with OCR, layout detection and table structure recognition — before chunking. NVIDIA provides this as NeMo Retriever extraction (the nv-ingest pipeline).',
    exam: 'If a scenario complains that answers about tables/charts are wrong, the failure is at extraction, not at the LLM.' },

  { id: 'freshness', term: 'Index freshness / incremental ingest', cat: 'RAG & retrieval',
    def: 'Keeping the index current through incremental upserts, deletes/tombstones and re-embedding on model change, rather than nightly full rebuilds.',
    exam: 'Re-embedding the entire corpus is mandatory when you change the embedding model — vectors from two models are not comparable.' },

  /* ---------------- NVIDIA platform ---------------- */
  { id: 'nim', term: 'NVIDIA NIM', cat: 'NVIDIA stack',
    def: 'NVIDIA Inference Microservices — prebuilt, GPU-optimised model containers exposing an OpenAI-compatible REST API, with TensorRT-LLM engines auto-selected for the detected GPU. Deployable in your own VPC, data centre or air-gapped site.',
    exam: 'The answer whenever a scenario demands data sovereignty, predictable latency or on-prem/self-hosted inference with a drop-in OpenAI-compatible client.' },

  { id: 'nim-operator', term: 'NIM Operator', cat: 'NVIDIA stack',
    def: 'A Kubernetes operator that manages the lifecycle of NIM and NeMo microservices — caching models, deploying services, and handling scaling and upgrades declaratively via CRDs.',
    exam: 'Pick it for "deploy and manage NIMs on Kubernetes at scale" questions, including model pre-caching to cut cold starts.' },

  { id: 'nemo', term: 'NVIDIA NeMo', cat: 'NVIDIA stack',
    def: 'NVIDIA\'s end-to-end platform for building, customising, evaluating and guarding generative-AI models — delivered as a framework and as a set of production microservices.',
    exam: 'Know which microservice owns which job; questions are typically "which NeMo component would you use to …".' },

  { id: 'nemo-agent-toolkit', term: 'NeMo Agent Toolkit', cat: 'NVIDIA stack',
    def: 'NVIDIA\'s framework-agnostic toolkit (formerly AgentIQ) for composing agent workflows from reusable typed functions declared in YAML. Ships ReAct, ReWOO, tool-calling, reasoning and router agents, plus a profiler, an evaluation harness and OpenTelemetry-based observability.',
    exam: 'Its selling point is that it wraps existing frameworks (LangChain, LangGraph, CrewAI, AutoGen, Semantic Kernel, LlamaIndex) rather than replacing them, and adds profiling/eval/observability across them.' },

  { id: 'nemo-guardrails', term: 'NeMo Guardrails', cat: 'NVIDIA stack',
    def: 'A programmable guardrail layer that sits between the application and the LLM. Rails are defined in Colang and run at five points: input, dialog, retrieval, execution and output.',
    exam: 'Memorise the five rail types. Also know that guardrails are runtime policy enforcement — complementary to, not a replacement for, alignment training.' },

  { id: 'colang', term: 'Colang', cat: 'NVIDIA stack',
    def: 'The modelling language used by NeMo Guardrails to define user/bot canonical forms, flows and rail logic.',
    exam: 'If a question shows `define user ...` / `define flow ...` syntax, it is Colang and therefore NeMo Guardrails.' },

  { id: 'nemo-retriever', term: 'NeMo Retriever', cat: 'NVIDIA stack',
    def: 'A family of NIM microservices for the retrieval half of RAG: multimodal document extraction, embedding models and reranking models, tuned for enterprise accuracy and throughput.',
    exam: 'Map the three sub-capabilities — extraction, embedding, reranking — to pipeline stages.' },

  { id: 'nemo-customizer', term: 'NeMo Customizer', cat: 'NVIDIA stack',
    def: 'A microservice for fine-tuning LLMs — LoRA and full SFT, plus DPO and reinforcement-style methods — exposing a job API and producing deployable customised models.',
    exam: 'The "how do I fine-tune in production, on Kubernetes, repeatably" answer, as opposed to a research notebook.' },

  { id: 'nemo-evaluator', term: 'NeMo Evaluator', cat: 'NVIDIA stack',
    def: 'A microservice for evaluating models and RAG/agent pipelines using academic benchmarks, custom datasets and LLM-as-a-judge, returning comparable scored runs.',
    exam: 'The evaluation half of the data flywheel: it is what tells you whether the customised model actually beat the baseline.' },

  { id: 'nemo-datastore', term: 'NeMo Data Store & Entity Store', cat: 'NVIDIA stack',
    def: 'Data Store holds datasets, model artefacts and evaluation results (HuggingFace-compatible API); Entity Store manages the metadata entities — namespaces, models, datasets, evaluation targets and configs.',
    exam: 'Low-frequency but easy marks: Data Store = files/artefacts, Entity Store = metadata and registry.' },

  { id: 'nemo-curator', term: 'NeMo Curator', cat: 'NVIDIA stack',
    def: 'GPU-accelerated data curation: download, extract, clean, filter by quality, deduplicate (exact/fuzzy/semantic), PII-redact and blend datasets for pretraining or fine-tuning.',
    exam: 'The right component when a scenario is about preparing training data, especially deduplication and PII removal at scale.' },

  { id: 'data-flywheel', term: 'Data flywheel', cat: 'NVIDIA stack',
    def: 'A closed loop: capture production traffic and feedback → curate it into datasets → fine-tune or distil a smaller model → evaluate against the incumbent → promote if better → repeat. Typically drives cost down while holding accuracy.',
    exam: 'Recognise the NeMo mapping: Curator → Customizer → Evaluator → Guardrails → NIM deployment. Common answer to "cut inference cost without losing accuracy".' },

  { id: 'nemotron', term: 'Nemotron', cat: 'NVIDIA stack',
    def: 'NVIDIA\'s family of open models (Nano/Super/Ultra tiers) built for reasoning, tool calling and agentic workloads, with open weights and published training data recipes.',
    exam: 'The "open, self-hostable, tool-calling-capable model family" option; Nano targets edge/low-cost, Ultra targets maximum accuracy.' },

  { id: 'blueprint', term: 'NVIDIA Blueprint', cat: 'NVIDIA stack',
    def: 'A reference application — code, Helm charts and configuration — that wires NIM and NeMo microservices into a working solution (for example the enterprise RAG blueprint or the AI-Q research-assistant blueprint).',
    exam: 'Correct choice for "get to a working reference architecture fast, then customise" rather than building from scratch.' },

  { id: 'tensorrt-llm', term: 'TensorRT-LLM', cat: 'NVIDIA stack',
    def: 'NVIDIA\'s LLM inference optimisation library: kernel fusion, quantisation (FP8/INT4-AWQ), paged KV cache, in-flight (continuous) batching, speculative decoding and multi-GPU tensor/pipeline parallelism.',
    exam: 'The engine inside NIM. Cite it when a question asks how NIM achieves higher throughput than a naive HuggingFace server.' },

  { id: 'triton', term: 'Triton Inference Server', cat: 'NVIDIA stack',
    def: 'A general-purpose inference server supporting many backends, dynamic batching, concurrent model execution and model ensembles.',
    exam: 'Use it for mixed/custom model serving (embedders, rerankers, classical models). NIM is the packaged, model-specific path.' },

  { id: 'dynamo', term: 'NVIDIA Dynamo', cat: 'NVIDIA stack',
    def: 'A datacentre-scale distributed inference framework: disaggregated prefill and decode, KV-cache-aware routing, a distributed KV cache manager and dynamic GPU planning across nodes.',
    exam: 'The answer for multi-node LLM serving at scale, especially "separate prefill from decode" and "route to the worker that already holds the KV cache".' },

  { id: 'mig', term: 'Multi-Instance GPU (MIG)', cat: 'NVIDIA stack',
    def: 'Hardware partitioning of a GPU into isolated instances each with dedicated compute and memory slices.',
    exam: 'Choose MIG for hard isolation and predictable QoS between tenants; choose time-slicing/MPS for higher utilisation without strict isolation.' },

  { id: 'nvlink', term: 'NVLink / NVSwitch', cat: 'NVIDIA stack',
    def: 'High-bandwidth GPU-to-GPU interconnect, essential when a model is split across GPUs with tensor parallelism.',
    exam: 'Tensor parallelism is interconnect-bound; without NVLink, sharding a model across GPUs can be slower than not sharding it.' },

  /* ---------------- Serving & scaling ---------------- */
  { id: 'kv-cache', term: 'KV cache', cat: 'Deployment',
    def: 'Cached key/value attention tensors for tokens already processed, so each new token attends without recomputing the prefix. Its size grows with batch size × sequence length and dominates inference memory.',
    exam: 'Long agent trajectories blow up KV memory. Mitigations: paged attention, quantised KV, prefix caching, trimming context.' },

  { id: 'prefix-caching', term: 'Prefix caching', cat: 'Deployment',
    def: 'Reusing the KV cache for a shared prompt prefix (system prompt, tool schemas, few-shot examples) across requests, so only the differing suffix is prefilled.',
    exam: 'Big time-to-first-token win for agents with large static system prompts. Requires the prefix to be byte-identical and stable — do not put a timestamp at the top of your system prompt.' },

  { id: 'continuous-batching', term: 'In-flight / continuous batching', cat: 'Deployment',
    def: 'Scheduling that adds and evicts sequences from the running batch at each decoding step instead of waiting for the whole batch to finish, keeping the GPU saturated under variable output lengths.',
    exam: 'The main throughput mechanism in TensorRT-LLM/NIM. Contrast with static batching, which stalls on the longest sequence.' },

  { id: 'prefill-decode', term: 'Prefill vs. decode', cat: 'Deployment',
    def: 'Prefill processes the whole prompt in parallel and is compute-bound (drives time-to-first-token); decode generates one token at a time and is memory-bandwidth-bound (drives inter-token latency).',
    exam: 'Explains why long prompts hurt TTFT while long outputs hurt total latency, and why disaggregating the two phases (Dynamo) helps at scale.' },

  { id: 'ttft', term: 'TTFT / ITL / throughput', cat: 'Deployment',
    def: 'Time-To-First-Token measures responsiveness; Inter-Token Latency measures streaming smoothness; throughput (tokens/sec or requests/sec) measures capacity. Batch size trades latency against throughput.',
    exam: 'Know which knob moves which metric — a question will give you an SLO and ask for the right change.' },

  { id: 'speculative-decoding', term: 'Speculative decoding', cat: 'Deployment',
    def: 'A small draft model proposes several tokens which the large model verifies in one pass; accepted tokens are kept. Output distribution is preserved.',
    exam: 'Reduces latency without changing quality — the correct answer for "speed up generation without degrading output".' },

  { id: 'quantization', term: 'Quantisation (FP8 / INT8 / INT4-AWQ)', cat: 'Deployment',
    def: 'Representing weights and/or activations in lower precision to cut memory and raise throughput, with a small and measurable accuracy cost.',
    exam: 'Always pair a quantisation answer with "re-run the evaluation suite to quantify the accuracy delta".' },

  { id: 'autoscaling', term: 'Autoscaling GPU inference', cat: 'Deployment',
    def: 'Scaling replicas on inference-specific signals — queue depth, batch occupancy, TTFT — rather than CPU utilisation, which is a poor proxy on GPUs.',
    exam: 'Standard wrong answer: "scale on CPU %". Standard right answer: KEDA/HPA on queue depth or a latency SLO, with warm pools and pre-cached models to hide cold starts.' },

  { id: 'cold-start', term: 'Cold start', cat: 'Deployment',
    def: 'The delay before a new replica serves traffic: pulling a multi-gigabyte image, loading weights to GPU memory and building/loading the engine.',
    exam: 'Mitigations: model caching (NIM Operator NIMCache), pre-pulled images, a minimum replica floor, and scale-up thresholds set ahead of saturation.' },

  { id: 'canary', term: 'Canary / blue-green / shadow deployment', cat: 'Deployment',
    def: 'Release strategies: canary sends a small traffic slice to the new version; blue-green swaps whole environments; shadow mirrors real traffic to the new version without serving its responses.',
    exam: 'Shadow is the answer for "validate a new model on real traffic with zero user risk".' },

  { id: 'circuit-breaker', term: 'Circuit breaker & bulkhead', cat: 'Deployment',
    def: 'Resilience patterns: a circuit breaker stops calling a failing dependency after a threshold and fails fast; a bulkhead isolates resource pools so one bad dependency cannot exhaust the whole system.',
    exam: 'Correct answer when one flaky tool degrades the entire agent — plus timeouts, bounded retries with exponential backoff and jitter, and a graceful fallback.' },

  { id: 'statelessness', term: 'Stateless agent services', cat: 'Deployment',
    def: 'Keeping agent processes stateless by externalising session state to Redis/a database, so any replica can serve any request and horizontal scaling is trivial.',
    exam: 'Standard fix for "conversation breaks when the load balancer routes to another pod" — beats sticky sessions.' },

  /* ---------------- Evaluation & tuning ---------------- */
  { id: 'llm-as-judge', term: 'LLM-as-a-judge', cat: 'Evaluation',
    def: 'Using a strong LLM with an explicit rubric to score outputs that have no single ground-truth answer.',
    exam: 'Known biases: position, verbosity and self-preference. Mitigate by randomising option order, using pairwise comparison, calibrating against human labels and pinning the judge model version.' },

  { id: 'ragas', term: 'RAG metrics (faithfulness, relevancy, context precision/recall)', cat: 'Evaluation',
    def: 'Faithfulness = is the answer supported by the retrieved context; answer relevancy = does it address the question; context precision = are retrieved chunks relevant and well ranked; context recall = did retrieval fetch everything needed.',
    exam: 'Diagnosis rule: low context recall → retrieval problem (chunking, embeddings, top-k, hybrid). High recall but low faithfulness → generation problem (prompt, grounding, model).' },

  { id: 'retrieval-metrics', term: 'Recall@k, MRR, nDCG', cat: 'Evaluation',
    def: 'Recall@k = fraction of relevant documents present in the top k; MRR = 1/rank of the first relevant hit; nDCG = graded relevance discounted by position.',
    exam: 'Evaluate the retriever separately from the generator. Tune first-stage retrieval for recall@k, reranking for nDCG/MRR.' },

  { id: 'trajectory-eval', term: 'Trajectory evaluation', cat: 'Evaluation',
    def: 'Scoring the agent\'s path, not just its final answer: correct tool selection, correct arguments, step efficiency, redundant calls and recovery behaviour.',
    exam: 'The distinguishing feature of agent evaluation. "Right answer via the wrong path" still fails a trajectory check and is fragile in production.' },

  { id: 'task-success', term: 'Task success rate / pass^k', cat: 'Evaluation',
    def: 'End-to-end fraction of runs achieving the goal. pass^k (all of k runs succeed) measures reliability under the non-determinism agents actually exhibit.',
    exam: 'Agents are stochastic; a single passing run proves nothing. Report success over repeated runs.' },

  { id: 'regression-suite', term: 'Golden dataset / regression suite', cat: 'Evaluation',
    def: 'A curated, versioned set of representative and adversarial cases with expected outcomes, run in CI on every prompt, model or tool change.',
    exam: 'The answer for "how do you stop prompt tweaks silently breaking things".' },

  { id: 'ab-test', term: 'Online A/B testing & offline eval', cat: 'Evaluation',
    def: 'Offline eval on fixed datasets is fast, cheap and repeatable; online A/B on live traffic measures real user outcomes but is slower and riskier.',
    exam: 'Correct sequence: offline gate → shadow → canary/A-B → full rollout.' },

  { id: 'sft', term: 'Supervised fine-tuning (SFT)', cat: 'Model & training',
    def: 'Training on curated prompt/response pairs to teach format, tone, domain style or reliable tool-call syntax.',
    exam: 'Teaches behaviour and form. It is the wrong tool for injecting volatile facts — that is RAG.' },

  { id: 'lora', term: 'LoRA / PEFT', cat: 'Model & training',
    def: 'Low-Rank Adaptation freezes base weights and trains small rank-decomposition matrices, cutting trainable parameters by orders of magnitude and letting many adapters share one base model in memory.',
    exam: 'Right answer for "many customer-specific variants, limited GPU budget". NIM can serve multiple LoRA adapters over a single base deployment.' },

  { id: 'dpo', term: 'DPO / RLHF', cat: 'Model & training',
    def: 'Preference optimisation from chosen/rejected response pairs. DPO optimises preferences directly without training a separate reward model; RLHF trains a reward model and optimises with PPO.',
    exam: 'Use preference tuning to align style and judgement calls where no single correct string exists.' },

  { id: 'rft', term: 'Reinforcement fine-tuning (RFT)', cat: 'Model & training',
    def: 'Fine-tuning against a programmatic reward or verifier (tests pass, schema valid, tool call correct) rather than reference outputs.',
    exam: 'Fits agentic tasks where success is checkable by code — valid tool calls, passing unit tests, correct final state.' },

  { id: 'distillation', term: 'Knowledge distillation', cat: 'Model & training',
    def: 'Training a small student model on a large teacher\'s outputs so it approaches teacher quality on a narrow task at a fraction of the cost.',
    exam: 'The classic cost-reduction move inside a data flywheel: distil the 70B\'s production traces into an 8B and verify with Evaluator.' },

  { id: 'catastrophic-forgetting', term: 'Catastrophic forgetting', cat: 'Model & training',
    def: 'Fine-tuning on a narrow dataset degrades unrelated capabilities the base model previously had.',
    exam: 'Mitigations: PEFT/LoRA instead of full fine-tuning, mixing in general data, and always evaluating on a broad held-out suite, not only the new task.' },

  /* ---------------- Observability & operations ---------------- */
  { id: 'observability', term: 'Agent observability', cat: 'Operations',
    def: 'Traces, metrics and logs covering every LLM call, tool call, retrieval and handoff — with token counts, latency, cost and errors attributed per step and per run.',
    exam: 'Non-negotiable for agents: without per-step traces you cannot tell whether a failure came from planning, tool choice, tool execution or generation.' },

  { id: 'otel', term: 'OpenTelemetry (OTel)', cat: 'Operations',
    def: 'The vendor-neutral standard for traces, metrics and logs. Agent frameworks (including NeMo Agent Toolkit) emit OTel spans consumable by Phoenix, Weave, Langfuse, Datadog and others.',
    exam: 'The correct answer for "instrument once, send anywhere" and for avoiding lock-in to one tracing vendor.' },

  { id: 'span-trace', term: 'Trace / span', cat: 'Operations',
    def: 'A trace is one end-to-end run; spans are its nested units of work (plan, tool call, retrieval, generation) carrying timing and attributes.',
    exam: 'Correlate spans with a run/session id so a user complaint maps to an exact trajectory.' },

  { id: 'drift', term: 'Drift (data / model / behaviour)', cat: 'Operations',
    def: 'Live inputs, the corpus or a model provider version change over time so yesterday\'s validated behaviour no longer holds.',
    exam: 'Detect with continuous eval on a fixed golden set plus monitoring of production distributions; pin model versions so upgrades are explicit.' },

  { id: 'guard-metrics', term: 'Agent SLIs', cat: 'Operations',
    def: 'The signals to alert on: task success rate, tool error rate, average steps per task, escalation/handoff rate, groundedness score, p95 latency, cost per resolved task, guardrail trigger rate.',
    exam: 'Cost per successfully resolved task is the business metric these questions usually want, not tokens per call.' },

  { id: 'fallback', term: 'Graceful degradation & fallback', cat: 'Operations',
    def: 'Serving reduced but useful behaviour when a dependency fails — cached results, a smaller model, a narrower answer, or an explicit handoff to a human.',
    exam: 'Better than either a hard error or a hallucinated answer; pair with a user-visible statement of the limitation.' },

  /* ---------------- Safety, governance, humans ---------------- */
  { id: 'guardrails', term: 'Guardrails', cat: 'Safety',
    def: 'Programmable runtime controls on what may enter and leave an LLM system: topic restrictions, jailbreak detection, PII redaction, toxicity filtering, groundedness checks and restrictions on which tools may run.',
    exam: 'Learn the five NeMo Guardrails rail types — input, dialog, retrieval, execution, output — and be able to place a given requirement on the right one.' },

  { id: 'prompt-injection', term: 'Prompt injection', cat: 'Safety',
    def: 'Malicious instructions embedded in content the model reads — a retrieved document, a web page, an email, a tool response — that hijack the agent\'s behaviour. "Indirect" injection means the payload arrives via data rather than from the user.',
    exam: 'The top agent security risk. Defences layer up: treat all tool/retrieval output as untrusted data, enforce least-privilege tool scopes, require human approval for high-impact actions, apply output rails, and never rely on prompt wording alone.' },

  { id: 'least-privilege', term: 'Least privilege & scoped credentials', cat: 'Safety',
    def: 'Each tool gets only the permissions it needs, credentials are short-lived, and authorisation is enforced by the tool/runtime under the end user\'s identity — never by asking the model to behave.',
    exam: 'Recurring right answer: enforce authorisation outside the model, propagate the user\'s identity, and check permissions server-side per call.' },

  { id: 'confused-deputy', term: 'Confused deputy / excessive agency', cat: 'Safety',
    def: 'An agent holding broad privileges is tricked into using them on an attacker\'s behalf, because permission is attached to the agent instead of the requesting user.',
    exam: 'Fix by scoping tokens per user and per action and by requiring approval for irreversible operations.' },

  { id: 'pii', term: 'PII handling & data minimisation', cat: 'Safety',
    def: 'Detecting and redacting or tokenising personal data before it reaches a model or a log, and retaining only what is necessary for as long as necessary.',
    exam: 'Where a scenario mentions GDPR/HIPAA plus a third-party API, the answer is usually redact at the boundary and/or self-host with NIM so data never leaves the trust boundary.' },

  { id: 'audit-trail', term: 'Audit trail', cat: 'Safety',
    def: 'Immutable, tamper-evident records of what the agent decided and did: inputs, retrieved sources, tool calls with arguments, approvals, outputs, model and prompt versions, timestamps and identities.',
    exam: 'Regulated-industry questions want reconstructable decisions. Ordinary application logs are not an audit trail.' },

  { id: 'eu-ai-act', term: 'AI regulation & risk tiers', cat: 'Safety',
    def: 'Frameworks such as the EU AI Act classify systems by risk and impose obligations — transparency, human oversight, logging, documentation and conformity assessment — on high-risk uses like credit, hiring and healthcare.',
    exam: 'You are not tested on legal detail, but on the engineering consequence: disclosure, oversight, logging and documentation for high-impact decisions.' },

  { id: 'nist-rmf', term: 'NIST AI Risk Management Framework', cat: 'Safety',
    def: 'A voluntary framework organised around four functions — Govern, Map, Measure, Manage — for identifying and reducing AI risk across a system lifecycle.',
    exam: 'Recognise the four function names; that is usually the depth required.' },

  { id: 'model-card', term: 'Model card / system card', cat: 'Safety',
    def: 'Structured documentation of a model or system: intended use, out-of-scope use, training data provenance, evaluation results, limitations and risks.',
    exam: 'The governance-artefact answer for transparency and procurement questions.' },

  { id: 'hitl', term: 'Human-in-the-loop (HITL)', cat: 'Human oversight',
    def: 'A human must approve or edit an action before it executes. Implemented as an interrupt: the agent pauses, persists state, surfaces the proposed action with context, and resumes on approval.',
    exam: 'Required for irreversible, high-cost or regulated actions. Distinguish from human-on-the-loop (monitoring, able to intervene) and human-in-command (overall authority).' },

  { id: 'escalation', term: 'Escalation policy', cat: 'Human oversight',
    def: 'Explicit rules for when the agent must hand off to a human: low confidence, repeated failure, out-of-scope request, high transaction value, user distress or an explicit user request.',
    exam: 'A good answer names concrete triggers and preserves full context in the handoff, so the human does not restart from zero.' },

  { id: 'automation-bias', term: 'Automation bias', cat: 'Human oversight',
    def: 'People over-trust automated output and stop checking it, so a rubber-stamp approval step provides no real oversight.',
    exam: 'Counter by surfacing uncertainty and evidence, showing the reasoning and sources, and making approval an active decision rather than a default.' },

  { id: 'calibration', term: 'Confidence & uncertainty surfacing', cat: 'Human oversight',
    def: 'Communicating how sure the system is — via verbalised confidence, retrieval scores, self-consistency agreement or abstention — so a human knows when to look closer.',
    exam: 'Pairs with escalation thresholds: low confidence should route to a human, not to a confident-sounding guess.' },

  { id: 'transparency', term: 'Disclosure & explainability', cat: 'Human oversight',
    def: 'Telling users they are interacting with an AI system, and showing the evidence and steps behind a recommendation.',
    exam: 'Frequently the correct option in ethics questions, alongside a documented appeal or override path.' },
]

export const glossaryById = Object.fromEntries(glossary.map((g) => [g.id, g]))
export const glossaryCats = [...new Set(glossary.map((g) => g.cat))]
