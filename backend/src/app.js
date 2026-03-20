import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import router from './routes/index.js'

const app = express()

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(helmet())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    success: true,
    message: 'Kuppi System backend is running.',
  })
})

app.use('/api', router)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
