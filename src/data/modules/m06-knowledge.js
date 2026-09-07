export default {
  id: 'knowledge',
  n: 6,
  domain: 'knowledge',
  weight: 10,
  title: 'Knowledge Integration and Data Handling',
  blurb: 'Production RAG end to end: extraction, chunking, embeddings, hybrid retrieval, reranking, agentic retrieval loops, graph knowledge, and keeping an index correct over time.',
  hours: '3–4 h',
  lessons: [
    {
      id: 'rag-pipeline',
      title: 'The production RAG pipeline stage by stage',
      minutes: 15,
      blocks: [
        { t: 'lede', x: 'Almost every "the model hallucinated" complaint is really a retrieval failure. Knowing which pipeline stage causes which symptom is what this domain tests.' },

        { t: 'flow', steps: [
          { b: '1 · Extract', s: 'PDF/HTML → text, tables, charts, images. OCR, layout and table structure.' },
          { b: '2 · Chunk', s: 'Split with structure awareness; attach metadata.' },
          { b: '3 · Embed', s: 'Chunks → vectors with an asymmetric QA embedder.' },
          { b: '4 · Index', s: 'ANN index plus a lexical index for hybrid.' },
          { b: '5 · Retrieve', s: 'Rewrite query, hybrid search, fuse, filter by metadata.' },
          { b: '6 · Rerank', s: 'Cross-encoder reorders top-N down to top-3-5.' },
          { b: '7 · Generate', s: 'Grounded answer with citations, or an explicit "not in the sources".' },
        ]},

        { t: 'h2', x: '1 · Extraction is where most quality is lost' },
        { t: 'p', x: 'If a PDF table becomes a run-on line of numbers, no embedding model or LLM can recover the relationship between a row and its header. [[multimodal-extraction|Multimodal extraction]] — layout detection, table structure recognition, chart understanding and OCR — is a distinct engineering stage, and NVIDIA ships it as [[nemo-retriever|NeMo Retriever]] extraction (the nv-ingest pipeline).' },
        { t: 'callout', kind: 'exam', title: 'Symptom → stage', x: 'If a scenario says "answers about figures in tables and charts are wrong while text answers are fine", the failure is at **extraction**, not at the LLM and not at the embedding model. Swapping the generator will not help.' },

        { t: 'h2', x: '2 · Chunking' },
        { t: 'p', x: 'Chunk boundaries determine what can ever be retrieved together. [[chunking|Structure-aware chunking]] — respecting headings, sections, table boundaries and code blocks — beats fixed-size splitting in nearly every real corpus. Add a small overlap (roughly 10–15%) so a fact spanning a boundary survives, and attach metadata (source, section, date, access level, version) to every chunk so retrieval can filter as well as rank.' },
        { t: 'p', x: 'The two failure directions: chunks too small lose the context needed to interpret them; chunks too large dilute the embedding across several topics so it matches nothing strongly, and waste prompt budget. A useful refinement is **small-to-big**: embed and search small precise chunks, but return the surrounding parent section to the LLM.' },

        { t: 'h2', x: '3 · Embeddings' },
        { t: 'p', x: 'An [[embedding|embedding model]] maps text into a space where similarity is proximity. Two practical points dominate:' },
        { t: 'ul', items: [
          '**Asymmetric models need their prefixes.** QA embedders encode short questions and long passages differently. Using the passage encoding for queries silently destroys recall — the system still works, just badly, which makes it hard to spot.',
          '**Changing the model means re-embedding everything.** Vectors from two different models are not comparable. A partial migration produces a silently broken index.',
        ]},
        { t: 'p', x: 'Domain fit matters more than leaderboard position: a model that tops a general benchmark may underperform on legal or biomedical text. Evaluate on your own queries.' },

        { t: 'h2', x: '4–5 · Indexing and retrieval' },
        { t: 'p', x: 'Dense [[vector-db|vector search]] finds semantic matches but is systematically weak on exactly the tokens enterprises care about: product codes, error identifiers, part numbers, rare acronyms and names. Lexical search (BM25) nails those and misses paraphrases. [[hybrid-search|Hybrid search]] runs both and fuses the ranked lists, usually with [[rrf|Reciprocal Rank Fusion]], which needs no score normalisation.' },
        { t: 'callout', kind: 'exam', title: 'The rare-entity question', x: 'A scenario where "queries containing specific part numbers or error codes return irrelevant results, while general questions work fine" is the hybrid-search question. Dense retrieval alone cannot reliably match rare literal tokens.' },
        { t: 'p', x: 'Metadata filtering is the other half of retrieval and is often the correct answer for access control: filter **before** the vector search by the requesting user\'s permitted document set, so restricted content is never a candidate. Filtering after retrieval leaks the existence of documents and wastes recall.' },

        { t: 'h2', x: '6 · Reranking' },
        { t: 'p', x: 'A [[reranker|cross-encoder reranker]] scores each (query, passage) pair jointly, which is far more accurate than comparing independently-computed embeddings — and far too slow to run over a whole corpus. Hence the two-stage pattern: retrieve top-50 cheaply, rerank, keep top-3-5. NVIDIA provides nv-rerankqa reranking NIMs for this stage.' },
        { t: 'callout', kind: 'warn', title: 'Reranking cannot fix recall', x: 'A reranker only reorders what retrieval already returned. If the right document was never in the top-50, no reranker will surface it. Recall is fixed at the retrieval stage — hybrid search, better chunking, query rewriting, higher first-stage k.' },

        { t: 'h2', x: '7 · Generation' },
        { t: 'p', x: 'The generation prompt must do three things: instruct the model to answer **only** from the provided context, require citations for every claim, and explicitly permit — indeed require — "the provided sources do not contain this" when the context is insufficient. Without that last instruction the model falls back on parametric knowledge and produces exactly the confident-but-unsourced answer you were trying to avoid.' },
      ],
    },

    {
      id: 'agentic-retrieval',
      title: 'Agentic RAG and knowledge graphs',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'Single-shot RAG assumes the user\'s question is already a good search query and that one retrieval suffices. Both assumptions fail often enough that agentic retrieval is the standard upgrade path.' },

        { t: 'h2', x: 'What the agent adds' },
        { t: 'ol', items: [
          '**[[query-rewriting|Query rewriting]].** Resolve pronouns from conversation history, split compound questions, generate paraphrases. "And what about the other one?" is unsearchable until rewritten.',
          '**Source selection.** Choose among several indexes or tools — product docs, ticket history, a SQL database, the web — instead of always hitting one.',
          '**Retrieval grading.** Judge whether the retrieved context actually answers the question before generating.',
          '**Iterative retrieval.** If the grade is poor, reformulate and retrieve again, or decompose into sub-questions and retrieve for each.',
          '**Synthesis across sources**, with conflicts surfaced rather than silently averaged.',
        ]},
        { t: 'p', x: 'This is [[agentic-rag|agentic RAG]], and the corrective loop (grade → rewrite → retry, with a cap) is the single highest-value addition. Cap the loop: two or three retrieval rounds, then answer with what you have or state that you cannot.' },

        { t: 'h2', x: 'Multi-hop questions and graphs' },
        { t: 'p', x: 'Chunk retrieval fails on questions requiring a join across documents: *"which suppliers of components in the recalled batch also ship to our EU sites?"* No single chunk contains that answer, and semantic similarity to the question does not retrieve the right chain of documents.' },
        { t: 'p', x: 'Two answers. **Iterative decomposition**: the agent breaks the question into hops, retrieves for hop one, uses the result to form hop two, and so on. **[[knowledge-graph|GraphRAG]]**: extract entities and relations into a graph up front and traverse it, so the join is a graph query rather than a similarity search. GraphRAG costs a substantial extraction pipeline and ongoing maintenance, so it is justified when multi-hop relational questions are the *core* workload, not an occasional case.' },
        { t: 'callout', kind: 'exam', title: 'When to say "knowledge graph"', x: 'The trigger is **explicit relationships that must be traversed** — supply chains, org hierarchies, dependency graphs, entity networks. If the questions are "find the passage that says X", a graph is over-engineering.' },

        { t: 'h2', x: 'Structured data is not a RAG problem' },
        { t: 'p', x: 'When the answer lives in a relational database, the right pattern is text-to-SQL against a curated schema and read-only views — not embedding table rows. Guardrails for that path: expose a restricted schema, enforce read-only credentials, validate the generated SQL, apply a row limit and a query timeout, and return the SQL alongside the answer so it can be checked. Hybrid questions ("summarise the policy and tell me this quarter\'s numbers") need both retrieval and SQL as separate tools.' },
      ],
    },

    {
      id: 'data-lifecycle',
      title: 'Data quality, freshness and access control',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'A RAG system that was accurate at launch decays silently. Freshness, permissions and provenance are ongoing engineering, not setup steps.' },

        { t: 'h2', x: 'Keeping the index current' },
        { t: 'p', x: 'Nightly full rebuilds do not scale and leave a long staleness window. [[freshness|Incremental ingestion]] is the production pattern: detect changes via webhooks or change-data-capture, upsert modified documents by a stable id, and **tombstone deletions** so removed content stops being retrievable immediately. Every chunk should carry a version and a timestamp so the generator can prefer the current revision and disclose the age of what it used.' },
        { t: 'callout', kind: 'trap', title: 'The deletion trap', x: 'Deleting a document from the source system does not remove its chunks from the vector index. A frequently-tested scenario: a policy is retracted but the agent keeps citing it. The fix is deletion propagation into the index — and, where the content was sensitive, verifying that it is gone from caches and memory stores too.' },

        { t: 'h2', x: 'Access control' },
        { t: 'p', x: 'Multi-tenant and permissioned corpora need **pre-filtering**: attach access metadata to every chunk at ingestion, and constrain the vector search itself to the requesting user\'s permitted set. Post-filtering after retrieval is both a leak (rankings and counts reveal what exists) and a quality loss (the top-k fills with documents that get discarded). Where isolation must be absolute, use separate collections or namespaces per tenant.' },
        { t: 'p', x: 'The subtler risk is that permissions change. A document a user could read last week may be restricted today, so authorisation must be evaluated at query time against current permissions — not baked into an index built at ingestion time.' },

        { t: 'h2', x: 'Provenance and conflicts' },
        { t: 'p', x: 'Real corpora contradict themselves: an old policy and its replacement, a draft and a final, a regional variant and a global default. Carry enough metadata (effective date, status, jurisdiction, authority) that ranking can prefer the authoritative version, and instruct the generator to **surface conflicts rather than silently pick one**. "Two sources disagree; the current policy effective 1 June says X, the superseded 2024 version said Y" is a better answer than a confident single claim.' },

        { t: 'h2', x: 'Sensitive data' },
        { t: 'p', x: 'Decide what may enter the index at all. [[pii|Redact or tokenise PII]] at ingestion where the use case does not need it — anything embedded is effectively distributed, since embeddings can be partially inverted. If a hosted model is in play and data cannot leave the trust boundary, either redact at the boundary or self-host with [[nim|NIM]] so nothing crosses it. [[nemo-curator|NeMo Curator]] provides PII detection and redaction at scale as part of the ingestion path.' },
      ],
    },
  ],

  quiz: [
    { id: 'k1', domain: 'knowledge',
      scenario: 'A RAG system answers general questions well, but queries containing specific part numbers ("BRK-4471-XR") and error codes return irrelevant passages.',
      q: 'What is the correct fix?',
      opts: [
        'Add hybrid search — combine BM25 lexical retrieval with dense vector retrieval and fuse the results with RRF',
        'Increase the chunk size so more context surrounds each part number',
        'Fine-tune the LLM on the parts catalogue',
        'Raise the temperature so the model explores more possibilities'],
      a: 0,
      why: 'Dense embeddings represent meaning, and rare literal tokens like part numbers carry little semantic signal, so they are systematically under-retrieved. Lexical search matches them exactly. Running both and fusing the ranked lists with Reciprocal Rank Fusion covers both cases.',
      distract: '**Bigger chunks** dilute embeddings further. **Fine-tuning** bakes in a catalogue that will change and provides no citations. **Temperature** affects generation, not retrieval.' },

    { id: 'k2', domain: 'knowledge',
      q: 'Where does a cross-encoder reranker belong in a RAG pipeline, and what does it improve?',
      opts: [
        'After first-stage retrieval, reordering the top-N candidates down to a precise top-3-5 — it improves precision, not recall',
        'Before retrieval, to rewrite the query',
        'Replacing the vector index entirely, scoring every document per query',
        'After generation, to check the answer for hallucinations'],
      a: 0,
      why: 'A cross-encoder scores each query-passage pair jointly, which is much more accurate than bi-encoder similarity but far too slow for a whole corpus. Hence the two-stage design: cheap retrieval for recall, then reranking for precision on the shortlist.',
      distract: 'It cannot replace the index (too slow at corpus scale) and cannot recover documents first-stage retrieval never returned. Query rewriting and hallucination checking are different components.' },

    { id: 'k3', domain: 'knowledge',
      scenario: 'A team swaps in a new, better embedding model and re-embeds only documents ingested after the change. Retrieval quality collapses.',
      q: 'Why?',
      opts: [
        'Vectors from two different embedding models occupy different spaces and are not comparable, so similarity scores across the mixed index are meaningless',
        'The new model produces vectors of the same dimension, causing collisions',
        'The vector database cannot store more than one model\'s output',
        'The reranker was not updated to match'],
      a: 0,
      why: 'Similarity is only meaningful within one embedding space. A mixed index compares apples to oranges, so ranking becomes effectively arbitrary. Changing the embedding model requires re-embedding the entire corpus.',
      distract: 'Matching dimensions do not make spaces compatible. Databases can store multiple collections, but they must not be mixed in one search. The reranker is a separate stage.' },

    { id: 'k4', domain: 'knowledge',
      scenario: 'Answers about numbers that appear in PDF tables and charts are consistently wrong, while answers drawn from body text are accurate.',
      q: 'Which pipeline stage is at fault?',
      opts: [
        'Document extraction — tables and charts need layout and structure-aware parsing before chunking',
        'The generation prompt',
        'The vector index parameters',
        'The reranker'],
      a: 0,
      why: 'If table structure is destroyed at extraction, the relationship between a value and its row and column headers is gone before anything is embedded. No downstream stage can reconstruct it. Multimodal extraction with table structure recognition — NeMo Retriever extraction — is the fix.',
      distract: 'Every other stage operates on whatever extraction produced. Fixing prompts, index parameters or reranking cannot restore information that was lost at parse time.' },

    { id: 'k5', domain: 'knowledge',
      q: 'A compliance policy is retracted and deleted from the source repository, but the agent keeps citing it. What went wrong?',
      opts: [
        'Deletions were not propagated to the vector index — the pipeline needs tombstoning so removed documents stop being retrievable',
        'The embedding model cached the document',
        'The context window is too large',
        'The reranker is ranking old documents higher'],
      a: 0,
      why: 'Vector indexes do not learn about source deletions on their own. Incremental ingestion must handle deletes explicitly, removing or tombstoning the affected chunks — and for sensitive content, verifying removal from caches and memory stores too.',
      distract: 'Embedding models do not cache documents; context window size is unrelated; and the reranker can only reorder chunks that are still in the index.' },

    { id: 'k6', domain: 'knowledge',
      q: 'In a multi-tenant RAG system, when should access control be applied?',
      opts: [
        'Before the vector search, by filtering candidates to the requesting user\'s permitted document set using chunk metadata',
        'After retrieval, by discarding results the user cannot see',
        'In the system prompt, by instructing the model to ignore unauthorised content',
        'At generation time, by redacting the final answer'],
      a: 0,
      why: 'Pre-filtering ensures unauthorised chunks are never candidates. Post-filtering leaks information through rankings and result counts, and wastes the top-k on documents that get thrown away. Permissions must be evaluated at query time against current entitlements.',
      distract: 'Prompt instructions are not an access-control mechanism, and redacting after generation means the restricted content already entered the model context.' },

    { id: 'k7', domain: 'knowledge',
      scenario: 'Users ask "which suppliers of components in the recalled batch also ship to our EU sites?" — no single document contains the answer.',
      q: 'Which approach fits best?',
      opts: [
        'A knowledge graph of entities and relations, traversed to join across documents (optionally combined with vector search)',
        'Larger chunks so more context fits per retrieval',
        'A higher retrieval top-k',
        'A larger LLM with a longer context window'],
      a: 0,
      why: 'This is a multi-hop relational query. Similarity search cannot perform a join, because no chunk resembles the full question. A graph encodes the entity relationships explicitly so the join becomes a traversal. Iterative agentic decomposition is the alternative when a graph is not warranted.',
      distract: 'Bigger chunks, higher top-k and longer context all supply more text without supplying the relational structure the question requires.' },

    { id: 'k8', domain: 'knowledge',
      q: 'What is the main benefit of an agentic RAG loop over single-shot RAG?',
      opts: [
        'The agent can rewrite the query, grade whether retrieved context is sufficient, and retrieve again from a different source before answering',
        'It eliminates the need for an embedding model',
        'It guarantees the answer is factually correct',
        'It removes the need to chunk documents'],
      a: 0,
      why: 'Single-shot RAG assumes the raw question is a good query and that one retrieval suffices. An agentic loop adds query rewriting, source selection, retrieval grading and bounded re-retrieval — which is what fixes conversational follow-ups and hard queries.',
      distract: 'Agentic RAG still needs embeddings and chunking, and no retrieval architecture guarantees factual correctness.' },

    { id: 'k9', domain: 'knowledge',
      q: 'A corpus contains a superseded policy and its replacement. What should the system do?',
      opts: [
        'Carry effective-date and status metadata, rank the authoritative version higher, and surface the conflict with dates when both are relevant',
        'Delete all historical versions from the corpus',
        'Return whichever version scores higher on embedding similarity',
        'Average the two answers'],
      a: 0,
      why: 'Historical versions often must be retained for audit. Metadata-aware ranking prefers the current authoritative revision, and explicitly surfacing the conflict with dates is more useful and more honest than presenting one version as if it were uncontested.',
      distract: 'Deleting history may breach retention requirements. Similarity is blind to authority and recency, and averaging contradictory policies produces a statement that is true of neither.' },

    { id: 'k10', domain: 'knowledge',
      q: 'Which instruction most reduces hallucination in the generation stage of a RAG pipeline?',
      opts: [
        'Answer only from the provided context, cite the source for each claim, and state explicitly when the sources do not contain the answer',
        'Be concise and confident',
        'Use your general knowledge to fill gaps in the context',
        'Always produce an answer, never refuse'],
      a: 0,
      why: 'Grounding requires three things together: restriction to the provided evidence, per-claim citation so it can be verified, and an explicit licence to say the sources are insufficient. Without that last permission the model falls back on parametric knowledge and invents plausible content.',
      distract: 'Confidence, gap-filling from general knowledge, and a no-refusal rule all directly increase unsupported claims.' },
  ],
}
