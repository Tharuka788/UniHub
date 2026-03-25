import crypto from 'node:crypto'
import { env } from '../config/env.js'
import { createHttpError } from '../utils/http.js'

export const ADMIN_SESSION_COOKIE_NAME = 'kuppi_admin_session'

const ADMIN_SESSION_TTL_MS = env.ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000

function parseCookieHeader(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((cookies, segment) => {
      const separatorIndex = segment.indexOf('=')

      if (separatorIndex === -1) {
        return cookies
      }

      const key = decodeURIComponent(segment.slice(0, separatorIndex).trim())
      const value = decodeURIComponent(segment.slice(separatorIndex + 1).trim())

      cookies[key] = value

      return cookies
    }, {})
}

function createSignature(payload) {
  return crypto.createHmac('sha256', env.ADMIN_SESSION_SECRET).update(payload).digest('base64url')
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(encodedPayload) {
  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
}

function areEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  }
}

export function authenticateAdmin(username, password) {
  const normalizedUsername = username.trim()

  if (normalizedUsername !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    throw createHttpError(401, 'Invalid admin credentials.', {
      errorCode: 'INVALID_ADMIN_CREDENTIALS',
      suggestion: 'Check the admin username and password configured in the backend environment.',
    })
  }

  return {
    username: env.ADMIN_USERNAME,
  }
}

export function createAdminSession(username) {
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS)
  const payload = encodePayload({
    username,
    expiresAt: expiresAt.toISOString(),
  })
  const signature = createSignature(payload)

  return {
    token: `${payload}.${signature}`,
    username,
    expiresAt: expiresAt.toISOString(),
  }
}

export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const [payload, signature] = token.split('.')

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = createSignature(payload)

  if (!areEqual(signature, expectedSignature)) {
    return null
  }

  try {
    const session = decodePayload(payload)
    const expiresAt = new Date(session.expiresAt)

    if (!session.username || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return null
    }

    if (session.username !== env.ADMIN_USERNAME) {
      return null
    }

    return {
      username: session.username,
      expiresAt: session.expiresAt,
    }
  } catch {
    return null
  }
}

export function getAdminSessionFromRequest(request) {
  const cookies = parseCookieHeader(request.headers.cookie)
  const token = cookies[ADMIN_SESSION_COOKIE_NAME]

  return verifyAdminSessionToken(token)
}

export function setAdminSessionCookie(response, token) {
  response.cookie(ADMIN_SESSION_COOKIE_NAME, token, {
    ...getCookieOptions(),
    maxAge: ADMIN_SESSION_TTL_MS,
  })
}

export function clearAdminSessionCookie(response) {
  response.clearCookie(ADMIN_SESSION_COOKIE_NAME, getCookieOptions())
}
