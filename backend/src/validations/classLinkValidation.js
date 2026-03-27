import { z } from 'zod'

export const sendClassLinkSchema = z.object({
  classOfferingId: z.string().trim().min(1, 'classOfferingId is required.'),
  forceResend: z.boolean().optional().default(false),
})

export const classOfferingUpsertSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, 'title is required.'),
  kuppiSession: z.string().trim().min(2, 'kuppiSession is required.'),
  classLink: z.string().trim().url().optional(),
  startDateTime: z.iso.datetime().optional(),
  status: z.enum(['draft', 'ready', 'active', 'completed']).optional(),
})
