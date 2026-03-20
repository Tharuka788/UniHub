import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { isStandaloneMode } from '../app/config'
import AppShell from '../layouts/AppShell'

const summaryCards = [
  { label: 'Confirmed Students', value: '124', tone: 'accent' },
  { label: 'Links Sent', value: '81', tone: 'success' },
  { label: 'Pending', value: '36', tone: 'warning' },
  { label: 'Failed', value: '07', tone: 'neutral' },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <PageHeader
          eyebrow="Kuppi System"
          title="Student confirmation dashboard"
          description={
            isStandaloneMode()
              ? 'Base dashboard shell for local presentation mode with the same visual language used in integrated mode.'
              : 'Base dashboard shell for the confirmed enrollment and class link workflow.'
          }
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
          <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                Dashboard Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                Confirmed students workspace
              </h2>
            </div>
            <button className="rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ocean-500">
              Send class link
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-ocean-50 px-4 py-3 text-sm text-ink-700">
              Search, session filters, and delivery status controls land here.
            </div>
            <div className="rounded-2xl bg-sand-100 px-4 py-3 text-sm text-ink-700">
              The table will show confirmed, paid, and delivery state columns.
            </div>
            <div className="rounded-2xl bg-mint-100 px-4 py-3 text-sm text-mint-600">
              Batch send results and retry-safe states connect in later steps.
            </div>
          </div>
        </div>

        <EmptyState
          title="Feature modules are scaffolded"
          description="API hooks, student feature slices, and reusable UI live in dedicated folders so the dashboard can expand without a later reorganization."
        />
      </section>
    </AppShell>
  )
}
