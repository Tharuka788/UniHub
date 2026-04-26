const mongoose = require('mongoose');
const { z } = require('zod');

const reportTypeSchema = z.enum([
  'confirmed-students',
  'dispatch-summary',
  'class-offering-summary',
]);

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Must be a valid date in YYYY-MM-DD format.',
  })
  .default('');

const optionalClassOfferingIdSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || mongoose.isValidObjectId(value), {
    message: 'classOfferingId must be a valid identifier.',
  })
  .default('');

const baseReportQuerySchema = z
  .object({
    reportType: reportTypeSchema,
    classOfferingId: optionalClassOfferingIdSchema,
    dateFrom: optionalDateSchema,
    dateTo: optionalDateSchema,
    deliveryStatus: z
      .enum(['pending', 'sent', 'failed'])
      .optional()
      .or(z.literal(''))
      .default(''),
    includeArchived: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((value) => value === 'true'),
  })
  .refine(
    (value) => {
      if (!value.dateFrom || !value.dateTo) {
        return true;
      }

      return new Date(value.dateFrom) <= new Date(value.dateTo);
    },
    {
      path: ['dateFrom'],
      message: 'dateFrom cannot be after dateTo.',
    },
  );

const reportSummaryQuerySchema = baseReportQuerySchema;

const reportPdfQuerySchema = baseReportQuerySchema.extend({
  allowEmpty: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((value) => value === 'true'),
});

module.exports = {
  reportSummaryQuerySchema,
  reportPdfQuerySchema,
};
