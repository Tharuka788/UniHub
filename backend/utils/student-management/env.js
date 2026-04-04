const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_MODE: z.enum(['standalone', 'integrated']).default('standalone'),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required.')
    .default(process.env.MONGO_URI || 'mongodb://localhost:27017/unihub'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  INTEGRATION_SHARED_SECRET: z.string().default('change-me'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.string().optional().default(''),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('no-reply@example.com'),
  ADMIN_USERNAME: z.string().trim().min(1).default('admin'),
  ADMIN_PASSWORD: z.string().min(1).default('change-me-admin'),
  ADMIN_SESSION_SECRET: z.string().min(1).default('replace-this-session-secret'),
  ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  DEFAULT_CLASS_LINK: z
    .string()
    .url()
    .default('https://meet.google.com/xxx-xxxx-xxx'),
  ENFORCE_CLASS_LINK_DOMAIN_POLICY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  CLASS_LINK_ALLOWED_DOMAINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ALLOW_MOCK_SYNC: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error(`Invalid environment configuration for student-management:\n${issues}`);
  // We don't necessarily want to crash the whole app if one module's optional env is missing,
  // but for Student Management logic it might be critical.
}

const env = parsedEnv.success ? parsedEnv.data : {};

module.exports = { env };
