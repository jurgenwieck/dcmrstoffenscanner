<template>
    <UMain class="grid">
        <UPageCard class="w-full m-auto max-w-md shadow-lg" title="Inloggen" description="Gebruik je DCMR Microsoft-account om verder te gaan.">
            <UButton color="primary" block size="lg" :loading="authStore.authLoading" @click="authStore.signIn()">
                Inloggen met Microsoft Entra ID
            </UButton>
        </UPageCard>
    </UMain>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
