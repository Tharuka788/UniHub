import mongoose from 'mongoose'
import { env } from '../config/env.js'

export async function connectDb() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected')
  })

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB error', error)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected')
  })

  await mongoose.connect(env.MONGODB_URI)
}
