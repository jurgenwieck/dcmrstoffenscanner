export interface Substance {
  id: string
  name: string
  adr_class?: string
  packaging_group?: string // VP I, VP II, VP III, I1, I2, N/A (Not applicable), etc.
  quantity?: number
  unit?: 'liter' | 'KG' | 'kg' // KG or liter
  specific_gravity?: number // Soortelijk gewicht (density relative to water)
  number_of_items?: number // Number of containers/barrels/drums
  un_number?: string
  cas_number?: string
  ghs_pictograms?: string[] // List of detected GHS/ADR pictograms
  confidence?: number
  pictogram_confidence?: number // Confidence in pictogram detection
  
  // AI reasoning
  ai_reasoning?: string // Explanation from AI about classification and detection
  
  // AI PACT Compliance - Metadata tracking
  ai_model?: string // Model used for extraction (e.g., "gpt-4o")
  ai_timestamp?: Date // When the AI analysis was performed
  user_id?: string // User who performed the scan
  
  // Validation
  is_over_limit?: boolean
  limit_exceeded?: string // Description of which limit was exceeded
  human_override?: boolean
  human_override_reason?: string
  
  // Photo tracking
  photo_id?: string // Reference to which photo this substance came from
}

export interface SubstanceExtractionResult {
  substances: Substance[]
  total_count: number
  image_description?: string
  ai_model?: string // AI model version used
  extraction_timestamp?: string // ISO timestamp of extraction
}

