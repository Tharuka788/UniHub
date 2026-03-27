import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReportsPage from './ReportsPage'
import {
  downloadReportPdf,
  getClassOfferings,
  getReportSummary,
} from '../api/admin'

vi.mock('../api/admin', () => ({
  getClassOfferings: vi.fn(),
  getReportSummary: vi.fn(),
  downloadReportPdf: vi.fn(),
}))

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()

    getClassOfferings.mockResolvedValue({
      data: {
        items: [
          {
            id: 'class-1',
            kuppiSession: '2026 A/L Physics Support - Batch 01',
          },
        ],
      },
    })

    getReportSummary.mockResolvedValue({
      data: {
        title: 'Confirmed Students Report',
        generatedAt: '2026-03-25T10:00:00.000Z',
        totalRows: 2,
        metrics: [
          { label: 'Total students', value: 2 },
          { label: 'Links sent', value: 1 },
        ],
        readinessSummary: null,
        previewRows: [
          {
            studentName: 'Nimal Perera',
            email: 'nimal@example.com',
          },
        ],
        failedRecipients: [],
        recentDispatches: [],
      },
    })

    downloadReportPdf.mockResolvedValue({
      blob: new Blob(['test'], { type: 'application/pdf' }),
      filename: 'confirmed-students-2026-03-25.pdf',
    })

    window.URL.createObjectURL = vi.fn(() => 'blob:report')
    window.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    cleanup()
  })

  it('loads the report preview and allows PDF download when rows exist', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)

    expect(await screen.findByText('Reports center')).toBeInTheDocument()
    expect(await screen.findByText('Confirmed Students Report')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Download PDF' }))

    await waitFor(() => {
      expect(downloadReportPdf).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'confirmed-students',
        }),
      )
    })
  })

  it('blocks invalid date ranges before attempting a download', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)

    await screen.findByText('Confirmed Students Report')

    fireEvent.change(screen.getByLabelText('Date from'), {
      target: { value: '2026-03-26' },
    })
    fireEvent.change(screen.getByLabelText('Date to'), {
      target: { value: '2026-03-25' },
    })

    await user.click(screen.getByRole('button', { name: 'Download PDF' }))

    expect(
      await screen.findByText('Date from cannot be after date to.'),
    ).toBeInTheDocument()
    expect(downloadReportPdf).not.toHaveBeenCalled()
  })
})
