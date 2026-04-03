import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import {
  archiveClassOffering,
  createClassOffering,
  getClassOfferingDetail,
  getClassOfferings,
  updateClassOffering,
} from '../api/admin'
import ActiveFilterChips from '../components/ActiveFilterChips'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DetailDrawer from '../components/DetailDrawer'
import EmptyState from '../components/EmptyState'
import EntityFormModal from '../components/EntityFormModal'
import FilterPanel from '../components/FilterPanel'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import PaginationControls from '../components/PaginationControls'
import ReadinessBadge from '../components/ReadinessBadge'
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { usePersistentState } from '../hooks/usePersistentState'
import { formatDateTime } from '../utils/formatters'

const initialForm = {
  title: '',
  kuppiSession: '',
  classLink: '',
  startDateTime: '',
  status: 'ready',
}

function validateOfferingForm(values) {
  const errors = {}

  if (!values.title.trim()) {
    errors.title = 'Title is required.'
  } else if (values.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long.'
  }

  if (!values.kuppiSession.trim()) {
    errors.kuppiSession = 'Kuppi session is required.'
  }

  if (values.classLink.trim()) {
    try {
      new URL(values.classLink.trim())
    } catch {
      errors.classLink = 'Class link must be a valid URL.'
    }
  }

  return errors
}

function OfferingCard({ item, onView, onEdit, onArchive }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{item.title}</h3>
          <p className="mt-1 text-sm text-ink-700">{item.kuppiSession}</p>
        </div>
        <StatusBadge value={item.isArchived ? 'archived' : item.status} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-ink-700">
        <p>Students: {item.linkedStudentCount}</p>
        <p>Dispatch attempts: {item.dispatchAttemptCount}</p>
        <p>Start: {formatDateTime(item.startDateTime, 'Not scheduled')}</p>
      </div>
      <div className="mt-4">
        <ReadinessBadge readiness={item.readiness} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="subtle" onClick={() => onView(item.id)}>
          View
        </Button>
        {!item.isArchived ? (
          <>
            <Button variant="subtle" onClick={() => onEdit(item)}>
              Edit
            </Button>
            <Button variant="ghost" onClick={() => onArchive(item)}>
              Archive
            </Button>
          </>
        ) : null}
      </div>
    </article>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink-900">{value}</p>
    </div>
  )
}

