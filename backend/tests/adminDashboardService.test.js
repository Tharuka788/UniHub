import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminEnrollments } from '../src/services/adminDashboardService.js'
import { ClassOffering } from '../src/models/ClassOffering.js'
import { Enrollment } from '../src/models/Enrollment.js'

describe('admin dashboard service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns paginated enrollments with search and session filters applied', async () => {
    vi.spyOn(ClassOffering, 'find').mockReturnValue({
      select: vi.fn().mockResolvedValue([{ _id: 'class-1' }]),
    })
    vi.spyOn(Enrollment, 'aggregate').mockResolvedValue([{ _id: 'enrollment-1' }])
    vi.spyOn(Enrollment, 'countDocuments').mockResolvedValue(1)
    vi.spyOn(Enrollment, 'find').mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          _id: 'enrollment-1',
          registrationReference: 'REG-1001',
          paymentReference: 'PAY-9001',
          registrationStatus: 'confirmed',
          paymentStatus: 'paid',
          linkDeliveryStatus: 'pending',
          linkSentAt: null,
          createdAt: new Date('2026-03-24T09:00:00.000Z'),
          student: {
            _id: 'student-1',
            fullName: 'Nimal Perera',
            email: 'nimal@example.com',
            phone: '0771234567',
          },
          classOffering: {
            _id: 'class-1',
            title: '2026 A/L Physics Support',
            kuppiSession: '2026 A/L Physics Support - Batch 01',
            classLink: 'https://meet.google.com/test',
            status: 'active',
          },
        },
      ]),
    })

    const result = await getAdminEnrollments({
      page: 1,
      limit: 10,
      search: 'nimal',
      kuppiSession: 'Physics',
      linkDeliveryStatus: '',
    })

    expect(result.items).toHaveLength(1)
    expect(result.pagination.totalItems).toBe(1)
    expect(result.items[0].student.fullName).toBe('Nimal Perera')
  })
})
