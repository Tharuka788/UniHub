import { z } from 'zod'
import { sanitizeSearchValue } from '../utils/validation.js'

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
})

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Must be a valid date in YYYY-MM-DD format.',
  })
  .default('')

export const adminEnrollmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z
    .string()
    .optional()
    .default('')
    .transform((value) => sanitizeSearchValue(value)),
  kuppiSession: z.string().trim().optional().default(''),
  linkDeliveryStatus: z
    .enum(['pending', 'sent', 'failed'])
    .optional()
    .or(z.literal(''))
    .default(''),
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  paymentReference: z.string().trim().optional().default(''),
  registrationReference: z.string().trim().optional().default(''),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'linkSentAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})
  .refine(
    (value) => {
      if (!value.dateFrom || !value.dateTo) {
        return true
      }

      return new Date(value.dateFrom) <= new Date(value.dateTo)
    },
    {
      message: 'dateFrom cannot be after dateTo.',
      path: ['dateFrom'],
    },
  )
