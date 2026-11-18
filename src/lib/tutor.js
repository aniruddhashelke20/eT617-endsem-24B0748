// THE ADAPTIVE DECISION RULE (P4 design challenge)
//  correct (+ explained if asked), 2 in a row  -> HARDER question (level up)
//  wrong, matches a known misconception (1st)   -> ALTERNATIVE explanation of that misconception
//  wrong, unrecognised, OR same misconception again after its alternative -> PREREQUISITE lesson
export function decide(state, verdict, explained = true) {
  if (verdict === 'correct') {
    const streak = explained ? state.streak + 1 : state.streak
    if (streak >= 2) {
      if (state.level >= 3) return { move: 'mastered', patch: { streak: 0, focus: null, altShownFor: null } }
      return { move: 'harder', patch: { level: state.level + 1, streak: 0, focus: null, altShownFor: null } }
    }
    return { move: 'next', patch: { streak, focus: null } }
  }

  if (verdict !== 'unknown' && state.altShownFor !== verdict) {
    return { move: 'alternative', patch: { streak: 0, focus: verdict, altShownFor: verdict } }
  }

  return {
    move: 'prerequisite',
    patch: { streak: 0, level: Math.max(1, state.level - 1), altShownFor: null, focus: verdict === 'unknown' ? null : verdict },
  }
}

export const MOVE_REASON = {
  next: 'One more at this level — 2 correct in a row moves you up.',
  harder: 'You got 2 in a row right, so the next question is a bit harder.',
  mastered: 'You cleared the top level!',
  alternative: 'Your answer matched a common mix-up, so here is another way to see it.',
  prerequisite: 'Let us warm up one basic idea first, then try again at an easier level.',
}
