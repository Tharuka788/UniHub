import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import {
  getClassOfferings,
  getDashboardSummary,
  getEnrollments,
  sendClassLinks,
} from '../api/admin'
import Button from '../components/Button'
import ConfirmSendModal from '../components/ConfirmSendModal'
import EmptyState from '../components/EmptyState'
import FilterBar from '../components/FilterBar'
import LoadingState from '../components/LoadingState'
import PaginationControls from '../components/PaginationControls'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StudentTable from '../components/StudentTable'
import Toast from '../components/Toast'
import { isStandaloneMode } from '../app/runtimeMode'
import { usePersistentState } from '../hooks/usePersistentState'
import AppShell from '../layouts/AppShell'

export default function DashboardPage() {
  const [filters, setFilters] = usePersistentState('kuppi-dashboard-filters', {
    search: '',
    kuppiSession: '',
    linkDeliveryStatus: '',
  })
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [summary, setSummary] = useState(null)
  const [classOfferings, setClassOfferings] = useState([])
  const [listState, setListState] = useState({
    items: [],
    pagination: null,
  })
  const [dispatchPreviewCount, setDispatchPreviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingList, setIsRefreshingList] = useState(false)
  const [pageError, setPageError] = useState('')

  const deferredSearch = useDeferredValue(filters.search)

  const selectedSession =
    classOfferings.find((session) => session.kuppiSession === filters.kuppiSession) || null

  const summaryCards = [
    { label: 'Confirmed Students', value: summary?.totalConfirmedStudents ?? 0, tone: 'accent' },
    { label: 'Links Sent', value: summary?.totalLinksSent ?? 0, tone: 'success' },
    { label: 'Pending', value: summary?.totalPendingLinkSends ?? 0, tone: 'warning' },
    { label: 'Failed', value: summary?.totalFailedSends ?? 0, tone: 'neutral' },
  ]

  const loadDispatchPreview = useCallback(async (session) => {
    if (!session) {
      setDispatchPreviewCount(0)
      return
    }

    try {
      const response = await getEnrollments({
        page: 1,
        limit: 100,
        kuppiSession: session.kuppiSession,
      })

      const eligibleCount = response.data.items.filter(
        (item) => item.linkDeliveryStatus !== 'sent',
      ).length

      setDispatchPreviewCount(eligibleCount)
    } catch {
      setDispatchPreviewCount(0)
    }
  }, [])

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setIsRefreshingList(true)
      } else {
        setIsLoading(true)
      }

      setPageError('')

      try {
        const [summaryResponse, offeringsResponse, enrollmentsResponse] = await Promise.all([
          getDashboardSummary(),
          getClassOfferings(),
          getEnrollments({
            page,
            limit: 10,
            search: deferredSearch,
            kuppiSession: filters.kuppiSession,
            linkDeliveryStatus: filters.linkDeliveryStatus,
          }),
        ])

        setSummary(summaryResponse.data)
        setClassOfferings(offeringsResponse.data.items)
        setListState(enrollmentsResponse.data)
      } catch (error) {
        setPageError(error.message || 'Failed to load dashboard data.')
      } finally {
        setIsLoading(false)
        setIsRefreshingList(false)
      }
    },
    [deferredSearch, filters.kuppiSession, filters.linkDeliveryStatus, page],
  )

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    loadDispatchPreview(selectedSession)
  }, [loadDispatchPreview, selectedSession])

  useEffect(() => {
    if (isStandaloneMode() && !filters.kuppiSession && classOfferings.length > 0) {
      setFilters((current) => ({
        ...current,
        kuppiSession: classOfferings[0].kuppiSession,
      }))
    }
  }, [classOfferings, filters.kuppiSession, setFilters])

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function handleReset() {
    setFilters({
      search: '',
      kuppiSession: '',
      linkDeliveryStatus: '',
    })
    setPage(1)
  }

  async function handleSendConfirm() {
    setIsSending(true)
    try {
      const response = await sendClassLinks({
        classOfferingId: selectedSession.id,
      })

      const result = response.data
      const toastType = result.failed > 0 ? 'error' : 'success'
      const toastTitle =
        result.failed > 0 ? 'Dispatch completed with failures' : 'Dispatch complete'

      setToast({
        type: toastType,
        title: toastTitle,
        message: `${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped for ${result.classOffering.title}.`,
      })
      setIsModalOpen(false)
      await loadDashboard({ silent: true })
      await loadDispatchPreview(selectedSession)
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Dispatch failed',
        message: error.message || 'Unable to send class links.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AppShell>
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <PageHeader
          eyebrow="Kuppi System"
          title="Student confirmation dashboard"
          description="Track confirmed enrollments, review delivery status, and dispatch class links from one clean admin workspace."
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
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedSession || isSending || dispatchPreviewCount === 0}
            >
              Send class link
            </Button>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : pageError ? (
            <EmptyState
              title="Dashboard data could not be loaded"
              description={pageError}
              actionLabel="Retry"
              onAction={() => loadDashboard()}
            />
          ) : (
            <>
              <FilterBar
                filters={filters}
                sessions={classOfferings}
                onSearchChange={(search) => updateFilters({ search })}
                onSessionChange={(kuppiSession) => updateFilters({ kuppiSession })}
                onStatusChange={(linkDeliveryStatus) => updateFilters({ linkDeliveryStatus })}
                onReset={handleReset}
              />

              {isRefreshingList ? (
                <LoadingState />
              ) : listState.items.length > 0 ? (
                <>
                  <StudentTable items={listState.items} />
                  <PaginationControls
                    pagination={listState.pagination}
                    onPageChange={setPage}
                  />
                </>
              ) : (
                <EmptyState
                  title="No students match the current filters"
                  description="Adjust the search term, session, or delivery state to reveal the confirmed enrollment list."
                />
              )}
            </>
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
                {String(dispatchPreviewCount).padStart(2, '0')}
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
        recipientCount={dispatchPreviewCount}
        isSending={isSending}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleSendConfirm}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppShell>
  )
}
