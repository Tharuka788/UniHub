export default function StatCard({ label, value, tone = 'neutral' }) {
  const toneStyles = {
    neutral: 'bg-white text-ink-900',
    accent: 'bg-ocean-500 text-white',
    success: 'bg-mint-100 text-mint-600',
    warning: 'bg-sand-100 text-ink-900',
  }

  return (
    <article
      className={`rounded-[1.75rem] border border-white/60 p-6 shadow-panel ${
        toneStyles[tone] || toneStyles.neutral
      }`}
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-70">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
    </article>
  )
}
