export interface AzureClientPrincipal {
  identityProvider: string
  userId: string
  userDetails: string
  userRoles: string[]
  claims?: Array<{
    typ: string
    val: string
  }>
}

export interface AzureAuthResponse {
  clientPrincipal: AzureClientPrincipal | null
}
