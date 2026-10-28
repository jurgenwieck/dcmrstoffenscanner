import type { Substance } from './Substance'

/**
 * Represents a single photo within an inspection session
 * Each photo has its own AI extraction and substances
 */
export interface InspectionPhoto {
  id: string
  inspection_id: string
  image_url?: string
  image_blob?: Blob // For unsaved photos
  image_description?: string
  substances: Substance[]
  status: 'draft' | 'completed' | 'cancelled'
  created_at: Date
  completed_at?: Date
}

/**
 * Represents an inspection session
 * Contains multiple photos, each with their own substances
 */
export interface Inspection {
  id: string
  user_id?: string
  name?: string
  status: 'active' | 'completed' | 'archived'
  photos: InspectionPhoto[]
  created_at: Date
  updated_at: Date
  completed_at?: Date
  
  // Warnings tracking
  has_warnings?: boolean
  warnings?: string[]
  
  // Metadata
  notes?: string
  location?: string
}

/**
 * Grouped substances for inspection overview
 * Groups by ADR class and packaging group
 */
export interface SubstanceGroup {
  adr_class: string
  packaging_group: string | null // null for classes without packaging group, or 'N/A'
  substances: Substance[]
  total_quantity: number
  total_quantity_kg: number // Always in KG for comparison
  total_quantity_display?: number // For display (can be liters for ADR 2.1/2.3)
  unit: string
  display_unit?: string // The unit to display (liters for ADR 2.1/2.3, KG otherwise)
  is_over_limit: boolean
  limit_value?: number
  limit_description?: string
}

/**
 * Summary statistics for an inspection
 */
export interface InspectionSummary {
  total_photos: number
  completed_photos: number
  total_substances: number
  groups: SubstanceGroup[]
  overall_status: 'ok' | 'warning' | 'error'
  total_overrides: number
  warnings: string[]
}

