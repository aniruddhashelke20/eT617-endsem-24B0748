// Diagnosis: is the answer correct, a known misconception, or an unrecognised error?
// Also a rule-based checker for the learner's one-line explanations.
import { show } from './generator.js'

export const MISCONCEPTIONS = {
  M1: 'Two negatives make a positive (used in adding)',
  M2: 'Ignores the sign of the number being subtracted',
  M3: 'Thinks −7 > −2 because 7 > 2',
}

// Accept "-8", "−8", "–8", " 8 "
export function parseNum(v) {
  const n = Number(String(v).trim().replace(/[−–]/g, '-'))
  return Number.isFinite(n) && String(v).trim() !== '' ? n : null
}

const sign = (n) => (n > 0 ? 'positive' : n < 0 ? 'negative' : 'zero')

// response = { value } for numeric/mcq/numberline, { choice, text } for spot/predict
export function diagnose(q, response) {
  if (q.format === 'spot') {
    if (response.choice === q.answer) return 'correct'
    // Agreeing with a classmate's misconception answer reveals the misconception
    const hit = Object.entries(q.traps).find(([, v]) => v === q.claimed)
    return response.choice === 'yes' && hit ? hit[0] : 'unknown'
  }
  if (q.format === 'predict') {
    if (response.choice === q.answer) return 'correct'
    const hit = Object.entries(q.traps).find(([, v]) => sign(v) === response.choice)
    return hit ? hit[0] : 'unknown'
  }
  const v = parseNum(response.value)
  if (v === q.answer) return 'correct'
  const hit = Object.entries(q.traps).find(([, t]) => t === v)
  return hit ? hit[0] : 'unknown'
}

// "Walk" on the number line in words — used in all feedback
export function walkText(q) {
  const target = q.trueValue ?? q.answer
  if (q.skill === 'compare') return `On the number line, ${show(q.answer)} is further RIGHT, so it is greater.`
  const start = `Start at ${show(q.a)}.`
  if (q.op === '+') {
    const dir = q.b < 0 ? 'LEFT' : 'RIGHT'
    return `${start} Adding ${show(q.b)} means ${Math.abs(q.b)} steps ${dir}. You land on ${show(target)}.`
  }
  return `${start} Subtracting ${show(q.b)} means turn around: ${Math.abs(q.b)} steps RIGHT. You land on ${show(target)}.`
}

// Alternative explanations, one per misconception
export function alternativeFor(m, q) {
  if (m === 'M1')
    return {
      title: '"Two minuses make a plus" is a multiplying rule',
      body: [
        `(−3) × (−5) = 15 is multiplication. Adding is different.`,
        `When you add a negative, you move LEFT. Both numbers are on the left side, so you go further left.`,
        walkText(q),
      ],
    }
  if (m === 'M2')
    return {
      title: 'Subtracting a negative = turn around',
      body: [
        `Minus sign in front = face the other way. A negative number points LEFT, so after turning, you walk RIGHT.`,
        `That is why taking away a negative makes the answer bigger.`,
        walkText(q),
      ],
    }
  return {
    title: 'Further right means greater',
    body: [
      `Think of temperature: −2 °C is warmer than −7 °C.`,
      `On a number line, the number further right is always greater, even if its digit looks smaller.`,
      walkText(q),
    ],
  }
}

// Rule-based explanation checker (the "AI" check that the teacher reviews — C5)
export function checkExplanation(q, text = '') {
  const t = text.toLowerCase().replace(/[−–]/g, '-')
  if (t.trim().length < 4)
    return { quality: 'unclear', feedback: 'Try adding a short "why" — even 4 or 5 words is enough.' }

  const direction = /left|right|back|turn|move|step|walk|jump|number ?line/.test(t)
  const rule = /opposite|both (are )?negative|stays? negative|multipl|times|bigger|larger|greater|more than|further|add(ing)? (the )?positive|plus/.test(t)
  const target = q.trueValue ?? q.answer
  const mentionsValue = typeof target === 'number' && new RegExp(`(^|[^0-9])${String(target).replace('-', '-\\s?')}([^0-9]|$)`).test(t)
  const m1Phrase = /(two|2) (minus|negative)(es|s)? (make|makes|=|is|give)/.test(t) && !/multipl|times/.test(t)

  if (m1Phrase)
    return {
      quality: 'unclear',
      flag: 'M1',
      feedback: 'Careful: "two minuses make a plus" is for multiplying. Try explaining with left/right moves.',
    }
  const score = (direction || rule ? 1 : 0) + (mentionsValue || (direction && rule) ? 1 : 0)
  if (score >= 2) return { quality: 'strong', feedback: 'Clear reason — you used the idea of moving on the number line.' }
  if (score === 1) return { quality: 'partial', feedback: 'Good start. Can you add which way you move, or what the answer is?' }
  return { quality: 'unclear', feedback: 'I could not see a reason. Try: "start at …, move … steps left/right".' }
}
