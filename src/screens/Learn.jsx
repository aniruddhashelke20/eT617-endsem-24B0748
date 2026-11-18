import { useState } from 'react'
import Balance from '../components/Balance.jsx'

// Concept explanation: conversational, one idea per step, key words highlighted.
const STEPS = [
  {
    title: 'An equation is a balance',
    text: <>x + 5 = 12 means: the left side <mark>weighs the same</mark> as the right side. Our job is to find x <mark>without breaking the balance</mark>.</>,
    bal: { left: 'x + 5', right: '12' },
  },
  {
    title: 'Step 1 · Undo adding by subtracting',
    text: <>To get x alone, remove the 5. The opposite of +5 is −5, so we <mark>subtract 5 from BOTH sides</mark>: x = 12 − 5 = <strong>7</strong>. (Not 17! Adding 5 would make it heavier.)</>,
    bal: { left: 'x', right: '7' },
  },
  {
    title: 'Step 2 · Undo times by dividing',
    text: <>3x = 12 means <mark>3 groups of x</mark> make 12. Share 12 into 3 groups: <mark>divide BOTH sides by 3</mark>, so x = <strong>4</strong>. (Subtracting 3 gives 9 — but 3 × 9 is 27, not 12.)</>,
    bal: { left: '3x', right: '12' },
  },
  {
    title: 'Step 3 · Two steps: number first, then divide',
    text: <>2x + 3 = 11. First: subtract 3 from both sides → 2x = 8. Then: divide both sides by 2 → x = <strong>4</strong>. <mark>Always check</mark>: 2 × 4 + 3 = 11 ✓ balanced.</>,
    bal: { left: '2 × 4 + 3', right: '11' },
  },
]

export default function Learn({ go, update }) {
  const [i, setI] = useState(0)
  const s = STEPS[i]
  return (
    <section className="card">
      <p className="muted">Quick idea {i + 1} of {STEPS.length}</p>
      <h1>{s.title}</h1>
      <p>{s.text}</p>
      <Balance left={s.bal.left} right={s.bal.right} />
      <div className="row">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
        {i < STEPS.length - 1 ? (
          <button className="btn primary" onClick={() => setI(i + 1)}>Next</button>
        ) : (
          <button className="btn primary" onClick={() => { update({ current: null }); go('practice') }}>Let's practise</button>
        )}
      </div>
    </section>
  )
}
