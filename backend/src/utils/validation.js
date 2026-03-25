export const sriLankanPhonePattern =
  /^(?:\+94\d{9}|0\d{9}|(?:\+94|0)\d{2}[-\s]?\d{3}[-\s]?\d{4})$/

export function isNonNumericName(value) {
  return !/^\d+$/.test(value.trim())
}

export function sanitizeSearchValue(value, { maxLength = 120 } = {}) {
  return value.trim().slice(0, maxLength)
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
