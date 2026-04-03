const { z } = require('zod');

const sendClassLinkSchema = z.object({
  classOfferingId: z.string().trim().min(1, 'classOfferingId is required.'),
  forceResend: z.boolean().optional().default(false),
});

const classOfferingUpsertSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, 'title is required.'),
  kuppiSession: z.string().trim().min(2, 'kuppiSession is required.'),
  classLink: z.string().trim().url().optional(),
  startDateTime: z.string().datetime().optional(), // iso.datetime is not standard zod, use .datetime() or string refine
  status: z.enum(['draft', 'ready', 'active', 'completed']).optional(),
});

module.exports = {
  sendClassLinkSchema,
  classOfferingUpsertSchema,
};
