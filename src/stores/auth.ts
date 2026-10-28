import type { AzureClientPrincipal } from '@/shared/interfaces/Auth'
import { getCurrentPrincipal, redirectToLogin, redirectToLogout } from '@/shared/helpers/azureAuth'
import { defineStore } from 'pinia'

interface AuthState {
    user: AzureClientPrincipal | null
    authLoading: boolean
}

const initialState = (): AuthState => ({
    user: null,
    authLoading: false,
});

export const useAuthStore = defineStore('auth', {
    state: () => initialState(),
    getters: {
        isAuthenticated: (state) => !!state.user,
        userName: (state) => state.user?.userDetails || '',
        userId: (state) => state.user?.userId || '',
    },
    actions: {
        setUser(user: AzureClientPrincipal | null) {
            this.user = user
        },
        async loadUser() {
            this.authLoading = true
            try {
                const user = await getCurrentPrincipal()
                this.setUser(user)
                return user
            } finally {
                this.authLoading = false
            }
        },
        async signIn() {
            redirectToLogin()
        },

        async signOut() {
            this.setUser(null)
            redirectToLogout()
        },
    },
    persist: true,
})
