// Automatic question generation for linear equations in one variable (Class 8).
// Templates × learner state (level, focus misconception). Each question stores its answer AND
// "traps": the answer each misconception would produce, so wrong answers can be diagnosed.

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const show = (n) => (n < 0 ? `−${-n}` : `${n}`) // proper minus sign
const term = (a) => (a === 1 ? 'x' : `${a}x`)
const plus = (b) => (b >= 0 ? `+ ${b}` : `− ${-b}`)
const isInt = (n) => Number.isInteger(n)

// Which skill practises which misconception
export const SKILL_FOR = { M1: 'oneAdd', M2: 'oneMul', M3: 'twoStep' }

// Words for "do this to both sides"
export const opText = (op, n) =>
  ({ '+': `Add ${n} to both sides`, '−': `Subtract ${n} from both sides`, '÷': `Divide both sides by ${n}`, '×': `Multiply both sides by ${n}` })[op]

function cleanTraps(traps, answer) {
  const out = {}
  for (const [m, v] of Object.entries(traps)) if (isInt(v) && v !== answer) out[m] = v
  return out
}

// x + b = c  or  x − b = c
function oneAdd(level) {
  const x = level === 3 ? pick([rnd(1, 12), -rnd(1, 9)]) : rnd(1, 9)
  const b = rnd(2, 9) * (Math.random() < 0.5 ? 1 : -1)
  const c = x + b
  const undo = b > 0 ? ['−', b] : ['+', -b]
  const wrong = b > 0 ? ['+', b] : ['−', -b]
  return {
    skill: 'oneAdd', a: 1, b, c, x,
    expr: `x ${plus(b)} = ${show(c)}`,
    answer: x,
    traps: cleanTraps({ M1: c + b }, x), // moved b across without changing its sign
    stepAnswer: opText(...undo),
    stepTraps: { [opText(...wrong)]: 'M1' },
    steps: [`x ${plus(b)} = ${show(c)}`, opText(...undo), `x = ${show(x)}`],
    check: `${show(x)} ${plus(b)} = ${show(c)} ✓`,
  }
}

// a·x = c
function oneMul(level) {
  const a = rnd(2, level === 1 ? 6 : 9)
  const x = level === 3 ? pick([rnd(2, 9), -rnd(2, 9)]) : rnd(2, 9)
  const c = a * x
  return {
    skill: 'oneMul', a, b: 0, c, x,
    expr: `${term(a)} = ${show(c)}`,
    answer: x,
    traps: cleanTraps({ M2: c - a }, x), // "undoes" 3x by subtracting 3
    stepAnswer: opText('÷', a),
    stepTraps: { [opText('−', a)]: 'M2', [opText('×', a)]: 'M2' },
    steps: [`${term(a)} = ${show(c)}`, opText('÷', a), `x = ${show(x)}`],
    check: `${a} × ${show(x)} = ${show(c)} ✓`,
  }
}

// a·x + b = c
function twoStep(level) {
  const a = rnd(2, level === 3 ? 9 : 5)
  const x = level === 3 ? pick([rnd(1, 9), -rnd(1, 6)]) : rnd(1, 9)
  const b = rnd(1, 9) * (Math.random() < 0.6 ? 1 : -1)
  const c = a * x + b
  const undo = b > 0 ? ['−', b] : ['+', -b]
  const wrong = b > 0 ? ['+', b] : ['−', -b]
  return {
    skill: 'twoStep', a, b, c, x,
    expr: `${term(a)} ${plus(b)} = ${show(c)}`,
    answer: x,
    traps: cleanTraps({
      M1: (c + b) / a, // moved b without changing sign
      M3: c / a - b, // divided only some terms by a
      M2: c - b - a, // subtracted a instead of dividing
    }, x),
    stepAnswer: opText(...undo),
    stepTraps: { [opText(...wrong)]: 'M1', [opText('−', a)]: 'M2' },
    steps: [`${term(a)} ${plus(b)} = ${show(c)}`, opText(...undo), `${term(a)} = ${show(a * x)}`, opText('÷', a), `x = ${show(x)}`],
    check: `${a} × ${show(x)} ${plus(b)} = ${show(c)} ✓`,
  }
}

const MAKERS = { oneAdd, oneMul, twoStep }

// Find the mistake: a worked solution of ax + b = c in 2 numbered steps.
// Either no mistake, an M1 mistake in step 1 (sign not changed), or an M2 mistake in step 2 (subtracts a).
function makeFindStep(q, focus) {
  const { a, b, c } = q
  const undoWord = b > 0 ? `Subtract ${b} from both sides` : `Add ${-b} to both sides`
  const rhs1 = c - b // correct value of a·x
  const rhsM1 = c + b // sign not changed
  const step1 = `${undoWord} → ${term(a)} = ${show(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${show(rhs1)}`
  const step1M1 = `Move ${b > 0 ? '+ ' + b : '− ' + -b} to the other side → ${term(a)} = ${show(c)} ${b > 0 ? '+' : '−'} ${Math.abs(b)} = ${show(rhsM1)}`
  const step2 = (r) => `Divide both sides by ${a} → x = ${show(r)} ÷ ${a} = ${show(r / a)}`
  const step2M2 = (r) => `Remove the ${a} → x = ${show(r)} − ${a} = ${show(r - a)}`

  const canM1 = Number.isInteger(rhsM1 / a) && rhsM1 / a !== q.x
  let kind = focus === 'M1' && canM1 ? 'M1' : focus === 'M2' ? 'M2' : pick(canM1 ? ['none', 'M1', 'M2'] : ['none', 'M2'])
  if (kind === 'M1') q.solSteps = [step1M1, step2(rhsM1)]
  else if (kind === 'M2') q.solSteps = [step1, step2M2(rhs1)]
  else q.solSteps = [step1, step2(rhs1)]
  q.errorType = kind === 'none' ? null : kind
  q.errorStep = kind === 'M1' ? 1 : kind === 'M2' ? 2 : 0
  q.fix = kind === 'M1' ? `Step 1 is wrong. ${step1}, then ${step2(rhs1).charAt(0).toLowerCase() + step2(rhs1).slice(1)}.` : kind === 'M2' ? `Step 2 is wrong. ${step2(rhs1)}.` : `No mistake: both steps keep the balance.`
  q.text = `${pick(NAMES)} solved this. In which step is the mistake?`
  q.options = ['Step 1', 'Step 2', 'No mistake']
  q.trueValue = q.x
  q.answer = q.errorStep ? `Step ${q.errorStep}` : 'No mistake'
}

