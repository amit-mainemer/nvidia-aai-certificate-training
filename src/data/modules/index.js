import m01 from './m01-architecture.js'
import m02 from './m02-development.js'
import m03 from './m03-evaluation.js'
import m04 from './m04-deployment.js'
import m05 from './m05-cognition.js'
import m06 from './m06-knowledge.js'
import m07 from './m07-platform.js'
import m08 from './m08-operations.js'
import m09 from './m09-safety.js'
import m10 from './m10-human.js'

export const modules = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10]
export const moduleById = Object.fromEntries(modules.map((m) => [m.id, m]))

export const allLessons = modules.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))
)

export const totalLessons = allLessons.length
export const totalQuizQuestions = modules.reduce((n, m) => n + m.quiz.length, 0)
export const totalMinutes = allLessons.reduce((n, l) => n + l.minutes, 0)

/** Flat pool of every module quiz question, used by the practice/mock builder. */
export const questionPool = modules.flatMap((m) =>
  m.quiz.map((q) => ({ ...q, moduleId: m.id, moduleTitle: m.title }))
)
