export default function DetailDrawer({ isOpen, title, subtitle, onClose, children }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-900/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-ocean-500">
              Details
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-ink-700">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-ink-700"
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-5">{children}</div>
      </div>
    </div>
  )
}
