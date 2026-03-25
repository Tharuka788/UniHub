import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassOffering } from '../src/models/ClassOffering.js'
import { DispatchLog } from '../src/models/DispatchLog.js'
import { Enrollment } from '../src/models/Enrollment.js'
import * as mailerService from '../src/services/mailerService.js'
import { sendClassLinksForOffering } from '../src/services/classLinkService.js'

describe('class link service', () => {
  const classOfferingId = '507f1f77bcf86cd799439011'

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends links only to unsent eligible enrollments by default', async () => {
    vi.spyOn(ClassOffering, 'findById').mockResolvedValue({
      _id: classOfferingId,
      title: '2026 A/L Physics Support',
      kuppiSession: '2026 A/L Physics Support - Batch 01',
      classLink: 'https://meet.google.com/test',
      startDateTime: null,
      isArchived: false,
    })
    vi.spyOn(Enrollment, 'find').mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          _id: 'enrollment-1',
          linkDeliveryStatus: 'pending',
          student: {
            _id: 'student-1',
            fullName: 'Nimal Perera',
            email: 'nimal@example.com',
            isActive: true,
          },
          save: vi.fn(),
        },
        {
          _id: 'enrollment-2',
          linkDeliveryStatus: 'sent',
          student: {
            _id: 'student-2',
            fullName: 'Tharushi De Silva',
            email: 'tharushi@example.com',
            isActive: true,
          },
          save: vi.fn(),
        },
      ]),
    })
    vi.spyOn(mailerService, 'sendMail').mockResolvedValue({
      provider: 'console',
      messageId: 'message-1',
    })
    vi.spyOn(DispatchLog, 'create').mockResolvedValue({})

    const result = await sendClassLinksForOffering({
      classOfferingId,
    })

    expect(result.attempted).toBe(1)
    expect(result.sent).toBe(1)
    expect(result.skipped).toBe(1)
  })

  it('records failures when mail delivery throws', async () => {
    vi.spyOn(ClassOffering, 'findById').mockResolvedValue({
      _id: classOfferingId,
      title: '2026 A/L Physics Support',
      kuppiSession: '2026 A/L Physics Support - Batch 01',
      classLink: 'https://meet.google.com/test',
      startDateTime: null,
      isArchived: false,
    })
    vi.spyOn(Enrollment, 'find').mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          _id: 'enrollment-1',
          linkDeliveryStatus: 'pending',
          student: {
            _id: 'student-1',
            fullName: 'Nimal Perera',
            email: 'nimal@example.com',
            isActive: true,
          },
          save: vi.fn(),
        },
      ]),
    })
    vi.spyOn(mailerService, 'sendMail').mockRejectedValue(new Error('SMTP unavailable'))
    vi.spyOn(DispatchLog, 'create').mockResolvedValue({})

    const result = await sendClassLinksForOffering({
      classOfferingId,
    })

    expect(result.failed).toBe(1)
    expect(result.errors[0].message).toBe('SMTP unavailable')
  })
})
