import { env } from '../config/env.js'

export const sriLankanPhonePattern =
  /^(?:\+94\d{9}|0\d{9}|(?:\+94|0)\d{2}[-\s]?\d{3}[-\s]?\d{4})$/
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isNonNumericName(value) {
  return !/^\d+$/.test(value.trim())
}

export function isValidEmail(value) {
  return emailPattern.test(value.trim())
}

export function sanitizeSearchValue(value, { maxLength = 120 } = {}) {
  return value.trim().slice(0, maxLength)
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function isValidDateTimeValue(value) {
  if (!value) {
    return true
  }

  return !Number.isNaN(new Date(value).valueOf())
}

export function isAllowedClassLink(value) {
  if (!value || !env.ENFORCE_CLASS_LINK_DOMAIN_POLICY) {
    return true
  }

  if (env.CLASS_LINK_ALLOWED_DOMAINS.length === 0) {
    return true
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase()

    return env.CLASS_LINK_ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

export function buildAllowedClassLinkMessage() {
  if (env.CLASS_LINK_ALLOWED_DOMAINS.length === 0) {
    return 'classLink must be a valid URL.'
  }

  return `classLink must use an allowed domain: ${env.CLASS_LINK_ALLOWED_DOMAINS.join(', ')}.`
}
