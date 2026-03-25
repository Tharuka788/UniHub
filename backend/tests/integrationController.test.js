import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createConfirmedEnrollment } from '../src/controllers/integrationController.js'
import { validateBody } from '../src/middlewares/validateRequest.js'
import { ClassOffering } from '../src/models/ClassOffering.js'
import { Enrollment } from '../src/models/Enrollment.js'
import { Student } from '../src/models/Student.js'
import { confirmedEnrollmentPayloadSchema } from '../src/validations/enrollmentIntegrationValidation.js'

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }
}

describe('confirmed enrollment ingestion flow', () => {
  const payload = {
    fullName: 'Nimal Perera',
    email: 'nimal@example.com',
    phone: '0771234567',
    kuppiSession: '2026 A/L Physics Support - Batch 01',
    registrationReference: 'REG-1001',
    paymentReference: 'PAY-9001',
    paymentStatus: 'paid',
    registrationStatus: 'confirmed',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a confirmed enrollment for a valid payload', async () => {
    vi.spyOn(Student, 'findOneAndUpdate').mockResolvedValue({
      _id: 'student-1',
      fullName: payload.fullName,
      email: payload.email,
    })
    vi.spyOn(ClassOffering, 'findOneAndUpdate').mockResolvedValue({
      _id: 'class-1',
      kuppiSession: payload.kuppiSession,
      title: payload.kuppiSession,
    })
    vi.spyOn(Enrollment, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    vi.spyOn(Enrollment, 'create').mockResolvedValue({
      _id: 'enrollment-1',
      registrationReference: payload.registrationReference,
      paymentReference: payload.paymentReference,
      linkDeliveryStatus: 'pending',
    })

    const request = {
      validatedBody: payload,
      integrationSource: 'mock',
    }
    const response = createResponse()
    const next = vi.fn()

    await createConfirmedEnrollment(request, response, next)

    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          created: true,
          student: expect.objectContaining({
            email: payload.email,
          }),
        }),
      }),
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('returns the existing enrollment for an idempotent registration reference', async () => {
    const existingEnrollment = {
      _id: 'enrollment-1',
      registrationReference: payload.registrationReference,
      paymentReference: payload.paymentReference,
      linkDeliveryStatus: 'pending',
      set: vi.fn(),
      save: vi.fn(),
    }

    vi.spyOn(Student, 'findOneAndUpdate').mockResolvedValue({
      _id: 'student-1',
      fullName: payload.fullName,
      email: payload.email,
    })
    vi.spyOn(ClassOffering, 'findOneAndUpdate').mockResolvedValue({
      _id: 'class-1',
      kuppiSession: payload.kuppiSession,
      title: payload.kuppiSession,
    })
    vi.spyOn(Enrollment, 'findOne').mockResolvedValueOnce(existingEnrollment)

    const request = {
      validatedBody: payload,
      integrationSource: 'integration',
    }
    const response = createResponse()
    const next = vi.fn()

    await createConfirmedEnrollment(request, response, next)

    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          created: false,
        }),
      }),
    )
    expect(existingEnrollment.save).toHaveBeenCalled()
  })

  it('rejects invalid payloads with structured validation details', () => {
    const request = {
      body: {
        paymentStatus: 'pending',
      },
    }
    const next = vi.fn()
    const middleware = validateBody(confirmedEnrollmentPayloadSchema)

    middleware(request, {}, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Request body validation failed.',
        details: expect.arrayContaining([
          expect.objectContaining({
            path: 'fullName',
          }),
        ]),
      }),
    )
  })
})
