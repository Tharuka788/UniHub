import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassOffering } from '../src/models/ClassOffering.js'
import { DispatchLog } from '../src/models/DispatchLog.js'
import { Enrollment } from '../src/models/Enrollment.js'
import {
  getReportPdfPayload,
  getReportSummary,
} from '../src/services/reportService.js'

describe('report service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns readiness totals for the class offering summary report', async () => {
    vi.spyOn(ClassOffering, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: 'class-1',
          title: '2026 A/L Physics Support',
          kuppiSession: '2026 A/L Physics Support - Batch 01',
          classLink: 'https://meet.google.com/phy-batch-01',
          status: 'active',
          isArchived: false,
        },
        {
          _id: 'class-2',
          title: '2026 Biology Revision Lab',
          kuppiSession: '2026 Biology Revision Lab - Batch 01',
          classLink: '',
          status: 'draft',
          isArchived: false,
        },
      ]),
    })
    vi.spyOn(Enrollment, 'countDocuments')
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)

    const result = await getReportSummary({
      reportType: 'class-offering-summary',
      classOfferingId: '',
      dateFrom: '',
      dateTo: '',
      deliveryStatus: '',
      includeArchived: false,
    })

    expect(result.readinessSummary).toEqual({
      ready: 1,
      almostReady: 0,
      needsSetup: 1,
    })
    expect(result.previewRows[0].readiness.label).toBe('Ready')
    expect(result.previewRows[1].readiness.label).toBe('Needs Setup')
  })

  it('rejects empty PDF payloads unless allowEmpty is true', async () => {
    vi.spyOn(ClassOffering, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([]),
    })
    vi.spyOn(Enrollment, 'find').mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([]),
    })

    await expect(
      getReportPdfPayload({
        reportType: 'confirmed-students',
        classOfferingId: '',
        dateFrom: '',
        dateTo: '',
        deliveryStatus: '',
        includeArchived: false,
        allowEmpty: false,
      }),
    ).rejects.toMatchObject({
      errorCode: 'REPORT_EMPTY',
    })
  })

  it('returns dispatch preview rows and recent history for dispatch summary reports', async () => {
    vi.spyOn(ClassOffering, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: 'class-1',
          title: '2026 A/L Physics Support',
          kuppiSession: '2026 A/L Physics Support - Batch 01',
          isArchived: false,
        },
      ]),
    })
    vi.spyOn(Enrollment, 'find').mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([
        {
          linkDeliveryStatus: 'failed',
          paymentReference: 'PAY-9001',
          student: {
            fullName: 'Nimal Perera',
            email: 'nimal@example.com',
          },
          classOffering: {
            kuppiSession: '2026 A/L Physics Support - Batch 01',
          },
        },
      ]),
    })
    vi.spyOn(DispatchLog, 'find').mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([
        {
          recipient: 'nimal@example.com',
          status: 'failed',
          subject: 'Physics class link',
          createdAt: new Date('2026-03-25T10:00:00.000Z'),
          student: {
            fullName: 'Nimal Perera',
          },
          classOffering: {
            kuppiSession: '2026 A/L Physics Support - Batch 01',
          },
        },
      ]),
    })

    const result = await getReportSummary({
      reportType: 'dispatch-summary',
      classOfferingId: '',
      dateFrom: '',
      dateTo: '',
      deliveryStatus: '',
      includeArchived: false,
    })

    expect(result.previewRows).toHaveLength(1)
    expect(result.failedRecipients).toHaveLength(1)
    expect(result.recentDispatches).toHaveLength(1)
  })
})
