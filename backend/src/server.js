import app from './app.js'
import { env } from './config/env.js'
import { assertRuntimeConfig } from './config/runtimeMode.js'
import { connectDb } from './db/connectDb.js'
import { logError, logInfo } from './utils/logger.js'

async function startServer() {
  try {
    assertRuntimeConfig()
    await connectDb()

    app.listen(env.PORT, () => {
      logInfo('Backend server listening', {
        port: env.PORT,
        appMode: env.APP_MODE,
        emailProvider: env.EMAIL_PROVIDER,
      })
    })
  } catch (error) {
    logError('Failed to start server', {
      message: error.message,
      stack: error.stack,
    })
    process.exit(1)
  }
}

startServer()
