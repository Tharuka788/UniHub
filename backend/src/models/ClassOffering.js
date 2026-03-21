import mongoose from 'mongoose'
import { env } from '../config/env.js'

const classOfferingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    },
    startDateTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'ready', 'active', 'completed'],
      default: 'ready',
    },
  },
  {
    timestamps: true,
  },
)

export const ClassOffering = mongoose.model('ClassOffering', classOfferingSchema)
