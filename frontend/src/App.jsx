import { startTransition, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { getAdminSession, loginAdmin, logoutAdmin } from './api/auth'

// Admin Components
import Button from './components/Button'
import LoadingState from './components/LoadingState'
import AdminNavigation from './components/AdminNavigation'
import AppShell from './layouts/AppShell'
import ClassOfferingsPage from './pages/ClassOfferingsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import StudentsPage from './pages/StudentsPage'

// Student Components
import Sidebar from './components/Sidebar/Sidebar'
import TopBar from './components/TopBar/TopBar'
import Dashboard from './pages/Dashboard/Dashboard'
import LostAndFound from './pages/LostAndFound/LostAndFound'
import ItemDetails from './pages/LostAndFound/ItemDetails'
import ItemForm from './components/ItemForm/ItemForm'
import PaymentForm from './components/PaymentForm/PaymentForm'
import PaymentHistory from './components/PaymentHistory/PaymentHistory'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import KuppiRequest from './pages/KuppiRequest/KuppiRequest'
import AdminKuppiRequests from './pages/AdminKuppiRequests/AdminKuppiRequests'

// Styles
import './index.css'
import './App.css'

// Hooks
import { usePersistentState } from './hooks/usePersistentState'

const adminNavigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'class-offerings', label: 'Class Offerings' },
  { id: 'reports', label: 'Reports' },
]

function StudentApp() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lost-and-found" element={<LostAndFound />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/report-lost" element={<ItemForm formType="Lost" />} />
            <Route path="/report-found" element={<ItemForm formType="Found" />} />
            <Route
              path="/events"
              element={
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  Events Page (Dummy)
                </div>
              }
            />
            <Route
              path="/updates"
              element={
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  Updates Page (Dummy)
                </div>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/kuppi-request" element={<KuppiRequest />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function AdminApp() {
  const [currentView, setCurrentView] = usePersistentState('kuppi-admin-view', 'dashboard')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authState, setAuthState] = useState({
    status: 'loading',
    username: '',
    errorMessage: '',
  })

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      try {
        const response = await getAdminSession()

        if (!isActive) return

        startTransition(() => {
          setAuthState({
            status: 'authenticated',
            username: response.data.username,
            errorMessage: '',
          })
        })
      } catch (error) {
        if (!isActive) return

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
      // Even if the backend session already expired, return to login
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
            items={adminNavigationItems}
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

function App() {
  const [isAdminPath] = useState(() => {
    // Check if the path includes /admin or /kuppi-admin
    return window.location.pathname.includes('admin')
  })

  return (
    <Router>
      {isAdminPath ? <AdminApp /> : <StudentApp />}
    </Router>
  );
}

export default App;