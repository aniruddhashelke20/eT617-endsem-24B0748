// Diagnosis: correct, a known misconception (M1/M2/M3), or an unrecognised error.
// Plus the rule-based checker for one-line explanations (reviewed by the teacher, C5).
import { show } from './generator.js'

export const MISCONCEPTIONS = {
  M1: 'Moves a number across "=" without changing its sign (x + 5 = 12 → x = 17)',
  M2: 'Undoes "times" by subtracting (3x = 12 → x = 9)',
  M3: 'Divides only some terms (2x + 4 = 10 → x + 4 = 5)',
}

// Accept "-8", "−8", "x = 8", " 8 "
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
  if (m === 'M1')
    return {
      title: 'Keep the balance: do the OPPOSITE to both sides',
      body: [
        `An equation is a balance. Whatever we do to one side, we do to the other.`,
        `To remove "+ 5", we subtract 5 (the opposite), on both sides. "Change side, change sign" is a short way of saying this.`,
        solutionText(q),
      ],
    }
  if (m === 'M2')
    return {
      title: '3x means 3 TIMES x — undo times with divide',
      body: [
        `3x = 12 means 3 groups of x make 12. Sharing 12 into 3 equal groups gives x = 4.`,
        `Subtracting 3 would only take away 3, not split into 3 groups.`,
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

// Rule-based explanation checker (the automated "AI" check that the teacher reviews)
export function checkExplanation(q, text = '') {
  const t = text.toLowerCase().replace(/[−–]/g, '-')
  if (t.trim().length < 4)
    return { quality: 'unclear', feedback: 'Try adding a short "why" — even 4 or 5 words is enough.' }

  const idea = /both sides|balance|opposite|inverse|undo|substitut|put .*(back|in)|plug|check|lhs|rhs|left side|right side/.test(t)
  const op = /subtract|minus|add|plus|divid|multipl|times|share|groups?/.test(t)
  const target = q.trueValue ?? q.answer
  const num = String(Math.abs(target))
  const mentionsValue = new RegExp(`(^|[^0-9])${num}([^0-9]|$)`).test(t)

  const working = /\d\s*(=|is|gives|makes)\s*-?\d/.test(t) // e.g. "2*9+3 = 21"
  const score = (idea ? 1 : 0) + (op || mentionsValue || working ? 1 : 0)
  if (score >= 2) return { quality: 'strong', feedback: 'Clear reason — you used the balance idea (same step on both sides / put the answer back).' }
  if (score === 1) return { quality: 'partial', feedback: 'Good start. Add which step you did to BOTH sides, or put x back in to check.' }
  return { quality: 'unclear', feedback: 'I could not see a reason. Try: "put x = … back in: … = …, so it balances / does not balance".' }
}
