// THE ADAPTIVE DECISION RULE (P4 design challenge) — viva version
// Questions come in PAIRS on the same CONCEPT (skill): undoing + / −, undoing × / ÷, two-step equations.
// Both questions are answered on one screen and submitted together.
//  both wrong   -> TEACH that concept:
//                    known misconception, not yet explained -> ALTERNATIVE explanation of that misconception
//                    unrecognised, or already explained     -> PREREQUISITE lesson, easier level
//  1 or 0 wrong -> just show the results, no lesson
//  LEVEL_UP correct answers in a row (counted across pairs) -> HARDER level
export const LEVEL_UP = 6

export const CONCEPT = {
  oneAdd: 'Undoing + and −',
  oneMul: 'Undoing × and ÷',
  twoStep: 'Two-step equations',
}

// verdicts: ['correct' | 'M1' | 'M2' | 'M3' | 'unknown', …] for the 2 questions
// explained: [true/false, …] — a right Yes/No with no real reason does not count as right
export function decidePair(state, verdicts, explained) {
  let streak = state.streak
  let level = state.level
  let levelled = false
  verdicts.forEach((v, i) => {
    streak = v === 'correct' && explained[i] ? streak + 1 : 0
    if (streak >= LEVEL_UP) {
      streak = 0
      if (level < 3) { level += 1; levelled = true }
    }
  })
  const bothWrong = verdicts.every((v) => v !== 'correct')

  if (!bothWrong) {
    const mastered = state.level === 3 && verdicts.every((v) => v === 'correct') && state.streak + 2 >= LEVEL_UP
    return { move: mastered ? 'mastered' : levelled ? 'harder' : 'results', patch: { streak, level, focus: null } }
  }

  // Both wrong: teach. Prefer a recognised misconception from either answer (latest first).
  const m = [...verdicts].reverse().find((v) => v !== 'unknown') ?? 'unknown'
  if (m !== 'unknown' && state.altShownFor !== m) {
    return { move: 'alternative', misconception: m, patch: { streak: 0, focus: m, altShownFor: m } }
  }
  return {
    move: 'prerequisite',
    misconception: m,
    patch: { streak: 0, level: Math.max(1, state.level - 1), altShownFor: null, focus: m === 'unknown' ? null : m },
  }
}

export const MOVE_REASON = {
  results: 'At least one answer was right, so we keep going. A new pair is next.',
  harder: `Level up! ${LEVEL_UP} right in a row — the next questions are a bit harder.`,
  mastered: 'You cleared the top level!',
  alternative: 'Both answers on this idea matched a common mix-up, so here is another way to see it.',
  prerequisite: 'Both answers on this idea were not right yet, so let us warm up one basic idea first.',
}
