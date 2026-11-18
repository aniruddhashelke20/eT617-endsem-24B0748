import Balance, { sides } from '../components/Balance.jsx'
import { show } from '../lib/generator.js'
import { solutionText, alternativeFor, backCheck, parseNum } from '../lib/diagnose.js'
import { MOVE_REASON } from '../lib/tutor.js'
import { encouragement } from '../lib/encourage.js'

// Shows the result and the tutor's next move (harder / alternative / prerequisite).
// Anxious learner: "Not yet", never a red cross; icon + words, never colour alone.
export default function Feedback({ state, go, update }) {
  const f = state.feedback
  if (!f) return <button className="btn primary" onClick={() => go('practice')}>Continue</button>
  const { q, verdict, move, response, expl } = f
  const ok = verdict === 'correct'
  const alt = move === 'alternative' ? alternativeFor(verdict, q) : null

  // The wrong value, put back into the equation → tilted balance (learner sees WHY it is wrong)
  const yesNo = q.format === 'check' || q.format === 'spot'
  const weakReason = expl && expl.quality !== 'strong'
  const wrongVal = yesNo ? q.claimed : q.format === 'step' || q.format === 'blank' || q.format === 'findstep' ? null : parseNum(response.value)
  const showTilt = !ok && wrongVal !== null && wrongVal !== (q.trueValue ?? q.answer)
  const { left, right } = sides(q.expr)
  const filled = left.replace(/(\d*)x/, (_, a) => (a ? `${a} × (${show(wrongVal)})` : `(${show(wrongVal)})`))
  const cheer = encouragement({ verdict, move, log: state.log, id: q.id })
  const yours = yesNo ? response.choice : q.format === 'step' || q.format === 'blank' || q.format === 'findstep' ? response.value : `x = ${wrongVal === null ? response.value : show(wrongVal)}`

  return (
    <section className="card">
      <div className={`box ${ok ? 'ok' : 'warn'}`} role="status">
        <strong>{ok && weakReason ? '✓ Right answer — now let us make your reason complete.' : ok ? '✓ Correct!' : '↻ Not yet — let us look again.'}</strong>
        {q.format === 'blank' && <p><strong>{q.blankAnswer}</strong></p>}
        {q.format === 'findstep' && <p><strong>{q.fix}</strong></p>}
        <p>{ok ? solutionText(q) : <>You answered <strong>{yours}</strong>.</>}</p>
      </div>
      {cheer && <p className="cheer" role="status">💪 {cheer}</p>}

      {showTilt && (
        <>
          <p>Let's put x = {show(wrongVal)} back in: <strong>{backCheck(q, wrongVal)}</strong>.</p>
          <Balance left={filled} right={right} tilt={q.a * wrongVal + q.b > q.c ? -1 : 1} label={`With x = ${wrongVal} the two sides are not equal`} />
        </>
      )}

      {expl && (
        <div className="box info">
          <span className="badge">Checking your reason · your teacher will also see this</span>
          <p className="muted">You wrote: “{response.text || '—'}”</p>
          <p className="pre">{expl.feedback}</p>
          {ok && expl.quality === 'unclear' && <p className="muted">Your Yes/No was right, but a reason is needed for it to count towards the next level.</p>}
        </div>
      )}

      {alt && (
        <>
          <h2>💡 {alt.title}</h2>
          <ol className="steps">{alt.body.map((b, i) => <li key={i}>{b}</li>)}</ol>
        </>
      )}
      {!ok && !alt && <p className="box info">{solutionText(q)}</p>}

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
