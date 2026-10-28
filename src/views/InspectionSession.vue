<template>
    <div class="container max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div class="space-y-4 sm:space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold">{{ currentInspection?.name || 'Nieuwe Inspectie' }}</h1>
                    <p class="text-gray-600 mt-1 text-sm sm:text-base">
                        Maak meerdere foto's en bouw een compleet overzicht van alle stoffen
                    </p>
                </div>
                <div class="flex gap-2">
                    <UButton v-if="currentInspection" color="neutral" variant="outline" @click="viewOverview">
                        <UIcon name="i-lucide-list-checks" class="h-4 w-4 mr-2"  />
                        Overzicht
                    </UButton>
                    <UButton v-if="currentInspection" color="primary" variant="outline" @click="startNewPhoto">
                        <UIcon name="i-lucide-camera" class="h-4 w-4 mr-2"  />
                        Nieuwe foto
                    </UButton>
                </div>
            </div>

            <!-- Quick Stats -->
            <div v-if="summary" class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-primary-600">{{ summary.completed_photos }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">Foto's voltooid</div>
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
                        <div class="text-2xl sm:text-3xl font-bold" :class="{
                            'text-green-600': summary.overall_status === 'ok',
                            'text-yellow-600': summary.overall_status === 'warning',
                            'text-red-600': summary.overall_status === 'error',
                        }">
                            {{ summary.groups.length }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">ADR groepen</div>
                    </div>
                </UCard>
                <UCard>
                    <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold" :class="{
                            'text-green-600': summary.warnings.length === 0,
                            'text-red-600': summary.warnings.length > 0,
                        }">
                            {{ summary.warnings.length }}
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">Waarschuwingen</div>
                    </div>
                </UCard>
            </div>

            <!-- Upload/Camera Step -->
            <div v-if="currentStep === 'upload'">
                <UCard>
                    <div class="space-y-4">
                        <h2 class="text-xl font-semibold">Foto maken of uploaden</h2>
                        <ImageUpload @image-confirmed="handleImageConfirmed" />
                    </div>
                </UCard>
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
                                Dit kan tot 60 seconden duren
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Error Step -->
            <div v-else-if="currentStep === 'error'">
                <UCard>
                    <div class="text-center py-12 space-y-4">
                        <UIcon name="i-lucide-triangle-alert" class="h-12 w-12 text-red-500 mx-auto"  />
                        <div>
                            <h3 class="text-lg font-semibold text-red-900">Analyse mislukt</h3>
                            <p class="text-gray-700 mt-2 max-w-lg mx-auto">
                                {{ errorMessage }}
                            </p>
                        </div>
                        <div class="flex gap-3 justify-center pt-4">
                            <UButton color="primary" @click="startNewPhoto">
                                <UIcon name="i-lucide-camera" class="h-4 w-4 mr-2"  />
                                Probeer opnieuw
                            </UButton>
                            <UButton color="neutral" variant="outline" @click="currentStep = 'none'">
                                Annuleren
                            </UButton>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Photo Review Step -->
            <div v-else-if="currentStep === 'review' && currentPhoto">
                <div class="space-y-4 sm:space-y-6">
                    <!-- Image preview -->
                    <UCard>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <h2 class="text-lg sm:text-xl font-semibold">Foto {{ currentInspection?.photos.length }}
                                </h2>
                            </div>
                            <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="Gescande afbeelding"
                                class="w-full max-w-2xl mx-auto rounded-lg border border-gray-200" />
                            <div v-if="currentPhoto.image_description" class="text-sm text-gray-600">
                                <strong>Beschrijving:</strong> {{ currentPhoto.image_description }}
                            </div>
                        </div>
                    </UCard>

                    <!-- Substances from this photo -->
                    <UCard>
                        <div class="space-y-3">
                            <h2 class="text-lg sm:text-xl font-semibold">
                                Gedetecteerde stoffen ({{ currentPhoto.substances.length }})
                            </h2>

                            <!-- Summary badges -->
                            <div class="flex flex-wrap gap-2 sm:gap-3">
                                <UBadge v-if="photoOverLimitCount > 0" color="error" variant="soft" size="lg">
                                    {{ photoOverLimitCount }} Boven limiet
                                </UBadge>
                                <UBadge v-if="photoCannotValidateCount > 0" color="warning" variant="soft" size="lg">
                                    {{ photoCannotValidateCount }} Onvolledig
                                </UBadge>
                                <UBadge v-if="photoOkCount > 0" color="success" variant="soft" size="lg">
                                    {{ photoOkCount }} Binnen limieten
                                </UBadge>
                            </div>
                        </div>
                    </UCard>

                    <!-- Substance cards -->
                    <div class="space-y-4">
                        <h2 class="text-lg sm:text-xl font-semibold">Stofdetails</h2>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <SubstanceCard v-for="substance in currentPhoto.substances" :key="substance.id"
                                :substance="substance" @update:substance="handleSubstanceUpdate" />
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col sm:flex-row gap-3">
                        <UButton color="primary" size="lg" class="flex-1 sm:flex-initial"
                            :disabled="photoCannotValidateCount > 0" @click="handleCompletePhoto">
                            <UIcon name="i-lucide-check" class="h-4 w-4 mr-2"  />
                            Foto afronden
                        </UButton>
                        <UButton color="neutral" variant="outline" size="lg" class="flex-1 sm:flex-initial"
                            @click="handleCancelPhoto">
                            <UIcon name="i-lucide-x" class="h-4 w-4 mr-2"  />
                            Annuleren
                        </UButton>
                    </div>

                    <!-- Warning message when button is disabled -->
                    <div v-if="photoCannotValidateCount > 0"
                        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <div class="flex items-start gap-3">
                            <UIcon name="i-lucide-triangle-alert"
                                class="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"  />
                            <div class="text-sm text-yellow-800">
                                <div class="font-medium">
                                    Vul alle verplichte velden in voordat u de foto kunt afronden.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Info message when over limit but can still proceed -->
                    <div v-if="photoOverLimitCount > 0 && photoCannotValidateCount === 0"
                        class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div class="flex items-start gap-3">
                            <UIcon name="i-lucide-info" class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"  />
                            <div class="text-sm text-blue-800">
                                <div class="font-medium">
                                    {{ photoOverLimitCount }} stof{{ photoOverLimitCount > 1 ? 'fen' : '' }}
                                    overschrijdt de limiet. U kunt de foto toch afronden om dit te documenteren.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Photos list (when no current step) -->
            <div v-else-if="currentInspection && currentInspection.photos.length > 0">
                <UCard>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-semibold">Foto's in deze inspectie</h2>
                            <UButton color="primary" @click="startNewPhoto">
                                <UIcon name="i-lucide-camera" class="h-4 w-4 mr-2"  />
                                Nieuwe foto
                            </UButton>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="(photo, index) in currentInspection.photos" :key="photo.id"
                                class="border rounded-lg p-4 space-y-3">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h3 class="font-semibold">Foto {{ index + 1 }}</h3>
                                        <p class="text-sm text-gray-600">
                                            {{ photo.substances.length }} stoffen
                                        </p>
                                    </div>
                                    <UBadge
                                        :color="photo.status === 'completed' ? 'success' : photo.status === 'cancelled' ? 'error' : 'warning'"
                                        variant="soft">
                                        {{ photo.status === 'completed' ? 'Voltooid' : photo.status === 'cancelled' ?
                                            'Geannuleerd' : 'Concept' }}
                                    </UBadge>
                                </div>

                                <div class="text-xs text-gray-500">
                                    {{ new Date(photo.created_at).toLocaleString('nl-NL') }}
                                </div>

                                <div class="flex gap-2">
                                    <UButton color="neutral" variant="ghost" size="xs" @click="deletePhoto(photo.id)">
                                        <UIcon name="i-lucide-trash-2" class="h-3 w-3 mr-1"  />
                                        Verwijderen
                                    </UButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Complete inspection button -->
                <div class="flex justify-center gap-3 pt-6">
                    <UButton color="primary" size="xl" @click="completeInspection">
                        <UIcon name="i-lucide-check" class="h-5 w-5 mr-2"  />
                        Inspectie afronden
                    </UButton>
                    <UButton color="neutral" variant="outline" size="xl" @click="viewOverview">
                        <UIcon name="i-lucide-list-checks" class="h-5 w-5 mr-2"  />
                        Overzicht bekijken
                    </UButton>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else>
                <UCard>
                    <div class="text-center py-12 space-y-4">
                        <UIcon name="i-lucide-camera" class="h-16 w-16 text-gray-400 mx-auto"  />
                        <div>
                            <h3 class="text-xl font-semibold">Start je inspectie</h3>
                            <p class="text-gray-600 mt-2">
                                Maak je eerste foto om stoffen te detecteren
                            </p>
                        </div>
                        <UButton color="primary" size="xl" @click="startNewPhoto">
                            <UIcon name="i-lucide-camera" class="h-5 w-5 mr-2"  />
                            Eerste foto maken
                        </UButton>
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ImageUpload from '@/components/ImageUpload.vue'
import SubstanceCard from '@/components/SubstanceCard.vue'
import { extractSubstances } from '@/shared/helpers/visionHelper'
import { validateSubstance } from '@/shared/helpers/adrValidation'
import { useInspectionStore } from '@/stores/inspection'
import type { Substance } from '@/shared/interfaces/Substance'
import type { InspectionPhoto } from '@/shared/interfaces/Inspection'

type InspectionStep = 'upload' | 'extracting' | 'review' | 'none' | 'error'

const router = useRouter()
const inspectionStore = useInspectionStore()

const currentStep = ref<InspectionStep>('none')
const currentPhoto = ref<InspectionPhoto | null>(null)
const imagePreviewUrl = ref<string>('')
const errorMessage = ref<string>('')

const currentInspection = computed(() => inspectionStore.currentInspection)
const summary = computed(() => inspectionStore.currentInspectionSummary)

// Computed counts for current photo
const photoOverLimitCount = computed(() => {
    if (!currentPhoto.value) return 0
    return currentPhoto.value.substances.filter(s => s.is_over_limit && !s.human_override).length
})

const photoCannotValidateCount = computed(() => {
    if (!currentPhoto.value) return 0
    // Count substances that cannot be validated (missing required fields)
    return currentPhoto.value.substances.filter(s => {
        const validation = validateSubstance(s)
        return !validation.can_validate && !validation.not_assessed
    }).length
})

const photoOkCount = computed(() => {
    if (!currentPhoto.value) return 0
    return currentPhoto.value.substances.filter(s => !s.is_over_limit).length
})

onMounted(() => {
    // Create or load inspection
    if (!inspectionStore.currentInspection || inspectionStore.currentInspection.status !== 'active') {
        inspectionStore.createInspection()
    }
})

const startNewPhoto = () => {
    currentStep.value = 'upload'
    currentPhoto.value = null
    if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = ''
    }
}

