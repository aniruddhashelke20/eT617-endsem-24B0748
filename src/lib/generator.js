// Automatic question generation: templates × learner state.
// Each question carries its correct answer AND the answer each misconception would produce
// ("traps"), so a wrong answer can be diagnosed, not just marked wrong.

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const show = (n) => (n < 0 ? `−${-n}` : `${n}`) // proper minus sign
const par = (n) => (n < 0 ? `(−${-n})` : `${n}`) // brackets around negatives

// Skill ↔ misconception it targets
export const SKILL_FOR = { M1: 'addNeg', M2: 'subNeg', M3: 'compare' }

// Number size grows with level (difficulty)
const range = (level) => (level === 1 ? [1, 5] : level === 2 ? [2, 9] : [3, 12])

function addNeg(level) {
  const [lo, hi] = range(level)
  const a = rnd(lo, hi), b = rnd(lo, hi)
  return {
    skill: 'addNeg', a: -a, b: -b, op: '+',
    expr: `${par(-a)} + ${par(-b)}`,
    answer: -(a + b),
    traps: { M1: a + b }, // "two minuses make a plus"
  }
}

function subNeg(level) {
  const [lo, hi] = range(level)
  const x = level === 1 ? rnd(lo, hi) : pick([rnd(lo, hi), -rnd(lo, hi)])
  const b = rnd(lo, hi)
  return {
    skill: 'subNeg', a: x, b: -b, op: '−',
    expr: `${par(x)} − ${par(-b)}`,
    answer: x + b,
    traps: { M2: x - b }, // ignores the sign of the number being subtracted
  }
}

function addMixed(level) {
  const [lo, hi] = range(level)
  const a = rnd(lo, hi)
  let b = rnd(lo, hi + 1)
  while (b === a) b = rnd(lo, hi + 1)
  const negFirst = Math.random() < 0.5
  const [p, q] = negFirst ? [-a, b] : [a, -b]
  return {
    skill: 'addMixed', a: p, b: q, op: '+',
    expr: `${par(p)} + ${par(q)}`,
    answer: p + q,
    traps: { M1: Math.abs(p) + Math.abs(q) }, // adds sizes and makes it positive
  }
}

function compare(level) {
  const [lo, hi] = range(level)
  let a = rnd(lo, hi), b = rnd(lo, hi)
  while (a === b) b = rnd(lo, hi)
  const big = -Math.min(a, b) // e.g. −2 is greater than −7
  const small = -Math.max(a, b)
  return {
    skill: 'compare', format: 'mcq',
    text: `Which number is greater?`,
    expr: `${show(-a)}  or  ${show(-b)}`,
    answer: big,
    options: [-a, -b],
    traps: { M3: small }, // picks the bigger digit
  }
}

const MAKERS = { addNeg, subNeg, addMixed, compare }

function mcqOptions(q) {
  const opts = new Set([q.answer, ...Object.values(q.traps)])
  opts.add(-q.answer)
  while (opts.size < 4) opts.add(q.answer + pick([-2, -1, 1, 2, 3]))
  return [...opts].sort(() => Math.random() - 0.5)
}

const NAMES = ['Aarav', 'Sana', 'Kabir', 'Meera', 'Rohan']

let counter = 0
// focus = misconception to target (after an alternative explanation) or null
export function generateQuestion(level, focus = null) {
  const skills = level === 1 ? ['addNeg', 'subNeg'] : ['addNeg', 'subNeg', 'addMixed', 'compare']
  const skill = focus ? SKILL_FOR[focus] : pick(skills)
  const q = MAKERS[skill](level)
  q.id = `q${Date.now()}-${counter++}`
  q.level = level

  if (!q.format) {
    const formats =
      level === 1 ? ['numeric', 'numberline'] :
      level === 2 ? ['numeric', 'mcq', 'numberline'] :
      ['spot', 'predict', 'numeric']
    q.format = pick(formats)
  }

  // keep number-line taps readable on a 360 px phone: only −10..10
  if (q.format === 'numberline' && (Math.abs(q.answer) > 10 || Math.abs(q.a) > 10)) q.format = 'numeric'

  if (q.format === 'mcq' && !q.options) q.options = mcqOptions(q)

  if (q.format === 'numeric') q.text = `Work out:`
  if (q.format === 'mcq' && q.skill !== 'compare') q.text = `Choose the answer:`
  if (q.format === 'numberline') q.text = `Tap where you land on the number line:`

  if (q.format === 'spot') {
    // Show a classmate's answer — usually the misconception answer, sometimes the right one
    const trap = Object.values(q.traps)[0]
    const claimed = Math.random() < 0.7 ? trap : q.answer
    q.claimed = claimed
    q.who = pick(NAMES)
    q.text = `${q.who} says ${q.expr} = ${show(claimed)}. Is ${q.who} right? Explain in one line.`
    q.answer = claimed === q.answer ? 'yes' : 'no'
    q.trueValue = eval0(q)
    q.needsExplanation = true
  }

  if (q.format === 'predict') {
    q.trueValue = q.answer
    q.text = `Without working it out fully: will the answer be positive or negative? Say why.`
    q.answer = q.trueValue > 0 ? 'positive' : q.trueValue < 0 ? 'negative' : 'zero'
    q.needsExplanation = true
  }
  return q
}

// true numeric value for spot questions (a op b)
function eval0(q) {
  return q.op === '+' ? q.a + q.b : q.a - q.b
}
