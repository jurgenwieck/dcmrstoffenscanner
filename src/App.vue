<template>
    <UApp>
        <UHeader v-if="authStore.isAuthenticated" title="DCMR Inspectie" class="z-[100]">
            <UNavigationMenu :items="items" />

            <template #right>
                <span class="hidden sm:inline text-sm text-gray-600">{{ authStore.userName }}</span>
                <UColorModeButton />
            </template>
        </UHeader>

        <UContainer>
            <RouterView />
        </UContainer>
    </UApp>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
    authStore.loadUser()
})

const items: NavigationMenuItem[] = [
    {
        label: 'Home',
        icon: 'i-lucide-home',
        to: '/app/home',
    },
    {
        label: 'Uitloggen',
        icon: 'i-lucide-log-out',
        onClick: () => authStore.signOut(),
    },
]
</script>
