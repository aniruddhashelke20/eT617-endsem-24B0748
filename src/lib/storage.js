// All learner + teacher data lives in one localStorage object (no backend).
const KEY = 'balance-buddy-v1'

export const initialState = {
  screen: 'welcome',
  name: '',
  level: 1, // 1 = one-step, 2 = two-step, 3 = check / spot-the-error
  streak: 0, // correct answers in a row at this level
  current: null, // the question on screen
  feedback: null, // last feedback shown
  lastMove: null, // 'harder' | 'alternative' | 'prerequisite'
  focus: null, // misconception to target next
  altShownFor: null, // misconception that already got an alternative explanation
  hintsInRow: 0,
  diagnostic: null, // { score, confidence, startLevel }
  counts: { M1: 0, M2: 0, M3: 0 },
  log: [], // every attempt, used by the teacher view
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    return initialState
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked: app still works for this session */
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
