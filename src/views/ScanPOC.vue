<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold">Product Scanner POC</h1>
        <p class="text-gray-600 mt-2">
          Upload een afbeelding van een productetiket om informatie te extraheren met AI
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
                Onze AI extraheert productinformatie
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Dit duurt meestal 5-10 seconden
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Results Step -->
      <div v-else-if="currentStep === 'results' && extractionResult">
        <ExtractionResults :data="extractionResult" :image-url="imagePreviewUrl" @try-another="resetScanner" />
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
import { ref } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ExtractionResults from '@/components/ExtractionResults.vue'
import { extractProductInfoPOC } from '@/shared/helpers/visionHelper'
import type { ExtractionResult } from '@/shared/interfaces/ExtractionResult'

type ScanStep = 'upload' | 'extracting' | 'results' | 'error'

const currentStep = ref<ScanStep>('upload')
const extractionResult = ref<ExtractionResult | null>(null)
const errorMessage = ref<string>('')
const imagePreviewUrl = ref<string>('')

const handleImageConfirmed = async (file: File) => {
  currentStep.value = 'extracting'

  // Create preview URL
  imagePreviewUrl.value = URL.createObjectURL(file)

  const response = await extractProductInfoPOC(file)

  if (!response.success || !response.data) {
    currentStep.value = 'error'
    errorMessage.value =
      response.error || 'Failed to extract product information'
    return
  }

  console.log('response.data', response.data)
  extractionResult.value = response.data
  currentStep.value = 'results'
}

const resetScanner = () => {
  currentStep.value = 'upload'
  extractionResult.value = null
  errorMessage.value = ''
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = ''
  }
}
</script>
