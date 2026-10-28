import type { VisionAPIResponse } from '@/shared/interfaces/ExtractionResult'
import type { SubstanceExtractionResult } from '@/shared/interfaces/Substance'
import { analyzeProductImage, analyzeSubstancesImage } from '@/shared/helpers/dcmrApi'

function normalizeSubstanceResult(data: SubstanceExtractionResult) {
  const timestamp = new Date().toISOString()

  data.ai_model = data.ai_model || 'azure-ai-foundry-agent'
  data.extraction_timestamp = data.extraction_timestamp || timestamp

  if (data.substances) {
    data.substances = data.substances.map(substance => ({
      ...substance,
      packaging_group: substance.packaging_group
        ?.replace(/\bPG\s*(I{1,3})\b/gi, 'VP $1')
        .replace(/\bPG\s*/gi, 'VP ')
        .trim(),
      ai_model: substance.ai_model || data.ai_model,
      ai_timestamp: substance.ai_timestamp || new Date(timestamp),
    }))
  }

  return data
}

export async function extractProductInfoPOC(imageFile: File | Blob): Promise<VisionAPIResponse> {
  return analyzeProductImage(imageFile)
}

export async function extractProductInfoFull(imageFile: File | Blob): Promise<VisionAPIResponse> {
  return analyzeProductImage(imageFile)
}

export async function extractSubstances(
  imageFile: File | Blob,
  metadata: { inspectionId?: string; photoId?: string } = {},
): Promise<{ success: boolean; data?: SubstanceExtractionResult; error?: string }> {
  const response = await analyzeSubstancesImage(imageFile, metadata)

  if (!response.success || !response.data) {
    return response
  }

  return {
    success: true,
    data: normalizeSubstanceResult(response.data),
  }
}
