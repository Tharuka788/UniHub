import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    classOffering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassOffering',
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ['confirmed'],
      default: 'confirmed',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid'],
      default: 'paid',
      required: true,
    },
    confirmationSource: {
      type: String,
      enum: ['integration', 'mock', 'seed', 'admin'],
      default: 'integration',
    },
    registrationReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentReference: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          if (this.paymentStatus !== 'paid') {
            return true
          }

          return Boolean(value?.trim())
        },
        message: 'paymentReference is required when paymentStatus is paid.',
      },
    },
    linkDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      required: true,
    },
    linkSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

enrollmentSchema.index({ classOffering: 1, student: 1 }, { unique: true })
enrollmentSchema.index({ linkDeliveryStatus: 1 })
enrollmentSchema.index({ createdAt: -1 })

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
