import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  downloadReportPdf,
  getClassOfferings,
  getReportSummary,
} from '../api/admin'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import FilterPanel from '../components/FilterPanel'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import ReadinessBadge from '../components/ReadinessBadge'
import Toast from '../components/Toast'
import { usePersistentState } from '../hooks/usePersistentState'
import { formatDateTime } from '../utils/formatters'

const reportOptions = [
  { value: 'confirmed-students', label: 'Confirmed students' },
  { value: 'dispatch-summary', label: 'Dispatch summary' },
  { value: 'class-offering-summary', label: 'Class offering summary' },
]

function PreviewCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
    </article>
  )
}

function PreviewList({ title, items, renderItem, emptyMessage }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">{items.map(renderItem)}</div>
      ) : (
        <p className="mt-4 text-sm text-ink-500">{emptyMessage}</p>
      )}
    </div>
  )
}

function validateFilters(filters) {
  const errors = {}

  if (!filters.reportType) {
    errors.reportType = 'Report type is required.'
  }

  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    errors.dateFrom = 'Date from cannot be after date to.'
  }

  return errors
}

export default function ReportsPage() {
  const [filters, setFilters] = usePersistentState('kuppi-reports-filters', {
    reportType: 'confirmed-students',
    classOfferingId: '',
    dateFrom: '',
    dateTo: '',
    deliveryStatus: '',
    includeArchived: false,
  })
  const [offerings, setOfferings] = useState([])
  const [summary, setSummary] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState(null)

  const selectedOffering = useMemo(
    () => offerings.find((offering) => offering.id === filters.classOfferingId) || null,
    [filters.classOfferingId, offerings],
  )

  const loadReportData = useCallback(async () => {
    const validationErrors = validateFilters(filters)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setSummary(null)
      setIsLoading(false)
      setIsSummaryLoading(false)
      return
    }

    setPageError('')
    setIsSummaryLoading(true)

    try {
      const response = await getReportSummary(filters)
      setSummary(response.data)
    } catch (error) {
      setSummary(null)
      setPageError(error.message || 'Report summary could not be loaded.')
    } finally {
      setIsLoading(false)
      setIsSummaryLoading(false)
    }
  }, [filters])

  useEffect(() => {
    async function bootstrap() {
      setIsLoading(true)

      try {
        const response = await getClassOfferings({
          page: 1,
          limit: 100,
          isArchived: '',
        })

        setOfferings(response.data.items)
      } catch (error) {
        setPageError(error.message || 'Class offerings could not be loaded for reports.')
      }
    }

    bootstrap()
  }, [])

  useEffect(() => {
    loadReportData()
  }, [loadReportData])

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  async function handleDownload() {
    const validationErrors = validateFilters(filters)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsDownloading(true)

    try {
      const { blob, filename } = await downloadReportPdf(filters)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)

      setToast({
        type: 'success',
        title: 'Report downloaded',
        message: `${filename} is ready.`,
      })
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Download failed',
        message: error.message || 'The PDF report could not be downloaded.',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <PageHeader
          eyebrow="Reporting layer"
          title="Reports center"
          description="Preview operational totals, validate filters, and download backend-generated PDF reports for academic administration."
        />
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <FilterPanel>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Report type
              <select
                value={filters.reportType}
                onChange={(event) => updateFilters({ reportType: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              >
                {reportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.reportType ? (
                <span className="text-xs text-coral-600">{errors.reportType}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Class offering
              <select
                value={filters.classOfferingId}
                onChange={(event) => updateFilters({ classOfferingId: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              >
                <option value="">All class offerings</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.kuppiSession}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Delivery status
              <select
                value={filters.deliveryStatus}
                onChange={(event) => updateFilters({ deliveryStatus: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Date from
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(event) => updateFilters({ dateFrom: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              />
              {errors.dateFrom ? (
                <span className="text-xs text-coral-600">{errors.dateFrom}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Date to
              <input
                type="date"
                value={filters.dateTo}
                onChange={(event) => updateFilters({ dateTo: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              />
            </label>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700 xl:self-end">
              <input
                type="checkbox"
                checked={filters.includeArchived}
                onChange={(event) => updateFilters({ includeArchived: event.target.checked })}
              />
              Include archived class offerings
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="subtle"
              onClick={() =>
                updateFilters({
                  reportType: 'confirmed-students',
                  classOfferingId: '',
                  dateFrom: '',
                  dateTo: '',
                  deliveryStatus: '',
                  includeArchived: false,
                })
              }
            >
              Reset filters
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isSummaryLoading || !summary || summary.totalRows === 0}
            >
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </FilterPanel>

        {isLoading || isSummaryLoading ? (
          <LoadingState />
        ) : pageError ? (
          <EmptyState
            title="Report preview could not be loaded"
            description={pageError}
            actionLabel="Retry"
            onAction={loadReportData}
          />
        ) : summary ? (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                Preview scope
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">
                {summary.title}
              </h2>
              <p className="mt-2 text-sm text-ink-700">
                Generated {formatDateTime(summary.generatedAt)} for{' '}
                {selectedOffering ? selectedOffering.kuppiSession : 'all class offerings'}.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summary.metrics.map((metric) => (
                <PreviewCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>

            {summary.readinessSummary ? (
              <div className="grid gap-4 md:grid-cols-3">
                <PreviewCard label="Ready" value={summary.readinessSummary.ready} />
                <PreviewCard
                  label="Almost Ready"
                  value={summary.readinessSummary.almostReady}
                />
                <PreviewCard
                  label="Needs Setup"
                  value={summary.readinessSummary.needsSetup}
                />
              </div>
            ) : null}

            <PreviewList
              title="Preview rows"
              items={summary.previewRows}
              emptyMessage="No preview rows are available for the current report type and filters."
              renderItem={(item, index) => (
                <div
                  key={`${item.studentName || item.title || item.recipient}-${index}`}
                  className="rounded-[1.25rem] border border-white/70 bg-white px-4 py-3 text-sm text-ink-700"
                >
                  <p className="font-semibold text-ink-900">
                    {item.studentName || item.title || item.recipient}
                  </p>
                  <p className="mt-1">
                    {item.email || item.kuppiSession || item.status || item.subject}
                  </p>
                  {item.readiness ? (
                    <div className="mt-3">
                      <ReadinessBadge readiness={item.readiness} />
                    </div>
                  ) : null}
                </div>
              )}
            />

            {summary.failedRecipients.length > 0 ? (
              <PreviewList
                title="Failed recipients"
                items={summary.failedRecipients}
                emptyMessage=""
                renderItem={(item, index) => (
                  <div
                    key={`${item.email}-${index}`}
                    className="rounded-[1.25rem] border border-white/70 bg-white px-4 py-3 text-sm text-ink-700"
                  >
                    <p className="font-semibold text-ink-900">{item.studentName}</p>
                    <p className="mt-1">{item.email}</p>
                    <p className="mt-1 text-ink-500">{item.kuppiSession}</p>
                  </div>
                )}
              />
            ) : null}

            {summary.recentDispatches.length > 0 ? (
              <PreviewList
                title="Recent dispatch history"
                items={summary.recentDispatches}
                emptyMessage=""
                renderItem={(item, index) => (
                  <div
                    key={`${item.recipient}-${index}`}
                    className="rounded-[1.25rem] border border-white/70 bg-white px-4 py-3 text-sm text-ink-700"
                  >
                    <p className="font-semibold text-ink-900">
                      {item.studentName} · {item.status}
                    </p>
                    <p className="mt-1">{item.recipient}</p>
                    <p className="mt-1 text-ink-500">
                      {item.kuppiSession} · {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                )}
              />
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="No report preview available"
            description="Adjust the selected report type or filters to generate a preview."
          />
        )}
      </section>

      {toast ? (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  )
}
