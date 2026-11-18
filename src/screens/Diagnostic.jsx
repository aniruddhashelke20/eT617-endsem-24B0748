import { useState } from 'react'

// Profile adaptivity: 3 fixed warm-up items + a confidence check decide the start level
// and the first misconception to focus on. Each wrong option is a known misconception.
const ITEMS = [
  { expr: 'x + 4 = 9', options: [5, 13, 4], answer: 5, traps: { 13: 'M1' } },
  { expr: '4x = 20', options: [16, 5, 80], answer: 5, traps: { 16: 'M2', 80: 'M2' } },
  { expr: '2x + 6 = 14', options: [1, 10, 4], answer: 4, traps: { 1: 'M3', 10: 'M1' } },
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
    setAnswers([...answers, o])
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
      // Any mistake or low confidence -> short explanation first
      screen: score === 3 && confidence === 'high' ? 'practice' : 'learn',
    })
  }

  if (i < ITEMS.length) {
    const it = ITEMS[i]
    return (
      <section className="card">
        <p className="muted">Warm-up {i + 1} of 3 · not marked, just helps me choose your start</p>
        <h1 className="question">Solve for x:<span className="expr">{it.expr}</span></h1>
        <div className="options">
          {it.options.map((o) => (
            <button key={o} className="btn option" onClick={() => answer(o)}>x = {o}</button>
          ))}
        </div>
        <button className="btn" onClick={() => answer(null)}>I'm not sure</button>
      </section>
    )
  }

  return (
    <section className="card">
      <h1>Thanks{state.name ? `, ${state.name}` : ''}!</h1>
      <p>One last thing: how do you feel about equations right now?</p>
      {FEELINGS.map((f) => (
        <button key={f.id} className="btn" onClick={() => finish(f.id)}>{f.label}</button>
      ))}
      <p className="muted">Every answer is fine. This only changes where we start.</p>
    </section>
  )
}
