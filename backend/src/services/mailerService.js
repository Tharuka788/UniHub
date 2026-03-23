import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { isStandaloneMode } from '../config/runtimeMode.js'
import { createHttpError } from '../utils/http.js'

let cachedTransporter = null

function getTransporter() {
  if (env.EMAIL_PROVIDER !== 'smtp') {
    return null
  }

  if (!cachedTransporter) {
    if (!env.SMTP_HOST || !env.SMTP_PORT) {
      throw createHttpError(500, 'SMTP configuration is incomplete.')
    }

    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    })
  }

  return cachedTransporter
}

export function buildClassLinkEmail({ studentName, classTitle, classLink, startDateTime }) {
  const subject = `${classTitle} class link`
  const startLine = startDateTime
    ? `Start time: ${new Date(startDateTime).toLocaleString('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`
    : 'Start time will be shared by the class coordinator if it changes.'

  const text = [
    `Hello ${studentName},`,
    '',
    `Your class link for ${classTitle} is ready.`,
    `Class link: ${classLink}`,
    startLine,
    '',
    'Please join a few minutes early and keep this email for reference.',
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #162033;">
      <p>Hello ${studentName},</p>
      <p>Your class link for <strong>${classTitle}</strong> is ready.</p>
      <p>
        <a href="${classLink}" style="color: #2b7490; font-weight: 700;">Join the class</a>
      </p>
      <p>${startLine}</p>
      <p>Please join a few minutes early and keep this email for reference.</p>
    </div>
  `

  return { subject, text, html }
}

export async function sendMail({ to, subject, text, html }) {
  if (env.EMAIL_PROVIDER === 'console' && isStandaloneMode()) {
    const messageId = `console-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

    console.log(
      JSON.stringify({
        type: 'mail.dispatch',
        provider: 'console',
        to,
        subject,
        text,
      }),
    )

    return {
      provider: 'console',
      messageId,
    }
  }

  if (env.EMAIL_PROVIDER === 'console') {
    throw createHttpError(
      500,
      'Console email transport is only available in standalone mode.',
    )
  }

  const transporter = getTransporter()
  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  })

  return {
    provider: 'smtp',
    messageId: info.messageId,
  }
}
