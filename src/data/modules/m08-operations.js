export default {
  id: 'operations',
  n: 8,
  domain: 'operations',
  weight: 5,
  title: 'Run, Monitor, and Maintain',
  blurb: 'Observability built for agents, the signals worth alerting on, detecting drift and regression, and the maintenance loop that keeps a deployed system honest.',
  hours: '2–3 h',
  lessons: [
    {
      id: 'observability',
      title: 'Observability for agents',
      minutes: 12,
      blocks: [
        { t: 'lede', x: 'A traditional APM trace tells you a request took nine seconds. An agent trace tells you it took nine seconds because the planner chose the wrong tool twice and the retrieval returned nothing useful. Only the second is actionable.' },

        { t: 'h2', x: 'What a span must carry' },
        { t: 'p', x: 'Instrument every LLM call, tool call, retrieval and agent handoff as a [[span-trace|span]], and record on each: model and prompt version, input and output token counts, latency, cost, the tool name and arguments, the result status, retry count, and the run and session identifiers that tie it all together. Without argument-level detail you cannot distinguish "chose the wrong tool" from "chose the right tool badly".' },
        { t: 'p', x: 'Use [[otel|OpenTelemetry]] as the wire format. Instrumenting once against an open standard lets you send the same spans to Phoenix, W&B Weave, Langfuse, Datadog or an internal collector without re-instrumenting — and it is what [[nemo-agent-toolkit|NeMo Agent Toolkit]] emits natively.' },

        { t: 'callout', kind: 'warn', title: 'Traces contain user data', x: 'Full prompt and response capture means your tracing backend now holds customer data. Redact PII before export, apply retention limits, and control access to trace storage the same way you control access to the production database.' },

        { t: 'h2', x: 'The signals worth alerting on' },
        { t: 'table', head: ['Signal', 'Why it matters', 'Typical trigger'], rows: [
          ['[[task-success|Task success rate]]', 'The only metric that reflects user value', 'Sustained drop versus a rolling baseline'],
          ['Tool error rate (per tool)', 'Isolates a failing dependency fast', 'Per-tool spike, not just the aggregate'],
          ['Average steps per task', 'Rising steps means the agent is struggling', 'Meaningful upward shift'],
          ['Budget-exhaustion rate', 'Runs hitting the step or cost cap', 'Any sustained increase'],
          ['[[escalation|Escalation]] / handoff rate', 'Rising handoffs mean lost capability', 'Above the agreed threshold'],
          ['Groundedness score', 'Early hallucination warning', 'Falling trend on sampled traffic'],
          ['[[guardrails|Guardrail]] trigger rate', 'Spikes can indicate an attack campaign', 'Anomalous rise, especially in one rail'],
          ['p95 latency and cost per resolved task', 'The two SLO/business numbers', 'Breach of the agreed target'],
        ]},
        { t: 'callout', kind: 'exam', title: 'The business metric', x: 'When a question asks what to optimise or report, **cost per successfully resolved task** beats cost per token or per call. A cheaper model that fails more often and takes more steps is more expensive by the measure that matters.' },

        { t: 'h2', x: 'Feedback capture' },
        { t: 'p', x: 'Explicit signals (thumbs, ratings, corrections) are precise but sparse. Implicit signals are abundant: did the user rephrase immediately, abandon the session, escalate to a human, or accept the suggested action? Capture both, tie them to the [[span-trace|trace]] id, and route them into the [[data-flywheel|data flywheel]] as training and evaluation data. This is how a monitoring system becomes an improvement system.' },
      ],
    },
    {
      id: 'maintenance',
      title: 'Drift, regression and the maintenance loop',
      minutes: 10,
      blocks: [
        { t: 'lede', x: 'Agent systems degrade even when nobody touches them, because everything around them changes.' },

        { t: 'h2', x: 'The four kinds of drift' },
        { t: 'specs', rows: [
          ['Input drift', 'Users ask new things, in new ways, about new products. Detect by monitoring the distribution of query embeddings and topics over time.'],
          ['Corpus drift', 'The knowledge base changes; retrieval quality shifts. Detect by re-running retrieval evaluation on a fixed query set.'],
          ['Model drift', 'A provider silently updates a hosted model version. Prevent by pinning versions; detect by continuous evaluation on the golden set.'],
          ['Tool / API drift', 'A dependency changes its schema, semantics or rate limits. Detect with contract tests against every tool, running on a schedule.'],
        ]},
        { t: 'callout', kind: 'exam', title: 'Pin your model versions', x: '"The agent worked for months and degraded overnight with no deployment" is a scenario with a standard answer: an upstream model or dependency changed. The controls are version pinning, continuous evaluation on a fixed golden set, and contract tests on external tools.' },

        { t: 'h2', x: 'Continuous evaluation in production' },
        { t: 'p', x: 'Run the [[regression-suite|golden set]] on a schedule against production, not only in CI — that catches drift that no code change caused. Sample live traffic for automated groundedness and quality scoring, and keep a small human review queue for the cases automation flags as uncertain. Track every metric as a trend against a baseline; a single number without a baseline tells you nothing.' },

        { t: 'h2', x: 'Incident response for agents' },
        { t: 'ol', items: [
          '**Contain.** Route affected traffic to a previous version, a smaller safe model, or a deterministic fallback. Availability of a degraded answer beats a confidently wrong one.',
          '**Diagnose from traces.** Pull the failing runs, find the common span. Localise to planning, tool selection, tool execution, retrieval or synthesis.',
          '**Fix at the right layer.** Prompt, schema, tool implementation, retrieval configuration or model version — the trace tells you which.',
          '**Add the case to the golden set.** Every incident becomes a permanent regression test; otherwise you will ship it again.',
          '**Review the guard.** Ask what control would have caught this earlier — a budget, an eval, an alert, a rail — and add it.',
        ]},

        { t: 'h2', x: 'Change management' },
        { t: 'p', x: 'Version prompts, tool schemas, retrieval configuration, model identifiers and guardrail policies together, and record the composite version on every trace so any production output can be reproduced. Gate changes on the golden set in CI, then release through [[canary|shadow → canary → full rollout]] with a fast, tested rollback path. A prompt edit is a production change and deserves the same discipline as a code change — a single word can move tool-selection accuracy several points.' },
      ],
    },
  ],

  quiz: [
    { id: 'o1', domain: 'operations',
      scenario: 'An agent that performed well for three months degrades noticeably over a weekend. No deployment took place.',
      q: 'What is the most likely cause and the right preventive control?',
      opts: [
        'An upstream model or tool version changed — pin model versions, run continuous evaluation on a golden set, and add contract tests for external tools',
        'The vector database ran out of memory — add more RAM',
        'The context window shrank — upgrade the model',
        'Users became more demanding — retrain on new data'],
      a: 0,
      why: 'With no deployment, the change came from outside: a hosted model version update, a tool API change, or corpus drift. The standard controls are version pinning, scheduled evaluation against a fixed golden set to catch silent regressions, and contract tests on every external dependency.',
      distract: 'A memory exhaustion would surface as errors, not gradual quality decline. Context windows do not shrink. Retraining before diagnosing treats a symptom.' },

    { id: 'o2', domain: 'operations',
      q: 'Which metric best represents the business value of a production agent?',
      opts: [
        'Cost per successfully resolved task',
        'Average tokens per LLM call',
        'GPU utilisation percentage',
        'Number of tool calls per hour'],
      a: 0,
      why: 'It combines quality and cost in one number. A cheaper model that fails more often and needs more steps is more expensive per resolved task, which is exactly the trade-off that per-token metrics hide.',
      distract: 'Tokens per call, GPU utilisation and tool-call volume are all useful operational signals but none of them reflect whether users got what they needed.' },

    { id: 'o3', domain: 'operations',
      q: 'Why instrument an agent with OpenTelemetry rather than a vendor SDK?',
      opts: [
        'Instrument once and export the same spans to any compatible backend — Phoenix, Weave, Langfuse, Datadog — without re-instrumenting or locking in',
        'It is the only way to measure token counts',
        'It automatically redacts PII from traces',
        'It replaces the need for evaluation'],
      a: 0,
      why: 'OTel is the vendor-neutral standard for traces, metrics and logs, and it is what NeMo Agent Toolkit emits. One instrumentation layer feeds any collector, so switching observability vendors does not mean rewriting instrumentation.',
      distract: 'Token counting is possible without OTel; PII redaction is something you must implement yourself; and tracing is complementary to, not a substitute for, evaluation.' },

    { id: 'o4', domain: 'operations',
      q: 'Traces show average steps per task rising from 4.2 to 7.8 over two weeks while success rate holds. What does this most likely indicate?',
      opts: [
        'The agent is working harder for the same outcome — investigate tool reliability, retrieval quality and query distribution shift before cost and latency degrade further',
        'Nothing — success rate is unchanged, so the system is healthy',
        'The model has become more thorough, which is desirable',
        'Users are asking fewer questions'],
      a: 0,
      why: 'Rising step count with flat success is an early warning: the agent is compensating for something — a degraded tool, weaker retrieval, or harder incoming queries. Cost and latency are already worse, and success will follow if the underlying cause continues.',
      distract: 'Treating it as healthy ignores a leading indicator; "more thorough" is a rationalisation of a regression; and step count per task is independent of query volume.' },

    { id: 'o5', domain: 'operations',
      q: 'What should happen to every production incident caused by agent behaviour?',
      opts: [
        'The failing case is added to the golden regression set so the fix is verified permanently in CI',
        'The agent is switched to a larger model',
        'The affected tool is removed',
        'The incident is documented in a runbook and closed'],
      a: 0,
      why: 'Without a regression test, the same failure reappears after the next prompt or model change. Converting each incident into a permanent golden-set case is what turns incident response into cumulative improvement.',
      distract: 'A bigger model is an untargeted and expensive response; removing tools removes capability; and documentation alone does not prevent recurrence.' },

    { id: 'o6', domain: 'operations',
      q: 'Which is the appropriate first action when a guardrail-trigger rate spikes tenfold in an hour?',
      opts: [
        'Investigate whether it is a coordinated attack or a legitimate traffic shift, using traces to inspect which rail is firing and on what content',
        'Loosen the guardrail so legitimate users are not blocked',
        'Disable guardrails until the cause is found',
        'Roll back the most recent model deployment'],
      a: 0,
      why: 'A spike in a specific rail is a signal, not a defect. The trace detail tells you which rail fired and on what input, distinguishing an injection or jailbreak campaign from a benign shift in traffic — and that determines whether the correct response is tightening or tuning.',
      distract: 'Loosening or disabling protection before understanding the cause is exactly what an attacker would want. Rolling back a deployment is unjustified when nothing indicates the deployment caused it.' },
  ],
}
