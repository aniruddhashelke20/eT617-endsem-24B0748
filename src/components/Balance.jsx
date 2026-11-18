// Balance scale: the topic-specific tool. An equation is a balance; the beam tilts when it is not.
// Always paired with text so meaning never depends on the picture alone.
// tilt: 0 balanced, -1 left side heavier (left goes down), 1 right side heavier
export default function Balance({ left, right, tilt = 0, label }) {
  const angle = tilt * 8 // positive rotate = clockwise = right end goes down // degrees; 0 = balanced
  return (
    <figure className="balance">
      <svg viewBox="0 0 320 150" role="img" aria-label={label ?? `${left} equals ${right}${tilt ? ' — not balanced' : ' — balanced'}`}>
        <polygon points="160,95 145,140 175,140" fill="#4a5068" />
        <g transform={`rotate(${angle} 160 95)`}>
          <line x1="30" y1="95" x2="290" y2="95" stroke="#1a1d29" strokeWidth="5" strokeLinecap="round" />
          <rect x="10" y="50" width="120" height="40" rx="8" fill="#e8eefc" stroke="#1f4fd1" strokeWidth="2" />
          <rect x="190" y="50" width="120" height="40" rx="8" fill="#e8eefc" stroke="#1f4fd1" strokeWidth="2" />
          <text x="70" y="77" textAnchor="middle" fontSize="18" fontWeight="700">{left}</text>
          <text x="250" y="77" textAnchor="middle" fontSize="18" fontWeight="700">{right}</text>
        </g>
        <text x="160" y="25" textAnchor="middle" fontSize="14" fontWeight="700" fill={tilt ? '#8a4b00' : '#0f6b3a'}>
          {tilt ? '⚠ Not balanced' : '= Balanced'}
        </text>
      </svg>
    </figure>
  )
}

// Split "2x + 3 = 11" into its two sides
export function sides(expr) {
  const [l, r] = expr.split('=').map((s) => s.trim())
  return { left: l, right: r }
}
