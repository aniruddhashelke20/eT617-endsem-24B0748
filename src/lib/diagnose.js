// Diagnosis: correct, a known misconception (M1/M2/M3), or an unrecognised error.
// Plus the rule-based checker for one-line explanations (reviewed by the teacher, C5).
import { show } from './generator.js'

export const MISCONCEPTIONS = {
  M1: 'Moves a number across "=" without changing its sign (x + 5 = 12 → x = 17)',
  M2: 'Undoes "times" or "divide" with the wrong operation (3x = 12 → x = 9)',
  M3: 'Divides only some terms (2x + 4 = 10 → x + 4 = 5)',
}

// Accept "-8", "−8", "x = 8", " 8 "
// "divided", "Divide", "share" -> 'divide' etc.
export function normVerb(v = '') {
  const t = String(v).toLowerCase()
  if (/divid|share/.test(t)) return 'divide'
  if (/multipl|times/.test(t)) return 'multiply'
  if (/subtract|minus|take|remov|less/.test(t)) return 'subtract'
  if (/add|plus|sum/.test(t)) return 'add'
  return t.trim()
}

export function parseNum(v) {
  const s = String(v ?? '').trim().replace(/[−–]/g, '-').replace(/^x\s*=\s*/i, '')
  const n = Number(s)
  return s !== '' && Number.isFinite(n) ? n : null
}

// response = { value } for numeric/mcq/step, { choice, text } for spot/check
export function diagnose(q, response) {
  if (q.format === 'spot' || q.format === 'check') {
    if (response.choice === q.answer) return 'correct'
    // Accepting a misconception's answer reveals that misconception
    const hit = Object.entries(q.traps).find(([, v]) => v === q.claimed)
    return response.choice === 'yes' && hit ? hit[0] : 'unknown'
  }
  if (q.format === 'findstep') {
    if (response.value === q.answer) return 'correct'
    // Saying "No mistake" to a misconception step means she accepts that move
    return response.value === 'No mistake' && q.errorType ? q.errorType : 'unknown'
  }
  if (q.format === 'blank') {
    const verb = normVerb(response.verb)
    if (verb === q.blank.verb && parseNum(response.num) === q.blank.num) return 'correct'
    if (verb !== q.blank.verb) return q.blank.verbTraps[verb] ?? 'unknown'
    return 'unknown' // right operation, wrong number
  }
  if (q.format === 'step') {
    if (response.value === q.stepAnswer) return 'correct'
    return q.stepTraps[response.value] ?? 'unknown'
  }
  const v = parseNum(response.value)
  if (v === q.trueValue || v === q.answer) return 'correct'
  const hit = Object.entries(q.traps).find(([, t]) => t === v)
  return hit ? hit[0] : 'unknown'
}

// Worked solution in words, with the substitution check
export function solutionText(q) {
  return `${q.steps.join('  →  ')}. Check: ${q.check}`
}

// What a wrong value gives when put back in (shows the balance is broken)
export function backCheck(q, v) {
  const lhs = q.a * v + q.b
  return `${q.a === 1 ? '' : q.a + ' × '}${show(v)}${q.b ? (q.b > 0 ? ' + ' + q.b : ' − ' + -q.b) : ''} = ${show(lhs)}, not ${show(q.c)}`
}

// Alternative explanations, one per misconception
export function alternativeFor(m, q) {
  const b = q.b || 5
  const bTxt = b > 0 ? `+ ${b}` : `− ${-b}`
  const undo = b > 0 ? `subtract ${b}` : `add ${-b}`
  const a = q.a > 1 ? q.a : 3
  if (m === 'M1')
    return {
      title: 'Keep the balance: do the OPPOSITE to both sides',
      body: [
        `An equation is a balance. Whatever we do to one side, we do to the other.`,
        `To remove "${bTxt}", we ${undo} (the opposite) on BOTH sides. "Change side, change sign" is a short way of saying this.`,
        solutionText(q),
      ],
    }
  if (m === 'M2' && q.expr.includes('÷'))
    return {
      title: `÷ ${q.a} is undone by × ${q.a}`,
      body: [
        `${q.expr} means: x was shared into ${q.a} equal groups, and each group is ${show(q.x / q.a)}.`,
        `To get the whole x back, put the ${q.a} groups together: multiply both sides by ${q.a}.`,
        solutionText(q),
      ],
    }
  if (m === 'M2')
    return {
      title: `${a}x means ${a} TIMES x — undo times with divide`,
      body: [
        `${a}x means ${a} equal groups of x. To find one group, we share (divide) by ${a} on both sides.`,
        `Subtracting ${a} only takes away ${a}; it does not split into ${a} groups.`,
        solutionText(q),
      ],
    }
  return {
    title: 'Divide EVERY term — or remove the number first',
    body: [
      `If you divide, divide everything: 2x + 4 = 10 → x + 2 = 5 (not x + 4 = 5).`,
      `Easier way: first remove the number (subtract 4 from both sides), then divide.`,
      solutionText(q),
    ],
  }
}

