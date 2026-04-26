export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
  appMode: import.meta.env.VITE_APP_MODE || 'integrated',
}

export function isStandaloneMode() {
  return appConfig.appMode === 'standalone'
}
