export default {
  id: 'deployment',
  n: 4,
  domain: 'deployment',
  weight: 13,
  title: 'Deployment and Scaling',
  blurb: 'Serving LLMs on GPUs without wasting them: prefill vs. decode, batching, KV cache, autoscaling on the right signals, and the resilience patterns that keep an agent alive when a tool goes down.',
  hours: '3–4 h',
  lessons: [
    {
      id: 'inference-serving',
      title: 'How LLM inference actually consumes a GPU',
      minutes: 14,
      blocks: [
        { t: 'lede', x: 'Every scaling answer in this domain follows from one fact: LLM inference has two phases with completely different bottlenecks. Get that straight and the rest is arithmetic.' },

        { t: 'h2', x: 'Prefill and decode' },
        { t: 'vs', cards: [
          { h: 'Prefill — compute-bound', items: ['Processes the entire prompt in parallel', 'Saturates GPU compute (high FLOPs)', 'Determines [[ttft|time-to-first-token]]', 'Cost scales with prompt length', 'Long agent transcripts hurt here'] },
          { h: 'Decode — memory-bandwidth-bound', items: ['One token at a time, each attending to all prior tokens', 'Limited by memory bandwidth, not FLOPs', 'Determines inter-token latency', 'Cost scales with output length', 'GPU compute sits largely idle'] },
        ]},
        { t: 'p', x: 'Because [[prefill-decode|the two phases stress different resources]], mixing them on the same GPU means one is always starving the other. That is the reasoning behind **disaggregated serving** in [[dynamo|NVIDIA Dynamo]]: run prefill on one pool of GPUs and decode on another, sized independently, with the [[kv-cache|KV cache]] transferred between them.' },

        { t: 'h2', x: 'The KV cache is your real memory budget' },
        { t: 'p', x: 'The [[kv-cache|KV cache]] stores the attention keys and values for every token already processed, so each new token does not recompute the prefix. Its size grows with **batch size × sequence length × layers × hidden size**, and in practice it — not the weights — is what limits how many concurrent requests a GPU can hold.' },
        { t: 'p', x: 'This is why agents are expensive to serve: a forty-step trajectory is a very long sequence, and its KV cache is resident for the whole run. Mitigations you should be able to name: paged attention (allocate in blocks, eliminating fragmentation), KV quantisation (FP8), [[prefix-caching|prefix caching]] for shared prompts, and simply keeping the context shorter through compaction.' },

        { t: 'h2', x: 'Batching' },
        { t: 'p', x: 'Static batching waits for a full batch and then stalls on the longest sequence, so short requests are held hostage. [[continuous-batching|In-flight (continuous) batching]] adds and evicts sequences at every decoding step: as soon as one sequence finishes, a queued one takes its slot. On mixed workloads this is a multi-fold throughput improvement, and it is the default in [[tensorrt-llm|TensorRT-LLM]] and therefore in [[nim|NIM]].' },
        { t: 'callout', kind: 'exam', title: 'Batch size is the latency/throughput dial', x: 'Larger batches raise tokens-per-second across all users and raise per-request latency. Smaller batches do the reverse. If a question gives you a strict p95 latency SLO and asks how to hit it, the answer involves capping batch size (and adding replicas), not raising it.' },

        { t: 'h2', x: 'The optimisations NIM gives you for free' },
        { t: 'table', head: ['Technique', 'Effect', 'Trade-off'], rows: [
          ['[[continuous-batching|In-flight batching]]', 'Large throughput gain on mixed lengths', 'None meaningful'],
          ['Paged KV cache', 'Higher concurrency; no memory fragmentation', 'Minor bookkeeping overhead'],
          ['[[prefix-caching|Prefix caching]]', 'Big TTFT and cost win for shared prompts', 'Requires a byte-identical prefix'],
          ['[[quantization|FP8 / INT4-AWQ quantisation]]', 'Less memory, more throughput', 'Small measurable accuracy cost — re-evaluate'],
          ['[[speculative-decoding|Speculative decoding]]', 'Lower latency at identical output quality', 'Needs a draft model; gain depends on acceptance rate'],
          ['Tensor parallelism', 'Fits models larger than one GPU', '[[nvlink|Interconnect-bound]] — needs NVLink to pay off'],
        ]},
        { t: 'callout', kind: 'warn', title: 'Quantisation is never free', x: 'Any answer that adopts quantisation without re-running the evaluation suite is incomplete. FP8 is usually near-lossless; INT4 can cost real accuracy on reasoning and tool-calling tasks. Measure on **your** golden set, not on a published benchmark.' },

        { t: 'h2', x: 'Self-hosted NIM vs. a hosted API' },
        { t: 'p', x: '[[nim|NIM]] packages a model with a pre-built TensorRT-LLM engine behind an OpenAI-compatible REST API, deployable in your own VPC, data centre or an air-gapped environment. Choose it when data residency, predictable latency, cost at sustained volume, version pinning or air-gapped operation matter. Choose a hosted API for spiky low volume, zero operational burden, or immediate access to the newest frontier model.' },
        { t: 'p', x: 'The OpenAI-compatible surface is a deliberate design point: migrating between the two is usually a base-URL change, so you can prototype against a hosted endpoint and move to self-hosted NIM without rewriting the agent.' },
      ],
    },

    {
      id: 'scaling-k8s',
      title: 'Scaling agents on Kubernetes',
      minutes: 13,
      blocks: [
        { t: 'lede', x: 'Agent systems scale as two separate tiers with completely different characteristics. Conflating them is the mistake most scaling questions are built around.' },

        { t: 'h2', x: 'Two tiers, two scaling laws' },
        { t: 'vs', cards: [
          { h: 'Agent orchestration tier', items: ['CPU-bound and mostly I/O-waiting', 'Cheap to replicate; scale horizontally without thinking', 'Must be [[statelessness|stateless]] — externalise session state', 'Scale on request rate and concurrency'] },
          { h: 'Model inference tier', items: ['GPU-bound and expensive', 'Slow to start — image pull plus weight load', 'Scale on queue depth or latency, never CPU%', 'Usually the actual bottleneck'] },
        ]},

        { t: 'callout', kind: 'exam', title: 'Never autoscale GPU inference on CPU utilisation', x: 'CPU% is a meaningless proxy on a GPU server — it can sit at 20% while the GPU is saturated and requests queue. [[autoscaling|Scale on inference-native signals]]: pending-request queue depth, batch occupancy, or a [[ttft|TTFT]]/p95-latency SLO, typically via KEDA or a custom-metrics HPA.' },

        { t: 'h2', x: 'Cold starts' },
        { t: 'p', x: 'A new inference replica must pull a multi-gigabyte image, load weights into GPU memory and load or build the engine — often minutes. If you only start scaling when you are already saturated, the new pod arrives long after the spike. The mitigations:' },
        { t: 'ul', items: [
          '**Pre-cache models.** The [[nim-operator|NIM Operator]] provides a NIMCache resource that stages model artefacts on a PVC so pods skip the download.',
          '**Keep a warm floor.** A minimum replica count above zero; scale-to-zero is wrong for latency-sensitive services.',
          '**Scale early.** Trigger at ~60–70% capacity, not at 95%, so the replica is ready before you need it.',
          '**Pre-pull images** onto nodes, and use node pools with the GPU drivers already in place.',
        ]},

        { t: 'h2', x: 'GPU sharing' },
        { t: 'table', head: ['Mechanism', 'Isolation', 'Use when'], rows: [
          ['[[mig|MIG]]', 'Hardware-level: dedicated compute and memory slices', 'Multi-tenant with hard QoS guarantees, or packing several small models onto one large GPU'],
          ['Time-slicing', 'None — processes contend', 'Dev/test, or bursty low-priority work where utilisation matters more than predictability'],
          ['MPS', 'Partial — concurrent kernels, shared memory', 'Cooperative workloads from a trusted source'],
          ['Dedicated GPU', 'Total', 'Latency-critical production inference'],
        ]},

        { t: 'h2', x: 'What actually runs where' },
        { t: 'code', lang: 'yaml', title: 'Scaling the two tiers differently', x: `# Orchestration tier — stateless, CPU, scales on concurrency
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: agent-orchestrator }
spec:
  scaleTargetRef: { kind: Deployment, name: agent-orchestrator }
  minReplicas: 3
  maxReplicas: 60
  metrics:
    - type: Pods
      pods:
        metric: { name: inflight_requests }
        target: { type: AverageValue, averageValue: "20" }
---
# Inference tier — GPU, scales on QUEUE DEPTH (not CPU), with a warm floor
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: { name: llm-nim }
spec:
  scaleTargetRef: { name: llm-nim }
  minReplicaCount: 2          # warm floor absorbs cold starts
  maxReplicaCount: 12
  cooldownPeriod: 300         # slow scale-down: GPUs are expensive to restart
  triggers:
    - type: prometheus
      metadata:
        query: sum(nim_num_requests_waiting)
        threshold: "8"` },

        { t: 'h2', x: 'Cost control that does not degrade quality' },
        { t: 'ol', items: [
          '**[[router|Route by difficulty]].** A small classifier sends easy traffic to an 8B NIM and hard traffic to a 70B. Usually the single largest saving available.',
          '**Cache aggressively.** Exact-match and semantic response caches for repeated questions; [[prefix-caching|prefix caching]] for the shared system prompt.',
          '**Shrink the loop.** Fewer, better tools and tighter termination policies mean fewer LLM calls per task.',
          '**[[distillation|Distil]].** Fine-tune a small model on the large model\'s production traces — the [[data-flywheel|data flywheel]].',
          '**Batch what can wait.** Offline and asynchronous work runs at high batch sizes on cheaper capacity.',
        ]},
        { t: 'callout', kind: 'tip', title: 'Measure the right unit', x: 'Optimising cost per token can be actively misleading: a cheaper model that fails more often and needs more steps costs more per resolved task. **Cost per successfully completed task** is the metric these questions want.' },
      ],
    },

    {
      id: 'resilience',
      title: 'Resilience: keeping agents alive when things break',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'An agent depends on a model service, several tools, a vector store and a state store. Its availability is the product of all of them unless you design for failure explicitly.' },

        { t: 'h2', x: 'The four patterns' },
        { t: 'specs', rows: [
          ['Timeouts', 'Every external call gets one, and it must be shorter than the caller\'s budget. A tool with no timeout can hang an entire agent run indefinitely.'],
          ['Bounded retries', 'Exponential backoff **with jitter**, capped attempts, and only for genuinely transient errors. Never retry a 4xx — the arguments were wrong and will be wrong again.'],
          ['[[circuit-breaker|Circuit breakers]]', 'After N consecutive failures, stop calling the dependency and fail fast for a cool-down window. Prevents a slow dependency from consuming every worker.'],
          ['[[circuit-breaker|Bulkheads]]', 'Separate connection/thread pools per dependency, so one saturated tool cannot exhaust the resources the rest of the system needs.'],
        ]},
        { t: 'callout', kind: 'warn', title: 'Retries and agents interact badly', x: 'The agent may retry at the reasoning level while your HTTP client retries at the transport level, multiplying load on an already-struggling dependency — a retry storm. Pick one layer to own retries, make side-effecting tools [[idempotency|idempotent]], and always add jitter.' },

        { t: 'h2', x: 'Degrade gracefully' },
        { t: 'p', x: 'When a dependency is down, [[fallback|graceful degradation]] beats both a hard error and a confidently hallucinated answer. In descending order of preference: serve a cached result with its age disclosed; fall back to a smaller or alternative model; answer a narrower version of the question and say what is missing; queue the request for asynchronous completion; hand off to a human with full context. The one unacceptable behaviour is answering as if nothing were wrong.' },

        { t: 'h2', x: 'State and durability' },
        { t: 'p', x: 'Long-running agents must survive pod restarts. Externalise session state to Redis or Postgres so the service tier stays [[statelessness|stateless]] and any replica can serve any request — this is strictly better than sticky sessions, which break on scale-down. [[state-checkpoint|Checkpoint]] after each significant step so a crashed run resumes rather than restarting, and give every run a durable id so a user complaint can be traced to an exact trajectory.' },

        { t: 'h2', x: 'Multi-region and provider failover' },
        { t: 'p', x: 'For high-availability requirements: deploy inference in at least two regions with health-check-based routing; keep a secondary model provider configured behind the same OpenAI-compatible interface (one reason to prefer that interface); and replicate the vector index rather than treating it as a single point of failure. Then actually test the failover — untested failover is a hypothesis, not a control.' },
        { t: 'callout', kind: 'exam', title: 'The complete resilience answer', x: 'A strong answer names four things together: a **timeout**, a **bounded retry with backoff and jitter**, a **circuit breaker**, and a **defined fallback behaviour**. Options that mention only retries are incomplete — unbounded retries against a failing dependency make an outage worse.' },
      ],
    },
  ],

  quiz: [
    { id: 'p1', domain: 'deployment',
      scenario: 'A GPU-backed NIM deployment on Kubernetes is autoscaled by an HPA on CPU utilisation. Under load, request latency climbs badly but the HPA never scales up.',
      q: 'What is wrong?',
      opts: [
        'CPU utilisation is a poor proxy for GPU inference load — scale on queue depth, batch occupancy or a latency SLO instead',
        'The HPA needs a longer stabilisation window',
        'The pods need more CPU limits assigned',
        'HPAs cannot scale GPU workloads at all'],
      a: 0,
      why: 'On a GPU inference server the CPU is mostly waiting on the GPU, so CPU% can sit low while the GPU saturates and requests queue. Autoscaling must use inference-native signals: pending requests, batch occupancy or p95 latency, typically through KEDA or a custom-metrics HPA.',
      distract: 'Tuning the stabilisation window or CPU limits does not change the fact that the chosen metric does not reflect GPU load. HPAs can scale GPU workloads given the right metric.' },

    { id: 'p2', domain: 'deployment',
      q: 'Which phase of LLM inference is compute-bound and determines time-to-first-token?',
      opts: ['Prefill', 'Decode', 'Tokenisation', 'Detokenisation'],
      a: 0,
      why: 'Prefill processes the whole prompt in parallel, saturating GPU compute, and finishes just as the first output token is produced — so it sets TTFT. Decode then generates one token at a time and is memory-bandwidth-bound, setting inter-token latency.',
      distract: 'Tokenisation and detokenisation are negligible CPU-side string operations.' },

    { id: 'p3', domain: 'deployment',
      scenario: 'An agent sends a 4,000-token system prompt containing tool schemas and few-shot examples on every one of its ~15 steps per task. TTFT is the dominant latency complaint.',
      q: 'Which optimisation helps most?',
      opts: [
        'Prefix caching, so the identical prompt prefix reuses its KV cache instead of being prefilled every step',
        'Increasing the maximum batch size',
        'Switching from FP16 to INT4 weights',
        'Adding more agent orchestrator replicas'],
      a: 0,
      why: 'The same 4,000-token prefix is being prefilled fifteen times per task. Prefix caching reuses the computed KV cache for that shared prefix so only the new suffix is processed — a direct and large TTFT reduction. It requires the prefix to be byte-identical, so nothing dynamic may sit at the top.',
      distract: '**Larger batches** raise throughput but worsen per-request latency. **INT4** helps memory and decode throughput but costs accuracy and does not eliminate repeated prefill. **More orchestrator replicas** do not touch the GPU bottleneck.' },

    { id: 'p4', domain: 'deployment',
      q: 'Which set of measures best mitigates cold starts for GPU inference pods?',
      opts: [
        'Pre-cache model artefacts on a PVC, keep a non-zero minimum replica count, and trigger scale-up well before saturation',
        'Enable scale-to-zero to save cost between spikes',
        'Increase the readiness probe timeout so the pod is marked ready sooner',
        'Move the model into the container image and disable caching'],
      a: 0,
      why: 'Cold start is dominated by pulling the image and loading weights into GPU memory. Pre-caching artefacts (the NIM Operator NIMCache pattern), keeping a warm floor of replicas, and scaling early so the new pod is ready ahead of demand are the standard mitigations.',
      distract: '**Scale-to-zero** maximises cold starts. A longer readiness timeout does not make loading faster and risks routing traffic to a pod that is not ready. Baking a huge model into the image makes the pull slower, not faster.' },

    { id: 'p5', domain: 'deployment',
      q: 'A single flaky third-party tool is causing agent workers to hang, and its slowness is now degrading unrelated requests. What is the most complete fix?',
      opts: [
        'Add a timeout, bounded retries with exponential backoff and jitter, a circuit breaker, and a defined fallback behaviour',
        'Increase the number of agent worker replicas',
        'Retry the tool until it succeeds',
        'Remove the tool from the agent permanently'],
      a: 0,
      why: 'Resilience needs the full set: a timeout stops the hang, bounded retries with jitter handle transient failures without a retry storm, a circuit breaker stops calling a dependency that is clearly down, and a defined fallback keeps the agent useful. Bulkheading the connection pool prevents the spillover to unrelated requests.',
      distract: '**More replicas** just gives the flaky dependency more workers to hang. **Unbounded retries** worsen the outage. **Removing the tool** discards the capability rather than containing the failure.' },

    { id: 'p6', domain: 'deployment',
      q: 'Which technique reduces generation latency while provably preserving output quality?',
      opts: [
        'Speculative decoding with a small draft model verified by the target model',
        'INT4 weight quantisation',
        'Reducing the maximum output token limit',
        'Lowering the sampling temperature'],
      a: 0,
      why: 'A small draft model proposes several tokens which the large model verifies in a single forward pass; rejected tokens are discarded. The accepted output follows the target model\'s distribution, so quality is preserved while wall-clock latency drops.',
      distract: '**INT4** trades measurable accuracy for speed. **Truncating output** changes the answer. **Temperature** changes the sampling distribution and therefore the output.' },

    { id: 'p7', domain: 'deployment',
      scenario: 'The agent service runs 12 replicas behind a round-robin load balancer. Users report that their conversation intermittently "resets" and the agent forgets what was just said.',
      q: 'What is the root cause and fix?',
      opts: [
        'Session state is held in pod memory — externalise it to Redis or Postgres so any replica can serve any request',
        'Enable sticky sessions on the load balancer permanently',
        'Reduce to a single replica',
        'Increase the context window of the model'],
      a: 0,
      why: 'In-memory state makes replicas non-interchangeable. Externalising session state to a shared store keeps the service tier stateless, so horizontal scaling, rolling deploys and pod restarts all work without losing conversations.',
      distract: '**Sticky sessions** still lose state when a pod is replaced or scaled down. **One replica** destroys availability. The **context window** is unrelated to where state is stored.' },

    { id: 'p8', domain: 'deployment',
      q: 'Which GPU-sharing mechanism gives hard isolation with predictable QoS between tenants?',
      opts: ['Multi-Instance GPU (MIG)', 'Time-slicing', 'MPS', 'CUDA streams'],
      a: 0,
      why: 'MIG partitions the GPU at hardware level into instances with dedicated compute units and dedicated memory, so one tenant cannot affect another\'s performance. That is precisely the multi-tenant QoS requirement.',
      distract: '**Time-slicing** provides no isolation — processes contend. **MPS** shares memory and offers only partial isolation. **CUDA streams** are an intra-process concurrency construct, not a tenancy mechanism.' },

    { id: 'p9', domain: 'deployment',
      q: 'A team wants to cut inference cost on a high-volume agent without hurting accuracy on hard requests. Which is the strongest first move?',
      opts: [
        'Route by difficulty — a small classifier sends easy traffic to a small NIM and escalates hard traffic to the large model',
        'Quantise everything to INT4',
        'Reduce max output tokens across the board',
        'Cut the retrieval top-k to 1'],
      a: 0,
      why: 'Most production traffic is easy. A cheap router captures the large majority of the cost saving while preserving large-model quality exactly where it is needed, and it is measurable and reversible per class of traffic.',
      distract: '**Blanket INT4** costs accuracy on precisely the hard requests. **Truncating outputs** and **top-k = 1** degrade quality across the board rather than targeting the cheap traffic.' },

    { id: 'p10', domain: 'deployment',
      q: 'What problem does disaggregated prefill/decode serving (as in NVIDIA Dynamo) solve?',
      opts: [
        'Prefill is compute-bound and decode is memory-bandwidth-bound, so running them on separately-sized GPU pools lets each be provisioned and scaled for its own bottleneck',
        'It removes the need for a KV cache',
        'It lets a model run without GPUs',
        'It guarantees structured JSON output'],
      a: 0,
      why: 'Mixing the two phases on the same GPUs means one always underutilises the resource the other needs. Disaggregation runs them on independent pools, with KV cache transferred between them and KV-aware routing sending requests to workers that already hold the relevant cache.',
      distract: 'Disaggregation depends on the KV cache rather than removing it, does not eliminate GPUs, and has nothing to do with output formatting.' },
  ],
}
