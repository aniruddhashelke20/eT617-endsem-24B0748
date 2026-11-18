import Balance, { sides } from '../components/Balance.jsx'
import { show } from '../lib/generator.js'
import { solutionText, alternativeFor, backCheck, parseNum } from '../lib/diagnose.js'
import { MOVE_REASON, CONCEPT } from '../lib/tutor.js'
import { encouragement } from '../lib/encourage.js'

// Results for a PAIR of same-concept questions (shown only after both are answered).
// Both wrong -> results + a lesson on that concept. 1 or 0 wrong -> results only.
const yesNo = (q) => q.format === 'spot' || q.format === 'check'

function yourAnswer(q, r) {
  if (yesNo(q)) return `${r.choice === 'yes' ? 'Yes' : 'No'}${r.text ? ` — “${r.text}”` : ''}`
  if (q.format === 'step' || q.format === 'findstep' || q.format === 'blank') return r.value
  const v = parseNum(r.value)
  return `x = ${v === null ? r.value : show(v)}`
}

function rightAnswer(q) {
  if (q.format === 'blank') return q.blankAnswer
  if (q.format === 'findstep') return q.fix
  if (q.format === 'step') return `${q.stepAnswer}. ${solutionText(q)}`
  if (yesNo(q)) return `${q.answer === 'yes' ? 'Yes' : 'No'}. ${solutionText(q)}`
  return solutionText(q)
}

export default function Feedback({ state, go, update }) {
  const f = state.feedback
  if (!f?.items) return <button className="btn primary" onClick={() => go('practice')}>Continue</button>
  const { items, move, misconception } = f
  const teach = move === 'alternative' || move === 'prerequisite'
  const right = items.filter((i) => i.verdict === 'correct').length
  const last = items[items.length - 1]
  // Encouragement: lesson -> mix-up / sticking-with-it line; Q1 wrong but Q2 right -> comeback praise;
  // Q2 wrong only -> "every mistake tells us what to practise"; both right -> none needed
  const cheer =
    teach ? encouragement({ verdict: 'wrong', move, log: state.log, id: last.q.id })
    : right === 1 ? encouragement({ verdict: last.verdict === 'correct' ? 'correct' : 'wrong', move: 'other', log: state.log, id: last.q.id })
    : null

  // For the lesson: the question that showed the misconception (or the last one)
  const lessonItem = items.slice().reverse().find((i) => i.verdict === misconception) ?? last
  const lq = lessonItem.q
  const alt = move === 'alternative' ? alternativeFor(misconception, lq) : null
  const wrongVal = yesNo(lq) ? lq.claimed : ['step', 'blank', 'findstep'].includes(lq.format) ? null : parseNum(lessonItem.response.value)
  const showTilt = teach && wrongVal !== null && wrongVal !== (lq.trueValue ?? lq.answer)
  const { left, right: rhs } = sides(lq.expr)
  const filled = left.replace(/(\d*)x/, (_, a) => (a ? `${a} × (${show(wrongVal)})` : `(${show(wrongVal)})`))

  return (
    <section className="card">
      <h1>Your results: {right} of 2 <span className="badge">{CONCEPT[last.q.skill]}</span></h1>

      {items.map(({ q, response, verdict, expl }, i) => {
        const ok = verdict === 'correct'
        return (
          <div key={q.id} className={`box ${ok ? 'ok' : 'warn'}`}>
            <strong>Question {i + 1}: {ok ? '✓ Correct' : '↻ Not yet'}</strong>
            <p>{yesNo(q) ? q.text : <>{q.text} <strong>{q.expr}</strong></>}</p>
            <p>You answered: <strong>{yourAnswer(q, response)}</strong></p>
            {!ok && <p>Answer: {rightAnswer(q)}</p>}
            {expl && <p className="pre"><span className="badge">Your reason · your teacher will also see this</span>{'\n'}{expl.feedback}</p>}
          </div>
        )
      })}

      {cheer && <p className="cheer" role="status">💪 {cheer}</p>}

      {teach && (
        <>
          <h2>📘 Let us look at this idea together</h2>
          {showTilt && (
            <>
              <p>Put x = {show(wrongVal)} back into {lq.expr}: <strong>{backCheck(lq, wrongVal)}</strong>.</p>
              <Balance left={filled} right={rhs} tilt={lq.a * wrongVal + lq.b > lq.c ? -1 : 1} label={`With x = ${wrongVal} the two sides are not equal`} />
            </>
          )}
          {alt && (
            <>
              <h2>💡 {alt.title}</h2>
              <ol className="steps">{alt.body.map((b, i) => <li key={i}>{b}</li>)}</ol>
            </>
          )}
        </>
      )}

      <p className="muted"><strong>Why this next step?</strong> {MOVE_REASON[move]}</p>

      {move === 'prerequisite' ? (
        <button className="btn primary" onClick={() => go('prereq')}>Quick refresher (2 min)</button>
      ) : move === 'mastered' ? (
        <button className="btn primary" onClick={() => go('summary')}>See what I learned</button>
      ) : (
        <button className="btn primary" onClick={() => update({ screen: 'practice', feedback: null })}>
          {move === 'alternative' ? 'Try a new pair on this idea' : move === 'harder' ? 'Next pair (a bit harder)' : 'Next pair'}
        </button>
      )}
      <button className="btn" onClick={() => go('summary')}>Stop for today</button>
    </section>
  )
}
