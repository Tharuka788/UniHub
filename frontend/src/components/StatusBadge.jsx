const badgeStyles = {
  confirmed: 'bg-mint-100 text-mint-600',
  paid: 'bg-ocean-50 text-ocean-500',
  pending: 'bg-sand-100 text-ink-900',
  sent: 'bg-mint-100 text-mint-600',
  failed: 'bg-coral-100 text-coral-600',
}

export default function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        badgeStyles[value] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {value}
    </span>
  )
}
