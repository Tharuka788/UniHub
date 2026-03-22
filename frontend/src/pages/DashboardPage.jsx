import { useState } from 'react'
import Button from '../components/Button'
import ConfirmSendModal from '../components/ConfirmSendModal'
import EmptyState from '../components/EmptyState'
import FilterBar from '../components/FilterBar'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StudentTable from '../components/StudentTable'
import Toast from '../components/Toast'
import { isStandaloneMode } from '../app/config'
import { mockStudents } from '../features/students/mockStudents'
import AppShell from '../layouts/AppShell'

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    search: '',
    kuppiSession: '',
    linkDeliveryStatus: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState(null)

  const sessions = Array.from(
    new Map(mockStudents.map((item) => [item.classOffering.id, item.classOffering])).values(),
  )

  const filteredStudents = mockStudents.filter((item) => {
    const matchesSearch =
      !filters.search ||
      item.student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.student.email.toLowerCase().includes(filters.search.toLowerCase())
    const matchesSession =
      !filters.kuppiSession || item.classOffering.kuppiSession === filters.kuppiSession
    const matchesDelivery =
      !filters.linkDeliveryStatus ||
      item.linkDeliveryStatus === filters.linkDeliveryStatus

    return matchesSearch && matchesSession && matchesDelivery
  })

  const summaryCards = [
    { label: 'Confirmed Students', value: mockStudents.length, tone: 'accent' },
    {
      label: 'Links Sent',
      value: mockStudents.filter((item) => item.linkDeliveryStatus === 'sent').length,
      tone: 'success',
    },
    {
      label: 'Pending',
      value: mockStudents.filter((item) => item.linkDeliveryStatus === 'pending').length,
      tone: 'warning',
    },
    {
      label: 'Failed',
      value: mockStudents.filter((item) => item.linkDeliveryStatus === 'failed').length,
      tone: 'neutral',
    },
  ]

  const selectedSession =
    sessions.find((session) => session.kuppiSession === filters.kuppiSession) || sessions[0]

  const eligibleForDispatch = mockStudents.filter((item) => {
    if (!selectedSession) {
      return false
    }

    return (
      item.classOffering.id === selectedSession.id &&
      item.registrationStatus === 'confirmed' &&
      item.paymentStatus === 'paid' &&
      item.linkDeliveryStatus !== 'sent'
    )
  })

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  function handleReset() {
    setFilters({
      search: '',
      kuppiSession: '',
      linkDeliveryStatus: '',
    })
  }

  function handleSendConfirm() {
    setIsSending(true)

    window.setTimeout(() => {
      setToast({
        type: 'success',
        title: 'Dispatch complete',
        message: `${eligibleForDispatch.length} student emails were prepared for ${selectedSession?.title}.`,
      })
      setIsSending(false)
      setIsModalOpen(false)
    }, 800)
  }

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
          <StatCard key={card.label} {...card} value={String(card.value).padStart(2, '0')} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
          <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                Confirmed enrollments
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                Admin workspace
              </h2>
            </div>
            <Button onClick={() => setIsModalOpen(true)} disabled={!selectedSession || isSending}>
              Send class link
            </Button>
          </div>

          <FilterBar
            filters={filters}
            sessions={sessions}
            onSearchChange={(search) => updateFilters({ search })}
            onSessionChange={(kuppiSession) => updateFilters({ kuppiSession })}
            onStatusChange={(linkDeliveryStatus) => updateFilters({ linkDeliveryStatus })}
            onReset={handleReset}
          />

          {filteredStudents.length > 0 ? (
            <StudentTable items={filteredStudents} />
          ) : (
            <EmptyState
              title="No students match the current filters"
              description="Adjust the search term, session, or delivery state to reveal the confirmed enrollment list."
            />
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
              Dispatch target
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
              {selectedSession?.title || 'No session selected'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-700">
              {selectedSession?.kuppiSession ||
                'Choose a session to preview the students eligible for link dispatch.'}
            </p>
            <div className="mt-5 rounded-[1.5rem] bg-ocean-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ocean-500">
                Eligible recipients
              </p>
              <p className="mt-2 text-4xl font-semibold text-ink-900">
                {String(eligibleForDispatch.length).padStart(2, '0')}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-700">
                Pending and failed deliveries are counted here. Sent records are excluded until
                a resend flow is triggered.
              </p>
            </div>
          </div>

          <EmptyState
            title="Reusable UI is in place"
            description="Status badges, filters, table views, modal confirmation, and toast feedback are all isolated so the next step can focus on API wiring."
          />
        </div>
      </section>

      <ConfirmSendModal
        isOpen={isModalOpen}
        sessionName={selectedSession?.kuppiSession || 'this session'}
        recipientCount={eligibleForDispatch.length}
        isSending={isSending}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleSendConfirm}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}
