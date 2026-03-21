import { z } from 'zod'

export const adminEnrollmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional().default(''),
  kuppiSession: z.string().trim().optional().default(''),
  linkDeliveryStatus: z
    .enum(['pending', 'sent', 'failed'])
    .optional()
    .or(z.literal(''))
    .default(''),
})
