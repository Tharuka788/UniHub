export default function Toast({ toast, onClose }) {
  if (!toast) {
    return null
  }

  const tone =
    toast.type === 'error'
      ? 'border-coral-100 bg-coral-100 text-coral-600'
      : 'border-mint-100 bg-mint-100 text-mint-600'

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100%-2rem))]">
      <div className={`rounded-[1.5rem] border px-5 py-4 shadow-panel ${tone}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">{toast.title}</p>
            <p className="mt-2 text-sm leading-6">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
