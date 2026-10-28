export interface Product {
  id?: number
  user_id?: string

  // Basic Product Info
  product_name: string
  brand?: string
  manufacturer?: string
  ean_code?: string

  // Chemical Identifiers
  un_number?: string
  cas_number?: string

  // Safety Information
  ghs_pictograms?: string[] // Array of pictogram codes (e.g., ['GHS02', 'GHS07'])
  h_statements?: string[] // Hazard statements
  p_statements?: string[] // Precautionary statements
  signal_word?: 'Danger' | 'Warning' | string

  // Content & Composition
  chemical_composition?: ChemicalComposition
  volume_weight?: string

  // Instructions
  safety_instructions?: string
  storage_requirements?: string
  first_aid?: string
  fire_fighting?: string

  // Metadata
  image_url?: string
  data_source?: 'extracted' | 'online' | 'merged'
  extraction_confidence?: ExtractionConfidence
  scanned_at?: string
  updated_at?: string
}

export interface ChemicalComposition {
  ingredients: Ingredient[]
}

export interface Ingredient {
  name: string
  cas_number?: string
  concentration?: string
  concentration_range?: string
}

export interface ExtractionConfidence {
  product_name?: number
  brand?: number
  manufacturer?: number
  ean_code?: number
  batch_number?: number
  production_date?: number
  expiration_date?: number
  origin?: number
  un_number?: number
  cas_number?: number
  dangerous_icons?: number
  ghs_pictograms?: number
  hazard_statements?: number
  h_statements?: number
  precautionary_statements?: number
  p_statements?: number
  signal_word?: number
  chemical_composition?: number
  volume_weight?: number
  safety_instructions?: number
  storage_requirements?: number
  first_aid?: number
  fire_fighting?: number
}
