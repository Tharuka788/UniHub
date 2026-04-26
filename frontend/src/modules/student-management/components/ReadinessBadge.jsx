const readinessStyles = {
  Ready: {
    tone: 'bg-mint-100 text-mint-600',
    bar: 'bg-mint-500',
    track: 'bg-mint-100',
    helper: 'Class setup is ready for dispatch.',
  },
  'Almost Ready': {
    tone: 'bg-ocean-50 text-ocean-500',
    bar: 'bg-ocean-500',
    track: 'bg-ocean-100',
    helper: 'A few operational details still need attention.',
  },
  'Needs Setup': {
    tone: 'bg-sand-100 text-ink-900',
    bar: 'bg-sand-500',
    track: 'bg-sand-100',
    helper: 'Core setup steps are still missing before dispatch.',
  },
}

export default function ReadinessBadge({ readiness }) {
  const style = readinessStyles[readiness?.label] || readinessStyles['Needs Setup']
  const score = Math.max(0, Math.min(100, readiness?.score || 0))

  return (
    <div
      className="space-y-2 rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-3"
      title={style.helper}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${style.tone}`}
        >
          {readiness?.label || 'Needs Setup'}
        </span>
        <span className="text-sm font-semibold text-ink-900">{score}/100</span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${style.track}`}>
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs leading-5 text-ink-500">{style.helper}</p>
    </div>
  )
}
