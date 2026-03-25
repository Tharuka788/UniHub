import { z } from 'zod'
import { sanitizeSearchValue } from '../utils/validation.js'

const classOfferingBaseSchema = z.object({
  title: z.string().trim().min(5, 'title must be at least 5 characters long.'),
  kuppiSession: z.string().trim().min(3, 'kuppiSession is required.'),
  classLink: z
    .string()
    .trim()
    .url('classLink must be a valid URL.')
    .optional()
    .or(z.literal('')),
  startDateTime: z.iso.datetime().optional().or(z.literal('')),
  status: z.enum(['draft', 'ready', 'active', 'completed']).optional().default('ready'),
})

export const createClassOfferingSchema = classOfferingBaseSchema

export const updateClassOfferingSchema = classOfferingBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one class offering field must be provided.',
  },
)

export const classOfferingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z
    .string()
    .optional()
    .default('')
    .transform((value) => sanitizeSearchValue(value)),
  status: z
    .enum(['draft', 'ready', 'active', 'completed'])
    .optional()
    .or(z.literal(''))
    .default(''),
  isArchived: z.enum(['true', 'false']).optional().or(z.literal('')).default('false'),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title', 'kuppiSession', 'startDateTime'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})
