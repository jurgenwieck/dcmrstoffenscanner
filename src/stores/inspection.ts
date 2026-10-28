import { defineStore } from 'pinia'
import type { Inspection, InspectionPhoto, InspectionSummary, SubstanceGroup } from '@/shared/interfaces/Inspection'
import type { Substance } from '@/shared/interfaces/Substance'
import { validateSubstances, type ADRLimit, ADR_LIMITS } from '@/shared/helpers/adrValidation'
import { useAuthStore } from '@/stores/auth'

interface InspectionState {
  currentInspection: Inspection | null
  inspections: Inspection[]
  inspectionsLoading: boolean
}

const initialState = (): InspectionState => ({
  currentInspection: null,
  inspections: [],
  inspectionsLoading: false,
})

export const useInspectionStore = defineStore('inspection', {
  state: () => initialState(),
  
  getters: {
    /**
     * Get inspection summary with grouped substances and validation
     */
    currentInspectionSummary(state): InspectionSummary | null {
      if (!state.currentInspection) return null
      
      const completedPhotos = state.currentInspection.photos.filter(p => p.status === 'completed')
      
      // Collect all substances from completed photos
      const allSubstances: Substance[] = []
      completedPhotos.forEach(photo => {
        allSubstances.push(...photo.substances)
      })
      
      // Group substances by ADR class + packaging group
      // Exception: For ADR class 3, VP I and VP II are grouped together
      const groupsMap = new Map<string, SubstanceGroup>()
      
      allSubstances.forEach(substance => {
        if (!substance.adr_class) return
        
        let packagingGroup = substance.packaging_group || null
        
        // Special grouping for ADR 3: VP I and VP II are treated as one group
        if (substance.adr_class === '3' && (packagingGroup === 'VP I' || packagingGroup === 'VP II')) {
          packagingGroup = 'VP I en II'
        }
        
        const key = `${substance.adr_class}|${packagingGroup}`
        
        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            adr_class: substance.adr_class,
            packaging_group: packagingGroup,
            substances: [],
            total_quantity: 0,
            total_quantity_kg: 0,
            unit: substance.unit || 'KG',
            is_over_limit: false,
          })
        }
        
        const group = groupsMap.get(key)!
        group.substances.push(substance)
      })
      
      // Calculate totals and validate each group
      const groups: SubstanceGroup[] = Array.from(groupsMap.values()).map(group => {
        let totalQty = 0
        let totalQtyKg = 0
        
        group.substances.forEach(substance => {
          const qty = (substance.quantity || 0) * (substance.number_of_items || 1)
          totalQty += qty
          
          // Convert to KG for validation
          if (substance.unit?.toLowerCase() === 'liter' && substance.specific_gravity) {
            totalQtyKg += qty * substance.specific_gravity
          } else if (substance.unit?.toLowerCase() === 'kg') {
            totalQtyKg += qty
          }
        })
        
        group.total_quantity = totalQty
        group.total_quantity_kg = totalQtyKg
        
        // Determine display unit: ADR 2.1 and 2.3 should display in liters
        const shouldDisplayInLiters = group.adr_class === '2.1' || group.adr_class === '2.3'
        group.display_unit = shouldDisplayInLiters ? 'liter' : 'KG'
        
        // Calculate display quantity
        if (shouldDisplayInLiters) {
          // Convert KG back to liters for display (using average SG if available)
          const substancesWithSG = group.substances.filter(s => s.specific_gravity)
          if (substancesWithSG.length > 0) {
            const avgSG = substancesWithSG.reduce((sum, s) => sum + (s.specific_gravity || 0), 0) / substancesWithSG.length
            group.total_quantity_display = avgSG > 0 ? totalQtyKg / avgSG : totalQty
          } else {
            group.total_quantity_display = totalQty
          }
        } else {
          group.total_quantity_display = totalQtyKg
        }
        
        // Find matching ADR limit rule
        const matchedRule = useInspectionStore().findMatchingADRLimit(group.adr_class, group.packaging_group)
        
        if (matchedRule) {
          group.is_over_limit = totalQtyKg > matchedRule.limit_value
          group.limit_value = matchedRule.limit_value
          group.limit_description = matchedRule.description
        }
        
        return group
      })
      
      // Calculate overall status
      const hasErrors = groups.some(g => g.is_over_limit)
      const hasWarnings = allSubstances.some(s => s.is_over_limit && !s.human_override)
      const totalOverrides = allSubstances.filter(s => s.human_override).length
      
      // Calculate total KG across all groups
      const totalKgAll = groups.reduce((sum, g) => sum + g.total_quantity_kg, 0)
      const exceedsTotalLimit = totalKgAll > 1000
      
      // Collect warnings
      const warnings: string[] = []
      groups.forEach(group => {
        if (group.is_over_limit) {
          warnings.push(`ADR klasse ${group.adr_class}${group.packaging_group ? ` (${group.packaging_group})` : ''}: ${group.total_quantity_kg.toFixed(2)} KG overschrijdt limiet van ${group.limit_value} KG`)
        }
      })
      
      // Add warning for total weight exceeding 1000 KG
      if (exceedsTotalLimit) {
        warnings.push(`Totaal gewicht: ${totalKgAll.toFixed(2)} KG overschrijdt de totale limiet van 1000 KG`)
      }
      
      return {
        total_photos: state.currentInspection.photos.length,
        completed_photos: completedPhotos.length,
        total_substances: allSubstances.length,
        groups,
        overall_status: (hasErrors || exceedsTotalLimit) ? 'error' : hasWarnings ? 'warning' : 'ok',
        total_overrides: totalOverrides,
        warnings,
      }
    },
  },
  
  actions: {
    /**
     * Find matching ADR limit for a given class and packaging group
     */
    findMatchingADRLimit(adrClass: string, packagingGroup: string | null): ADRLimit | null {
      return ADR_LIMITS.find(rule => {
        if (rule.adr_class !== adrClass) return false
        
        if (!rule.packaging_group) return true // No specific group requirement
        if (!packagingGroup) return false
        
        const normalized = packagingGroup.toUpperCase().trim()
        const normalizedRule = rule.packaging_group.toUpperCase().trim()
        
        if (normalized === normalizedRule) return true
        
        // Handle combined rules
        if (normalizedRule === 'VP I EN II') {
          return normalized === 'VP I' || normalized === 'VP II'
        }
        if (normalizedRule === 'VP II EN III') {
          return normalized === 'VP II' || normalized === 'VP III'
        }
        if (normalizedRule === 'I1 EN I2') {
          return normalized === 'I1' || normalized === 'I2'
        }
        
        return false
      }) || null
    },
    
    /**
     * Create a new inspection session
     */
    createInspection(name?: string): Inspection {
      const authStore = useAuthStore()
      const userId = authStore.userId || undefined
      
      const inspection: Inspection = {
        id: `insp_${Date.now()}`,
        user_id: userId,
        name: name || `Inspectie ${new Date().toLocaleDateString('nl-NL')}`,
        status: 'active',
        photos: [],
        created_at: new Date(),
        updated_at: new Date(),
      }
      
      this.currentInspection = inspection
      this.inspections.push(inspection)
      
      return inspection
    },
    
    /**
     * Add a new photo to the current inspection
     */
    addPhotoToInspection(imageBlob?: Blob): InspectionPhoto {
      if (!this.currentInspection) {
        this.createInspection()
      }
      
      const photo: InspectionPhoto = {
        id: `photo_${Date.now()}`,
        inspection_id: this.currentInspection!.id,
        image_blob: imageBlob,
        substances: [],
        status: 'draft',
        created_at: new Date(),
      }
      
      this.currentInspection!.photos.push(photo)
      this.currentInspection!.updated_at = new Date()
      
      return photo
    },
    
    /**
     * Update a photo's substances (after AI extraction)
     */
    async updatePhotoSubstances(photoId: string, substances: Substance[], imageDescription?: string) {
      if (!this.currentInspection) return
      
      const photo = this.currentInspection.photos.find(p => p.id === photoId)
      if (!photo) return
      
      const authStore = useAuthStore()
      const userId = authStore.userId || undefined
      
      // Add photo_id and user_id to each substance for tracking
      const substancesWithMetadata = substances.map(s => ({
        ...s,
        photo_id: photoId,
        user_id: userId,
      }))
      
      photo.substances = validateSubstances(substancesWithMetadata)
      photo.image_description = imageDescription
      photo.status = 'draft'
      this.currentInspection.updated_at = new Date()
    },
    
    /**
     * Complete a photo (commit its substances to the inspection)
     */
    completePhoto(photoId: string) {
      if (!this.currentInspection) return
      
      const photo = this.currentInspection.photos.find(p => p.id === photoId)
      if (!photo) return
      
      photo.status = 'completed'
      photo.completed_at = new Date()
      this.currentInspection.updated_at = new Date()
    },
    
    /**
     * Cancel a photo (don't commit substances)
     */
    cancelPhoto(photoId: string) {
      if (!this.currentInspection) return
      
      const photo = this.currentInspection.photos.find(p => p.id === photoId)
      if (!photo) return
      
      photo.status = 'cancelled'
      this.currentInspection.updated_at = new Date()
    },
    
    /**
     * Delete a photo from inspection
     */
    deletePhoto(photoId: string) {
      if (!this.currentInspection) return
      
      const index = this.currentInspection.photos.findIndex(p => p.id === photoId)
      if (index !== -1) {
        this.currentInspection.photos.splice(index, 1)
        this.currentInspection.updated_at = new Date()
      }
    },
    
    /**
     * Update a substance within a photo
     */
    updateSubstance(photoId: string, substanceId: string, updates: Partial<Substance>) {
      if (!this.currentInspection) return
      
      const photo = this.currentInspection.photos.find(p => p.id === photoId)
      if (!photo) return
      
      const substanceIndex = photo.substances.findIndex(s => s.id === substanceId)
      if (substanceIndex === -1) return
      
      photo.substances[substanceIndex] = {
        ...photo.substances[substanceIndex]!,
        ...updates,
      }
      
      // Re-validate all substances in the photo
      photo.substances = validateSubstances(photo.substances)
      this.currentInspection.updated_at = new Date()
    },
    
    /**
     * Delete a substance from a photo
     */
    deleteSubstance(photoId: string, substanceId: string) {
      if (!this.currentInspection) return
      
      const photo = this.currentInspection.photos.find(p => p.id === photoId)
      if (!photo) return
      
      const index = photo.substances.findIndex(s => s.id === substanceId)
      if (index !== -1) {
        photo.substances.splice(index, 1)
        this.currentInspection.updated_at = new Date()
      }
    },
    
    /**
     * Complete the inspection
     */
    completeInspection() {
      if (!this.currentInspection) return
      
      const summary = this.currentInspectionSummary
      
      this.currentInspection.status = 'completed'
      this.currentInspection.completed_at = new Date()
      this.currentInspection.updated_at = new Date()
      
      // Store warnings if any
      if (summary && summary.warnings.length > 0) {
        this.currentInspection.has_warnings = true
        this.currentInspection.warnings = summary.warnings
      } else {
        this.currentInspection.has_warnings = false
        this.currentInspection.warnings = []
      }
      
      // TODO: Save to database
      console.log('Inspection completed:', this.currentInspection)
    },
    
    /**
     * Load an inspection by ID
     */
    loadInspection(inspectionId: string) {
      const inspection = this.inspections.find(i => i.id === inspectionId)
      if (inspection) {
        this.currentInspection = inspection
      }
    },
    
    /**
     * Reset current inspection
     */
    resetCurrentInspection() {
      this.currentInspection = null
    },
  },
})
