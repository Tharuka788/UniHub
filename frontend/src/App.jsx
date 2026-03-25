import AdminNavigation from './components/AdminNavigation'
import { usePersistentState } from './hooks/usePersistentState'
import AppShell from './layouts/AppShell'
import ClassOfferingsPage from './pages/ClassOfferingsPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import StudentsPage from './pages/StudentsPage'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'class-offerings', label: 'Class Offerings' },
  { id: 'reports', label: 'Reports' },
]

function App() {
  const [currentView, setCurrentView] = usePersistentState('kuppi-admin-view', 'dashboard')

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
        <AdminNavigation
          items={navigationItems}
          currentView={currentView}
          onChange={setCurrentView}
        />
      }
    >
      {currentPage}
    </AppShell>
  )
}

export default App
