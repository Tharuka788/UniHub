import Button from './Button'

export default function EntityFormModal({
  isOpen,
  title,
  description,
  children,
  submitLabel = 'Save',
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-ocean-500">
          Admin form
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-700">{description}</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          {children}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
