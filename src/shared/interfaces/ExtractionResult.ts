import type { ExtractionConfidence } from './Product'

export interface ExtractionResult {
  // Basic Product Info
  product_name?: string
  brand?: string
  manufacturer?: string
  ean_code?: string

  // POC Fields
  batch_number?: string
  production_date?: string
  expiration_date?: string
  origin?: string

  // Chemical Identifiers
  un_number?: string
  cas_number?: string

  // Safety Information
  dangerous_icons?: string[] // POC field for dangerous icons
  ghs_pictograms?: string[]
  hazard_statements?: string[] // POC field mapping to h_statements
  h_statements?: string[]
  precautionary_statements?: string[] // POC field mapping to p_statements
  p_statements?: string[]
  signal_word?: string

  // Content & Composition
  chemical_composition?: {
    ingredients: Array<{
      name: string
      cas_number?: string
      concentration?: string
      concentration_range?: string
    }>
  }
  volume_weight?: string

  // Instructions
  safety_instructions?: string
  storage_requirements?: string
  first_aid?: string
  fire_fighting?: string

  // Confidence scores
  confidence?: ExtractionConfidence
}

export interface VisionAPIResponse {
  success: boolean
  data?: ExtractionResult
  error?: string
  raw_response?: unknown
}
