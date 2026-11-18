import { useState } from 'react'
import NumberLine from '../components/NumberLine.jsx'

// Concept explanation: conversational, one idea per step, key words highlighted.
const STEPS = [
  {
    title: 'The number line is a road',
    text: <>Let's stand on the road. <mark>Right = bigger</mark>, <mark>left = smaller</mark>. Zero is the middle.</>,
    nl: { start: 0, hops: [] },
  },
  {
    title: 'Step 1 · Adding a negative = walk LEFT',
    text: <>(−3) + (−5): start at −3. Adding −5 means <mark>5 steps left</mark>. We land on <strong>−8</strong>. Both moves go left, so the answer <mark>stays negative</mark>.</>,
    nl: { start: -3, hops: [{ from: -3, to: -8, label: '+ (−5)' }] },
  },
  {
    title: 'Step 2 · Subtracting = TURN AROUND',
    text: <>5 − (−3): start at 5. Subtracting means <mark>turn around</mark>. −3 points left, so after turning we walk <mark>3 steps right</mark>. We land on <strong>8</strong>.</>,
    nl: { start: 5, hops: [{ from: 5, to: 8, label: '− (−3)' }] },
  },
  {
    title: 'Step 3 · "Two minuses make a plus"?',
    text: <>That rule is for <mark>multiplying</mark>: (−3) × (−5) = 15. For adding, we just walk on the road. So (−3) + (−5) is <strong>−8</strong>, not 8.</>,
    nl: { start: -3, hops: [{ from: -3, to: -8, label: '+ (−5)' }] },
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
      <NumberLine min={-10} max={10} start={s.nl.start} hops={s.nl.hops} label={s.title} />
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
