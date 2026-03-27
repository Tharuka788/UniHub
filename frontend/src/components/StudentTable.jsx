import StatusBadge from './StatusBadge'
import { formatDateTime } from '../utils/formatters'

function StudentCard({ item }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{item.student.fullName}</h3>
          <p className="text-sm text-ink-700">{item.student.email}</p>
        </div>
        <StatusBadge value={item.linkDeliveryStatus} />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-ink-700">
        <p>{item.classOffering.kuppiSession}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={item.registrationStatus} />
          <StatusBadge value={item.paymentStatus} />
        </div>
        <p>Registered: {formatDateTime(item.createdAt)}</p>
        <p>Last delivery: {formatDateTime(item.linkSentAt)}</p>
      </div>
    </article>
  )
}

export default function StudentTable({ items }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[1.75rem] border border-slate-200/80 lg:block">
        <table className="min-w-full divide-y divide-slate-200/80">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-ink-500">
              <th className="px-5 py-4">Student</th>
              <th className="px-5 py-4">Session</th>
              <th className="px-5 py-4">Registration</th>
              <th className="px-5 py-4">Payment</th>
              <th className="px-5 py-4">Delivery</th>
              <th className="px-5 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="align-top text-sm text-ink-700">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink-900">{item.student.fullName}</p>
                  <p className="mt-1 text-ink-500">{item.student.email}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink-900">{item.classOffering.title}</p>
                  <p className="mt-1 text-ink-500">{item.classOffering.kuppiSession}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={item.registrationStatus} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={item.paymentStatus} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <StatusBadge value={item.linkDeliveryStatus} />
                    <p className="text-xs text-ink-500">{formatDateTime(item.linkSentAt)}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-500">{formatDateTime(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {items.map((item) => (
          <StudentCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