// Fill in the blanks: "To undo division by 4, we ____ both sides by __."
// parts: strings, with null where a blank goes (1st blank = operation, 2nd = number)
function makeBlank(q) {
  q.text = 'Fill in the blanks:'
  if (q.skill === 'oneMul' && Math.random() < 0.5) {
    // division variant: x ÷ a = c
    const a = q.a, c = q.x, x = a * c
    Object.assign(q, {
      expr: `x ÷ ${a} = ${show(c)}`, x, answer: x, traps: {},
      steps: [`x ÷ ${a} = ${show(c)}`, opText('×', a), `x = ${show(x)}`],
      check: `${show(x)} ÷ ${a} = ${show(c)} ✓`,
    })
    q.parts = [`To undo division by ${a}, we `, null, ' both sides by ', null, '.']
    q.blank = { verb: 'multiply', num: a, verbTraps: { divide: 'M2', subtract: 'M2', add: 'M2' } }
  } else if (q.skill === 'oneMul') {
    q.parts = [`To undo multiplying by ${q.a}, we `, null, ' both sides by ', null, '.']
    q.blank = { verb: 'divide', num: q.a, verbTraps: { subtract: 'M2', multiply: 'M2' } }
  } else {
    const first = q.skill === 'twoStep' ? 'First, t' : 'T'
    const b = q.b
    q.parts = [`${first}o undo "${b > 0 ? '+ ' + b : '− ' + -b}", we `, null, ' ', null, ' on both sides.']
    q.blank = b > 0
      ? { verb: 'subtract', num: b, verbTraps: { add: 'M1' } }
      : { verb: 'add', num: -b, verbTraps: { subtract: 'M1' } }
  }
  q.blankAnswer = q.parts.map((p, i) => (p === null ? (i === 1 ? q.blank.verb : q.blank.num) : p)).join('')
}
const NAMES = ['Aarav', 'Sana', 'Kabir', 'Meera', 'Rohan']

function mcqOptions(q) {
  const opts = new Set([q.answer, ...Object.values(q.traps)])
  while (opts.size < 4) opts.add(q.answer + pick([-3, -2, -1, 1, 2, 3]))
  return [...opts].slice(0, 4).sort(() => Math.random() - 0.5)
}

let counter = 0
// focus = misconception to target next (after an alternative explanation) or null
export function generateQuestion(level, focus = null) {
  const skills = level === 1 ? ['oneAdd', 'oneMul'] : ['oneAdd', 'oneMul', 'twoStep', 'twoStep']
  const skill = focus ? SKILL_FOR[focus] : pick(skills)
  let q = MAKERS[skill](level)
  // make sure a focus question can actually show its misconception
  for (let i = 0; focus && !q.traps[focus] && i < 10; i++) q = MAKERS[skill](level)

  q.id = `q${Date.now()}-${counter++}`
  q.level = level
  const formats =
    level === 1 ? ['numeric', 'step', 'mcq', 'blank'] :
    level === 2 ? ['numeric', 'mcq', 'step', 'blank', 'findstep'] :
    ['spot', 'check', 'numeric', 'findstep']
  q.format = pick(formats)
  if (q.format === 'mcq' || q.format === 'numeric') q.text = 'Solve for x:'

  if (q.format === 'mcq') q.options = mcqOptions(q)
  if (q.format === 'blank') makeBlank(q)
  if (q.format === 'findstep') {
    // needs a two-step equation; keep id/level/format
    if (q.skill !== 'twoStep') q = { ...twoStep(level), id: q.id, level, format: 'findstep' }
    makeFindStep(q, focus)
  }

  if (q.format === 'step') {
    q.text = 'What should we do to BOTH sides first?'
    q.options = [q.stepAnswer, ...Object.keys(q.stepTraps)].sort(() => Math.random() - 0.5)
  }

  if (q.format === 'spot' || q.format === 'check') {
    // A claimed solution: usually a misconception answer, sometimes the right one
    const trapVals = Object.values(q.traps)
    const claimed = trapVals.length && Math.random() < 0.7 ? pick(trapVals) : q.answer
    q.claimed = claimed
    q.who = pick(NAMES)
    q.text = q.format === 'spot'
      ? `${q.who} solved ${q.expr} and got x = ${show(claimed)}. Is ${q.who} right? Explain in one line.`
      : `Is x = ${show(claimed)} a solution of ${q.expr}? Put it back in and explain.`
    q.trueValue = q.answer
    q.answer = claimed === q.trueValue ? 'yes' : 'no'
    q.needsExplanation = true
  }
  return q
}
