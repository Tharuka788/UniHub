import { z } from 'zod'
import {
  isNonNumericName,
  sanitizeSearchValue,
  sriLankanPhonePattern,
} from '../utils/validation.js'

const studentNameSchema = z
  .string()
  .trim()
  .min(3, 'fullName must be at least 3 characters long.')
  .refine(isNonNumericName, 'fullName cannot be purely numeric.')

const studentEmailSchema = z
  .email('email must be a valid email address.')
  .transform((value) => value.trim().toLowerCase())

const studentPhoneSchema = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((value) => !value || sriLankanPhonePattern.test(value), {
    message: 'phone must be a valid Sri Lankan local or international number.',
  })

const studentCodeSchema = z
  .string()
  .trim()
  .optional()
  .default('')

export const createStudentSchema = z.object({
  fullName: studentNameSchema,
  email: studentEmailSchema,
  phone: studentPhoneSchema,
  studentCode: studentCodeSchema,
})

export const updateStudentSchema = createStudentSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one student field must be provided.',
  },
)

export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z
    .string()
    .optional()
    .default('')
    .transform((value) => sanitizeSearchValue(value)),
  isActive: z.enum(['true', 'false']).optional().or(z.literal('')).default(''),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'fullName', 'email'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})
