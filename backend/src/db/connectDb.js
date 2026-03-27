import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { logError, logInfo, logWarn } from '../utils/logger.js'

export async function connectDb() {
  mongoose.connection.on('connected', () => {
    logInfo('MongoDB connected')
  })

  mongoose.connection.on('error', (error) => {
    logError('MongoDB error', { message: error.message })
  })

  mongoose.connection.on('disconnected', () => {
    logWarn('MongoDB disconnected')
  })

  await mongoose.connect(env.MONGODB_URI)
}
