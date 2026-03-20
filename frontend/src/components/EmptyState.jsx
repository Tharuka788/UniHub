export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/70 bg-white/75 p-10 text-center shadow-panel">
      <p className="text-lg font-semibold text-ink-900">{title}</p>
      <p className="mt-3 text-sm leading-6 text-ink-700">{description}</p>
    </div>
  )
}
