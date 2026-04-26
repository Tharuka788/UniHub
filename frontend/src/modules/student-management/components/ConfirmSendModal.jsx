import Button from './Button'

export default function ConfirmSendModal({
  isOpen,
  sessionName,
  recipientCount,
  isSending,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-ocean-500">
          Confirm send
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
          Dispatch class links
        </h2>
        <p className="mt-4 text-sm leading-7 text-ink-700">
          This will send the class link to <strong>{recipientCount}</strong> eligible
          students for <strong>{sessionName}</strong>.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send class link'}
          </Button>
        </div>
      </div>
    </div>
  )
}
