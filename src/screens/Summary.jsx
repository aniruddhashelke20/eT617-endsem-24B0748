import { MISCONCEPTIONS } from '../lib/diagnose.js'

// Session summary: progress as skills and effort, not a percentage score (L5: low self-efficacy).
export default function Summary({ state, go }) {
  const tries = state.log.length
  const right = state.log.filter((e) => e.verdict === 'correct').length
  const fixed = Object.entries(state.counts).filter(([, n]) => n > 0)

  return (
    <section className="card">
      <h1>Today's progress{state.name ? `, ${state.name}` : ''}</h1>
      <ul className="steps">
        <li>You tried <strong>{tries}</strong> questions and got <strong>{right}</strong> right.</li>
        <li>You reached <strong>Level {state.level}</strong> of 3.</li>
        {fixed.map(([m, n]) => (
          <li key={m}>You worked on: <em>{MISCONCEPTIONS[m]}</em> ({n}×). Spotting this is how we fix it.</li>
        ))}
      </ul>
      <div className="box ok">Your place is saved. Next time, tap <strong>Continue where I stopped</strong>.</div>
      <button className="btn primary" onClick={() => go('practice')}>Keep practising</button>
      <button className="btn" onClick={() => go('welcome')}>Done for today</button>
    </section>
  )
}
