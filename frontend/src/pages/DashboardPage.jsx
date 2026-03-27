import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import {
  getClassOfferings,
  getDashboardSummary,
  getEnrollments,
  sendClassLinks,
} from '../api/admin'
import ActiveFilterChips from '../components/ActiveFilterChips'
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

export default function DashboardPage() {
  const [filters, setFilters] = usePersistentState('kuppi-dashboard-filters', {
    search: '',
    kuppiSession: '',
    linkDeliveryStatus: '',
    dateFrom: '',
    dateTo: '',
    paymentReference: '',
    registrationReference: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
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

  const adminPriorities = [
    !selectedSession
      ? {
          title: 'Choose a dispatch session',
          description:
            'Select a class offering to preview recipients and enable the class-link send action.',
          tone: 'bg-ocean-50 text-ocean-500',
        }
      : {
          title: `${String(dispatchPreviewCount).padStart(2, '0')} students ready for dispatch`,
          description:
            dispatchPreviewCount > 0
              ? 'This session still has pending or failed deliveries that can be sent from the dashboard.'
              : 'This session has no pending recipients right now, so the delivery queue is clear.',
          tone: dispatchPreviewCount > 0 ? 'bg-sand-100 text-ink-900' : 'bg-mint-100 text-mint-600',
        },
    (summary?.totalFailedSends ?? 0) > 0
      ? {
          title: 'Review failed deliveries',
          description: `${summary?.totalFailedSends ?? 0} delivery attempts need attention. Check the affected session and resend after verifying the class link.`,
          tone: 'bg-coral-100 text-coral-600',
        }
      : {
          title: 'Delivery health looks stable',
          description:
            'No failed send attempts are currently blocking the admin workflow.',
          tone: 'bg-mint-100 text-mint-600',
        },
    (summary?.totalPendingLinkSends ?? 0) > 0
      ? {
          title: 'Pending queue still needs action',
          description: `${summary?.totalPendingLinkSends ?? 0} confirmed enrollments are still waiting for a class link.`,
          tone: 'bg-sand-100 text-ink-900',
        }
      : {
          title: 'Confirmed students are up to date',
          description:
            'There are no pending class-link sends across the current dashboard totals.',
          tone: 'bg-ocean-50 text-ocean-500',
        },
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
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            paymentReference: filters.paymentReference,
            registrationReference: filters.registrationReference,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
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
    [
      deferredSearch,
      filters.dateFrom,
      filters.dateTo,
      filters.kuppiSession,
      filters.linkDeliveryStatus,
      filters.paymentReference,
      filters.registrationReference,
      filters.sortBy,
      filters.sortOrder,
      page,
    ],
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
      dateFrom: '',
      dateTo: '',
      paymentReference: '',
      registrationReference: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  const filterChips = [
    { key: 'search', label: 'Search', value: filters.search },
    { key: 'kuppiSession', label: 'Session', value: filters.kuppiSession },
    { key: 'linkDeliveryStatus', label: 'Delivery', value: filters.linkDeliveryStatus },
    { key: 'registrationReference', label: 'Registration', value: filters.registrationReference },
    { key: 'paymentReference', label: 'Payment', value: filters.paymentReference },
    { key: 'dateFrom', label: 'From', value: filters.dateFrom },
    { key: 'dateTo', label: 'To', value: filters.dateTo },
    {
      key: 'sort',
      label: 'Sort',
      value:
        filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc'
          ? `${filters.sortBy} ${filters.sortOrder}`
          : '',
    },
  ]

  function handleRemoveChip(key) {
    if (key === 'sort') {
      updateFilters({ sortBy: 'createdAt', sortOrder: 'desc' })
      return
    }

    updateFilters({ [key]: '' })
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
    <>
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

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel xl:col-span-7 2xl:col-span-8">
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
                onRegistrationReferenceChange={(registrationReference) =>
                  updateFilters({ registrationReference })
                }
                onPaymentReferenceChange={(paymentReference) =>
                  updateFilters({ paymentReference })
                }
                onDateFromChange={(dateFrom) => updateFilters({ dateFrom })}
                onDateToChange={(dateTo) => updateFilters({ dateTo })}
                onSortByChange={(sortBy) => updateFilters({ sortBy })}
                onSortOrderChange={(sortOrder) => updateFilters({ sortOrder })}
                onReset={handleReset}
              />
              <ActiveFilterChips chips={filterChips} onRemove={handleRemoveChip} />

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

        <div className="space-y-5 xl:col-span-5 2xl:col-span-4">
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

          <div className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
              Admin priorities
            </p>
            <div className="mt-4 space-y-4">
              {adminPriorities.map((priority) => (
                <article
                  key={priority.title}
                  className="rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-4"
                >
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${priority.tone}`}
                  >
                    {priority.title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-700">{priority.description}</p>
                </article>
              ))}
            </div>
          </div>
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
    </>
  )
}
