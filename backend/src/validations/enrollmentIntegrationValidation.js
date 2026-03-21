import { z } from 'zod'

export const confirmedEnrollmentPayloadSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName is required.'),
  email: z.email('email must be a valid email address.').transform((value) =>
    value.trim().toLowerCase(),
  ),
  phone: z.string().trim().optional().default(''),
  kuppiSession: z.string().trim().min(2, 'kuppiSession is required.'),
  classTitle: z.string().trim().optional(),
  classLink: z.string().trim().url().optional(),
  startDateTime: z.iso.datetime().optional(),
  registrationReference: z
    .string()
    .trim()
    .min(1, 'registrationReference is required.'),
  paymentReference: z.string().trim().optional().default(''),
  paymentStatus: z.literal('paid', {
    error: 'paymentStatus must be "paid".',
  }),
  registrationStatus: z.literal('confirmed', {
    error: 'registrationStatus must be "confirmed".',
  }),
})
