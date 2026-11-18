// Number line: the topic-specific tool. Shows "walks" (hops) and can be used as an input.
// Input works by tapping a tick OR with the big ◀ ▶ buttons (keyboard / low-precision friendly).
const W = 30 // px between ticks in the SVG coordinate system
const PAD = 20

export default function NumberLine({ min = -10, max = 10, hops = [], start = null, value = null, onPick, label }) {
  const x = (n) => PAD + (n - min) * W
  const width = (max - min) * W + PAD * 2
  const ticks = []
  for (let n = min; n <= max; n++) ticks.push(n)

  return (
    <figure className="numberline">
      <svg viewBox={`0 0 ${width} 110`} role="img" aria-label={label ?? 'Number line'}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#1f4fd1" />
          </marker>
        </defs>
        <line x1={PAD - 10} x2={width - PAD + 10} y1="70" y2="70" stroke="#1a1d29" strokeWidth="2" />
        {hops.map((h, i) => {
          const x1 = x(h.from), x2 = x(h.to)
          const lift = 18 + Math.min(40, Math.abs(x2 - x1) / 4)
          return (
            <g key={i}>
              <path d={`M${x1},64 Q${(x1 + x2) / 2},${64 - lift * 2} ${x2},64`} fill="none" stroke="#1f4fd1" strokeWidth="3" markerEnd="url(#arrow)" />
              <text x={(x1 + x2) / 2} y={60 - lift} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f4fd1">{h.label}</text>
            </g>
          )
        })}
        {ticks.map((n) => (
          <g key={n}
            onClick={onPick ? () => onPick(n) : undefined}
            style={onPick ? { cursor: 'pointer' } : undefined}>
            <rect x={x(n) - W / 2} y="40" width={W} height="70" fill="transparent" />
            <line x1={x(n)} x2={x(n)} y1={n === 0 ? 58 : 63} y2={n === 0 ? 82 : 77} stroke="#1a1d29" strokeWidth={n === 0 ? 3 : 1.5} />
            <text x={x(n)} y="98" textAnchor="middle" fontSize="12" fontWeight={n === 0 ? 700 : 400} fill="#1a1d29">
              {n < 0 ? `−${-n}` : n}
            </text>
          </g>
        ))}
        {start !== null && <circle cx={x(start)} cy="70" r="7" fill="#fff" stroke="#1a1d29" strokeWidth="3" />}
        {value !== null && (
          <g>
            <circle cx={x(value)} cy="70" r="9" fill="#ffb000" stroke="#1a1d29" strokeWidth="2" />
            <text x={x(value)} y="30" textAnchor="middle" fontSize="13" fontWeight="700">▼ {value < 0 ? `−${-value}` : value}</text>
          </g>
        )}
      </svg>
      {onPick && (
        <div className="row" role="group" aria-label="Move your marker">
          <button className="btn" onClick={() => onPick(Math.max(min, (value ?? 0) - 1))} aria-label="Move marker left">◀ Left</button>
          <output className="nl-value" aria-live="polite">{value === null ? '—' : value < 0 ? `−${-value}` : value}</output>
          <button className="btn" onClick={() => onPick(Math.min(max, (value ?? 0) + 1))} aria-label="Move marker right">Right ▶</button>
        </div>
      )}
      <figcaption className="muted">○ start · ● your answer · arrows = moves (left = smaller, right = bigger)</figcaption>
    </figure>
  )
}

// Hops for a question: one arrow for the move
export function hopsFor(q) {
  if (q.skill === 'compare' || q.a === undefined) return []
  const end = q.op === '+' ? q.a + q.b : q.a - q.b
  const label = q.op === '+' ? `+ (${q.b < 0 ? '−' + -q.b : q.b})` : `− (${q.b < 0 ? '−' + -q.b : q.b})`
  return [{ from: q.a, to: end, label }]
}
