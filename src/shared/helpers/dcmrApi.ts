import type { ExtractionResult, VisionAPIResponse } from '@/shared/interfaces/ExtractionResult'
import type { SubstanceExtractionResult } from '@/shared/interfaces/Substance'

const apiBaseUrl = (import.meta.env.VITE_DCMR_API_BASE_URL || '/api').replace(/\/$/, '')
const analyzeSubstancesUrl = import.meta.env.VITE_ANALYZE_SUBSTANCES_URL || ''
const analyzeProductUrl = import.meta.env.VITE_ANALYZE_PRODUCT_URL || ''

interface AnalysisRequest {
  fileName: string
  contentType: string
  imageBase64: string
  inspectionId?: string
  photoId?: string
}

interface AnalysisResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Kan afbeelding niet lezen.'))
        return
      }

      const [, base64Data] = result.split(',')
      if (!base64Data) {
        reject(new Error('Kan afbeelding niet omzetten naar base64.'))
        return
      }

      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function postAnalysis<T>(url: string, file: File | Blob, metadata: Partial<AnalysisRequest> = {}) {
  const isRelativeApiUrl = url.startsWith('/')
  const imageBase64 = await fileToBase64(file)
  const payload: AnalysisRequest = {
    fileName: metadata.fileName || (file instanceof File ? file.name : `upload-${Date.now()}.jpg`),
    contentType: metadata.contentType || file.type || 'image/jpeg',
    imageBase64,
    inspectionId: metadata.inspectionId,
    photoId: metadata.photoId,
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: isRelativeApiUrl ? 'include' : 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch((error: unknown) => ({
    ok: false,
    status: 0,
    statusText: 'Network Error',
    text: async () => error instanceof Error ? error.message : String(error),
  } as Response))

  if (!response.ok) {
    const errorText = await response.text()
    return {
      success: false,
      error: `Azure analyse-aanvraag mislukt: ${response.status} ${response.statusText}. ${errorText}`,
    } satisfies AnalysisResponse<T>
  }

  const result = await response.json().catch(() => null) as AnalysisResponse<T> | null

  if (!result || typeof result.success !== 'boolean') {
    return {
      success: false,
      error: 'Azure analyse-response heeft niet het verwachte DCMR-contract.',
    } satisfies AnalysisResponse<T>
  }

  return result
}

export async function analyzeProductImage(imageFile: File | Blob): Promise<VisionAPIResponse> {
  const response = await postAnalysis<ExtractionResult>(
    analyzeProductUrl || `${apiBaseUrl}/analyze-product`,
    imageFile,
  )

  return {
    success: response.success,
    data: response.data,
    error: response.error,
    raw_response: response.data,
  }
}

export async function analyzeSubstancesImage(
  imageFile: File | Blob,
  metadata: { inspectionId?: string; photoId?: string } = {},
): Promise<{ success: boolean; data?: SubstanceExtractionResult; error?: string }> {
  return postAnalysis<SubstanceExtractionResult>(
    analyzeSubstancesUrl || `${apiBaseUrl}/analyze-substances`,
    imageFile,
    metadata,
  )
}
