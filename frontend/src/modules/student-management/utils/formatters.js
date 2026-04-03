export function formatDateTime(value, fallback = 'Not sent yet') {
  if (!value) {
    return fallback
  }

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
