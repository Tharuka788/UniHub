export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  appMode: import.meta.env.VITE_APP_MODE || 'standalone',
}

export function isStandaloneMode() {
  return appConfig.appMode === 'standalone'
}
