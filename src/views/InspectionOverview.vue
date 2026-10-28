<template>
    <div class="container max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div class="space-y-4 sm:space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold">{{ currentInspection?.name || 'Inspectie Overzicht' }}
                    </h1>
                    <p class="text-gray-600 mt-1 text-sm sm:text-base">
                        Alle stoffen gegroepeerd per ADR-klasse en verpakkingsgroep
                    </p>
                </div>
                <div class="flex gap-2">
                    <UButton color="neutral" variant="outline" @click="goBack">
                        <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2"  />
                        Terug
                    </UButton>
                    <UButton color="primary" @click="generateReport">
                        <UIcon name="i-lucide-file-text" class="h-4 w-4 mr-2"  />
                        Rapport
                    </UButton>
                </div>
            </div>

            <!-- Overall Status Alert -->
            <div v-if="summary && summary.warnings.length > 0" class="space-y-4">
                <!-- Critical Warnings -->
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <UIcon name="i-lucide-triangle-alert" class="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5"  />
                        <div class="flex-1">
                            <div class="font-semibold text-red-900 text-lg">
                                Kritieke waarschuwingen - Limieten overschreden
                            </div>
                            <div class="text-sm text-red-700 mt-2 space-y-1">
                                <div v-for="(warning, index) in summary.warnings" :key="index"
                                    class="flex items-start gap-2">
                                    <span class="font-medium">•</span>
                                    <span>{{ warning }}</span>
                                </div>
                            </div>
                            <div class="text-sm text-red-800 mt-3 font-medium">
                                De inspectie overschrijdt ADR-limieten. U kunt de inspectie toch opslaan om de
                                overschrijding te documenteren.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PGS 15 Compliance Warning -->
                <div class="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <UIcon name="i-lucide-circle-alert" class="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5"  />
                        <div class="flex-1">
                            <div class="font-semibold text-orange-900 text-lg">
                                PGS 15 Compliance Vereist
                            </div>
                            <div class="text-sm text-orange-800 mt-2">
                                Eén of meerdere stoffen of combinatie van stoffen overschrijdt de ondergrens. Dit
                                betekent dat er sprake is van de activiteit "opslaan gevaarlijke stoffen". De opslag van
                                deze stoffen moet voldoen aan de <strong>PGS 15</strong> (Publicatiereeks Gevaarlijke
                                Stoffen).
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="summary && summary.overall_status === 'ok'"
                class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <UIcon name="i-lucide-circle-check" class="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5"  />
                    <div>
                        <div class="font-semibold text-green-900 text-lg">
                            Alle stoffen binnen limieten
                        </div>
                        <div class="text-sm text-green-700 mt-1">
                            De inspectie voldoet aan alle ADR-limieten en kan worden afgerond.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div v-if="summary" class="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-primary-600">{{ summary.completed_photos }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">Foto's</div>
                    </div>
                </UCard>
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-gray-900">{{ summary.total_substances }}</div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">Totaal stoffen</div>
                    </div>
                </UCard>
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-gray-900">{{ summary.groups.length }}</div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">ADR groepen</div>
                    </div>
                </UCard>
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-gray-900">{{ totalKgAcrossAll.toFixed(0) }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">Totaal KG</div>
                    </div>
                </UCard>
            </div>

            <!-- Grouped Substances Table -->
            <div v-if="summary && summary.groups.length > 0" class="space-y-4">
                <h2 class="text-xl sm:text-2xl font-semibold">Stoffen per ADR-klasse</h2>

                <div v-for="group in summary.groups" :key="`${group.adr_class}-${group.packaging_group}`"
                    class="border rounded-lg overflow-hidden">
                    <!-- Group Header -->
                    <div class="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg">
                                ADR Klasse {{ group.adr_class }}
                                <span v-if="group.packaging_group" class="text-gray-600">
                                    - {{ group.packaging_group }}
                                </span>
                            </h3>
                            <div class="text-sm text-gray-600 mt-1">
                                {{ group.substances.length }} stof{{ group.substances.length !== 1 ? 'fen' : '' }}
                                • Totaal: {{ (group.total_quantity_display || group.total_quantity_kg).toFixed(2) }} {{
                                    group.display_unit || 'KG' }}
                                <span v-if="group.limit_value">
                                    (Limiet: {{ group.limit_value }} {{ group.display_unit || 'KG' }})
                                </span>
                            </div>
                        </div>
                        <UBadge v-if="group.is_over_limit" color="error" variant="solid" size="lg">
                            <UIcon name="i-lucide-triangle-alert" class="h-4 w-4 mr-1"  />
                            Overschrijding
                        </UBadge>
                        <UBadge v-else color="success" variant="solid" size="lg">
                            <UIcon name="i-lucide-circle-check" class="h-4 w-4 mr-1"  />
                            OK
                        </UBadge>
                    </div>

                    <!-- Substances Table -->
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-100 border-b">
                                <tr>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Stofnaam</th>
                                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">VP</th>
                                    <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700">Hoeveelheid
                                    </th>
                                    <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700">Aantal</th>
                                    <th class="px-4 py-2 text-right text-sm font-semibold text-gray-700">Totaal (KG)
                                    </th>
                                    <th class="px-4 py-2 text-center text-sm font-semibold text-gray-700">UN</th>
                                    <th class="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="substance in group.substances" :key="substance.id"
                                    class="hover:bg-gray-50 transition-colors">
                                    <td class="px-4 py-3 text-sm">
                                        <button type="button" class="font-medium text-primary-700 underline text-left"
                                            :aria-label="`Bewerk ${substance.name}`" @click="editSubstance(substance)">
                                            {{ substance.name }}
                                        </button>
                                        <div v-if="substance.ai_reasoning" class="text-xs text-gray-500 mt-1">
                                            <UTooltip :text="substance.ai_reasoning">
                                                <div class="flex items-center gap-1 cursor-help">
                                                    <UIcon name="i-lucide-info" class="h-3 w-3"  />
                                                    <span>AI redenering</span>
                                                </div>
                                            </UTooltip>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-700">
                                        {{ substance.packaging_group || '-' }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-700 text-right">
                                        {{ substance.quantity }} {{ substance.unit }}
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-700 text-right">
                                        {{ substance.number_of_items || 1 }}×
                                    </td>
                                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                        {{ calculateTotalKg(substance).toFixed(2) }} KG
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-700 text-center">
                                        {{ substance.un_number || '-' }}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <UBadge v-if="substance.human_override" color="warning" variant="soft"
                                            size="sm">
                                            Override
                                        </UBadge>
                                        <UBadge v-else-if="substance.is_over_limit" color="error" variant="soft"
                                            size="sm">
                                            Over limiet
                                        </UBadge>
                                        <UBadge v-else color="success" variant="soft" size="sm">
                                            OK
                                        </UBadge>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot class="bg-gray-50 border-t-2">
                                <tr>
                                    <td colspan="4" class="px-4 py-3 text-sm font-semibold text-gray-900">
                                        Subtotaal
                                    </td>
                                    <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                                        {{ (group.total_quantity_display || group.total_quantity_kg).toFixed(2) }} {{
                                            group.display_unit || 'KG' }}
                                    </td>
                                    <td colspan="3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else>
                <UCard>
                    <div class="text-center py-12">
                        <UIcon name="i-lucide-package-open" class="h-16 w-16 text-gray-400 mx-auto"  />
                        <h3 class="text-xl font-semibold mt-4">Nog geen stoffen</h3>
                        <p class="text-gray-600 mt-2">
                            Maak foto's om stoffen te detecteren
                        </p>
                        <UButton color="primary" size="lg" class="mt-6" @click="goBack">
                            <UIcon name="i-lucide-camera" class="h-4 w-4 mr-2"  />
                            Start inspectie
                        </UButton>
                    </div>
                </UCard>
            </div>

            <!-- Actions -->
            <div v-if="summary && summary.total_substances > 0"
                class="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <UButton color="primary" size="xl" @click="completeInspection">
                    <UIcon name="i-lucide-check" class="h-5 w-5 mr-2"  />
                    Inspectie afronden
                </UButton>
                <UButton color="neutral" variant="outline" size="xl" @click="goBack">
                    <UIcon name="i-lucide-arrow-left" class="h-5 w-5 mr-2"  />
                    Meer foto's toevoegen
                </UButton>
            </div>
        </div>
        <UModal v-model:open="isEditOpen" title="Stof bewerken" description="Controleer en wijzig de stofgegevens.">
            <template #body>
                <SubstanceCard v-if="selectedSubstance" :key="`${selectedSubstance.photo_id}-${selectedSubstance.id}`"
                    :substance="selectedSubstance" @update:substance="handleSubstanceUpdate" />
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SubstanceCard from '@/components/SubstanceCard.vue'
import { useRouter } from 'vue-router'
import { useInspectionStore } from '@/stores/inspection'
import type { Substance } from '@/shared/interfaces/Substance'

const isEditOpen = ref(false)
const selectedSubstance = ref<Substance | null>(null)
const router = useRouter()
const inspectionStore = useInspectionStore()

const currentInspection = computed(() => inspectionStore.currentInspection)
const summary = computed(() => inspectionStore.currentInspectionSummary)

// Calculate total KG across all groups
const totalKgAcrossAll = computed(() => {
    if (!summary.value) return 0
    return summary.value.groups.reduce((sum, group) => sum + group.total_quantity_kg, 0)
})

const calculateTotalKg = (substance: Substance): number => {
    const qty = (substance.quantity || 0) * (substance.number_of_items || 1)

    if (substance.unit?.toLowerCase() === 'liter' && substance.specific_gravity) {
        return qty * substance.specific_gravity
    } else if (substance.unit?.toLowerCase() === 'kg') {
        return qty
    }

    return 0
}

const goBack = () => {
    router.push({ name: 'InspectionSession' })
}

const editSubstance = (substance: Substance) => {
    selectedSubstance.value = substance
    isEditOpen.value = true
}

const handleSubstanceUpdate = (substance: Substance) => {
    if (!substance.photo_id) return
    inspectionStore.updateSubstance(substance.photo_id, substance.id, substance)
    isEditOpen.value = false
    selectedSubstance.value = null
}

const generateReport = () => {
    router.push({ name: 'InspectionReport' })
}

const completeInspection = () => {
    inspectionStore.completeInspection()
    alert('Inspectie afgerond!')
    router.push({ name: 'Home' })
}
</script>
