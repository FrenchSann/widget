interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444'
  const label = score >= 80 ? 'Bon' : score >= 50 ? 'À améliorer' : 'Critique'

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative inline-flex items-center justify-center"
        aria-label={`Score d'accessibilité : ${score} sur 100`}
      >
        <svg width="136" height="136" className="-rotate-90" aria-hidden="true">
          <circle cx="68" cy="68" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="68"
            cy="68"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute text-center" aria-hidden="true">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="block text-sm text-gray-400">/100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: color + '20', color }}
      >
        {label}
      </span>
    </div>
  )
}
