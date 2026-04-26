const { env } = require('./env');

const sriLankanPhonePattern =
  /^(?:\+94\d{9}|0\d{9}|(?:\+94|0)\d{2}[-\s]?\d{3}[-\s]?\d{4})$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonNumericName(value) {
  return !/^\d+$/.test(value.trim());
}

function isValidEmail(value) {
  return emailPattern.test(value.trim());
}

function sanitizeSearchValue(value, { maxLength = 120 } = {}) {
  return value.trim().slice(0, maxLength);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidDateTimeValue(value) {
  if (!value) {
    return true;
  }

  return !Number.isNaN(new Date(value).valueOf());
}

function isAllowedClassLink(value) {
  if (!value || !env.ENFORCE_CLASS_LINK_DOMAIN_POLICY) {
    return true;
  }

  if (env.CLASS_LINK_ALLOWED_DOMAINS && env.CLASS_LINK_ALLOWED_DOMAINS.length === 0) {
    return true;
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase();

    return env.CLASS_LINK_ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

function buildAllowedClassLinkMessage() {
  if (env.CLASS_LINK_ALLOWED_DOMAINS && env.CLASS_LINK_ALLOWED_DOMAINS.length === 0) {
    return 'classLink must be a valid URL.';
  }

  return `classLink must use an allowed domain: ${env.CLASS_LINK_ALLOWED_DOMAINS.join(', ')}.`;
}

module.exports = {
  sriLankanPhonePattern,
  emailPattern,
  isNonNumericName,
  isValidEmail,
  sanitizeSearchValue,
  escapeRegex,
  isValidDateTimeValue,
  isAllowedClassLink,
  buildAllowedClassLinkMessage,
};
