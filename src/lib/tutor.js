// THE ADAPTIVE DECISION RULE (P4 design challenge) — viva version
// Questions come in PAIRS of the same CONCEPT (skill): undoing + / −, undoing × / ÷, two-step equations.
// No right/wrong is shown after each answer; answers are just saved.
//  after the 1st question of a pair            -> ask a 2nd question of the SAME concept
//  after the 2nd: both wrong                   -> TEACH that concept
//        known misconception, not yet explained -> ALTERNATIVE explanation of that misconception
//        unrecognised, or already explained     -> PREREQUISITE lesson, easier level
//  after the 2nd: at least one right           -> no teaching, new question
//  LEVEL_UP correct answers in a row           -> HARDER level
export const LEVEL_UP = 6

export const CONCEPT = {
  oneAdd: 'Undoing + and −',
  oneMul: 'Undoing × and ÷',
  twoStep: 'Two-step equations',
}

export function decide(state, verdict, explained = true, skill = null) {
  const right = verdict === 'correct' && explained
  let streak = right ? state.streak + 1 : 0
  let level = state.level
  let levelled = false
  if (streak >= LEVEL_UP) {
    streak = 0
    if (level < 3) { level += 1; levelled = true } else return { move: 'mastered', patch: { streak, pair: null, retrySkill: null } }
  }
  const base = { streak, level }

  // 1st question of a pair: save it and ask another of the same concept
  if (!state.pair) {
    return { move: levelled ? 'harder' : 'pairNext', patch: { ...base, pair: { skill, first: verdict }, retrySkill: skill } }
  }

  // 2nd question of the pair
  const clear = { ...base, pair: null, retrySkill: null }
  const bothWrong = state.pair.first !== 'correct' && verdict !== 'correct'
  if (!bothWrong) return { move: levelled ? 'harder' : 'next', patch: { ...clear, focus: null } }

  const prev = state.pair.first
  const m = verdict !== 'unknown' ? verdict : prev !== 'unknown' ? prev : 'unknown'
  if (m !== 'unknown' && state.altShownFor !== m) {
    return { move: 'alternative', patch: { ...clear, streak: 0, focus: m, altShownFor: m } }
  }
  return {
    move: 'prerequisite',
    patch: { ...clear, streak: 0, level: Math.max(1, state.level - 1), altShownFor: null, focus: m === 'unknown' ? null : m },
  }
}

// Short neutral notes shown on the next question (no right/wrong)
export const MOVE_NOTE = {
  pairNext: 'Answer saved. Here is one more on the same idea.',
  next: 'Answer saved. On to a new question.',
  harder: `Level up! ${LEVEL_UP} in a row — the questions get a bit harder now.`,
}

export const MOVE_REASON = {
  alternative: 'Both answers on this idea matched a common mix-up, so here is another way to see it.',
  prerequisite: 'Both answers on this idea were not right yet, so let us warm up one basic idea first.',
  mastered: 'You cleared the top level!',
}
