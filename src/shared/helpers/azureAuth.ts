import type { AzureAuthResponse, AzureClientPrincipal } from '@/shared/interfaces/Auth'

const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true'

export async function getCurrentPrincipal(): Promise<AzureClientPrincipal | null> {
  if (isAuthDisabled) {
    return {
      identityProvider: 'local',
      userId: 'local-dev-user',
      userDetails: 'local.dev@dcmr.nl',
      userRoles: ['anonymous', 'authenticated'],
    }
  }

  const response = await fetch('/.auth/me', {
    credentials: 'include',
  }).catch(() => null)

  if (!response?.ok) {
    return null
  }

  const data = await response.json().catch(() => ({ clientPrincipal: null })) as AzureAuthResponse
  return data.clientPrincipal
}

export function redirectToLogin() {
  const redirectUri = encodeURIComponent('/app/home')
  window.location.href = `/.auth/login/aad?post_login_redirect_uri=${redirectUri}`
}

export function redirectToLogout() {
  const redirectUri = encodeURIComponent('/auth')
  window.location.href = `/.auth/logout?post_logout_redirect_uri=${redirectUri}`
}
