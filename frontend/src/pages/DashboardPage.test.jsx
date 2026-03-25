import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'
import {
  getClassOfferings,
  getDashboardSummary,
  getEnrollments,
  sendClassLinks,
} from '../api/admin'

vi.mock('../api/admin', () => ({
  getDashboardSummary: vi.fn(),
  getClassOfferings: vi.fn(),
  getEnrollments: vi.fn(),
  sendClassLinks: vi.fn(),
}))

const summaryResponse = {
  data: {
    totalConfirmedStudents: 8,
    totalLinksSent: 3,
    totalPendingLinkSends: 3,
    totalFailedSends: 2,
  },
}

const classOfferingsResponse = {
  data: {
    items: [
      {
        id: 'class-1',
        title: '2026 A/L Physics Support',
        kuppiSession: '2026 A/L Physics Support - Batch 01',
      },
    ],
  },
}

const enrollmentItems = [
  {
    id: 'enr-1',
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
    linkDeliveryStatus: 'pending',
    linkSentAt: null,
    createdAt: '2026-03-24T09:00:00.000Z',
    student: {
      fullName: 'Nimal Perera',
      email: 'nimal.perera@example.com',
    },
    classOffering: {
      id: 'class-1',
      title: '2026 A/L Physics Support',
      kuppiSession: '2026 A/L Physics Support - Batch 01',
    },
  },
  {
    id: 'enr-2',
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
    linkDeliveryStatus: 'sent',
    linkSentAt: '2026-03-24T10:00:00.000Z',
    createdAt: '2026-03-24T08:00:00.000Z',
    student: {
      fullName: 'Tharushi De Silva',
      email: 'tharushi.desilva@example.com',
    },
    classOffering: {
      id: 'class-1',
      title: '2026 A/L Physics Support',
      kuppiSession: '2026 A/L Physics Support - Batch 01',
    },
  },
]

function mockDashboardRequests() {
  getDashboardSummary.mockResolvedValue(summaryResponse)
  getClassOfferings.mockResolvedValue(classOfferingsResponse)
  getEnrollments.mockImplementation((query) => {
    const data = {
      items:
        query?.limit === 100
          ? enrollmentItems
          : enrollmentItems.filter((item) => {
              if (query?.search) {
                return item.student.fullName
                  .toLowerCase()
                  .includes(query.search.toLowerCase())
              }

              return true
            }),
      pagination: {
        page: query?.page || 1,
        limit: query?.limit || 10,
        totalItems: enrollmentItems.length,
        totalPages: 1,
      },
    }

    return Promise.resolve({ data })
  })
  sendClassLinks.mockResolvedValue({
    data: {
      classOffering: {
        title: '2026 A/L Physics Support',
      },
      sent: 1,
      failed: 0,
      skipped: 0,
    },
  })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    mockDashboardRequests()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders summary data from the backend', async () => {
    render(<DashboardPage />)

    expect(await screen.findByText('Student confirmation dashboard')).toBeInTheDocument()
    expect(await screen.findAllByText('nimal.perera@example.com')).toHaveLength(2)
    expect(screen.getByText('08')).toBeInTheDocument()
  })

  it('updates enrollment API queries when filters change', async () => {
    render(<DashboardPage />)

    const searchInput = await screen.findByLabelText('Search student')
    fireEvent.change(searchInput, {
      target: { value: 'nimal' },
    })

    await waitFor(() => {
      expect(
        getEnrollments.mock.calls.some(
          ([query]) => query && query.search === 'nimal',
        ),
      ).toBe(true)
    })

    fireEvent.change(screen.getByLabelText('Payment reference'), {
      target: { value: 'PAY-9001' },
    })

    await waitFor(() => {
      expect(
        getEnrollments.mock.calls.some(
          ([query]) => query && query.paymentReference === 'PAY-9001',
        ),
      ).toBe(true)
    })
  })

  it('disables the confirm button while send request is in progress', async () => {
    const user = userEvent.setup()
    sendClassLinks.mockReturnValue(new Promise(() => {}))
    window.localStorage.setItem(
      'kuppi-dashboard-filters',
      JSON.stringify({
        search: '',
        kuppiSession: '2026 A/L Physics Support - Batch 01',
        linkDeliveryStatus: '',
      }),
    )

    render(<DashboardPage />)

    const [openButton] = await screen.findAllByRole('button', { name: 'Send class link' })
    await waitFor(() => expect(openButton).toBeEnabled())
    await user.click(openButton)
    const [, confirmButton] = screen.getAllByRole('button', { name: 'Send class link' })
    await user.click(confirmButton)

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
  })

  it('shows send summary feedback after a dispatch completes', async () => {
    const user = userEvent.setup()
    sendClassLinks.mockResolvedValue({
      data: {
        classOffering: {
          title: '2026 A/L Physics Support',
        },
        sent: 1,
        failed: 1,
        skipped: 0,
      },
    })
    window.localStorage.setItem(
      'kuppi-dashboard-filters',
      JSON.stringify({
        search: '',
        kuppiSession: '2026 A/L Physics Support - Batch 01',
        linkDeliveryStatus: '',
      }),
    )

    render(<DashboardPage />)

    const [openButton] = await screen.findAllByRole('button', { name: 'Send class link' })
    await waitFor(() => expect(openButton).toBeEnabled())
    await user.click(openButton)
    const [, confirmButton] = screen.getAllByRole('button', { name: 'Send class link' })
    await user.click(confirmButton)

    expect(
      await screen.findByText((content) =>
        content.includes('1 sent, 1 failed, 0 skipped for 2026 A/L Physics Support.'),
      ),
    ).toBeInTheDocument()
  })
})
