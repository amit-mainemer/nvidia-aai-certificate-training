// End-of-lesson comprehension checks for Module 10: Human-AI Interaction and Oversight. Keyed by lesson id.
export default {
  'oversight-models': [
    {
      q: 'Which two questions does the lesson use to choose an oversight model for an action?',
      opts: [
        'How accurate is the model, and how fast must it respond?',
        'How many users are affected, and how many agents are involved?',
        'Can it be undone, and how large is the damage if it is wrong?',
        'Is the action regulated, and how many reviewers are available?',
      ],
      a: 2,
      why: 'Reversibility and blast radius decide the model. Irreversible plus high impact means in-the-loop; reversible plus high volume means on-the-loop with good monitoring and a working undo.',
    },
    {
      q: 'An agent updates thousands of product descriptions a day. Every change is versioned and can be rolled back in one click, and staff watch a dashboard of changes. Which oversight model fits?',
      opts: [
        'Human-in-the-loop, approving every edit',
        'Human-on-the-loop, monitoring with ability to reverse',
        'No oversight at all, since each edit is low value on its own',
        'Human-in-the-loop, but only during business hours',
      ],
      a: 1,
      why: 'The actions are reversible and high volume, where full approval would not scale. On-the-loop lets the agent act while a human monitors and can intervene or roll back.',
      distract: 'Approving every edit does not scale and produces rubber-stamping; the lesson never recommends no oversight at all.',
    },
    {
      q: 'In which model do humans set policy, scope and limits but take no part in individual actions?',
      opts: ['Human-in-the-loop', 'Human-on-the-loop', 'Human-in-command', 'Human-as-reviewer'],
      a: 2,
      why: 'Human-in-command is the lowest-cost model: people define the policy and limits up front, with no per-action involvement. It suits low-stakes, reversible, high-volume operations.',
    },
    {
      q: 'A reviewer may take several hours to answer an approval request. What does a working LangGraph human-in-the-loop implementation need?',
      opts: [
        '`interrupt_before` on the tool step plus a durable checkpointer to resume from there',
        'A system-prompt instruction telling the model to wait for the reviewer before continuing',
        'Running the tool immediately, then asking the reviewer to confirm the result afterwards',
        'Restarting the whole agent run from the first step once the approval finally arrives',
      ],
      a: 0,
      why: 'Human-in-the-loop is an interrupt at the tool boundary: the agent pauses before executing, persists its state through a checkpointer, and resumes from that point on approval.',
      distract: 'A prompt instruction is not an interrupt, executing first defeats the gate, and restarting throws away the state the reviewer approved.',
    },
    {
      q: 'An approval request has had no response for 24 hours. What should the design do?',
      opts: [
        'Proceed with the action, since silence implies consent',
        'Retry the same request to the same reviewer indefinitely',
        'Let the agent decide based on its own confidence score',
        'Follow a defined timeout policy that never silently proceeds',
      ],
      a: 3,
      why: 'A timeout policy is a required design detail, and the lesson is explicit that the system must never silently proceed when nobody responds. Escalating or cancelling are typical choices.',
    },
    {
      q: 'Reviewers get dozens of near-identical approval requests an hour and can only click approve or reject. Which changes does the lesson suggest?',
      opts: [
        'Remove the approval step for these actions entirely',
        'Batch similar requests and allow editing the proposed action',
        'Show less context per request so that each one is faster to read',
        'Pre-select approve so reviewers only act on exceptions',
      ],
      a: 1,
      why: 'Batching similar approvals keeps reviewers from being interrupted constantly, and being able to edit the proposed action, not just approve or reject it, makes the step useful.',
      distract: 'Cutting context forces reviewers to reconstruct the situation, and a pre-selected approve default invites rubber-stamping.',
    },
    {
      q: 'Which of these is a well-formed escalation trigger?',
      opts: [
        'Escalate whenever the agent feels unsure of its answer',
        'Escalate whenever a conversation goes past three turns',
        'Escalate when a step fails twice or the step budget runs out',
        'Escalate whenever a tool returns more data than expected',
      ],
      a: 2,
      why: 'A good escalation policy names concrete conditions, such as repeated failures, an exhausted step budget, a low calibrated score, out-of-scope requests, value limits, user distress or a regulatory rule.',
      distract: '"When unsure" is exactly the vague trigger the lesson warns against, and turn counts or data size are not tied to risk.',
    },
  ],

  'interaction-design': [
    {
      q: 'A team argues: "The agent is now 98% accurate, so reviewer diligence matters less." What does the lesson say about this?',
      opts: [
        'It is correct; oversight can shrink as accuracy rises',
        'It is backwards; automation bias grows as the system improves',
        'It only holds if the reviewers are experienced domain experts',
        'It is correct once accuracy passes 99%',
      ],
      a: 1,
      why: 'Automation bias grows as the system gets better: a reviewer who has approved hundreds of correct recommendations stops reading the next one. Higher accuracy makes the rare error more likely to slip through.',
    },
    {
      q: 'An approval screen shows the recommendation with "Approve" pre-selected and one Confirm button. Which change best counters automation bias?',
      opts: [
        'Make the Confirm button larger and easier to find',
        'Add a note reminding reviewers to check carefully',
        'Hide the recommendation until the reviewer clicks Confirm',
        'No default; require an active choice and a reason on override',
      ],
      a: 3,
      why: 'The lesson lists requiring an active decision as a countermeasure: no pre-selected approve default, and a brief reason when overriding.',
      distract: 'A reminder note is ignored after a few uses, and hiding the recommendation removes the evidence the reviewer needs.',
    },
    {
      q: 'Which practice helps reviewers keep calibrated scepticism over time?',
      opts: [
        'Rotating reviewers and training them on known failure cases',
        'Assigning the same expert reviewer to every case permanently',
        'Showing only the conclusion so reviews go faster',
        'Hiding confidence scores so reviewers form their own view',
      ],
      a: 0,
      why: 'Rotation and training with known failure cases remind reviewers that the system does fail, which counters the drift into over-trust.',
      distract: 'Showing only the conclusion makes review performative, and hiding uncertainty removes the signal meant to draw attention.',
    },
    {
      q: 'For a RAG assistant, which is a better signal of answer confidence than the model\'s raw probability?',
      opts: [
        'The length and fluency of the generated answer',
        'Whether the answer uses hedging words such as "might" or "maybe"',
        'Whether retrieved sources agree and samples are self-consistent',
        'How quickly the model produced its first token',
      ],
      a: 2,
      why: 'The lesson recommends retrieval scores, agreement between sources and self-consistency across samples, tied to calibrated bands, because raw model probabilities are poorly calibrated.',
      distract: 'Fluency and confident or hedged wording are produced regardless of correctness, and latency says nothing about accuracy.',
    },
    {
      q: 'An agent makes consequential decisions about benefit claims. Beyond telling users they are talking to an AI and citing sources, what transparency measure does the lesson require?',
      opts: [
        'A disclaimer on every response that answers may be wrong',
        'A documented appeal and override path to someone with authority',
        'Publishing the full system prompt on the public website',
        'Showing the raw token probabilities for each decision',
      ],
      a: 1,
      why: 'For consequential decisions a person must be able to contest the outcome and reach someone with authority to change it, so a documented appeal and override path is required.',
    },
    {
      q: 'Which feedback design gives the most useful signal for improving the system?',
      opts: [
        'Thumbs up and thumbs down buttons shown under each answer',
        'A monthly satisfaction survey sent to every active user',
        'Tracking how long users spend reading each generated answer',
        'Specific corrections tied to the trace id, fed to the data flywheel',
      ],
      a: 3,
      why: 'A thumbs-down says almost nothing, while a specific correction such as "this cited the wrong policy version" shows where the pipeline failed. Capturing it against the trace id and routing it into the data flywheel turns it into the highest-quality training and evaluation data.',
    },
  ],
}
