<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Action Bar (hidden in print) -->
        <div class="no-print bg-white border-b shadow-sm sticky top-0 z-10">
            <div class="container max-w-7xl mx-auto px-4 py-3">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-4">
                        <UButton color="neutral" variant="ghost" size="sm" @click="goBack">
                            <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2"  />
                            Terug
                        </UButton>
                        <div class="border-l border-gray-300 pl-4">
                            <h2 class="font-semibold text-gray-900 text-sm sm:text-base">Rapport Voorbeeld</h2>
                            <p class="text-xs sm:text-sm text-gray-600">{{ currentInspection?.name }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <UButton color="neutral" variant="outline" size="sm" class="flex-1 sm:flex-initial"
                            @click="toggleReasoning">
                            <UIcon name="i-lucide-brain" class="h-4 w-4 mr-2"  />
                            {{ showReasoning ? 'Verberg' : 'Toon' }} AI
                        </UButton>
                        <UButton color="primary" size="sm" class="flex-1 sm:flex-initial" @click="handlePrint">
                            <UIcon name="i-lucide-printer" class="h-4 w-4 mr-2"  />
                            Print
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Content -->
        <div v-if="currentInspection && summary" class="py-8">
            <InspectionReport :inspection="currentInspection" :summary="summary" :show-reasoning="showReasoning"
                :is-print-mode="false" />
        </div>

        <!-- Loading State -->
        <div v-else class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <UIcon name="i-lucide-loader-circle" class="h-12 w-12 text-primary-600 animate-spin mx-auto" />
                <p class="text-gray-600 mt-4">Rapport laden...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInspectionStore } from '@/stores/inspection'
import InspectionReport from '@/components/InspectionReport.vue'

const router = useRouter()
const inspectionStore = useInspectionStore()

const showReasoning = ref(true)

const currentInspection = computed(() => inspectionStore.currentInspection)
const summary = computed(() => inspectionStore.currentInspectionSummary)

const goBack = () => {
    router.back()
}

const toggleReasoning = () => {
    showReasoning.value = !showReasoning.value
}

const handlePrint = () => {
    window.print()
}
</script>

<style>
@media print {
    .no-print {
        display: none !important;
    }

    body {
        background: white !important;
    }
}
</style>
