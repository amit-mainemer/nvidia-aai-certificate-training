export const exam = {
  code: 'NCP-AAI',
  name: 'NVIDIA-Certified Professional: Agentic AI',
  level: 'Professional',
  duration: '120 minutes',
  questions: '60–70',
  price: '$200 USD',
  passing: '~70% (scaled)',
  validity: '2 years',
  delivery: 'Online, remotely proctored (Certiverse)',
  language: 'English',
  prereq: '1–2 years in an AI/ML role plus hands-on production agentic-AI work',
  officialUrl: 'https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/',
}

/* Colours are assigned per-domain and reused across the whole app so that a
   domain is always recognisable by the same hue. */
export const blueprint = [
  { id: 'architecture', n: 1,  name: 'Agent Architecture and Design',          weight: 15, color: '#76b900' },
  { id: 'development',  n: 2,  name: 'Agent Development',                      weight: 15, color: '#a8e63d' },
  { id: 'evaluation',   n: 3,  name: 'Evaluation and Tuning',                  weight: 13, color: '#5cc8ff' },
  { id: 'deployment',   n: 4,  name: 'Deployment and Scaling',                 weight: 13, color: '#4d9fe0' },
  { id: 'cognition',    n: 5,  name: 'Cognition, Planning, and Memory',        weight: 10, color: '#b388ff' },
  { id: 'knowledge',    n: 6,  name: 'Knowledge Integration and Data Handling',weight: 10, color: '#ff9d6b' },
  { id: 'platform',     n: 7,  name: 'NVIDIA Platform Implementation',         weight: 7,  color: '#f5c451' },
  { id: 'operations',   n: 8,  name: 'Run, Monitor, and Maintain',             weight: 5,  color: '#67d977' },
  { id: 'safety',       n: 9,  name: 'Safety, Ethics, and Compliance',         weight: 5,  color: '#ff6b6b' },
  { id: 'human',        n: 10, name: 'Human-AI Interaction and Oversight',     weight: 5,  color: '#ff8fc7' },
]

export const domainById = Object.fromEntries(blueprint.map((d) => [d.id, d]))
