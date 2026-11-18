// Encouraging messages for an anxious learner (L5). Mistakes are framed as normal and useful,
// praise goes to effort and strategy (not "being smart"), and progress she has already made is named.
const FIRST_MIXUP = [
  'This is one of the most common mix-ups in Class 8. Spotting it is how we fix it.',
  'Lots of students make exactly this move. You are in good company — let us untangle it.',
  'Good try! Your answer shows us exactly which idea to practise.',
]
const AGAIN = [
  'This one is tricky, and you are sticking with it. That is what matters.',
  'No rush. We will build it one small step at a time.',
  'Mistakes are part of learning. Every try makes the next one easier.',
]
const OTHER = [
  'Not this time — and that is okay. Let us look at it together.',
  'Every mistake tells us what to practise next. You have got this.',
  'Take a breath. You know more than you think.',
]
const COMEBACK = [
  'You fixed it! Getting it right after a mistake is exactly how learning works.',
  'Look at that — you came back and got it. Well done for not giving up.',
]

const pickBy = (arr, id) => arr[[...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0) % arr.length]

export function encouragement({ verdict, move, log, id }) {
  const prev = log[log.length - 2] // log already includes this attempt
  const solved = log.filter((e) => e.verdict === 'correct').length
  if (verdict === 'correct') {
    if (prev && prev.verdict !== 'correct') return pickBy(COMEBACK, id)
    return null
  }
  const line =
    move === 'alternative' ? pickBy(FIRST_MIXUP, id) :
    move === 'prerequisite' && verdict !== 'unknown' ? pickBy(AGAIN, id) :
    pickBy(OTHER, id)
  return solved > 0 ? `${line} You have already solved ${solved} today.` : line
}
