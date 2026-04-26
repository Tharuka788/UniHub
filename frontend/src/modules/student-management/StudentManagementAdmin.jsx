import { startTransition, useEffect, useState } from 'react'
import { getAdminSession, loginAdmin, logoutAdmin } from './api/auth'
import Button from './components/Button'
import LoadingState from './components/LoadingState'
import AdminNavigation from './components/AdminNavigation'
import { usePersistentState } from './hooks/usePersistentState'
import AppShell from './layouts/AppShell'
import ClassOfferingsPage from './pages/ClassOfferingsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import StudentsPage from './pages/StudentsPage'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'class-offerings', label: 'Class Offerings' },
  { id: 'reports', label: 'Reports' },
]

function StudentManagementAdmin() {
  const [currentView, setCurrentView] = usePersistentState('kuppi-admin-view', 'dashboard')
  const [authState, setAuthState] = useState({
    status: 'loading',
    username: '',
    errorMessage: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      try {
        const response = await getAdminSession()

        if (!isActive) {
          return
        }

        startTransition(() => {
          setAuthState({
            status: 'authenticated',
            username: response.data.username,
            errorMessage: '',
          })
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        startTransition(() => {
          setAuthState({
            status: 'unauthenticated',
            username: '',
            errorMessage: error.statusCode && error.statusCode !== 401 ? error.message : '',
          })
        })
      }
    }

    loadSession()

    return () => {
      isActive = false
    }
  }, [])

  async function handleLogin(credentials) {
    setIsSubmitting(true)

    try {
      const response = await loginAdmin(credentials)

      startTransition(() => {
        setAuthState({
          status: 'authenticated',
          username: response.data.username,
          errorMessage: '',
        })
      })
    } catch (error) {
      startTransition(() => {
        setAuthState({
          status: 'unauthenticated',
          username: '',
          errorMessage: error.message,
        })
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    setIsSubmitting(true)

    try {
      await logoutAdmin()
    } catch {
      // Even if the backend session already expired, return the UI to the login screen.
    } finally {
      startTransition(() => {
        setAuthState({
          status: 'unauthenticated',
          username: '',
          errorMessage: '',
        })
      })
      setIsSubmitting(false)
    }
  }

  if (authState.status === 'loading') {
    return (
      <AppShell>
        <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-panel backdrop-blur">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-ocean-500">
              Admin Access
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
              Checking your admin session
            </h1>
          </div>
          <LoadingState />
        </section>
      </AppShell>
    )
  }

  if (authState.status !== 'authenticated') {
    return (
      <LoginPage
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        errorMessage={authState.errorMessage}
      />
    )
  }

  const currentPage =
    currentView === 'students' ? (
      <StudentsPage />
    ) : currentView === 'class-offerings' ? (
      <ClassOfferingsPage />
    ) : currentView === 'reports' ? (
      <ReportsPage />
    ) : (
      <DashboardPage />
    )

  return (
    <AppShell
      navigation={
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminNavigation
            items={navigationItems}
            currentView={currentView}
            onChange={setCurrentView}
          />
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full bg-ocean-50 px-4 py-2 text-sm text-ink-700">
              Signed in as <span className="font-semibold text-ink-900">{authState.username}</span>
            </p>
            <Button variant="subtle" onClick={handleLogout} disabled={isSubmitting}>
              {isSubmitting ? 'Signing out...' : 'Log out'}
            </Button>
          </div>
        </div>
      }
    >
      {currentPage}
    </AppShell>
  )
}

export default StudentManagementAdmin
