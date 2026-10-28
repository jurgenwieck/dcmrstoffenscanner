import type { Substance } from '../interfaces/Substance'

export interface ADRLimit {
  adr_class: string
  packaging_group: string | null
  limit_value: number
  limit_unit: 'liter' | 'KG'
  description: string
}

// ADR limits table based on MBA 3.2.9 artikel 3.27 BAL
export const ADR_LIMITS: ADRLimit[] = [
  { adr_class: '2.1', packaging_group: null, limit_value: 125, limit_unit: 'liter', description: 'Meer dan 125 liter' },
  { adr_class: '2.2', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '2.3', packaging_group: null, limit_value: 25, limit_unit: 'liter', description: 'Meer dan 25 liter' },
  { adr_class: '3', packaging_group: 'VP I en II', limit_value: 25, limit_unit: 'KG', description: 'Meer dan 25 KG' },
  { adr_class: '3', packaging_group: 'VP III', limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '4.1', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '4.2', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '4.3', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '5.1', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '5.2', packaging_group: 'VP I', limit_value: 1, limit_unit: 'KG', description: 'Meer dan 1 KG' },
  { adr_class: '5.2', packaging_group: 'VP II en III', limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '6.1', packaging_group: 'VP I', limit_value: 1, limit_unit: 'KG', description: 'Meer dan 1 KG' },
  { adr_class: '6.1', packaging_group: 'VP II en III', limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '6.2', packaging_group: 'I1 en I2', limit_value: 1, limit_unit: 'KG', description: 'Meer dan 1 KG' },
  { adr_class: '6.2', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '8', packaging_group: 'VP I', limit_value: 1, limit_unit: 'KG', description: 'Meer dan 1 KG' },
  { adr_class: '8', packaging_group: 'VP II en III', limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: '9', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
  { adr_class: 'Acute toxiciteit cat 1,2 of 3', packaging_group: null, limit_value: 1000, limit_unit: 'KG', description: 'Meer dan 1000 KG' },
]

/**
 * Check if a packaging group matches the rule
 */
function matchesPackagingGroup(substanceGroup: string | undefined, ruleGroup: string | null): boolean {
  if (!ruleGroup) return true // No specific group requirement
  if (!substanceGroup) return false

  // Normalize both for comparison
  const normalized = substanceGroup.toUpperCase().trim()
  const normalizedRule = ruleGroup.toUpperCase().trim()

  console.log('Matching packaging group:', {
    substance: substanceGroup,
    rule: ruleGroup,
    normalized,
    normalizedRule
  })

  // Exact match first
  if (normalized === normalizedRule) {
    console.log('✓ Exact match found')
    return true
  }

  // Handle specific combined rules - be very explicit
  // Rule "VP I en II" should match substances with "VP I" or "VP II" ONLY
  if (normalizedRule === 'VP I EN II') {
    const matches = normalized === 'VP I' || normalized === 'VP II'
    console.log(`VP I en II rule: matches ${matches}`)
    return matches
  }
  
  // Rule "VP II en III" should match substances with "VP II" or "VP III" ONLY
  if (normalizedRule === 'VP II EN III') {
    const matches = normalized === 'VP II' || normalized === 'VP III'
    console.log(`VP II en III rule: matches ${matches}`)
    return matches
  }
  
  // Rule "I1 en I2" should match substances with "I1" or "I2" ONLY
  if (normalizedRule === 'I1 EN I2') {
    const matches = normalized === 'I1' || normalized === 'I2'
    console.log(`I1 en I2 rule: matches ${matches}`)
    return matches
  }

  // No match
  console.log('✗ No match found')
  return false
}

/**
 * Convert between liter and KG using specific gravity
 */
function convertUnits(
  value: number, 
  fromUnit: string, 
  toUnit: string, 
  specificGravity?: number
): number | null {
  const from = fromUnit.toLowerCase()
  const to = toUnit.toLowerCase()
  
  // If units are the same, no conversion needed
  if (from === to) {
    return value
  }
  
  // Need specific gravity for conversion
  if (!specificGravity) {
    return null
  }
  
  // Convert liter to KG: liter * SG = KG
  if (from === 'liter' && to === 'kg') {
    return value * specificGravity
  }
  
  // Convert KG to liter: KG / SG = liter
  if (from === 'kg' && to === 'liter') {
    return value / specificGravity
  }
  
  return null
}

/**
 * Validate a substance against ADR limits
 * Returns validation result with details
 */
export function validateSubstance(substance: Substance): {
  is_over_limit: boolean
  limit_exceeded?: string
  matched_rule?: ADRLimit
  can_validate: boolean // New: indicates if all required data is present
  missing_fields?: string[] // New: lists missing required fields
  not_assessed?: boolean // New: for ADR classes that shouldn't be auto-validated
  not_assessed_reason?: string // New: reason why not assessed
} {
  console.log('🚀 validateSubstance START:', substance.name, 'ADR:', substance.adr_class, 'PG:', substance.packaging_group, 'Qty:', substance.quantity, substance.unit)
  
  // Check for ADR classes that should NOT be automatically assessed
  if (substance.adr_class === '1' || substance.adr_class === '7') {
    console.log('⚠️ ADR Class 1 or 7 detected - not assessed')
    return {
      is_over_limit: false,
      can_validate: false,
      not_assessed: true,
      not_assessed_reason: substance.adr_class === '1' 
        ? 'ADR Klasse 1 (Explosieven) wordt niet automatisch beoordeeld. Handmatige controle vereist.'
        : 'ADR Klasse 7 (Radioactieve stoffen) wordt niet automatisch beoordeeld. Handmatige controle vereist.',
    }
  }
  
  // If there's a human override, respect it
  if (substance.human_override === true) {
    console.log('⏭️ Human override detected, skipping validation')
    return {
      is_over_limit: false, // Override means user says it's okay
      can_validate: true,
    }
  }

  // Track missing fields for validation
  const missingFields: string[] = []
  
  // Check required fields
  if (!substance.quantity) missingFields.push('hoeveelheid')
  if (!substance.unit) missingFields.push('eenheid')
  if (!substance.adr_class) missingFields.push('ADR klasse')
  
  // Check if packaging group is required for this ADR class
  const packagingGroupRequired = ['3', '5.2', '6.1', '6.2', '8'].includes(substance.adr_class || '')
  if (packagingGroupRequired && !substance.packaging_group) {
    missingFields.push('verpakkingsgroep')
  }
  
  // Specific gravity is REQUIRED for liquids (liter) because limits are in KG
  if (substance.unit?.toLowerCase() === 'liter' && !substance.specific_gravity) {
    missingFields.push('soortelijk gewicht (SG) - verplicht voor vloeistoffen')
  }

  console.log('📋 Missing fields check:', missingFields)

  // If no quantity, unit, or ADR class, cannot validate
  if (missingFields.length > 0) {
    console.log('❌ Cannot validate due to missing fields')
    return { 
      is_over_limit: false,
      can_validate: false,
      missing_fields: missingFields,
    }
  }
  
  console.log('✓ All required fields present, proceeding with validation')

  // Find matching ADR limit rule
  console.log('🔍 Looking for matching rule for:', {
    adr_class: substance.adr_class,
    packaging_group: substance.packaging_group
  })
  
  const matchedRule = ADR_LIMITS.find(rule => {
    const classMatches = rule.adr_class === substance.adr_class
    const groupMatches = matchesPackagingGroup(substance.packaging_group, rule.packaging_group)
    
    console.log(`Testing rule: ADR ${rule.adr_class}, PG ${rule.packaging_group} -> class:${classMatches}, group:${groupMatches}`)
    
    return classMatches && groupMatches
  })

  console.log('✅ Matched rule:', matchedRule)
  console.log('Validation for substance:', {
    name: substance.name,
    adr_class: substance.adr_class,
    packaging_group: substance.packaging_group,
    quantity: substance.quantity,
    unit: substance.unit,
    matched_rule: matchedRule
  })

  if (!matchedRule) {
    // No rule found, cannot validate
    console.warn('No matching rule found for substance:', substance.name)
    return { 
      is_over_limit: false,
      can_validate: false,
    }
  }

  // Try to compare quantities
  const normalizedUnit = substance.unit?.toLowerCase() as 'liter' | 'kg' | undefined
  const ruleUnit = matchedRule.limit_unit.toLowerCase() as 'liter' | 'kg'

  // Calculate TOTAL quantity (per container × number of containers)
  const totalQuantity = substance.quantity! * (substance.number_of_items || 1)
  console.log('💯 Total quantity calculation:', {
    perContainer: substance.quantity,
    numberOfItems: substance.number_of_items || 1,
    total: totalQuantity
  })

  let quantityToCompare = totalQuantity

  // If units don't match, try to convert
  if (normalizedUnit !== ruleUnit) {
    console.log('🔄 Converting units from', normalizedUnit, 'to', ruleUnit)
    const converted = convertUnits(
      totalQuantity, 
      normalizedUnit!, 
      ruleUnit, 
      substance.specific_gravity
    )
    
    if (converted === null) {
      // Cannot convert without specific gravity
      console.log('❌ Cannot convert - missing SG')
      return { 
        is_over_limit: false,
        can_validate: false,
        missing_fields: ['soortelijk gewicht (SG) voor unit conversie'],
      }
    }
    
    quantityToCompare = converted
    console.log('✓ Converted quantity:', quantityToCompare, ruleUnit)
  }

  const isOverLimit = quantityToCompare > matchedRule.limit_value

  console.log('📊 Validation result:', {
    quantityToCompare,
    limit: matchedRule.limit_value,
    unit: ruleUnit,
    isOverLimit: isOverLimit ? '❌ OVER LIMIT' : '✅ WITHIN LIMIT'
  })

  return {
    is_over_limit: isOverLimit,
    limit_exceeded: isOverLimit ? matchedRule.description : undefined,
    matched_rule: matchedRule,
    can_validate: true,
  }
}

/**
 * Validate multiple substances and return results
 */
export function validateSubstances(substances: Substance[]): Substance[] {
  console.log('=== validateSubstances called with', substances.length, 'substances ===')
  
  return substances.map(substance => {
    console.log('\n--- Validating substance:', substance.name, '---')
    const validation = validateSubstance(substance)
    
    const result = {
      ...substance,
      is_over_limit: validation.is_over_limit,
      limit_exceeded: validation.limit_exceeded,
    }
    
    console.log('Validation result for', substance.name, ':', {
      is_over_limit: validation.is_over_limit,
      can_validate: validation.can_validate,
      matched_rule: validation.matched_rule
    })
    
    return result
  })
}

