import { useState } from 'react'
import { show } from '../lib/generator.js'

// Profile adaptivity: 3 fixed warm-up items + a confidence check decide the start level
// and which misconception to focus on first. Each wrong option is a known misconception.
const ITEMS = [
  { expr: '(−2) + (−4)', options: [-6, 6, -2], answer: -6, traps: { 6: 'M1' } },
  { expr: '6 − (−2)', options: [4, 8, -8], answer: 8, traps: { 4: 'M2' } },
  { expr: 'Which is greater: −3 or −8?', options: [-3, -8], answer: -3, traps: { '-8': 'M3' } },
]
const FEELINGS = [
  { id: 'low', label: '😟 Worried' },
  { id: 'mid', label: '😐 A bit unsure' },
  { id: 'high', label: '🙂 Okay' },
]

export default function Diagnostic({ state, update }) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState([])

  function answer(o) {
    const next = [...answers, o]
    setAnswers(next)
    setI(i + 1)
  }

  function finish(confidence) {
    const score = answers.filter((a, k) => a === ITEMS[k].answer).length
    const found = answers.map((a, k) => ITEMS[k].traps[a]).filter(Boolean)
    const startLevel = score === 3 && confidence !== 'low' ? 2 : 1
    update({
      diagnostic: { score, confidence, found, startLevel },
      level: startLevel,
      focus: found[0] ?? null,
      // Low confidence or any mistake -> see the short explanation first
      screen: score === 3 && confidence === 'high' ? 'practice' : 'learn',
    })
  }

  if (i < ITEMS.length) {
    const it = ITEMS[i]
    return (
      <section className="card">
        <p className="muted">Warm-up {i + 1} of 3 · not marked, just helps me choose your start</p>
        <h1 className="question"><span className="expr">{it.expr}</span></h1>
        <div className="options">
          {it.options.map((o) => (
            <button key={o} className="btn option" onClick={() => answer(o)}>{show(o)}</button>
          ))}
        </div>
        <button className="btn" onClick={() => answer(null)}>I'm not sure</button>
      </section>
    )
  }

  return (
    <section className="card">
      <h1>Thanks{state.name ? `, ${state.name}` : ''}!</h1>
      <p>One last thing: how do you feel about negative numbers right now?</p>
      {FEELINGS.map((f) => (
        <button key={f.id} className="btn" onClick={() => finish(f.id)}>{f.label}</button>
      ))}
      <p className="muted">Every answer is fine. This only changes where we start.</p>
    </section>
  )
}
