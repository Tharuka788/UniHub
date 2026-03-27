import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getAdminSession, loginAdmin, logoutAdmin } from './api/auth'

vi.mock('./api/auth', () => ({
  getAdminSession: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
}))

vi.mock('./pages/DashboardPage', () => ({
  default: () => <div>Dashboard view</div>,
}))

vi.mock('./pages/StudentsPage', () => ({
  default: () => <div>Students view</div>,
}))

vi.mock('./pages/ClassOfferingsPage', () => ({
  default: () => <div>Class offerings view</div>,
}))

vi.mock('./pages/ReportsPage', () => ({
  default: () => <div>Reports view</div>,
}))

describe('App authentication gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the login page when there is no active admin session', async () => {
    getAdminSession.mockRejectedValue({
      statusCode: 401,
      message: 'No active admin session found.',
    })

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.queryByText('Dashboard view')).not.toBeInTheDocument()
  })

  it('renders the admin workspace after a successful login', async () => {
    const user = userEvent.setup()

    getAdminSession.mockRejectedValue({
      statusCode: 401,
      message: 'No active admin session found.',
    })
    loginAdmin.mockResolvedValue({
      data: {
        username: 'admin',
      },
    })

    render(<App />)

    await user.type(await screen.findByLabelText('Username'), 'admin')
    await user.type(screen.getByLabelText('Password'), 'change-me-admin')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Dashboard view')).toBeInTheDocument()
    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(loginAdmin).toHaveBeenCalledWith({
      username: 'admin',
      password: 'change-me-admin',
    })
  })

  it('returns to the login page after logging out', async () => {
    const user = userEvent.setup()

    getAdminSession.mockResolvedValue({
      data: {
        username: 'admin',
      },
    })
    logoutAdmin.mockResolvedValue({
      success: true,
    })

    render(<App />)

    expect(await screen.findByText('Dashboard view')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    })
  })
})
