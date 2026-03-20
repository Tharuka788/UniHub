import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_MODE: z.enum(['standalone', 'integrated']).default('standalone'),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required.')
    .default('mongodb://localhost:27017/class_link_manager'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  INTEGRATION_SHARED_SECRET: z.string().default('change-me'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.string().optional().default(''),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('no-reply@example.com'),
  DEFAULT_CLASS_LINK: z
    .string()
    .url()
    .default('https://meet.google.com/xxx-xxxx-xxx'),
  ALLOW_MOCK_SYNC: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment configuration:\n${issues}`)
}

export const env = parsedEnv.data
