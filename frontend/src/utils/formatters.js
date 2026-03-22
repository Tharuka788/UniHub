export function formatDateTime(value) {
  if (!value) {
    return 'Not sent yet'
  }

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
