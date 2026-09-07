export default {
  id: 'platform',
  n: 7,
  domain: 'platform',
  weight: 7,
  title: 'NVIDIA Platform Implementation',
  blurb: 'The NVIDIA stack as an exam subject: what NIM, each NeMo microservice, the Agent Toolkit, Blueprints, Dynamo and Triton are for — and which one is the right answer to a given requirement.',
  hours: '2–3 h',
  lessons: [
    {
      id: 'stack-map',
      title: 'The NVIDIA agentic stack, mapped',
      minutes: 13,
      blocks: [
        { t: 'lede', x: 'This domain is mostly recall with a design flavour: "which component would you use to…". Learn the one-line job of each piece and the boundaries between them.' },

        { t: 'h2', x: 'The layers' },
        { t: 'flow', steps: [
          { b: 'Applications', s: '[[blueprint|Blueprints]] — reference apps (enterprise RAG, AI-Q research assistant).' },
          { b: 'Agent layer', s: '[[nemo-agent-toolkit|NeMo Agent Toolkit]] + LangGraph / CrewAI / LlamaIndex.' },
          { b: 'Model services', s: '[[nim|NIM]] for LLM, embedding, reranking, speech, vision.' },
          { b: 'Model lifecycle', s: '[[nemo|NeMo]] microservices — Curator, Customizer, Evaluator, Guardrails, Retriever, Data Store, Entity Store.' },
          { b: 'Serving runtime', s: '[[tensorrt-llm|TensorRT-LLM]], [[triton|Triton]], [[dynamo|Dynamo]].' },
          { b: 'Infrastructure', s: 'Kubernetes + [[nim-operator|NIM Operator]], GPU Operator, [[mig|MIG]], [[nvlink|NVLink]].' },
        ]},

        { t: 'h2', x: 'One line each — the table to memorise' },
        { t: 'table', head: ['Component', 'Its one job', 'Answer it when the stem says…'], rows: [
          ['[[nim|NIM]]', 'Prebuilt GPU-optimised model container with an OpenAI-compatible API', '"self-host", "data must not leave our VPC", "air-gapped", "predictable latency"'],
          ['[[nim-operator|NIM Operator]]', 'Kubernetes lifecycle management for NIM/NeMo services', '"deploy and manage many NIMs on K8s", "pre-cache models", "declarative scaling"'],
          ['[[nemo-retriever|NeMo Retriever]]', 'Extraction, embedding and reranking microservices for RAG', '"parse complex PDFs", "enterprise-grade embeddings", "reranking"'],
          ['[[nemo-guardrails|NeMo Guardrails]]', 'Programmable runtime safety rails in Colang', '"block off-topic", "prevent jailbreaks", "enforce policy at runtime"'],
          ['[[nemo-customizer|NeMo Customizer]]', 'Production fine-tuning: LoRA, SFT, DPO, RFT', '"fine-tune repeatably on K8s", "customise a model per tenant"'],
          ['[[nemo-evaluator|NeMo Evaluator]]', 'Benchmarks, custom evals and LLM-as-a-judge', '"did the new model beat the old one", "run benchmarks"'],
          ['[[nemo-curator|NeMo Curator]]', 'GPU-accelerated data curation, dedup and PII redaction', '"prepare training data", "deduplicate", "strip PII at scale"'],
          ['[[nemo-datastore|Data / Entity Store]]', 'Artefact storage; entity and metadata registry', '"where do datasets, results and model metadata live"'],
          ['[[nemo-agent-toolkit|NeMo Agent Toolkit]]', 'Framework-agnostic agent composition, profiling, eval, OTel', '"agents in several frameworks", "profile token and latency cost", "unified observability"'],
          ['[[tensorrt-llm|TensorRT-LLM]]', 'Inference optimisation library (the engine inside NIM)', '"why is NIM faster", "quantisation", "in-flight batching"'],
          ['[[triton|Triton]]', 'Multi-backend inference server', '"serve mixed model types", "ensembles", "custom backends"'],
          ['[[dynamo|Dynamo]]', 'Datacentre-scale distributed inference', '"multi-node serving", "disaggregate prefill and decode", "KV-aware routing"'],
          ['[[nemotron|Nemotron]]', 'Open model family tuned for reasoning and tool use', '"open weights", "self-hostable", "agentic-capable model"'],
          ['[[blueprint|Blueprints]]', 'Reference architectures with code and Helm charts', '"get to a working reference implementation quickly"'],
        ]},

        { t: 'callout', kind: 'trap', title: 'Boundaries that get confused', x: [
          '**NIM vs. Triton** — NIM is a packaged, model-specific microservice with an OpenAI-compatible API; Triton is a general multi-backend server you configure yourself.',
          '**Customizer vs. Curator** — Curator prepares the data, Customizer trains on it.',
          '**Evaluator vs. Guardrails** — Evaluator measures quality offline; Guardrails enforces policy at runtime on live traffic.',
          '**Agent Toolkit vs. LangGraph** — the toolkit composes and instruments agents built in frameworks like LangGraph; it does not replace them.',
        ]},

        { t: 'h2', x: 'Why NIM is fast' },
        { t: 'p', x: 'NIM bundles the model with a [[tensorrt-llm|TensorRT-LLM]] engine selected for the detected GPU, and inherits its optimisations: [[continuous-batching|in-flight batching]], paged KV cache, [[quantization|FP8/INT4 quantisation]], [[prefix-caching|prefix caching]], [[speculative-decoding|speculative decoding]] and tensor parallelism. A question asking why NIM outperforms a naive HuggingFace `pipeline()` server wants those mechanisms named, not "because it is optimised".' },
        { t: 'p', x: 'The other design point worth remembering: the OpenAI-compatible REST surface means moving between a hosted endpoint and self-hosted NIM is usually a base-URL change, so agent code does not need rewriting.' },
      ],
    },
    {
      id: 'reference-arch',
      title: 'Putting the stack together',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'The exam favours end-to-end architectures. Here is the shape a strong answer takes for a self-hosted enterprise agent.' },

        { t: 'h2', x: 'A reference agentic RAG deployment' },
        { t: 'code', lang: 'text', title: 'Component map', x: `Client
  |
  v
Agent service (stateless, K8s Deployment, HPA on in-flight requests)
  |-- NeMo Agent Toolkit workflow  (ReAct / ReWOO / router; profiler + OTel spans)
  |-- NeMo Guardrails              (input, dialog, retrieval, execution, output rails)
  |
  |--> LLM NIM            (llama-3.3-70b / Nemotron)   KEDA on queue depth, warm floor 2
  |--> Embedding NIM      (llama-3.2-nv-embedqa)       NeMo Retriever
  |--> Reranking NIM      (nv-rerankqa)                NeMo Retriever
  |--> Vector DB          (Milvus, GPU-accelerated index)
  |--> Tools              (MCP servers, internal APIs, SQL read-replica)
  |
  |--> State store        (Postgres checkpointer / Redis sessions)
  \\--> Observability      (OTel collector -> Phoenix / Langfuse / Datadog)

Offline loop:  production traces -> NeMo Curator -> NeMo Customizer (LoRA)
               -> NeMo Evaluator -> promote via shadow -> canary -> full` },

        { t: 'h2', x: 'Choosing hardware sensibly' },
        { t: 'p', x: 'The three questions that decide GPU selection: does the model fit in one GPU\'s memory at your chosen precision (weights plus [[kv-cache|KV cache]] for your target concurrency)? If not, do you have [[nvlink|NVLink]] to make tensor parallelism worthwhile? And are you serving many small models — in which case [[mig|MIG]] partitioning packs them onto fewer GPUs with hard isolation?' },
        { t: 'callout', kind: 'tip', title: 'Size for the KV cache, not just the weights', x: 'A common planning error is provisioning for weights alone. At production concurrency with long agent trajectories, the KV cache can rival or exceed the weight footprint. Capacity planning must include it.' },

        { t: 'h2', x: 'Air-gapped and sovereign deployments' },
        { t: 'p', x: 'When data absolutely cannot leave the environment, the entire stack must be self-hosted: NIM containers pulled from NGC into a private registry, models cached on a PVC via the [[nim-operator|NIM Operator]], a self-hosted vector database, and no external API calls anywhere in the agent\'s tool set. This is one of NIM\'s primary reasons to exist, and it is a recurring scenario framing in regulated-industry questions.' },
      ],
    },
  ],

  quiz: [
    { id: 'n1', domain: 'platform',
      q: 'Which protocol standardises how an agent discovers and calls external tools across different implementations?',
      opts: ['Model Context Protocol (MCP)', 'OpenAPI 2.0', 'gRPC', 'Server-Sent Events'],
      a: 0,
      why: 'MCP is an open protocol for connecting LLM applications to tools, resources and prompts through a standard interface, so a tool integration written once works across compliant clients. NeMo Agent Toolkit can both consume MCP servers and expose its functions as one.',
      distract: '**OpenAPI** describes REST APIs generally but defines no agent tool-discovery semantics. **gRPC** and **SSE** are transports, not tool-integration protocols.' },

    { id: 'n2', domain: 'platform',
      scenario: 'A bank must run an agentic assistant entirely inside its own data centre. No customer data may reach a third-party API, and inference latency must be predictable.',
      q: 'Which deployment approach fits?',
      opts: [
        'Self-hosted NVIDIA NIM containers exposing an OpenAI-compatible API inside the bank\'s own infrastructure',
        'A hosted frontier-model API with a signed data-processing agreement',
        'A hosted API with PII redaction applied before every request',
        'Fine-tuning a hosted model on bank data so it no longer needs data at inference'],
      a: 0,
      why: 'NIM packages GPU-optimised models as containers you run in your own VPC, data centre or air-gapped environment, with a drop-in OpenAI-compatible API. That satisfies both the data-residency requirement and predictable self-managed latency.',
      distract: 'A **contract** does not stop data leaving the boundary. **Redaction** reduces but does not eliminate exposure and degrades context. **Fine-tuning** does not remove the need to send the query itself.' },

    { id: 'n3', domain: 'platform',
      q: 'Which NeMo microservice would you use to determine whether a newly fine-tuned model outperforms the model currently in production?',
      opts: ['NeMo Evaluator', 'NeMo Curator', 'NeMo Guardrails', 'NeMo Data Store'],
      a: 0,
      why: 'Evaluator runs academic benchmarks, custom dataset evaluations and LLM-as-a-judge configurations against models and pipelines, producing comparable scored runs — the promotion gate in the data flywheel.',
      distract: '**Curator** prepares data, **Guardrails** enforces runtime policy, and **Data Store** holds datasets, artefacts and results without comparing them.' },

    { id: 'n4', domain: 'platform',
      q: 'What is the primary role of the NeMo Agent Toolkit?',
      opts: [
        'A framework-agnostic layer that composes agents built in other frameworks and adds profiling, evaluation and OpenTelemetry observability',
        'A replacement for LangChain and LangGraph',
        'A GPU inference server for large language models',
        'A vector database optimised for RAG'],
      a: 0,
      why: 'The toolkit treats tools, agents and workflows as typed composable functions and wraps existing frameworks — LangChain, LangGraph, CrewAI, AutoGen, Semantic Kernel — adding a profiler, an evaluation harness and OTel-based tracing across all of them.',
      distract: 'It composes rather than replaces those frameworks, and it is neither an inference server nor a vector store.' },

    { id: 'n5', domain: 'platform',
      q: 'Which NVIDIA technology directly enables disaggregated prefill and decode with KV-cache-aware routing across nodes?',
      opts: ['NVIDIA Dynamo', 'Triton Inference Server', 'NeMo Curator', 'NIM Operator'],
      a: 0,
      why: 'Dynamo is the datacentre-scale distributed inference framework: it separates the compute-bound prefill phase from the bandwidth-bound decode phase onto independently-sized GPU pools, manages a distributed KV cache, and routes requests to workers that already hold the relevant cache.',
      distract: '**Triton** serves models on a node with multiple backends. **Curator** handles data. **NIM Operator** manages Kubernetes lifecycle, not inference-phase disaggregation.' },

    { id: 'n6', domain: 'platform',
      q: 'Which mechanisms explain why NIM delivers higher throughput than a naive HuggingFace inference server?',
      opts: [
        'TensorRT-LLM optimisations — in-flight batching, paged KV cache, quantisation, prefix caching and speculative decoding',
        'It runs the model on CPU to free the GPU for other work',
        'It compresses network responses more efficiently',
        'It reduces the model\'s parameter count automatically'],
      a: 0,
      why: 'NIM ships a prebuilt TensorRT-LLM engine matched to the detected GPU, inheriting continuous batching, paged attention, low-precision execution, prefix cache reuse and speculative decoding — the mechanisms that keep the GPU saturated.',
      distract: 'NIM is GPU-based, network compression is negligible against inference cost, and it does not silently reduce parameters (quantisation lowers precision, not parameter count).' },

    { id: 'n7', domain: 'platform',
      q: 'Which component prepares training data by deduplicating and stripping PII at scale before fine-tuning?',
      opts: ['NeMo Curator', 'NeMo Customizer', 'NeMo Retriever', 'NeMo Evaluator'],
      a: 0,
      why: 'Curator performs GPU-accelerated data curation: download, extract, clean, quality-filter, exact/fuzzy/semantic deduplication, PII redaction and dataset blending — the stage before any training runs.',
      distract: '**Customizer** performs the fine-tuning itself, **Retriever** serves RAG extraction/embedding/reranking, and **Evaluator** scores models.' },

    { id: 'n8', domain: 'platform',
      q: 'A team needs to run several small models on one large GPU with hard performance isolation between tenants. What should they use?',
      opts: ['MIG partitioning', 'Time-slicing', 'A larger batch size', 'Tensor parallelism'],
      a: 0,
      why: 'Multi-Instance GPU splits a GPU at hardware level into instances with dedicated compute and memory, so tenants cannot affect each other\'s performance — exactly the hard-isolation requirement.',
      distract: '**Time-slicing** gives no isolation. **Batch size** is a throughput dial. **Tensor parallelism** splits one model across several GPUs, which is the opposite direction.' },
  ],
}
