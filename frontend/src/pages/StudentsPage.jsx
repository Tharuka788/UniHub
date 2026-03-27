import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import {
  createStudent,
  deactivateStudent,
  getStudentDetail,
  getStudents,
  updateStudent,
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
import SearchBar from '../components/SearchBar'
import StatusBadge from '../components/StatusBadge'
import Toast from '../components/Toast'
import { usePersistentState } from '../hooks/usePersistentState'
import { formatDateTime } from '../utils/formatters'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  studentCode: '',
}

function validateStudentForm(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters long.'
  } else if (/^\d+$/.test(values.fullName.trim())) {
    errors.fullName = 'Full name cannot be purely numeric.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Email must be valid.'
  }

  if (
    values.phone.trim() &&
    !/^(?:\+94\d{9}|0\d{9}|(?:\+94|0)\d{2}[-\s]?\d{3}[-\s]?\d{4})$/.test(values.phone.trim())
  ) {
    errors.phone = 'Phone must use a valid Sri Lankan local or international format.'
  }

  return errors
}

function StudentCard({ item, onView, onEdit, onDeactivate }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{item.fullName}</h3>
          <p className="mt-1 text-sm text-ink-700">{item.email}</p>
        </div>
        <StatusBadge value={item.isActive ? 'active' : 'inactive'} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-ink-700">
        <p>{item.phone || 'No phone number'}</p>
        <p>{item.studentCode || 'No student code'}</p>
        <p>Created: {formatDateTime(item.createdAt)}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="subtle" onClick={() => onView(item.id)}>
          View
        </Button>
        <Button variant="subtle" onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button variant="ghost" onClick={() => onDeactivate(item)}>
          Deactivate
        </Button>
      </div>
    </article>
  )
}

function StudentField({ label, value, muted = false }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className={`mt-2 text-sm leading-6 ${muted ? 'text-ink-500' : 'text-ink-900'}`}>
        {value}
      </p>
    </div>
  )
}

