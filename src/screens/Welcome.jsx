import { useState } from 'react'

// L5: anxious learner. Calm, private, no timer, no score on the first screen.
export default function Welcome({ state, update, go, reset }) {
  const [name, setName] = useState(state.name)
  const started = state.log.length > 0 || state.diagnostic

  return (
    <section className="card">
      <h1>Hi{state.name ? `, ${state.name}` : ''}! 👋</h1>
      <p>
        Let's practise <strong>solving equations like 2x + 3 = 11</strong> together, using a
        balance.  No timer. Mistakes are fine here — they show us what to practise next.
      </p>

      {!started && (
        <label className="field">
          Your first name (optional)
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
        </label>
      )}

      {started ? (
        <>
          <button className="btn primary" onClick={() => go(state.diagnostic ? 'practice' : 'diagnostic')}>
            Continue where I stopped
          </button>
          <button className="btn" onClick={reset}>Start over</button>
        </>
      ) : (
        <button className="btn primary" onClick={() => update({ name: name.trim(), screen: 'diagnostic' })}>
          Start (3 warm-up questions)
        </button>
      )}
    </section>
  )
}
