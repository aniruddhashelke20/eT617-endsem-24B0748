import { useEffect, useState } from 'react'
import NumberLine from '../components/NumberLine.jsx'
import { generateQuestion, show } from '../lib/generator.js'
import { diagnose, checkExplanation } from '../lib/diagnose.js'
import { decide } from '../lib/tutor.js'

const LEVEL_NAME = { 1: 'Level 1 · small numbers', 2: 'Level 2 · bigger & mixed', 3: 'Level 3 · spot the error & predict' }

export default function Practice(props) {
  const { state, update } = props
  // Generate a question if none is waiting (also on resume)
  useEffect(() => {
    if (!state.current) update({ current: generateQuestion(state.level, state.focus) })
  }, [state.current]) // eslint-disable-line
  if (!state.current) return null
  return <QuestionCard key={state.current.id} q={state.current} {...props} />
}

function QuestionCard({ q, state, update }) {
  const [value, setValue] = useState(q.format === 'numberline' ? null : '')
  const [choice, setChoice] = useState(null)
  const [text, setText] = useState('')
  const [hints, setHints] = useState(0)
  const [startedAt] = useState(Date.now())
  // Interaction adaptivity: 2 questions in a row with hints -> number line shown by default
  const lineByDefault = state.hintsInRow >= 2

  const teacherNotes = state.log.filter((e) => e.review?.status === 'overridden' && !e.review.seen)

  const ready =
    q.format === 'spot' || q.format === 'predict' ? choice !== null : value !== null && value !== ''

  function submit() {
    const response = q.format === 'spot' || q.format === 'predict' ? { choice, text } : { value }
    const verdict = diagnose(q, response)
    const expl = q.needsExplanation ? checkExplanation(q, text) : null
    const explained = !expl || expl.quality !== 'unclear'
    const { move, patch } = decide(state, verdict, explained)

    const entry = {
      id: q.id, time: new Date().toISOString(), level: q.level, skill: q.skill, format: q.format,
      question: `${q.text} ${q.format === 'spot' ? '' : q.expr}`.trim(),
      response: response.choice ? `${response.choice}${text ? ` — “${text}”` : ''}` : String(response.value),
      correct: q.trueValue !== undefined ? `${q.answer} (value ${show(q.trueValue)})` : String(q.answer),
      verdict, move, hints, seconds: Math.round((Date.now() - startedAt) / 1000),
      auto: expl, // automated feedback on the explanation
      review: expl ? { status: 'pending', text: expl.feedback } : null,
    }
    const counts = { ...state.counts }
    if (counts[verdict] !== undefined) counts[verdict]++

    update({
      ...patch,
      counts,
      hintsInRow: hints > 0 ? state.hintsInRow + 1 : 0,
      log: [...state.log, entry],
      feedback: { q, verdict, move, response, expl, entryId: q.id },
      current: null,
      screen: 'feedback',
    })
  }

  const hintText =
    q.skill === 'compare'
      ? 'Find both numbers on the line. Which one is further RIGHT?'
      : `Start at ${show(q.a)}. Does ${q.op} ${show(q.b)} move you left or right?`

  return (
    <section className="card">
      <p className="muted">
        {LEVEL_NAME[q.level]} · {state.streak}/2 in a row
        {state.focus && <> · <span className="badge">practising one idea</span></>}
      </p>

      {teacherNotes.map((e) => (
        <div key={e.id} className="box info" role="status">
          <strong>📝 Your teacher reviewed your explanation</strong>
          <p>{e.review.text}</p>
          <button className="btn" onClick={() => update({ log: state.log.map((x) => (x.id === e.id ? { ...x, review: { ...x.review, seen: true } } : x)) })}>Got it</button>
        </div>
      ))}

      <h1 className="question">
        {q.text}
        {q.format !== 'spot' && <span className="expr">{q.expr}</span>}
      </h1>

      {q.format === 'numeric' && (
        <label className="field">
          Your answer
          <input inputMode="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. −4"
            onKeyDown={(e) => e.key === 'Enter' && ready && submit()} />
          <span className="row signs">
            <button type="button" className="btn" onClick={() => setValue((v) => (v.startsWith('-') ? v.slice(1) : '-' + v))}>± sign</button>
          </span>
        </label>
      )}

      {q.format === 'mcq' && (
        <div role="radiogroup" aria-label="Options" className="options">
          {q.options.map((o) => (
            <button key={o} role="radio" aria-checked={value === o} className={`btn option ${value === o ? 'selected' : ''}`} onClick={() => setValue(o)}>
              {value === o ? '● ' : '○ '}{show(o)}
            </button>
          ))}
        </div>
      )}

      {q.format === 'numberline' && (
        <NumberLine min={-10} max={10} start={q.a} value={value} onPick={setValue} label={`Tap where ${q.expr} lands`} />
      )}

      {(q.format === 'spot' || q.format === 'predict') && (
        <>
          <div role="radiogroup" aria-label="Your choice" className="row">
            {(q.format === 'spot' ? ['yes', 'no'] : ['positive', 'negative']).map((c) => (
              <button key={c} role="radio" aria-checked={choice === c} className={`btn option ${choice === c ? 'selected' : ''}`} onClick={() => setChoice(c)}>
                {choice === c ? '● ' : '○ '}{c === 'yes' ? 'Yes, right' : c === 'no' ? 'No, wrong' : c}
              </button>
            ))}
          </div>
          <label className="field">
            Why? (one line)
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Start at …, move … steps left/right" />
          </label>
        </>
      )}

      {(hints > 0 || lineByDefault) && (
        <div className="box info" aria-live="polite">
          {hints > 0 && <p><strong>Hint:</strong> {hintText}</p>}
          {q.format !== 'numberline' && <NumberLine min={-12} max={12} start={q.skill === 'compare' ? null : q.a} label="Number line helper" />}
        </div>
      )}

      <div className="row">
        <button className="btn" onClick={() => setHints(hints + 1)} disabled={hints >= 1}>💡 Hint (no penalty)</button>
        <button className="btn primary" disabled={!ready} onClick={submit}>Check</button>
      </div>
    </section>
  )
}
