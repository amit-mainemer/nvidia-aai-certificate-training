export default {
  id: 'human',
  n: 10,
  domain: 'human',
  weight: 5,
  title: 'Human-AI Interaction and Oversight',
  blurb: 'Designing oversight that actually works: the three oversight models, escalation triggers, communicating uncertainty, and interfaces that resist automation bias.',
  hours: '2–3 h',
  lessons: [
    {
      id: 'oversight-models',
      title: 'Three oversight models and where each belongs',
      minutes: 11,
      blocks: [
        { t: 'lede', x: 'Oversight is an architectural decision with a latency and staffing cost. Placing it correctly — and knowing the difference between the three models — is what this domain tests.' },

        { t: 'h2', x: 'The three models' },
        { t: 'table', head: ['Model', 'Mechanism', 'Cost', 'Use when'], rows: [
          ['[[hitl|Human-in-the-loop]]', 'The agent pauses and cannot proceed without explicit approval', 'Highest — human latency on every action', 'Irreversible, high-value, regulated or safety-critical actions'],
          ['Human-on-the-loop', 'The agent acts; a human monitors and can intervene or reverse', 'Moderate', 'Reversible actions at volume where full approval would not scale'],
          ['Human-in-command', 'Humans set policy, scope and limits; no per-action involvement', 'Lowest', 'Low-stakes, reversible, high-volume operations'],
        ]},
        { t: 'callout', kind: 'exam', title: 'Choose by reversibility and blast radius', x: 'Two questions decide the model: **can this action be undone**, and **how large is the damage if it is wrong?** Irreversible plus high impact means in-the-loop. Reversible plus high volume means on-the-loop with good monitoring and a working undo. Applying full approval to everything is a real wrong answer — it does not scale and it produces rubber-stamping.' },

        { t: 'h2', x: 'Implementing an approval interrupt' },
        { t: 'p', x: 'Technically, [[hitl|human-in-the-loop]] is an interrupt at the tool boundary: the agent pauses **before** executing, persists its state via a [[state-checkpoint|checkpointer]], surfaces the proposed action with its supporting reasoning and evidence, and resumes from that exact point on approval. LangGraph implements this directly with `interrupt_before` plus a durable checkpointer.' },
        { t: 'p', x: 'Design details that decide whether it works in practice: a timeout policy (what happens if nobody responds — never silently proceed), the ability to **edit** the proposed action rather than only approve or reject, batching of similar approvals so reviewers are not interrupted constantly, and full context in the request so the reviewer does not have to reconstruct the situation.' },

        { t: 'h2', x: 'Escalation triggers' },
        { t: 'p', x: 'A good [[escalation|escalation policy]] names concrete conditions rather than "when unsure":' },
        { t: 'ul', items: [
          'Confidence or retrieval score below a calibrated threshold.',
          'The same step failed twice, or the step budget was exhausted.',
          'The request is out of scope, or the corpus cannot answer it.',
          'The transaction value or risk exceeds a defined limit.',
          'The user expresses distress, frustration or an explicit request for a human.',
          'A regulatory rule requires human involvement for this decision type.',
        ]},
        { t: 'callout', kind: 'tip', title: 'Hand off context, not just the conversation', x: 'The single biggest determinant of handoff quality is what the human receives: the goal, what has been tried, what was found, the sources consulted, and why the agent stopped. Making the customer repeat everything is the failure mode users hate most about escalation, and it is the difference between a good and a bad answer option.' },
      ],
    },
    {
      id: 'interaction-design',
      title: 'Communicating uncertainty and designing against automation bias',
      minutes: 10,
      blocks: [
        { t: 'lede', x: 'An oversight step that people rubber-stamp provides no oversight. The interface is part of the safety architecture.' },

        { t: 'h2', x: 'Automation bias' },
        { t: 'p', x: '[[automation-bias|Automation bias]] is the well-documented tendency to over-trust automated output and stop checking it. It gets worse as the system gets better: a reviewer who has approved four hundred correct recommendations will approve the four hundred and first without reading it. The countermeasures are design choices:' },
        { t: 'ul', items: [
          '**Show the evidence, not just the conclusion.** Sources and reasoning make review possible rather than performative.',
          '**Surface uncertainty visibly**, and vary the interface by confidence so low-confidence cases look different and demand attention.',
          '**Require an active decision.** No pre-selected "approve" default; ask for a brief reason on override.',
          '**Sample-audit approvals** and measure the override rate — a rate near zero across a large volume is evidence of rubber-stamping, not of perfection.',
          '**Rotate and train reviewers**, showing them known failure cases so they retain calibrated scepticism.',
        ]},

        { t: 'h2', x: 'Communicating confidence honestly' },
        { t: 'p', x: 'Raw model probabilities are poorly calibrated and should not be shown as precise percentages. Better signals: retrieval scores and whether sources agree, [[self-consistency|self-consistency]] agreement across samples, explicit abstention when the evidence is insufficient, and simple bands ("high / medium / low confidence") tied to a [[calibration|calibrated threshold]] rather than a fabricated number.' },
        { t: 'callout', kind: 'warn', title: 'Overconfident language is a design defect', x: 'LLMs produce fluent, confident prose regardless of whether they are right. If the system cannot answer well, the correct output says so. "I could not find this in the policy documents — here is who can help" is a better response than a plausible invention, and answer options that prefer always producing an answer are wrong.' },

        { t: 'h2', x: 'Transparency obligations' },
        { t: 'p', x: '[[transparency|Disclosure]] is both a regulatory expectation and good design: tell users they are interacting with an AI system, cite the sources behind claims, explain what the system can and cannot do, and provide a visible route to a human. For consequential decisions, add a documented appeal and override path — a person must be able to contest an outcome and reach someone with authority to change it.' },

        { t: 'h2', x: 'Feedback as a product surface' },
        { t: 'p', x: 'Make correction cheap and specific. A thumbs-down tells you almost nothing; "this cited the wrong policy version" tells you exactly where the pipeline failed. Capture corrections against the [[span-trace|trace]] id, close the loop by telling the user what changed, and route the signal into the [[data-flywheel|data flywheel]] — human corrections are the highest-quality training and evaluation data you will ever get.' },
      ],
    },
  ],

  quiz: [
    { id: 'h1', domain: 'human',
      q: 'What distinguishes human-in-the-loop from human-on-the-loop oversight?',
      opts: [
        'In-the-loop requires explicit approval before the action executes; on-the-loop lets the agent act while a human monitors and can intervene or reverse',
        'In-the-loop applies to single agents, on-the-loop to multi-agent systems',
        'In-the-loop is offline, on-the-loop is real-time',
        'They are two terms for the same control'],
      a: 0,
      why: 'The difference is whether the human is a blocking gate. In-the-loop blocks execution pending approval and suits irreversible high-impact actions. On-the-loop is supervisory monitoring with intervention and rollback, which scales to high-volume reversible operations.',
      distract: 'Neither is tied to agent count, and both operate on live systems.' },

    { id: 'h2', domain: 'human',
      scenario: 'An agent autonomously issues customer refunds. Refunds under $50 are routine and high-volume; refunds over $1,000 are rare and cannot be reversed.',
      q: 'What is the best oversight design?',
      opts: [
        'Tiered oversight — autonomous under $50 with monitoring and sampled audit, human approval required above the high-value threshold',
        'Human approval for every refund regardless of amount',
        'Full autonomy for all refunds, with a daily review report',
        'Block all refunds and route every request to a human'],
      a: 0,
      why: 'Oversight should be proportionate to reversibility and blast radius. Tiering preserves the efficiency of automation on low-risk volume while placing a blocking gate exactly where an error is expensive and irreversible.',
      distract: '**Approving everything** does not scale and induces rubber-stamping, which is worse than no gate because it looks like control. **Full autonomy** leaves irreversible losses undetected until after the fact. **Blocking everything** discards the system\'s purpose.' },

    { id: 'h3', domain: 'human',
      q: 'Reviewers approve 99.8% of agent recommendations. What does this most likely indicate?',
      opts: [
        'Automation bias — review has become a rubber stamp; surface evidence and uncertainty, require an active decision, and sample-audit the approvals',
        'The agent is performing excellently and oversight can be removed',
        'The reviewers need faster tooling',
        'The confidence threshold should be lowered'],
      a: 0,
      why: 'A near-total approval rate across high volume is evidence that review has stopped being substantive. The countermeasures are design-level: show the reasoning and sources, make low-confidence cases visually distinct, remove any pre-selected approve default, and independently audit a sample of approvals against ground truth.',
      distract: 'Concluding the agent is perfect assumes the very thing the approvals can no longer evidence. Faster tooling accelerates rubber-stamping. Lowering the threshold sends even more cases through an ineffective gate.' },

    { id: 'h4', domain: 'human',
      q: 'What most improves the quality of an escalation from agent to human?',
      opts: [
        'Passing the full context — goal, steps attempted, findings, sources consulted, and why the agent stopped',
        'Escalating as early as possible to minimise agent errors',
        'Providing the human with the raw model logits',
        'Restarting the conversation so the human has a clean slate'],
      a: 0,
      why: 'The dominant cost of a handoff is the human reconstructing the situation — and the dominant user complaint is having to repeat everything. Structured context transfer makes the handoff continuous rather than a restart.',
      distract: 'Escalating everything defeats the purpose of automation. Raw logits are not actionable for a human reviewer. A clean slate is precisely the failure mode being avoided.' },

    { id: 'h5', domain: 'human',
      q: 'A RAG assistant cannot find an answer in its sources. What should it do?',
      opts: [
        'State that the sources do not cover the question, and offer a route to a human or a related source',
        'Answer from the model\'s general knowledge without mentioning the gap',
        'Return the closest retrieved passage as though it answered the question',
        'Ask the user to rephrase, repeatedly, until retrieval succeeds'],
      a: 0,
      why: 'Honest abstention plus a path forward preserves trust and is the behaviour grounding instructions must explicitly permit. Without that permission the model falls back on parametric knowledge and produces confident, unsourced, unverifiable claims.',
      distract: 'Silently using general knowledge breaks grounding and citation guarantees. Returning a near-miss passage misleads. Endless rephrasing loops frustrate the user without addressing a genuine coverage gap.' },

    { id: 'h6', domain: 'human',
      q: 'How should a system communicate confidence to a non-technical user?',
      opts: [
        'Calibrated bands tied to thresholds, backed by visible sources and explicit abstention when evidence is insufficient',
        'The raw token-level probability of the generated answer, as a percentage',
        'Nothing — confidence displays confuse users',
        'A fixed disclaimer on every response saying the answer may be wrong'],
      a: 0,
      why: 'Raw model probabilities are poorly calibrated and misleading when presented as precision. Simple bands anchored to measured thresholds, together with the sources themselves and a willingness to abstain, give users a usable and honest basis for deciding how much to trust an answer.',
      distract: 'Precise-looking probabilities imply a calibration that does not exist. Hiding uncertainty entirely encourages over-trust. A blanket disclaimer on every response is quickly ignored and conveys no per-answer information.' },
  ],
}
