import { appConfig } from './config'

export function isStandaloneMode() {
  return appConfig.appMode === 'standalone'
}

export function isIntegratedMode() {
  return appConfig.appMode === 'integrated'
}