// Explanation checker (the automated check that the teacher reviews — C5).
// It reads the learner's own reason and checks the steps of a substitution check:
//   1. did they put the claimed x back in?  2. is their left-side value right?
//   3. did they compare with the right side?  4. does the reason agree with their Yes/No?
// Solving the equation themselves (correct x + an operation) also counts as a good reason.
// Feedback is built from what they actually wrote, point by point.
export function checkExplanation(q, text = '', choice = null) {
  const t = text.toLowerCase().replace(/[−–]/g, '-').replace(/×|\*/g, ' x ')
  if (t.trim().length === 0)
    return { quality: 'unclear', points: [], feedback: `↻ No reason yet. Try: "put x = ${show(q.claimed)} back in: … = …, so it balances / does not balance".` }

  const nums = (t.match(/-?\d+/g) || []).map(Number)
  const has = (n) => nums.includes(n)
  const lhs = q.a * q.claimed + q.b
  const leftWithX = `${q.a === 1 ? '' : q.a + ' × '}${show(q.claimed)}${q.b ? (q.b > 0 ? ' + ' + q.b : ' − ' + -q.b) : ''}`

  const usedClaim = has(q.claimed) || /put .*(back|in)|substitut|plug|replace/.test(t)
  const lhsRight = has(lhs)
  const compared = has(q.c) || /balanc|equal|same|≠|!=|not|n't/.test(t)
  // Giving the correct x (when the claim is wrong) is itself a valid reason: "No, x should be 4".
  // If that number also appears in the equation (e.g. 4x = 16, x = 4), require "x = 4" / "x is 4" or an operation word.
  const tv = q.trueValue
  const statesX = new RegExp(`(x|answer|it'?s|it)\\s*(=|is|should be|must be|will be|comes to|equals)?\\s*${tv}(?![0-9])`).test(t)
  const ambiguous = [q.a, q.b, q.c, q.claimed].includes(tv)
  const solved = tv !== q.claimed && has(tv) &&
    (statesX || !ambiguous || /subtract|minus|add|plus|divid|multipl|both sides|opposite/.test(t))
  // conclusion words, incl. "satisfies / doesn't satisfy the equation"
  const saysNo = /not|n't|nt\b|≠|!=|wrong|unequal|false|invalid|\bno\b/.test(t)
  const saysYes = /satisf|works|holds|true|valid|balanc|equal|same|correct|right|\byes\b/.test(t) && !saysNo
  const disagrees = (choice === 'no' && saysYes) || (choice === 'yes' && saysNo)

  const points = []
  // A conclusion without working: credit the idea, then show the working
  if (!usedClaim && !solved && (saysYes || saysNo) && !disagrees) {
    const claimTrue = saysNo === (q.claimed !== q.trueValue)
    const said = `You said x = ${show(q.claimed)} ${saysNo ? 'does not satisfy' : 'satisfies'} the equation`
    points.push(claimTrue ? `✓ ${said} — right idea. Now show it:` : `↻ ${said} — let us test that:`)
  }
  if (solved) points.push(`✓ You solved it yourself and got x = ${show(q.trueValue)} — that is a good reason.`)
  if (usedClaim) points.push(`✓ You put x = ${show(q.claimed)} back in.`)
  else if (!solved) points.push(`↻ Put x = ${show(q.claimed)} back in: ${leftWithX} = ${show(lhs)}.`)
  if (usedClaim && lhsRight) points.push(`✓ Left side: ${leftWithX} = ${show(lhs)}.`)
  else if (usedClaim) points.push(`↻ Check the left side: ${leftWithX} = ${show(lhs)}.`)
  if (compared && (usedClaim || solved)) points.push(`✓ You compared it with the right side (${show(q.c)}).`)
  else if (!solved) points.push(`↻ Compare it with the right side, ${show(q.c)}: ${lhs === q.c ? 'equal, so it balances' : 'not equal, so it does not balance'}.`)
  if (disagrees) points.push('↻ Your reason and your Yes/No answer do not agree — read it again.')

  const good = !disagrees && (solved || (usedClaim && lhsRight && compared))
  const some = points.some((p) => p.startsWith('✓'))
  if (good) return { quality: 'strong', points, feedback: '✓ Good reasoning!' }
  return {
    quality: some ? 'partial' : 'unclear',
    points,
    feedback: points.join('\n'),
  }
}
