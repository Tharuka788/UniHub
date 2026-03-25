import AdminNavigation from './components/AdminNavigation'
import { usePersistentState } from './hooks/usePersistentState'
import AppShell from './layouts/AppShell'
import ClassOfferingsPage from './pages/ClassOfferingsPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'class-offerings', label: 'Class Offerings' },
]

function App() {
  const [currentView, setCurrentView] = usePersistentState('kuppi-admin-view', 'dashboard')

  const currentPage =
    currentView === 'students' ? (
      <StudentsPage />
    ) : currentView === 'class-offerings' ? (
      <ClassOfferingsPage />
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
