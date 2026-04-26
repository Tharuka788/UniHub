export default function DataTable({ columns, items, renderRow, renderCard }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[1.75rem] border border-slate-200/80 lg:block">
        <table className="min-w-full divide-y divide-slate-200/80">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-ink-500">
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {items.map((item) => renderRow(item))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {items.map((item) => renderCard(item))}
      </div>
    </>
  )
}
