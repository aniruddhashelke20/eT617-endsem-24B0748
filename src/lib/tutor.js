// THE ADAPTIVE DECISION RULE (P4 design challenge) — viva version
// Questions belong to CONCEPTS (skill): undoing + / −, undoing × / ÷, two-step equations.
//  correct, LEVEL_UP in a row                 -> HARDER question (level up)
//  1st wrong on a concept                     -> RETRY: one more question of the SAME concept, no teaching yet
//  retry correct                              -> carry on, no teaching (it was a slip)
//  retry wrong too (2 wrong on that concept)  -> TEACH that concept:
//        known misconception, not yet explained -> ALTERNATIVE explanation of that misconception
//        unrecognised, or already explained     -> PREREQUISITE lesson, easier level
export const LEVEL_UP = 6

export const CONCEPT = {
  oneAdd: 'Undoing + and −',
  oneMul: 'Undoing × and ÷',
  twoStep: 'Two-step equations',
}

export function decide(state, verdict, explained = true, skill = null) {
  const retry = state.retry // { skill, verdict } after a first wrong answer, else null

  if (verdict === 'correct') {
    const streak = explained ? state.streak + 1 : state.streak
    const base = { retry: null, retrySkill: null }
    if (streak >= LEVEL_UP) {
      if (state.level >= 3) return { move: 'mastered', patch: { ...base, streak: 0, focus: null, altShownFor: null } }
      return { move: 'harder', patch: { ...base, level: state.level + 1, streak: 0, focus: null, altShownFor: null } }
    }
    return { move: retry ? 'recovered' : 'next', patch: { ...base, streak, focus: null } }
  }

  // First wrong answer on this concept: ask one more of the same concept before teaching
  if (!retry) {
    return { move: 'retry', patch: { streak: 0, retry: { skill, verdict }, retrySkill: skill } }
  }

  // Second wrong answer on the same concept -> teach it
  const m = verdict !== 'unknown' ? verdict : retry.verdict !== 'unknown' ? retry.verdict : 'unknown'
  const clear = { streak: 0, retry: null, retrySkill: null }
  if (m !== 'unknown' && state.altShownFor !== m) {
    return { move: 'alternative', patch: { ...clear, focus: m, altShownFor: m } }
  }
  return {
    move: 'prerequisite',
    patch: { ...clear, level: Math.max(1, state.level - 1), altShownFor: null, focus: m === 'unknown' ? null : m },
  }
}

export const MOVE_REASON = {
  next: `Keep going — ${LEVEL_UP} correct in a row moves you up a level.`,
  recovered: 'You got the second one right, so that first one was just a slip. No lesson needed!',
  retry: 'One mistake is okay. Let us try one more of the same kind before changing anything.',
  harder: `You got ${LEVEL_UP} in a row right, so the next questions are a bit harder.`,
  mastered: 'You cleared the top level!',
  alternative: 'Two answers on this idea matched a common mix-up, so here is another way to see it.',
  prerequisite: 'Two answers on this idea were not right yet, so let us warm up one basic idea first.',
}
