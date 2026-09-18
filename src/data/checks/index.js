import c01 from './m01-architecture.js'
import c02 from './m02-development.js'
import c03 from './m03-evaluation.js'
import c04 from './m04-deployment.js'
import c05 from './m05-cognition.js'
import c06 from './m06-knowledge.js'
import c07 from './m07-platform.js'
import c08 from './m08-operations.js'
import c09 from './m09-safety.js'
import c10 from './m10-human.js'

/** End-of-lesson comprehension checks: moduleId -> lessonId -> questions. */
const checks = {
  architecture: c01,
  development: c02,
  evaluation: c03,
  deployment: c04,
  cognition: c05,
  knowledge: c06,
  platform: c07,
  operations: c08,
  safety: c09,
  human: c10,
}

export function lessonCheck(moduleId, lessonId) {
  return checks[moduleId]?.[lessonId] || []
}

/** Share of questions needed to pass a lesson check and mark the lesson complete. */
export const CHECK_PASS = 0.7

export function checkPassMark(total) {
  return Math.ceil(total * CHECK_PASS)
}
