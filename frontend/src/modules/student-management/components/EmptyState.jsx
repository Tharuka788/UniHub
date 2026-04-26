export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/70 bg-white/75 p-10 text-center shadow-panel">
      <p className="text-lg font-semibold text-ink-900">{title}</p>
      <p className="mt-3 text-sm leading-6 text-ink-700">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ocean-500"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
