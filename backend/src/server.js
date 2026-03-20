import app from './app.js'
import { env } from './config/env.js'
import { connectDb } from './db/connectDb.js'

async function startServer() {
  try {
    await connectDb()

    app.listen(env.PORT, () => {
      console.log(`Backend server listening on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
