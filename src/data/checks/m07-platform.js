// End-of-lesson comprehension checks for Module 7: NVIDIA Platform Implementation. Keyed by lesson id.
export default {
  'stack-map': [
    {
      q: 'A team must serve a mix of model types from several frameworks behind one server, chain some of them into ensembles, and plug in a custom backend. Which component fits?',
      opts: ['NVIDIA NIM', 'Triton Inference Server', 'NeMo Agent Toolkit', 'NIM Operator'],
      a: 1,
      why: '**Triton** is the general multi-backend inference server you configure yourself; "mixed model types", "ensembles" and "custom backends" are its cues.',
      distract: '**NIM** is a packaged, model-specific microservice rather than a general server, and the toolkit and operator do not serve models at all.',
    },
    {
      q: 'A requirement says: "block off-topic requests and jailbreak attempts on live user traffic." A colleague proposes NeMo Evaluator. What is wrong with that choice?',
      opts: [
        'Nothing; Evaluator is the standard runtime policy layer',
        'Evaluator only works on models trained with Customizer',
        'Evaluator measures quality offline; Guardrails enforces policy at runtime',
        'Evaluator is a data curation tool, not a safety tool',
      ],
      a: 2,
      why: 'The lesson draws this boundary explicitly: **Evaluator** scores models offline, while **NeMo Guardrails** applies programmable Colang rails to live traffic.',
      distract: 'Evaluator is not tied to Customizer outputs, and data curation is Curator\'s job.',
    },
    {
      q: 'An agent currently calls a hosted model endpoint. The team moves to a self-hosted NIM. What change does the agent code usually need?',
      opts: [
        'A rewrite against the NIM-specific gRPC client',
        'Usually just a new base URL for the OpenAI-style API',
        'A port to NeMo Agent Toolkit before it can call NIM',
        'New prompts, because NIM models use a different chat format',
      ],
      a: 1,
      why: 'NIM exposes an **OpenAI-compatible REST API**, so switching between a hosted endpoint and self-hosted NIM is usually a base-URL change and the agent code stays as it is.',
      distract: 'No proprietary client or framework port is required; compatibility with the OpenAI API surface is the point of the design.',
    },
    {
      q: 'What is the relationship between TensorRT-LLM and NIM?',
      opts: [
        'They are competing servers; you pick one or the other',
        'TensorRT-LLM manages NIM deployments on Kubernetes',
        'NIM is the training library that produces TensorRT-LLM models',
        'TensorRT-LLM is the optimisation engine packaged inside NIM',
      ],
      a: 3,
      why: 'NIM bundles the model with a **TensorRT-LLM engine** selected for the detected GPU, which is where its batching, KV-cache and quantisation optimisations come from.',
      distract: 'Kubernetes lifecycle is the NIM Operator\'s job, and neither component is a training library.',
    },
    {
      q: 'A platform team must deploy and manage dozens of NIMs on Kubernetes, pre-cache model weights, and scale them declaratively. Which component is the answer?',
      opts: ['NVIDIA Dynamo', 'NeMo Data Store', 'NIM Operator', 'NVIDIA Blueprints'],
      a: 2,
      why: 'The **NIM Operator** provides Kubernetes lifecycle management for NIM and NeMo services, including model pre-caching and declarative scaling.',
      distract: '**Dynamo** handles distributed inference, **Data Store** holds artefacts, and **Blueprints** are reference apps rather than a lifecycle manager.',
    },
    {
      q: 'A RAG project struggles to parse complex PDFs and needs enterprise-grade embeddings plus a reranking step. Which NVIDIA offering is built for this?',
      opts: ['NeMo Retriever', 'NeMo Curator', 'NeMo Guardrails', 'NeMo Entity Store'],
      a: 0,
      why: '**NeMo Retriever** is the set of extraction, embedding and reranking microservices for RAG.',
      distract: '**Curator** prepares training data rather than serving retrieval, and **Guardrails** and **Entity Store** do not parse or embed documents.',
    },
    {
      q: 'A SaaS vendor wants to fine-tune a separate LoRA adapter for each tenant, repeatably, on its Kubernetes cluster. Which component performs the training?',
      opts: ['NeMo Curator', 'NeMo Evaluator', 'TensorRT-LLM', 'NeMo Customizer'],
      a: 3,
      why: '**NeMo Customizer** is the production fine-tuning service (LoRA, SFT, DPO, RFT). Its cues are "fine-tune repeatably on K8s" and "customise a model per tenant".',
      distract: 'The lesson\'s boundary: **Curator** prepares the data and **Customizer** trains on it. Evaluator scores results, and TensorRT-LLM optimises inference.',
    },
  ],

  'reference-arch': [
    {
      q: 'In the reference deployment the agent service is a stateless Kubernetes Deployment. Where does conversation and checkpoint state live?',
      opts: [
        'In the LLM NIM\'s KV cache between requests',
        'In a separate state store such as a Postgres checkpointer or Redis',
        'In memory on each agent pod, pinned by sticky sessions',
        'Inside the vector database next to the document embeddings',
      ],
      a: 1,
      why: 'The component map puts state in a dedicated **state store** (Postgres checkpointer or Redis sessions), which is what lets the agent service stay stateless and scale horizontally.',
      distract: 'The KV cache is a serving optimisation, not durable state. Pod memory breaks when pods scale or restart, and the vector DB holds retrieval data.',
    },
    {
      q: 'Which ordering matches the offline improvement loop in the reference architecture?',
      opts: [
        'Customizer, then Curator, then Evaluator, then full rollout',
        'Evaluator, then Customizer, then Curator, then canary',
        'Production traces, Curator, Customizer, Evaluator, then shadow, canary, full',
        'Production traces, Evaluator, Guardrails, then full rollout',
      ],
      a: 2,
      why: 'Traces are curated into data (**Curator**), used for LoRA fine-tuning (**Customizer**), scored (**Evaluator**), and only then promoted through **shadow, canary, full**.',
      distract: 'You cannot train before curating the data, and skipping evaluation or the staged rollout removes the promotion gate.',
    },
    {
      q: 'A team sized its GPUs from the model\'s weight footprint alone. The deployment runs out of memory at production concurrency with long agent trajectories. What did the plan miss?',
      opts: [
        'The KV cache, which can rival or exceed the weights',
        'The tokenizer vocabulary, which grows with traffic',
        'Guardrails models, which must share every GPU',
        'Vector index memory, which always lives on the LLM GPU',
      ],
      a: 0,
      why: 'The lesson\'s capacity tip: size for **weights plus KV cache** at target concurrency. With many concurrent long trajectories, the KV cache can match or exceed the weights.',
      distract: 'Vocabulary size is fixed, and nothing in the architecture requires Guardrails or the vector index to sit on the LLM GPU.',
    },
    {
      q: 'A model does not fit in one GPU\'s memory at the chosen precision. What makes tensor parallelism across several GPUs worthwhile?',
      opts: [
        'MIG partitioning on each GPU',
        'Fast NVLink interconnect between the GPUs',
        'A larger batch size to hide the split',
        'Running the KV cache on CPU memory instead',
      ],
      a: 1,
      why: 'Tensor parallelism exchanges data between GPUs constantly, so the lesson\'s second hardware question is whether you have **NVLink** to make it worthwhile.',
      distract: 'MIG splits one GPU into smaller pieces, which goes the wrong way for a model that is too large, and batch size does not fix a model that does not fit.',
    },
    {
      q: 'An "air-gapped" design pulls NIM containers into a private registry, caches models on a PVC and runs Milvus in-cluster. Which extra element breaks the requirement?',
      opts: [
        'A Postgres checkpointer running inside the cluster',
        'An OpenTelemetry collector exporting to an in-cluster Phoenix instance',
        'A read-only SQL replica used as a tool',
        'A tool that calls a public web translation API',
      ],
      a: 3,
      why: 'Air-gapped means **no external API calls anywhere in the agent\'s tool set**. One outbound tool call is enough to let data leave the environment.',
      distract: 'The other three all run inside the environment, so they are consistent with a sovereign deployment.',
    },
    {
      q: 'In an air-gapped cluster with no internet access, how do NIM models reach the GPUs?',
      opts: [
        'NIM downloads weights from NGC the first time a request arrives',
        'Models are baked into the agent service container image',
        'Containers are mirrored from NGC to a private registry and models cached on a PVC via the NIM Operator',
        'Weights stream from a hosted endpoint through an outbound proxy',
      ],
      a: 2,
      why: 'The lesson describes pulling NIM containers from NGC into a **private registry** and caching models on a **PVC** with the NIM Operator, so nothing is fetched at runtime.',
      distract: 'Runtime downloads and outbound proxies both need external connectivity, and the agent service does not host the model.',
    },
  ],
}
