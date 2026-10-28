<template>
    <div class="container max-w-6xl mx-auto px-4 py-8">
        <div class="space-y-6">
            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold">Stof Scanner</h1>
                <p class="text-gray-600 mt-2">
                    Upload een afbeelding om meerdere chemische stoffen te detecteren en te valideren tegen ADR-limieten
                </p>
            </div>

            <!-- Upload Step -->
            <div v-if="currentStep === 'upload'">
                <ImageUpload @image-confirmed="handleImageConfirmed" />
            </div>

            <!-- Extracting Step -->
            <div v-else-if="currentStep === 'extracting'">
                <UCard>
                    <div class="text-center py-12 space-y-4">
                        <UIcon name="i-lucide-loader-circle" class="h-12 w-12 text-primary-600 animate-spin mx-auto" />
                        <div>
                            <h3 class="text-lg font-semibold">Afbeelding analyseren...</h3>
                            <p class="text-gray-600 mt-1">
                                Stoffen detecteren en informatie extraheren
                            </p>
                            <p class="text-sm text-gray-500 mt-2">
                                Dit kan even duren...
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Results Step -->
            <div v-else-if="currentStep === 'results' && extractionResult">
                <div class="space-y-6">
                    <!-- Image preview -->
                    <UCard>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <h2 class="text-xl font-semibold">Gescande afbeelding</h2>
                                <UButton color="neutral" variant="ghost" @click="resetScanner">
                                    <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2"  />
                                    Scan nog een
                                </UButton>
                            </div>
                            <img :src="imagePreviewUrl" alt="Gescande afbeelding"
                                class="w-full max-w-2xl mx-auto rounded-lg border border-gray-200" />
                            <div v-if="extractionResult.image_description" class="text-sm text-gray-600">
                                <strong>Beschrijving:</strong> {{ extractionResult.image_description }}
                            </div>
                        </div>
                    </UCard>

                    <!-- Substances summary -->
                    <UCard>
                        <div class="space-y-3">
                            <h2 class="text-xl font-semibold">
                                Gedetecteerde stoffen ({{ extractionResult.total_count }})
                            </h2>

                            <!-- Summary badges -->
                            <div class="flex flex-wrap gap-3">
                                <UBadge v-if="overLimitCount > 0" color="error" variant="soft" size="lg">
                                    {{ overLimitCount }} Boven limiet
                                </UBadge>
                                <UBadge v-if="overrideCount > 0" color="warning" variant="soft" size="lg">
                                    {{ overrideCount }} Override{{ overrideCount > 1 ? 's' : '' }}
                                </UBadge>
                                <UBadge v-if="okCount > 0" color="success" variant="soft" size="lg">
                                    {{ okCount }} Binnen limieten
                                </UBadge>
                            </div>

                            <!-- Warning if any over limit -->
                            <div v-if="overLimitCount > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div class="flex items-start gap-3">
                                    <UIcon name="i-lucide-triangle-alert"
                                        class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"  />
                                    <div>
                                        <div class="font-medium text-red-900">
                                            Waarschuwing: {{ overLimitCount }} stof{{ overLimitCount > 1 ? 'fen' : '' }}
                                            overschrijdt{{ overLimitCount === 1 ? '' : 'en' }} ADR-limieten
                                        </div>
                                        <div class="text-sm text-red-700 mt-1">
                                            Controleer en geef indien nodig een reden voor override.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>

                    <!-- Substance cards -->
                    <div class="space-y-4">
                        <h2 class="text-xl font-semibold">Stofdetails</h2>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <SubstanceCard v-for="substance in substances" :key="substance.id" :substance="substance"
                                @update:substance="handleSubstanceUpdate" />
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3">
                        <UButton color="primary" size="lg" :disabled="overLimitCount > 0" @click="handleSave">
                            <UIcon name="i-lucide-save" class="h-4 w-4 mr-2"  />
                            Alle stoffen opslaan
                        </UButton>
                        <UButton color="neutral" variant="outline" size="lg" @click="resetScanner">
                            Scan nog een afbeelding
                        </UButton>
                    </div>
                </div>
            </div>

            <!-- Error Step -->
            <div v-else-if="currentStep === 'error'">
                <UCard>
                    <div class="text-center py-12 space-y-4">
                        <UIcon name="i-lucide-circle-x" class="h-12 w-12 text-red-600 mx-auto" />
                        <div>
                            <h3 class="text-lg font-semibold text-red-900">
                                Extractie mislukt
                            </h3>
                            <p class="text-gray-600 mt-2">{{ errorMessage }}</p>
                        </div>
                        <UButton color="primary" @click="resetScanner">
                            Opnieuw proberen
                        </UButton>
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import SubstanceCard from '@/components/SubstanceCard.vue'
import { extractSubstances } from '@/shared/helpers/visionHelper'
import { validateSubstances } from '@/shared/helpers/adrValidation'
import type { SubstanceExtractionResult, Substance } from '@/shared/interfaces/Substance'

type ScanStep = 'upload' | 'extracting' | 'results' | 'error'

const currentStep = ref<ScanStep>('upload')
const extractionResult = ref<SubstanceExtractionResult | null>(null)
const substances = ref<Substance[]>([])
const errorMessage = ref<string>('')
const imagePreviewUrl = ref<string>('')

// Computed summary counts
const overLimitCount = computed(() => {
    return substances.value.filter(s => s.is_over_limit && !s.human_override).length
})

const overrideCount = computed(() => {
    return substances.value.filter(s => s.human_override).length
})

const okCount = computed(() => {
    return substances.value.filter(s => !s.is_over_limit && !s.human_override).length
})

const handleImageConfirmed = async (file: File) => {
    currentStep.value = 'extracting'

    // Create preview URL
    imagePreviewUrl.value = URL.createObjectURL(file)

    const response = await extractSubstances(file)

    if (!response.success || !response.data) {
        currentStep.value = 'error'
        errorMessage.value =
            response.error || 'Failed to extract substance information'
        return
    }

    console.log('Extraction result:', response.data)

    extractionResult.value = response.data

    // Validate all substances
    substances.value = validateSubstances(response.data.substances)

    currentStep.value = 'results'
}

const handleSubstanceUpdate = (updatedSubstance: Substance) => {
    const index = substances.value.findIndex(s => s.id === updatedSubstance.id)
    if (index !== -1) {
        // Create a new array to trigger reactivity
        const newSubstances = [...substances.value]
        newSubstances[index] = updatedSubstance

        // Re-validate after update
        substances.value = validateSubstances(newSubstances)

        console.log('Updated substance:', updatedSubstance)
    }
}

const handleSave = () => {
    // TODO: Implement saving to database
    console.log('Saving substances:', substances.value)
    alert('Save functionality coming soon!')
}

const resetScanner = () => {
    currentStep.value = 'upload'
    extractionResult.value = null
    substances.value = []
    errorMessage.value = ''
    if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = ''
    }
}
</script>
