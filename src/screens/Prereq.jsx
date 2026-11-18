import { useState } from 'react'
import Balance from '../components/Balance.jsx'

// Prerequisite instruction: inverse (opposite) operations + the balance rule, with one check.
// Reached when an error is unrecognised, or the same misconception repeats after its alternative explanation.
const CHECK = { q: 'Which step undoes "× 4"?', options: ['Divide by 4', 'Subtract 4', 'Add 4'], answer: 'Divide by 4' }

export default function Prereq({ update }) {
  const [pick, setPick] = useState(null)
  const ok = pick === CHECK.answer

  return (
    <section className="card">
      <span className="badge">Refresher · 2 minutes</span>
      <h1>Opposite operations</h1>
      <ol className="steps">
        <li><mark>+ 5 is undone by − 5</mark>, and − 5 is undone by + 5.</li>
        <li><mark>× 3 is undone by ÷ 3</mark>, and ÷ 3 is undone by × 3.</li>
        <li>The balance rule: whatever you do, do it to <strong>both sides</strong>.</li>
      </ol>
      <Balance left="x + 5 − 5" right="12 − 5" label="Subtracting 5 from both sides keeps the balance" />

      <h2>Quick check</h2>
      <p>{CHECK.q}</p>
      <div role="radiogroup" aria-label="Options">
        {CHECK.options.map((o) => (
          <button key={o} role="radio" aria-checked={pick === o} className={`btn option ${pick === o ? 'selected' : ''}`} onClick={() => setPick(o)}>
            {pick === o ? '● ' : '○ '}{o}
          </button>
        ))}
      </div>
      {pick && (
        <div className={`box ${ok ? 'ok' : 'warn'}`} role="status">
          {ok ? '✓ Yes! × and ÷ undo each other. So 4x = 20 → divide both sides by 4 → x = 5.' : '↻ Not yet. 4x means 4 groups of x. To split into 4 equal groups, we divide.'}
        </div>
      )}
      <button className="btn primary" disabled={!ok} onClick={() => update({ screen: 'practice', current: null, feedback: null })}>
        Back to practice (easier level)
      </button>
    </section>
  )
}