const handleImageConfirmed = async (file: File) => {
    currentStep.value = 'extracting'
    errorMessage.value = ''

    // Create preview URL
    imagePreviewUrl.value = URL.createObjectURL(file)

    // Add photo to inspection
    const photo = inspectionStore.addPhotoToInspection(file)
    currentPhoto.value = photo

    // Extract substances
    const response = await extractSubstances(file, {
        inspectionId: inspectionStore.currentInspection?.id,
        photoId: photo.id,
    })

    if (!response.success || !response.data) {
        // Show error state
        console.error('Extraction failed:', response.error)
        errorMessage.value = response.error || 'Er is een fout opgetreden bij het analyseren van de afbeelding.'
        currentStep.value = 'error'
        // Clean up the failed photo
        inspectionStore.deletePhoto(photo.id)
        currentPhoto.value = null
        return
    }

    // Update photo with extracted substances
    inspectionStore.updatePhotoSubstances(
        photo.id,
        response.data.substances,
        response.data.image_description
    )

    // Reload current photo reference (it's been updated in store)
    currentPhoto.value = inspectionStore.currentInspection?.photos.find(p => p.id === photo.id) || null

    currentStep.value = 'review'
}

const handleSubstanceUpdate = (updatedSubstance: Substance) => {
    if (!currentPhoto.value) return

    inspectionStore.updateSubstance(
        currentPhoto.value.id,
        updatedSubstance.id,
        updatedSubstance
    )

    // Reload current photo reference
    currentPhoto.value = inspectionStore.currentInspection?.photos.find(p => p.id === currentPhoto.value!.id) || null
}

const handleCompletePhoto = () => {
    if (!currentPhoto.value) return

    inspectionStore.completePhoto(currentPhoto.value.id)

    // Clean up
    if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = ''
    }

    currentStep.value = 'none'
    currentPhoto.value = null
}

const handleCancelPhoto = () => {
    if (!currentPhoto.value) return

    inspectionStore.cancelPhoto(currentPhoto.value.id)

    // Clean up
    if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value)
        imagePreviewUrl.value = ''
    }

    currentStep.value = 'none'
    currentPhoto.value = null
}

const deletePhoto = (photoId: string) => {
    if (confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
        inspectionStore.deletePhoto(photoId)
    }
}

const viewOverview = () => {
    router.push({ name: 'InspectionOverview' })
}

const completeInspection = () => {
    inspectionStore.completeInspection()
    router.push({ name: 'InspectionOverview' })
}
</script>
