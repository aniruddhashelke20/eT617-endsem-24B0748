import { useState } from 'react'
import { MISCONCEPTIONS } from '../lib/diagnose.js'

// C5 Teacher-in-the-loop: progress view + approve/override automated feedback
// + teacher can override the tutor's next step (level, focus).
const PIN = '617'

export default function Teacher({ state, update, go }) {
  const [pin, setPin] = useState('')
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <section className="card">
        <h1>Teacher view</h1>
        <label className="field">
          Teacher PIN <span className="muted">(demo PIN: {PIN})</span>
          <input inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && pin === PIN && setOpen(true)} />
        </label>
        <button className="btn primary" disabled={pin !== PIN} onClick={() => setOpen(true)}>Open</button>
        <button className="btn" onClick={() => go('welcome')}>Back to learner</button>
      </section>
    )
  return <Dashboard state={state} update={update} go={go} />
}

function Dashboard({ state, update, go }) {
  const log = state.log
  const right = log.filter((e) => e.verdict === 'correct').length
  const hinted = log.filter((e) => e.hints > 0).length
  const avg = log.length ? Math.round(log.reduce((s, e) => s + e.seconds, 0) / log.length) : 0
  const queue = log.filter((e) => e.review?.status === 'pending')
  const reviewed = log.filter((e) => e.review && e.review.status !== 'pending')
  const d = state.diagnostic

  const setReview = (id, review) =>
    update({ log: log.map((e) => (e.id === id ? { ...e, review: { ...e.review, ...review } } : e)) })

  return (
    <>
      <section className="card">
        <h1>Teacher view · {state.name || 'Learner'}</h1>
        <dl className="facts">
          <dt>Warm-up</dt>
          <dd>{d ? `${d.score}/3 · feels ${d.confidence} · started Level ${d.startLevel}` : 'not done'}</dd>
          <dt>Now</dt><dd>Level {state.level} · {state.streak}/2 in a row</dd>
          <dt>Attempts</dt><dd>{log.length} ({right} correct)</dd>
          <dt>Hints used</dt><dd>{hinted} questions · avg {avg}s per question</dd>
        </dl>
        <h2>Misconceptions seen</h2>
        <ul className="steps">
          {Object.entries(MISCONCEPTIONS).map(([m, label]) => (
            <li key={m}><strong>{m}</strong> {label}: <strong>{state.counts[m]}</strong>×{d?.found?.includes(m) ? ' (also in warm-up)' : ''}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Review automated feedback ({queue.length} waiting)</h2>
        {queue.length === 0 && <p className="muted">Nothing to review. Explanations appear here at Level 3 (check / spot-the-error). Tip: set Level 3 below to test..</p>}
        {queue.map((e) => <ReviewItem key={e.id} e={e} onSave={setReview} />)}
        {reviewed.length > 0 && (
          <p className="muted">Reviewed: {reviewed.filter((e) => e.review.status === 'approved').length} approved, {reviewed.filter((e) => e.review.status === 'overridden').length} overridden.</p>
        )}
      </section>

      <section className="card">
        <h2>Override the tutor's next step</h2>
        <div className="row">
          <label className="field">Level
            <select value={state.level} onChange={(e) => update({ level: Number(e.target.value), streak: 0, current: null })}>
              {[1, 2, 3].map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </label>
          <label className="field">Focus
            <select value={state.focus ?? ''} onChange={(e) => update({ focus: e.target.value || null, current: null })}>
              <option value="">Mixed (tutor decides)</option>
              {Object.keys(MISCONCEPTIONS).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
        <p className="muted">Changes apply from the learner's next question.</p>
      </section>

      <section className="card">
        <h2>Attempt log (latest first)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Question</th><th>Answer</th><th>Diagnosis</th><th>Next step</th></tr></thead>
            <tbody>
              {[...log].reverse().slice(0, 20).map((e) => (
                <tr key={e.id}>
                  <td>{e.question}</td>
                  <td>{e.response}<br /><span className="muted">key: {e.correct}</span></td>
                  <td>{e.verdict === 'correct' ? '✓ correct' : e.verdict === 'unknown' ? '✗ other error' : `✗ ${e.verdict}`}{e.hints ? ' · hint' : ''}</td>
                  <td>{e.move}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn" onClick={() => go('welcome')}>Back to learner</button>
      </section>
    </>
  )
}

function ReviewItem({ e, onSave }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(e.auto.feedback)
  return (
    <div className="box info">
      <p><strong>Q:</strong> {e.question}</p>
      <p><strong>Learner:</strong> {e.response} <span className="muted">(key: {e.correct})</span></p>
      <p><strong>Tutor said</strong> <span className="badge">check: {e.auto.quality}</span><br />{e.auto.feedback}</p>
      {editing ? (
        <>
          <label className="field">Your feedback to the learner
            <textarea value={text} onChange={(ev) => setText(ev.target.value)} />
          </label>
          <button className="btn primary" disabled={!text.trim()} onClick={() => onSave(e.id, { status: 'overridden', text: text.trim() })}>Send my feedback</button>
        </>
      ) : (
        <div className="row">
          <button className="btn primary" onClick={() => onSave(e.id, { status: 'approved' })}>✓ Approve</button>
          <button className="btn" onClick={() => setEditing(true)}>✎ Override</button>
        </div>
      )}
    </div>
  )
}
