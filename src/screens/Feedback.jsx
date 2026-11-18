import NumberLine, { hopsFor } from '../components/NumberLine.jsx'
import { show } from '../lib/generator.js'
import { walkText, alternativeFor } from '../lib/diagnose.js'
import { MOVE_REASON } from '../lib/tutor.js'

// Shows the result and the tutor's next move (harder / alternative / prerequisite).
// Language for an anxious learner: "Not yet", never a red cross; always icon + words, not colour alone.
export default function Feedback({ state, go, update }) {
  const f = state.feedback
  if (!f) return <button className="btn primary" onClick={() => go('practice')}>Continue</button>
  const { q, verdict, move, response, expl } = f
  const ok = verdict === 'correct'
  const alt = move === 'alternative' ? alternativeFor(verdict, q) : null
  const yours = response.choice ?? (response.value === null ? '—' : show(Number(String(response.value).replace(/[−–]/g, '-'))))

  return (
    <section className="card">
      <div className={`box ${ok ? 'ok' : 'warn'}`} role="status">
        <strong>{ok ? '✓ Correct!' : '↻ Not yet — let us look again.'}</strong>
        <p>{ok ? walkText(q) : <>You answered <strong>{yours}</strong>. {move !== 'alternative' && walkText(q)}</>}</p>
      </div>

      {expl && (
        <div className="box info">
          <span className="badge">Tutor's quick check · your teacher will review</span>
          <p>{expl.feedback}</p>
        </div>
      )}

      {alt && (
        <>
          <h2>💡 {alt.title}</h2>
          <ol className="steps">{alt.body.map((b, i) => <li key={i}>{b}</li>)}</ol>
        </>
      )}

      {q.skill !== 'compare' && (
        <NumberLine min={-15} max={15} start={q.a} hops={hopsFor(q)} label={walkText(q)} />
      )}

      <p className="muted"><strong>Why this next step?</strong> {MOVE_REASON[move]}</p>

      {move === 'prerequisite' ? (
        <button className="btn primary" onClick={() => go('prereq')}>Quick refresher (2 min)</button>
      ) : move === 'mastered' ? (
        <button className="btn primary" onClick={() => go('summary')}>See what I learned</button>
      ) : (
        <button className="btn primary" onClick={() => update({ screen: 'practice', feedback: null })}>
          {move === 'alternative' ? 'Try a similar one' : move === 'harder' ? 'Next (a bit harder)' : 'Next question'}
        </button>
      )}
      <button className="btn" onClick={() => go('summary')}>Stop for today</button>
    </section>
  )
}
