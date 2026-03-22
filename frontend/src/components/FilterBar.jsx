export default function FilterBar({
  filters,
  sessions,
  onSearchChange,
  onSessionChange,
  onStatusChange,
  onReset,
}) {
  return (
    <div className="grid gap-3 rounded-[1.75rem] border border-white/60 bg-white/80 p-4 shadow-panel lg:grid-cols-[1.4fr_1fr_1fr_auto]">
      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Search student
        <input
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
          placeholder="Search by name or email"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Kuppi session
        <select
          value={filters.kuppiSession}
          onChange={(event) => onSessionChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
        >
          <option value="">All sessions</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.kuppiSession}>
              {session.kuppiSession}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-ink-700">
        Delivery status
        <select
          value={filters.linkDeliveryStatus}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-ink-700 transition hover:border-ocean-500 hover:text-ocean-500 lg:self-end"
      >
        Reset
      </button>
    </div>
  )
}