export default function StudentsPage() {
  const [filters, setFilters] = usePersistentState('kuppi-students-filters', {
    search: '',
    isActive: 'true',
  })
  const [page, setPage] = useState(1)
  const [listState, setListState] = useState({ items: [], pagination: null })
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formValues, setFormValues] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [detailItem, setDetailItem] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState(null)

  const deferredSearch = useDeferredValue(filters.search)

  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    setPageError('')

    try {
      const response = await getStudents({
        page,
        limit: 10,
        search: deferredSearch,
        isActive: filters.isActive,
      })

      setListState(response.data)
    } catch (error) {
      setPageError(error.message || 'Failed to load students.')
    } finally {
      setIsLoading(false)
    }
  }, [deferredSearch, filters.isActive, page])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function openCreateForm() {
    setEditingStudent(null)
    setFormValues(initialForm)
    setFormErrors({})
    setIsFormOpen(true)
  }

  function openEditForm(student) {
    setEditingStudent(student)
    setFormValues({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone || '',
      studentCode: student.studentCode || '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  async function openDetails(studentId) {
    setIsDetailLoading(true)
    setDetailItem(null)

    try {
      const response = await getStudentDetail(studentId)
      setDetailItem(response.data.item)
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Unable to load student',
        message: error.message || 'Student details could not be loaded.',
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  async function handleSave() {
    const nextErrors = validateStudentForm(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formValues)
      } else {
        await createStudent(formValues)
      }

      setToast({
        type: 'success',
        title: editingStudent ? 'Student updated' : 'Student created',
        message: `${formValues.fullName} has been saved successfully.`,
      })
      setFormErrors({})
      setIsFormOpen(false)
      await loadStudents()
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
        message: error.message || 'Student could not be saved.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeactivate() {
    if (!deletingStudent) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await deactivateStudent(deletingStudent.id)

      setToast({
        type: 'success',
        title: 'Student deactivated',
        message: `${response.data.item.fullName} is now inactive.`,
      })
      setDeletingStudent(null)
      await loadStudents()
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Action failed',
        message: error.message || 'Student could not be deactivated.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    { key: 'student', label: 'Student' },
    { key: 'phone', label: 'Phone' },
    { key: 'code', label: 'Student code' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ]

  const filterChips = [
    { key: 'search', label: 'Search', value: filters.search },
    {
      key: 'isActive',
      label: 'State',
      value:
        filters.isActive === 'true'
          ? 'Active'
          : filters.isActive === 'false'
            ? 'Inactive'
            : '',
    },
  ]

  function handleRemoveChip(key) {
    if (key === 'isActive') {
      updateFilters({ isActive: '' })
      return
    }

    updateFilters({ [key]: '' })
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <PageHeader
          eyebrow="Admin subsystem"
          title="Students"
          description="Manage student identities, keep activity state clean, and inspect each student’s linked enrollments."
        />
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterPanel>
            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_auto]">
              <SearchBar
                label="Search students"
                placeholder="Search by name, email, phone, or code"
                value={filters.search}
                onChange={(search) => updateFilters({ search })}
              />
              <label className="flex flex-col gap-2 text-sm text-ink-700">
                Activity state
                <select
                  value={filters.isActive}
                  onChange={(event) => updateFilters({ isActive: event.target.value })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
                >
                  <option value="true">Active students</option>
                  <option value="">All students</option>
                  <option value="false">Inactive students</option>
                </select>
              </label>
              <div className="flex gap-3 lg:self-end">
                <Button variant="subtle" onClick={() => updateFilters({ search: '', isActive: 'true' })}>
                  Reset
                </Button>
                <Button onClick={openCreateForm}>Add student</Button>
              </div>
            </div>
          </FilterPanel>
        </div>
        <ActiveFilterChips chips={filterChips} onRemove={handleRemoveChip} />

        {isLoading ? (
          <LoadingState />
        ) : pageError ? (
          <EmptyState
            title="Students could not be loaded"
            description={pageError}
            actionLabel="Retry"
            onAction={loadStudents}
          />
        ) : listState.items.length > 0 ? (
          <>
            <DataTable
              columns={columns}
              items={listState.items}
              renderRow={(item) => (
                <tr key={item.id} className="align-top text-sm text-ink-700">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink-900">{item.fullName}</p>
                    <p className="mt-1 text-ink-500">{item.email}</p>
                  </td>
                  <td className="px-5 py-4">{item.phone || 'No phone number'}</td>
                  <td className="px-5 py-4">{item.studentCode || 'Not assigned'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge value={item.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-4 text-ink-500">{formatDateTime(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="subtle" onClick={() => openDetails(item.id)}>
                        View
                      </Button>
                      <Button variant="subtle" onClick={() => openEditForm(item)}>
                        Edit
                      </Button>
                      {item.isActive ? (
                        <Button variant="ghost" onClick={() => setDeletingStudent(item)}>
                          Deactivate
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
              renderCard={(item) => (
                <StudentCard
                  key={item.id}
                  item={item}
                  onView={openDetails}
                  onEdit={openEditForm}
                  onDeactivate={setDeletingStudent}
                />
              )}
            />
            <PaginationControls pagination={listState.pagination} onPageChange={setPage} />
          </>
        ) : (
          <EmptyState
            title="No students match the current filters"
            description="Adjust the search or activity filter, or create the first student from this module."
            actionLabel="Add student"
            onAction={openCreateForm}
          />
        )}
      </section>

      <EntityFormModal
        isOpen={isFormOpen}
        title={editingStudent ? 'Edit student' : 'Create student'}
        description="Student records are shared across enrollments, so identity details should stay accurate and normalized."
        submitLabel={editingStudent ? 'Save changes' : 'Create student'}
        isSubmitting={isSubmitting}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleSave}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-ink-700 sm:col-span-2">
            Full name
            <input
              value={formValues.fullName}
              onChange={(event) => setFormValues((current) => ({ ...current, fullName: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.fullName ? <span className="text-xs text-coral-600">{formErrors.fullName}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Email
            <input
              value={formValues.email}
              onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.email ? <span className="text-xs text-coral-600">{formErrors.email}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700">
            Phone
            <input
              value={formValues.phone}
              onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
            {formErrors.phone ? <span className="text-xs text-coral-600">{formErrors.phone}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm text-ink-700 sm:col-span-2">
            Student code
            <input
              value={formValues.studentCode}
              onChange={(event) => setFormValues((current) => ({ ...current, studentCode: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
            />
          </label>
        </div>
      </EntityFormModal>

      <DetailDrawer
        isOpen={Boolean(detailItem) || isDetailLoading}
        title={detailItem?.fullName || 'Loading student'}
        subtitle={detailItem?.email || 'Fetching student detail'}
        onClose={() => setDetailItem(null)}
      >
        {isDetailLoading ? (
          <LoadingState />
        ) : detailItem ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <StudentField label="Phone" value={detailItem.phone || 'No phone number'} muted={!detailItem.phone} />
              <StudentField
                label="Student code"
                value={detailItem.studentCode || 'Not assigned'}
                muted={!detailItem.studentCode}
              />
              <StudentField
                label="Activity"
                value={detailItem.isActive ? 'Active' : `Inactive since ${formatDateTime(detailItem.deactivatedAt)}`}
              />
              <StudentField label="Created" value={formatDateTime(detailItem.createdAt)} />
            </div>
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
                            {enrollment.classOffering?.title || 'Unknown class'}
                          </p>
                          <p className="mt-1 text-sm text-ink-700">
                            {enrollment.classOffering?.kuppiSession || 'No session'}
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
                    description="This student has not yet been associated with any confirmed enrollment records."
                  />
                )}
              </div>
            </div>
          </>
        ) : null}
      </DetailDrawer>

      <DeleteConfirmModal
        isOpen={Boolean(deletingStudent)}
        title="Deactivate student"
        description={`This keeps historical enrollments intact while removing ${deletingStudent?.fullName || 'the student'} from active operations.`}
        confirmLabel="Deactivate"
        isSubmitting={isSubmitting}
        onCancel={() => setDeletingStudent(null)}
        onConfirm={handleDeactivate}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
