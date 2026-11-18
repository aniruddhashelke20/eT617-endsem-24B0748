import { useEffect, useState } from 'react'
import Balance, { sides } from '../components/Balance.jsx'
import { generateQuestion, show } from '../lib/generator.js'
import { diagnose, checkExplanation } from '../lib/diagnose.js'
import { decide } from '../lib/tutor.js'

const LEVEL_NAME = { 1: 'Level 1 · one-step', 2: 'Level 2 · two-step', 3: 'Level 3 · check & spot the error' }

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
  const [value, setValue] = useState('')
  const [verb, setVerb] = useState('')
  const [num, setNum] = useState('')
  const [choice, setChoice] = useState(null)
  const [text, setText] = useState('')
  const [hints, setHints] = useState(0)
  const [startedAt] = useState(Date.now())
  // Interaction adaptivity: hints on 2 questions in a row -> balance helper shown by default
  const helperByDefault = state.hintsInRow >= 2
  const yesNo = q.format === 'spot' || q.format === 'check'

  const teacherNotes = state.log.filter((e) => e.review?.status === 'overridden' && !e.review.seen)
  const ready = yesNo ? choice !== null : q.format === 'blank' ? verb.trim() !== '' && num.trim() !== '' : value !== ''

  function submit() {
    const response = yesNo ? { choice, text } : q.format === 'blank' ? { verb, num, value: `${verb} ${num}` } : { value }
    const verdict = diagnose(q, response)
    const expl = q.needsExplanation ? checkExplanation(q, text, choice) : null
    const explained = !expl || expl.quality !== 'unclear'
    const { move, patch } = decide(state, verdict, explained)

    const entry = {
      id: q.id, time: new Date().toISOString(), level: q.level, skill: q.skill, format: q.format,
      question: yesNo ? q.text : `${q.text} ${q.expr}`,
      response: yesNo ? `${choice}${text ? ` — “${text}”` : ''}` : String(response.value),
      correct: yesNo ? `${q.answer} (x = ${show(q.trueValue)})` : q.format === 'step' ? q.stepAnswer : q.format === 'blank' ? `${q.blank.verb} ${q.blank.num}` : `x = ${show(q.answer)}`,
      verdict, move, hints, seconds: Math.round((Date.now() - startedAt) / 1000),
      choice, reason: text, // kept separately so a teacher note can be shown with its context
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
      feedback: { q, verdict, move, response, expl },
      current: null,
      screen: 'feedback',
    })
  }

  const hintText =
    q.skill === 'oneMul' ? `${q.a}x means ${q.a} times x. What undoes "times"?`
    : q.skill === 'oneAdd' ? `What is added to or taken from x? Do the opposite to both sides.`
    : `First remove the number (${q.b > 0 ? '+ ' + q.b : '− ' + -q.b}), then deal with ${q.a}x.`
  const { left, right } = sides(q.expr)

  return (
    <section className="card">
      <p className="muted">
        {LEVEL_NAME[q.level]} · {state.streak}/2 in a row
        {state.focus && <> · <span className="badge">practising one idea</span></>}
      </p>

      {teacherNotes.map((e) => (
        <div key={e.id} className="box info" role="status">
          <strong>📝 Your teacher reviewed one of your answers</strong>
          <p><strong>Question:</strong> {e.question}</p>
          <p><strong>You answered:</strong> {e.choice ? <>{e.choice === 'yes' ? 'Yes' : 'No'} · <strong>Your reason:</strong> “{e.reason || '—'}”</> : e.response}</p>
          <p><strong>Teacher:</strong> {e.review.text}</p>
          <button className="btn" onClick={() => update({ log: state.log.map((x) => (x.id === e.id ? { ...x, review: { ...x.review, seen: true } } : x)) })}>Got it</button>
        </div>
      ))}

      <h1 className="question">
        {q.text}
        {!yesNo && <span className="expr">{q.expr}</span>}
      </h1>

      {q.format === 'numeric' && (
        <label className="field">
          Your answer: x =
          <input inputMode="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 4 or −3"
            onKeyDown={(e) => e.key === 'Enter' && ready && submit()} />
          <span className="row signs">
            <button type="button" className="btn" onClick={() => setValue((v) => (v.startsWith('-') ? v.slice(1) : '-' + v))}>± make negative</button>
          </span>
        </label>
      )}

      {q.format === 'blank' && (
        <p className="blanks">
          {q.parts.map((p, i) =>
            p !== null ? <span key={i}>{p}</span>
            : i === 1 ? <input key={i} className="blank wide" aria-label="Blank 1: operation (add, subtract, multiply, divide)" value={verb} onChange={(e) => setVerb(e.target.value)} placeholder="operation" list="verbs" />
            : <input key={i} className="blank" inputMode="numeric" aria-label="Blank 2: number" value={num} onChange={(e) => setNum(e.target.value)} placeholder="no." />
          )}
          <datalist id="verbs"><option value="add" /><option value="subtract" /><option value="multiply" /><option value="divide" /></datalist>
        </p>
      )}

      {(q.format === 'mcq' || q.format === 'step') && (
        <div role="radiogroup" aria-label="Options" className={q.format === 'mcq' ? 'options' : ''}>
          {q.options.map((o) => (
            <button key={o} role="radio" aria-checked={value === o} className={`btn option ${value === o ? 'selected' : ''}`} onClick={() => setValue(o)}>
              {value === o ? '● ' : '○ '}{q.format === 'mcq' ? `x = ${show(o)}` : o}
            </button>
          ))}
        </div>
      )}

      {yesNo && (
        <>
          <div role="radiogroup" aria-label="Your choice" className="row">
            {['yes', 'no'].map((c) => (
              <button key={c} role="radio" aria-checked={choice === c} className={`btn option ${choice === c ? 'selected' : ''}`} onClick={() => setChoice(c)}>
                {choice === c ? '● ' : '○ '}{c === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          <label className="field">
            Why? (one line)
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={`Put x = ${show(q.claimed)} back in: …`} />
          </label>
        </>
      )}

      {(hints > 0 || helperByDefault) && (
        <div className="box info" aria-live="polite">
          {hints > 0 && <p><strong>Hint:</strong> {hintText}</p>}
          <Balance left={left} right={right} />
        </div>
      )}

      <div className="row">
        <button className="btn" onClick={() => setHints(hints + 1)} disabled={hints >= 1}>💡 Hint (no penalty)</button>
        <button className="btn primary" disabled={!ready} onClick={submit}>Check</button>
      </div>
    </section>
  )
}
