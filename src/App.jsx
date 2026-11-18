import { useEffect, useState } from 'react'
import { loadState, saveState, clearState, initialState } from './lib/storage.js'
import Welcome from './screens/Welcome.jsx'
import About from './screens/About.jsx'
import Learn from './screens/Learn.jsx'
import Practice from './screens/Practice.jsx'
import Feedback from './screens/Feedback.jsx'
import Diagnostic from './screens/Diagnostic.jsx'
import Prereq from './screens/Prereq.jsx'
import Summary from './screens/Summary.jsx'
import Teacher from './screens/Teacher.jsx'

import { ROLL } from './lib/config.js'

// Simple screen state machine: state.screen decides what is shown.
// Every change is saved, so the learner can close the phone and resume.
export default function App() {
  const [state, setState] = useState(loadState)
  useEffect(() => saveState(state), [state])

  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  const go = (screen) => update({ screen })
  const reset = () => {
    clearState()
    setState(initialState)
  }

  const props = { state, update, go, reset }
  const screens = {
    welcome: <Welcome {...props} />,
    about: <About {...props} />,
    learn: <Learn {...props} />,
    practice: <Practice {...props} />,
    feedback: <Feedback {...props} />,
    diagnostic: <Diagnostic {...props} />,
    prereq: <Prereq {...props} />,
    summary: <Summary {...props} />,
    teacher: <Teacher {...props} />,
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('welcome')} aria-label="Home">
          <span aria-hidden="true">➖➕</span> Number Line Buddy
        </button>
        <nav aria-label="Main">
          <button className="link" onClick={() => go('teacher')}>Teacher</button>
          <button className="link" onClick={() => go('about')}>About</button>
        </nav>
      </header>
      <main id="main">{screens[state.screen] ?? screens.welcome}</main>
      <footer className="footer">
        ET 617 End-Sem · <strong>{ROLL}</strong> · P4 Adaptive tutor · Integers (Cl. 7)
      </footer>
    </div>
  )
}
