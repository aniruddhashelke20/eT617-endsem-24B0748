import { useState } from 'react'
import NumberLine from '../components/NumberLine.jsx'

// Prerequisite instruction: opposites and direction on the number line, with one check.
// Reached when an error is unrecognised or the same misconception repeats after its alternative explanation.
export default function Prereq({ update }) {
  const [pick, setPick] = useState(null)
  const [checked, setChecked] = useState(false)
  const ok = pick === 4

  return (
    <section className="card">
      <span className="badge">Refresher · 2 minutes</span>
      <h1>Opposites and directions</h1>
      <ol className="steps">
        <li><mark>3 and −3 are opposites</mark>: same distance from 0, on different sides.</li>
        <li>A <strong>+</strong> sign means: keep facing the way the number points.</li>
        <li>A <strong>−</strong> sign means: <mark>turn around</mark>. So − (−4) points RIGHT, like +4.</li>
      </ol>
      <NumberLine min={-6} max={6} start={0} hops={[{ from: 0, to: 3, label: '3' }, { from: 0, to: -3, label: '−3' }]} label="3 and minus 3 are the same distance from zero" />

      <h2>Quick check</h2>
      <p>Turn −4 around. Where does it point? Tap the number line.</p>
      <NumberLine min={-6} max={6} start={0} value={pick} onPick={(n) => { setPick(n); setChecked(false) }} label="Pick the opposite of minus 4" />
      <button className="btn" disabled={pick === null} onClick={() => setChecked(true)}>Check</button>
      {checked && (
        <div className={`box ${ok ? 'ok' : 'warn'}`} role="status">
          {ok ? '✓ Yes! The opposite of −4 is 4. That is why − (−4) is the same as + 4.' : '↻ Not yet. −4 is 4 steps LEFT of 0. Turned around, it is 4 steps RIGHT.'}
        </div>
      )}
      <button className="btn primary" disabled={!ok || !checked} onClick={() => update({ screen: 'practice', current: null, feedback: null })}>
        Back to practice (easier level)
      </button>
    </section>
  )
}
