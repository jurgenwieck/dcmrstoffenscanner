<template>
    <div class="inspection-report bg-white" :class="{ 'print-mode': isPrintMode }">
        <div class="report-container max-w-4xl mx-auto p-4 sm:p-8">
            <!-- Header -->
            <div class="report-header mb-6 sm:mb-8 border-b-2 border-gray-800 pb-4 sm:pb-6">
                <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Inspectie Rapport</h1>
                        <h2 class="text-lg sm:text-xl text-gray-700">{{ inspection.name }}</h2>
                    </div>
                    <div class="text-left sm:text-right text-sm">
                        <div class="font-semibold">DCMR</div>
                        <div class="text-gray-600">Gevaarlijke Stoffen Inspectie</div>
                    </div>
                </div>
            </div>

            <!-- Inspection Details -->
            <div class="report-section mb-8">
                <h3 class="text-lg font-semibold mb-3 text-gray-900">Inspectie Details</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div class="flex flex-col sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-700">Inspectie ID:</span>
                        <span class="sm:ml-2 break-all">{{ inspection.id }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-700">Datum:</span>
                        <span class="sm:ml-2">{{ formatDate(inspection.created_at) }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-700">Status:</span>
                        <span class="sm:ml-2 mt-1 sm:mt-0">
                            <UBadge :color="inspection.status === 'completed' ? 'success' : 'warning'">
                                {{ inspection.status === 'completed' ? 'Voltooid' : 'Actief' }}
                            </UBadge>
                        </span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-700">Aantal foto's:</span>
                        <span class="sm:ml-2">{{ summary.completed_photos }}</span>
                    </div>
                    <div v-if="inspection.location"
                        class="col-span-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center">
                        <span class="font-medium text-gray-700">Locatie:</span>
                        <span class="sm:ml-2">{{ inspection.location }}</span>
                    </div>
                    <div v-if="inspection.notes" class="col-span-1 sm:col-span-2 flex flex-col">
                        <span class="font-medium text-gray-700 mb-1">Opmerkingen:</span>
                        <span class="text-gray-600">{{ inspection.notes }}</span>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div class="report-section mb-6 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 class="text-base sm:text-lg font-semibold mb-3 text-gray-900">Samenvatting</h3>
                <div class="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div>
                        <div class="text-xl sm:text-2xl font-bold text-gray-900">{{ summary.total_substances }}</div>
                        <div class="text-xs sm:text-sm text-gray-600">Totaal Stoffen</div>
                    </div>
                    <div>
                        <div class="text-xl sm:text-2xl font-bold text-gray-900">{{ summary.groups.length }}</div>
                        <div class="text-xs sm:text-sm text-gray-600">ADR Groepen</div>
                    </div>
                    <div>
                        <div class="text-xl sm:text-2xl font-bold" :class="{
                            'text-green-600': summary.overall_status === 'ok',
                            'text-red-600': summary.overall_status === 'error',
                            'text-yellow-600': summary.overall_status === 'warning',
                        }">
                            {{ summary.overall_status === 'ok' ? 'OK' : summary.overall_status === 'error' ? 'FOUT' :
                                'WAARSCHUWING' }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600">Status</div>
                    </div>
                </div>
            </div>

            <!-- Warnings (if any) -->
            <div v-if="summary.warnings.length > 0" class="report-section mb-6 sm:mb-8">
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4">
                    <h3 class="text-base sm:text-lg font-semibold mb-3 text-red-900 flex items-center gap-2">
                        <UIcon name="i-lucide-triangle-alert" class="h-4 sm:h-5 w-4 sm:w-5"  />
                        Waarschuwingen
                    </h3>
                    <ul class="space-y-2 text-xs sm:text-sm">
                        <li v-for="(warning, index) in summary.warnings" :key="index"
                            class="flex items-start gap-2 text-red-800">
                            <span class="font-bold flex-shrink-0">•</span>
                            <span class="break-words">{{ warning }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Grouped Substances -->
            <div class="report-section mb-6 sm:mb-8">
                <h3 class="text-base sm:text-lg font-semibold mb-4 text-gray-900">Stoffen per ADR-klasse</h3>

                <div v-for="group in summary.groups" :key="`${group.adr_class}-${group.packaging_group}`"
                    class="mb-6 page-break-inside-avoid">
                    <!-- Group Header -->
                    <div class="bg-gray-100 border-b-2 border-gray-800 px-3 sm:px-4 py-3 mb-2">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h4 class="font-semibold text-sm sm:text-base">
                                    ADR Klasse {{ group.adr_class }}
                                    <span v-if="group.packaging_group" class="text-gray-600">
                                        - {{ group.packaging_group }}
                                    </span>
                                </h4>
                                <div class="text-xs sm:text-sm text-gray-700 mt-1">
                                    {{ group.substances.length }} stof{{ group.substances.length !== 1 ? 'fen' : '' }}
                                    • Totaal: <strong>{{ group.total_quantity_kg.toFixed(2) }} KG</strong>
                                    <span v-if="group.limit_value">
                                        (Limiet: {{ group.limit_value }} KG)
                                    </span>
                                </div>
                            </div>
                            <UBadge v-if="group.is_over_limit" color="error" variant="solid" size="sm">
                                Overschrijding
                            </UBadge>
                            <UBadge v-else color="success" variant="solid" size="sm">
                                OK
                            </UBadge>
                        </div>
                    </div>

                    <!-- Substances Table - Scrollable on mobile -->
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs sm:text-sm border-collapse min-w-max sm:min-w-0">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-300">
                                    <th class="px-2 sm:px-3 py-2 text-left font-semibold whitespace-nowrap">Stofnaam
                                    </th>
                                    <th class="px-2 sm:px-3 py-2 text-left font-semibold whitespace-nowrap">VP</th>
                                    <th class="px-2 sm:px-3 py-2 text-right font-semibold whitespace-nowrap">Hoeveelheid
                                    </th>
                                    <th class="px-2 sm:px-3 py-2 text-right font-semibold whitespace-nowrap">Aantal</th>
                                    <th class="px-2 sm:px-3 py-2 text-right font-semibold whitespace-nowrap">Totaal (KG)
                                    </th>
                                    <th class="px-2 sm:px-3 py-2 text-center font-semibold whitespace-nowrap">UN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="substance in group.substances" :key="substance.id"
                                    class="border-b border-gray-200">
                                    <td class="px-2 sm:px-3 py-2">
                                        <div class="font-medium">{{ substance.name }}</div>
                                        <div v-if="substance.human_override" class="text-xs text-yellow-700 mt-1">
                                            Override: {{ substance.human_override_reason }}
                                        </div>
                                    </td>
                                    <td class="px-2 sm:px-3 py-2 whitespace-nowrap">{{ substance.packaging_group || '-'
                                        }}</td>
                                    <td class="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{{ substance.quantity }}
                                        {{ substance.unit }}</td>
                                    <td class="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{{
                                        substance.number_of_items || 1 }}×</td>
                                    <td class="px-2 sm:px-3 py-2 text-right font-semibold whitespace-nowrap">{{
                                        calculateTotalKg(substance).toFixed(2)
                                        }} KG</td>
                                    <td class="px-2 sm:px-3 py-2 text-center whitespace-nowrap">{{ substance.un_number
                                        || '-' }}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="bg-gray-100 font-semibold border-t-2 border-gray-800">
                                    <td colspan="4" class="px-2 sm:px-3 py-2">Subtotaal</td>
                                    <td class="px-2 sm:px-3 py-2 text-right whitespace-nowrap">{{
                                        group.total_quantity_kg.toFixed(2) }} KG</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Photos Section -->
            <div class="report-section mb-8 page-break-before">
                <h3 class="text-lg font-semibold mb-4 text-gray-900">Foto's van inspectie</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(photo, index) in completedPhotos" :key="photo.id" class="page-break-inside-avoid">
                        <div class="border border-gray-300 rounded-lg overflow-hidden">
                            <img v-if="getPhotoUrl(photo)" :src="getPhotoUrl(photo)" :alt="`Foto ${index + 1}`"
                                class="w-full h-auto object-contain bg-gray-50" style="max-height: 400px;" />
                            <div class="px-3 py-2 bg-gray-100 border-t border-gray-300">
                                <div class="font-semibold text-sm">Foto {{ index + 1 }}</div>
                                <div v-if="photo.image_description" class="text-xs text-gray-600 mt-1">
                                    {{ photo.image_description }}
                                </div>
                                <div class="text-xs text-gray-600 mt-1">
                                    {{ photo.substances.length }} stof{{ photo.substances.length !== 1 ? 'fen' : '' }}
                                    gedetecteerd
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Reasoning (Optional Appendix) -->
            <div v-if="showReasoning && hasReasoning" class="report-section mb-8 page-break-before">
                <h3 class="text-lg font-semibold mb-4 text-gray-900">Appendix: AI Classificatie Redenering</h3>
                <div class="space-y-4">
                    <div v-for="(photo, photoIndex) in inspection.photos.filter((p: any) => p.status === 'completed')"
                        :key="photo.id" class="page-break-inside-avoid">
                        <h4 class="font-semibold text-sm mb-2">Foto {{ photoIndex + 1 }}</h4>
                        <div v-for="substance in photo.substances.filter((s: any) => s.ai_reasoning)"
                            :key="substance.id" class="mb-3 bg-gray-50 p-3 rounded text-sm">
                            <div class="font-medium text-gray-900 mb-1">{{ substance.name }}</div>
                            <div class="text-gray-700">{{ substance.ai_reasoning }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="report-footer mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600">
                <div class="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <div>Gegenereerd op: {{ formatDateTime(new Date()) }}</div>
                        <div class="mt-1">DCMR Inspectie Systeem v1.0</div>
                        <div v-if="aiModelInfo" class="mt-2 space-y-1">
                            <div class="font-semibold text-gray-700">AI Model Informatie (AI PACT):</div>
                            <div>Model: {{ aiModelInfo.model }}</div>
                            <div v-if="aiModelInfo.timestamp">Analyse uitgevoerd: {{
                                formatDateTime(aiModelInfo.timestamp) }}</div>
                        </div>
                    </div>
                    <div class="text-left sm:text-right">
                        <div>Document ID: {{ inspection.id }}</div>
                        <div v-if="inspection.user_id" class="mt-1">Inspecteur ID: {{ inspection.user_id }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Inspection, InspectionSummary, InspectionPhoto } from '@/shared/interfaces/Inspection'
import type { Substance } from '@/shared/interfaces/Substance'

interface Props {
    inspection: Inspection
    summary: InspectionSummary
    showReasoning?: boolean
    isPrintMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showReasoning: true,
    isPrintMode: false,
})

const hasReasoning = computed(() => {
    return props.inspection.photos
        .filter(p => p.status === 'completed')
        .some(photo => photo.substances.some(s => s.ai_reasoning))
})

// Get AI model info from first substance with metadata
const aiModelInfo = computed(() => {
    const completedPhotos = props.inspection.photos.filter(p => p.status === 'completed')
    for (const photo of completedPhotos) {
        const substanceWithModel = photo.substances.find(s => s.ai_model)
        if (substanceWithModel) {
            return {
                model: substanceWithModel.ai_model,
                timestamp: substanceWithModel.ai_timestamp
            }
        }
    }
    return null
})

// Get completed photos
const completedPhotos = computed(() => {
    return props.inspection.photos.filter(p => p.status === 'completed')
})

// Get photo URL from blob or URL
const getPhotoUrl = (photo: InspectionPhoto) => {
    if (photo.image_url) {
        return photo.image_url
    }
    if (photo.image_blob) {
        return URL.createObjectURL(photo.image_blob)
    }
    return undefined
}

const calculateTotalKg = (substance: Substance): number => {
    const qty = (substance.quantity || 0) * (substance.number_of_items || 1)

    if (substance.unit?.toLowerCase() === 'liter' && substance.specific_gravity) {
        return qty * substance.specific_gravity
    } else if (substance.unit?.toLowerCase() === 'kg') {
        return qty
    }

    return 0
}

const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('nl-NL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>

<style scoped>
/* Print styles */
@media print {
    .inspection-report {
        background-color: white;
    }

    .page-break-before {
        page-break-before: always;
    }

    .page-break-inside-avoid {
        page-break-inside: avoid;
    }

    /* Hide Nuxt UI badges in print, show text instead */
    .print-mode :deep(.badge) {
        border: 1px solid #808080;
        background-color: white;
        color: #808080;
    }
}

/* Screen styles for preview */
.inspection-report:not(.print-mode) {
    background-color: #f5f5f5;
    min-height: 100vh;
    padding: 80px;
}
</style>
