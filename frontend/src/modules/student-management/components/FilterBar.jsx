export default function FilterBar({
  filters,
  sessions,
  onSearchChange,
  onSessionChange,
  onStatusChange,
  onPaymentReferenceChange,
  onRegistrationReferenceChange,
  onDateFromChange,
  onDateToChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}) {
  return (
    <div className="space-y-4 rounded-[1.75rem] border border-white/60 bg-white/80 p-4 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <label className="flex flex-col gap-2 text-sm text-ink-700">
          Search student
          <input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            placeholder="Search across students, class, refs"
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

      <details className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-ink-700">
          Advanced filters
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Registration reference
            <input
              value={filters.registrationReference}
              onChange={(event) => onRegistrationReferenceChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Payment reference
            <input
              value={filters.paymentReference}
              onChange={(event) => onPaymentReferenceChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Sort by
            <select
              value={filters.sortBy}
              onChange={(event) => onSortByChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            >
              <option value="createdAt">Created date</option>
              <option value="updatedAt">Updated date</option>
              <option value="linkSentAt">Link sent date</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Date from
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Date to
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Sort order
            <select
              value={filters.sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-ocean-500"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
        </div>
      </details>
    </div>
  )
}