export default function ClassOfferingsPage() {
  const [filters, setFilters] = usePersistentState('kuppi-class-offerings-filters', {
    search: '',
    status: '',
    isArchived: 'false',
  })
  const [page, setPage] = useState(1)
  const [listState, setListState] = useState({ items: [], pagination: null })
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [archivingItem, setArchivingItem] = useState(null)
  const [formValues, setFormValues] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})

  const deferredSearch = useDeferredValue(filters.search)

  const loadOfferings = useCallback(async () => {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getClassOfferings({
        page,
        limit: 10,
        search: deferredSearch,
        status: filters.status,
        isArchived: filters.isArchived,
      })

      setListState(response.data)
    } catch (error) {
      setPageError(error.message || 'Failed to load class offerings.')
    } finally {
      setIsLoading(false)
    }
  }, [deferredSearch, filters.isArchived, filters.status, page])

  useEffect(() => {
    loadOfferings()
  }, [loadOfferings])

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function openCreateForm() {
    setEditingItem(null)
    setFormValues(initialForm)
    setFormErrors({})
    setIsFormOpen(true)
  }

  function openEditForm(item) {
    setEditingItem(item)
    setFormValues({
      title: item.title,
      kuppiSession: item.kuppiSession,
      classLink: item.classLink || '',
      startDateTime: item.startDateTime
        ? new Date(item.startDateTime).toISOString().slice(0, 16)
        : '',
      status: item.status,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  async function openDetails(id) {
    setIsDetailLoading(true)
    setDetailItem(null)

    try {
      const response = await getClassOfferingDetail(id)
      setDetailItem(response.data.item)
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Unable to load class offering',
        message: error.message || 'Class offering details could not be loaded.',
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  async function handleSave() {
    const nextErrors = validateOfferingForm(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      if (editingItem) {
        await updateClassOffering(editingItem.id, formValues)
      } else {
        await createClassOffering(formValues)
      }

      setToast({
        type: 'success',
        title: editingItem ? 'Class offering updated' : 'Class offering created',
        message: `${formValues.title} has been saved successfully.`,
      })
      setFormErrors({})
      setIsFormOpen(false)
      await loadOfferings()
    } catch (error) {
      if (error.details?.length) {
        setFormErrors(
          error.details.reduce(
            (accumulator, detail) => ({
              ...accumulator,
              [detail.path]: detail.message,
            }),
            {},
          ),
        )
      }

      setToast({
        type: 'error',
        title: 'Save failed',
        message: error.message || 'Class offering could not be saved.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleArchive() {
    if (!archivingItem) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await archiveClassOffering(archivingItem.id)

      setToast({
        type: 'success',
        title: 'Class offering archived',
        message: `${response.data.item.title} has been archived.`,
      })
      setArchivingItem(null)
      await loadOfferings()
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Action failed',
        message: error.message || 'Class offering could not be archived.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    { key: 'offering', label: 'Class offering' },
    { key: 'status', label: 'Status' },
    { key: 'students', label: 'Linked students' },
    { key: 'dispatch', label: 'Dispatch' },
    { key: 'start', label: 'Start time' },
    { key: 'actions', label: 'Actions' },
  ]

  const filterChips = [
    { key: 'search', label: 'Search', value: filters.search },
    { key: 'status', label: 'Status', value: filters.status },
    {
      key: 'isArchived',
      label: 'Archive',
      value:
        filters.isArchived === 'true'
          ? 'Archived only'
          : filters.isArchived === 'false'
            ? 'Active only'
            : '',
    },
  ]

  const readinessSummary = listState.items.reduce(
    (summary, item) => {
      if (item.readiness?.label === 'Ready') {
        summary.ready += 1
      } else if (item.readiness?.label === 'Almost Ready') {
        summary.almostReady += 1
      } else {
        summary.needsSetup += 1
      }

      return summary
    },
    { ready: 0, almostReady: 0, needsSetup: 0 },
  )

  function handleRemoveChip(key) {
    if (key === 'isArchived') {
      updateFilters({ isArchived: '' })
      return
    }

    updateFilters({ [key]: '' })
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <PageHeader
          eyebrow="Admin subsystem"
          title="Class offerings"
          description="Create, update, inspect, and archive teaching sessions without losing enrollment or dispatch history."
        />
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <FilterPanel>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr_auto]">
            <SearchBar
              label="Search class offerings"
              placeholder="Search by class title or kuppi session"
              value={filters.search}
              onChange={(search) => updateFilters({ search })}
            />
            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Status
              <select
                value={filters.status}
                onChange={(event) => updateFilters({ status: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-ink-700">
              Archive state
              <select
                value={filters.isArchived}
                onChange={(event) => updateFilters({ isArchived: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
              >
                <option value="false">Active only</option>
                <option value="">All records</option>
                <option value="true">Archived only</option>
              </select>
            </label>
            <div className="flex gap-3 lg:self-end">
              <Button
                variant="subtle"
                onClick={() => updateFilters({ search: '', status: '', isArchived: 'false' })}
              >
                Reset
              </Button>
              <Button onClick={openCreateForm}>Add class</Button>
            </div>
          </div>
        </FilterPanel>
        <ActiveFilterChips chips={filterChips} onRemove={handleRemoveChip} />

        {!isLoading && !pageError && listState.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <DetailField label="Ready" value={String(readinessSummary.ready)} />
            <DetailField label="Almost Ready" value={String(readinessSummary.almostReady)} />
            <DetailField label="Needs Setup" value={String(readinessSummary.needsSetup)} />
          </div>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : pageError ? (
          <EmptyState
            title="Class offerings could not be loaded"
            description={pageError}
            actionLabel="Retry"
            onAction={loadOfferings}
          />
        ) : listState.items.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              items={listState.items}
              renderRow={(item) => (
                <tr key={item.id} className="align-top text-sm text-ink-700">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink-900">{item.title}</p>
                    <p className="mt-1 text-ink-500">{item.kuppiSession}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-3">
                      <StatusBadge value={item.isArchived ? 'archived' : item.status} />
                      <ReadinessBadge readiness={item.readiness} />
                    </div>
                  </td>
                  <td className="px-5 py-4">{item.linkedStudentCount}</td>
                  <td className="px-5 py-4">
                    {item.failedDispatchCount} failed / {item.dispatchAttemptCount} attempts
                  </td>
                  <td className="px-5 py-4 text-ink-500">
                    {formatDateTime(item.startDateTime, 'Not scheduled')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="subtle" onClick={() => openDetails(item.id)}>
                        View
                      </Button>
                      {!item.isArchived ? (
                        <>
                          <Button variant="subtle" onClick={() => openEditForm(item)}>
                            Edit
                          </Button>
                          <Button variant="ghost" onClick={() => setArchivingItem(item)}>
                            Archive
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
              renderCard={(item) => (
                <OfferingCard
                  key={item.id}
                  item={item}
                  onView={openDetails}
                  onEdit={openEditForm}
                  onArchive={setArchivingItem}
                />
              )}
            />
            <PaginationControls pagination={listState.pagination} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No class offerings match the current filters"
            description="Adjust the search or archive filters, or create the first class offering from this module."
            actionLabel="Add class"
            onAction={openCreateForm}
          />
        )}
      </section>

      <EntityFormModal
        isOpen={isFormOpen}
        title={editingItem ? 'Edit class offering' : 'Create class offering'}
        description="Class offerings define the session, class link, and operational status used throughout the admin subsystem."
        submitLabel={editingItem ? 'Save changes' : 'Create class offering'}
        isSubmitting={isSubmitting}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleSave}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ink-700 sm:col-span-2">
            Title
            <input
              value={formValues.title}
              onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.title ? <span className="text-xs text-coral-600">{formErrors.title}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700 sm:col-span-2">
            Kuppi session
            <input
              value={formValues.kuppiSession}
              onChange={(event) => setFormValues((current) => ({ ...current, kuppiSession: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.kuppiSession ? (
              <span className="text-xs text-coral-600">{formErrors.kuppiSession}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700 sm:col-span-2">
            Class link
            <input
              value={formValues.classLink}
              onChange={(event) => setFormValues((current) => ({ ...current, classLink: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.classLink ? <span className="text-xs text-coral-600">{formErrors.classLink}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Start date and time
            <input
              type="datetime-local"
              value={formValues.startDateTime}
              onChange={(event) => setFormValues((current) => ({ ...current, startDateTime: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Status
            <select
              value={formValues.status}
              onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      </EntityFormModal>

      <DetailDrawer
        isOpen={Boolean(detailItem) || isDetailLoading}
        title={detailItem?.title || 'Loading class offering'}
        subtitle={detailItem?.kuppiSession || 'Fetching class offering detail'}
        onClose={() => setDetailItem(null)}
      >
        {isDetailLoading ? (
          <LoadingState />
        ) : detailItem ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Status" value={detailItem.isArchived ? 'Archived' : detailItem.status} />
              <DetailField label="Linked students" value={String(detailItem.linkedStudentCount)} />
              <DetailField label="Dispatch attempts" value={String(detailItem.dispatchAttemptCount)} />
              <DetailField label="Class link" value={detailItem.classLink || 'No class link'} />
              <DetailField
                label="Start time"
                value={formatDateTime(detailItem.startDateTime, 'Not scheduled')}
              />
            </div>
            <ReadinessBadge readiness={detailItem.readiness} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                Linked enrollments
              </p>
              <div className="mt-4 grid gap-3">
                {detailItem.linkedEnrollments.length > 0 ? (
                  detailItem.linkedEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">
                            {enrollment.student?.fullName || 'Unknown student'}
                          </p>
                          <p className="mt-1 text-sm text-ink-700">
                            {enrollment.student?.email || 'No email'}
                          </p>
                        </div>
                        <StatusBadge value={enrollment.linkDeliveryStatus} />
                      </div>
                      <p className="mt-3 text-sm text-ink-700">
                        Registration: {enrollment.registrationReference}
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No linked enrollments"
                    description="This class offering has not yet received any confirmed enrollments."
                  />
                )}
              </div>
            </div>
          </>
        ) : null}
      </DetailDrawer>

      <DeleteConfirmModal
        isOpen={Boolean(archivingItem)}
        title="Archive class offering"
        description={`Archiving keeps linked enrollments and dispatch history while removing ${archivingItem?.title || 'this class offering'} from active workflows.`}
        confirmLabel="Archive"
        isSubmitting={isSubmitting}
        onCancel={() => setArchivingItem(null)}
        onConfirm={handleArchive}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
