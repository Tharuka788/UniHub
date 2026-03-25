import mongoose from 'mongoose'
import { env } from '../config/env.js'
import {
  buildAllowedClassLinkMessage,
  isAllowedClassLink,
  isValidDateTimeValue,
} from '../utils/validation.js'

const classOfferingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    kuppiSession: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    classLink: {
      type: String,
      trim: true,
      default: env.DEFAULT_CLASS_LINK,
      validate: {
        validator: isAllowedClassLink,
        message: buildAllowedClassLinkMessage,
      },
    },
    startDateTime: {
      type: Date,
      default: null,
      validate: {
        validator: isValidDateTimeValue,
        message: 'startDateTime must be a valid date.',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'ready', 'active', 'completed'],
      default: 'ready',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export const ClassOffering = mongoose.model('ClassOffering', classOfferingSchema)
