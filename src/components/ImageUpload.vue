<template>
  <div class="space-y-4">
    <div v-if="!previewUrl" class="space-y-3">
      <!-- Camera Capture Option (Mobile) -->
      <div
        class="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors bg-primary-50">
        <label class="cursor-pointer">
          <input ref="cameraInput" type="file" accept="image/jpeg,image/png,image/jpg" capture="environment"
            class="hidden" @change="handleFileSelect" />
          <div class="flex flex-col items-center space-y-3">
            <UIcon name="i-lucide-camera" class="h-12 w-12 text-primary-600" />
            <div>
              <p class="text-sm font-medium text-primary-900">
                Foto maken met camera
              </p>
              <p class="text-xs text-primary-700 mt-1">
                Open camera direct
              </p>
            </div>
          </div>
        </label>
      </div>

      <!-- File Upload Option -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <label class="cursor-pointer">
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/jpg" class="hidden"
            @change="handleFileSelect" />
          <div class="flex flex-col items-center space-y-3">
            <UIcon name="i-lucide-image" class="h-12 w-12 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-700">
                Foto uploaden uit galerij
              </p>
              <p class="text-xs text-gray-500 mt-1">
                JPEG of PNG (max 100MB)
              </p>
            </div>
          </div>
        </label>
      </div>

      <div v-if="validationError" class="text-sm text-red-600 text-center">
        {{ validationError }}
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="relative rounded-lg overflow-hidden bg-gray-100">
        <img :src="previewUrl" alt="Voorbeeld van productafbeelding" class="w-full h-auto max-h-96 object-contain" />
      </div>

      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="clearImage">
          Kies andere afbeelding
        </UButton>
        <UButton color="primary" icon="i-lucide-check" :disabled="!selectedFile" @click="confirmImage">
          Gebruik deze afbeelding
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  imageConfirmed: [file: File]
}>()

const fileInput = ref<HTMLInputElement>()
const cameraInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const validationError = ref<string>('')

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB original
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

// Image resize settings
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const JPEG_QUALITY = 0.85

/**
 * Resize image to reduce file size for PDF generation
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions while maintaining aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`Image resized from ${file.size} to ${blob.size} bytes (${((blob.size / file.size) * 100).toFixed(1)}%)`)
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

const handleFileSelect = async (event: Event) => {
  console.log('handleFileSelect triggered')
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  console.log('Selected file:', file)

  if (!file) {
    console.warn('No file selected')
    validationError.value = 'Geen bestand geselecteerd. Probeer opnieuw.'
    return
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error('Invalid file type:', file.type)
    validationError.value = 'Selecteer een JPEG of PNG afbeelding'
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    console.error('File too large:', file.size, 'bytes')
    validationError.value = 'Afbeelding moet kleiner zijn dan 100MB'
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  validationError.value = ''
  selectedFile.value = file

  // Resize image before creating preview
  try {
    console.log('Resizing image...')
    const resizedBlob = await resizeImage(file)
    const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' })
    selectedFile.value = resizedFile
    console.log('Image resize successful')
  } catch (err) {
    console.error('Image resize failed, using original:', err)
    // Continue with original file if resize fails
  }

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result
    if (typeof result === 'string') {
      previewUrl.value = result
      console.log('Preview URL created successfully')
    } else {
      console.error('Failed to create preview URL')
      validationError.value = 'Fout bij het laden van de afbeelding. Probeer opnieuw.'
      selectedFile.value = null
    }
  }
  reader.onerror = (error) => {
    console.error('FileReader error:', error)
    validationError.value = 'Fout bij het laden van de afbeelding. Probeer opnieuw.'
    selectedFile.value = null
  }
  console.log('Starting file read...')
  reader.readAsDataURL(selectedFile.value)
}

const clearImage = () => {
  selectedFile.value = null
  previewUrl.value = ''
  validationError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  if (cameraInput.value) {
    cameraInput.value.value = ''
  }
}

const confirmImage = () => {
  if (selectedFile.value) {
    emit('imageConfirmed', selectedFile.value)
  }
}
</script>
