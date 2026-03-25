import mongoose from 'mongoose'
import { ClassOffering } from '../models/ClassOffering.js'
import { createHttpError } from '../utils/http.js'

export async function ensureClassOfferingExists(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, 'Invalid class offering id.')
  }

  const offering = await ClassOffering.findById(id)

  if (!offering) {
    throw createHttpError(404, 'Class offering not found.')
  }

  return offering
}
