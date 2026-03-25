import { z } from 'zod'
import {
  buildAllowedClassLinkMessage,
  isAllowedClassLink,
  isNonNumericName,
  isValidDateTimeValue,
  isValidEmail,
  sriLankanPhonePattern,
} from '../utils/validation.js'

export const confirmedEnrollmentPayloadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'fullName must be at least 3 characters long.')
    .refine(isNonNumericName, 'fullName cannot be purely numeric.'),
  email: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine(isValidEmail, 'email must be a valid email address.'),
  phone: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((value) => !value || sriLankanPhonePattern.test(value), {
      message: 'phone must be a valid Sri Lankan local or international number.',
    }),
  kuppiSession: z.string().trim().min(2, 'kuppiSession is required.'),
  classTitle: z.string().trim().optional(),
  classLink: z
    .string()
    .trim()
    .url('classLink must be a valid URL.')
    .refine((value) => isAllowedClassLink(value), {
      message: buildAllowedClassLinkMessage(),
    })
    .optional(),
  startDateTime: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidDateTimeValue(value), {
      message: 'startDateTime must be a valid date-time value.',
    }),
  registrationReference: z
    .string()
    .trim()
    .min(1, 'registrationReference is required.'),
  paymentReference: z.string().trim().min(1, 'paymentReference is required.'),
  paymentStatus: z.literal('paid', {
    error: 'paymentStatus must be "paid".',
  }),
  registrationStatus: z.literal('confirmed', {
    error: 'registrationStatus must be "confirmed".',
  }),
})
