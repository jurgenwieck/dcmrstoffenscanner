<template>
    <UCard>
        <div class="space-y-4">
            <!-- Header with substance name and validation status -->
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ substance.name }}
                    </h3>
                    <div v-if="substance.confidence && !isEditing" class="text-sm text-gray-500 mt-1">
                        Betrouwbaarheid: {{ Math.round(substance.confidence * 100) }}%
                    </div>
                </div>

                <!-- Edit button -->
                <div v-if="!isEditing" class="flex items-center gap-2">
                    <!-- Not assessed badge (for ADR 1 and 7) -->
                    <div v-if="validationResult.not_assessed">
                        <UBadge color="neutral" variant="solid" size="lg">
                            <div class="flex items-center gap-1">
                                <UIcon name="i-lucide-info" class="h-4 w-4"  />
                                Niet beoordeeld
                            </div>
                        </UBadge>
                    </div>
                    <!-- Validation badge - only show if we can validate -->
                    <div v-else-if="validationResult.can_validate && validationResult.is_over_limit">
                        <UBadge color="error" variant="solid" size="lg">
                            <div class="flex items-center gap-1">
                                <UIcon name="i-lucide-triangle-alert" class="h-4 w-4"  />
                                Boven limiet
                            </div>
                        </UBadge>
                    </div>
                    <div v-else-if="validationResult.can_validate && !validationResult.is_over_limit">
                        <UBadge color="success" variant="solid" size="lg">
                            <div class="flex items-center gap-1">
                                <UIcon name="i-lucide-circle-check" class="h-4 w-4"  />
                                OK
                            </div>
                        </UBadge>
                    </div>

                    <!-- Pictogram warning badge -->
                    <div v-if="substance.pictogram_confidence !== undefined && substance.pictogram_confidence < 0.7">
                        <UBadge color="warning" variant="outline" size="lg">
                            <div class="flex items-center gap-1">
                                <UIcon name="i-lucide-triangle-alert" class="h-4 w-4"  />
                                Pictogrammen onzeker
                            </div>
                        </UBadge>
                    </div>

                    <UButton color="neutral" variant="ghost" size="sm" @click="startEditing">
                        <UIcon name="i-lucide-pencil" class="h-3 w-3 mr-1"  />
                        Bewerken
                    </UButton>
                </div>
            </div>

            <!-- Edit Form -->
            <div v-if="isEditing" class="space-y-4 border-t pt-4">
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Stofnaam *
                        </label>
                        <UInput v-model="editedSubstance.name" size="sm" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            ADR Klasse
                        </label>
                        <USelect v-model="editedSubstance.adr_class" :items="[
                            { label: 'Geen', value: 'none' },
                            { label: '1 - Ontplofbare stoffen en voorwerpen', value: '1' },
                            { label: '2.1 - Brandbare gassen', value: '2.1' },
                            { label: '2.2 - Niet-brandbare gassen', value: '2.2' },
                            { label: '2.3 - Giftige gassen', value: '2.3' },
                            { label: '3 - Brandbare vloeistoffen', value: '3' },
                            { label: '4.1 - Brandbare vaste stoffen', value: '4.1' },
                            { label: '4.2 - Voor zelfontbranding vatbare stoffen', value: '4.2' },
                            { label: '4.3 - Stoffen die in contact met water brandbare gassen ontwikkelen', value: '4.3' },
                            { label: '5.1 - Oxiderende stoffen', value: '5.1' },
                            { label: '5.2 - Organische peroxiden', value: '5.2' },
                            { label: '6.1 - Giftige stoffen', value: '6.1' },
                            { label: '6.2 - Infectueuze stoffen', value: '6.2' },
                            { label: '7 - Radioactieve stoffen', value: '7' },
                            { label: '8 - Bijtende stoffen', value: '8' },
                            { label: '9 - Diverse gevaarlijke stoffen', value: '9' },
                            { label: 'Acute toxiciteit cat 1,2 of 3', value: 'Acute toxiciteit cat 1,2 of 3' },
                        ]" size="sm" placeholder="Selecteer ADR klasse" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Verpakkingsgroep
                            <span v-if="availablePackagingGroups.length > 0" class="text-red-600">*</span>
                        </label>
                        <USelect v-model="editedSubstance.packaging_group" :items="availablePackagingGroups" size="sm"
                            placeholder="Selecteer verpakkingsgroep" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Hoeveelheid (per container)
                        </label>
                        <UInput v-model.number="editedSubstance.quantity" type="number" size="sm" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Eenheid
                        </label>
                        <USelect v-model="editedSubstance.unit" :items="[
                            { label: 'Liter', value: 'liter' },
                            { label: 'KG', value: 'KG' },
                        ]" size="sm" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Aantal containers
                        </label>
                        <UInput v-model.number="editedSubstance.number_of_items" type="number" size="sm" min="1" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Soortelijk gewicht (SG)
                            <span v-if="editedSubstance.unit?.toLowerCase() === 'liter'" class="text-red-600">*</span>
                        </label>
                        <UInput v-model.number="editedSubstance.specific_gravity" type="number" size="sm" step="0.01"
                            placeholder="bijv. 0.8" />
                        <p v-if="editedSubstance.unit?.toLowerCase() === 'liter'" class="text-xs text-gray-500 mt-1">
                            Verplicht voor vloeistoffen (limieten zijn in KG)
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            UN Nummer
                        </label>
                        <UInput v-model="editedSubstance.un_number" size="sm" placeholder="bijv. UN1234" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            CAS Nummer
                        </label>
                        <UInput v-model="editedSubstance.cas_number" size="sm" placeholder="bijv. 123-45-6" />
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2 pt-2">
                    <UButton color="primary" size="sm" :disabled="!editedSubstance.name" @click="saveEdits"
                        class="w-full sm:w-auto">
                        <UIcon name="i-lucide-save" class="h-3 w-3 mr-1"  />
                        Wijzigingen opslaan
                    </UButton>
                    <UButton color="neutral" variant="outline" size="sm" @click="cancelEditing"
                        class="w-full sm:w-auto">
                        Annuleren
                    </UButton>
                </div>
            </div>

            <!-- Substance details grid (view mode) -->
            <div v-else class="grid grid-cols-2 gap-3 text-sm">
                <div v-if="substance.adr_class">
                    <div class="text-gray-500 font-medium">ADR Klasse</div>
                    <div class="text-gray-900 mt-1">{{ substance.adr_class }}</div>
                </div>

                <div v-if="substance.packaging_group || packagingGroupRequired">
                    <div class="text-gray-500 font-medium">Verpakkingsgroep</div>
                    <div v-if="substance.packaging_group" class="text-gray-900 mt-1">
                        {{ substance.packaging_group }}
                    </div>
                    <div v-else class="text-red-600 mt-1 text-sm flex items-center gap-1">
                        <UIcon name="i-lucide-triangle-alert" class="h-3 w-3"  />
                        Niet ingevuld (verplicht)
                    </div>
                </div>

                <div v-if="substance.quantity">
                    <div class="text-gray-500 font-medium">Hoeveelheid (per container)</div>
                    <div class="text-gray-900 mt-1">
                        {{ substance.quantity }} {{ substance.unit }}
                    </div>
                </div>

                <div v-if="substance.number_of_items">
                    <div class="text-gray-500 font-medium">Aantal containers</div>
                    <div class="text-gray-900 mt-1">{{ substance.number_of_items }}</div>
                </div>

                <div v-if="substance.specific_gravity">
                    <div class="text-gray-500 font-medium">Soortelijk gewicht (SG)</div>
                    <div class="text-gray-900 mt-1">{{ substance.specific_gravity }}</div>
                </div>

                <div v-if="substance.un_number">
                    <div class="text-gray-500 font-medium">UN Nummer</div>
                    <div class="text-gray-900 mt-1">{{ substance.un_number }}</div>
                </div>

                <div v-if="substance.cas_number">
                    <div class="text-gray-500 font-medium">CAS Nummer</div>
                    <div class="text-gray-900 mt-1">{{ substance.cas_number }}</div>
                </div>

                <div v-if="substance.ghs_pictograms && substance.ghs_pictograms.length > 0" class="col-span-2">
                    <div class="text-gray-500 font-medium">GHS Pictogrammen</div>
                    <div class="text-gray-900 mt-1">
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="pictogram in substance.ghs_pictograms" :key="pictogram" color="neutral"
                                variant="outline">
                                {{ pictogram }}
                            </UBadge>
                        </div>
                        <div v-if="substance.pictogram_confidence !== undefined" class="text-xs text-gray-500 mt-1">
                            Betrouwbaarheid: {{ Math.round(substance.pictogram_confidence * 100) }}%
                        </div>
                    </div>
                </div>

                <div v-if="substance.ai_reasoning" class="col-span-2">
                    <div class="text-gray-500 font-medium flex items-center gap-2">
                        AI Redenering
                        <UTooltip text="Uitleg van de AI over de classificatie">
                            <UIcon name="i-lucide-info" class="h-3 w-3 text-gray-400"  />
                        </UTooltip>
                    </div>
                    <div class="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                        {{ substance.ai_reasoning }}
                    </div>
                </div>

                <div v-if="substance.quantity && substance.number_of_items" class="col-span-2">
                    <div class="text-gray-500 font-medium">Totale hoeveelheid</div>
                    <div class="text-gray-900 mt-1">
                        <div class="text-lg font-semibold">
                            {{ substance.quantity * substance.number_of_items }} {{ substance.unit }}
                        </div>
                        <div v-if="convertedQuantity" class="text-sm text-gray-600 mt-1">
                            ≈ {{ convertedQuantity.value }} {{ convertedQuantity.unit }} (met SG {{
                                substance.specific_gravity }})
                        </div>
                    </div>
                </div>
            </div>

            <!-- Missing fields warning -->
            <div v-if="!isEditing && validationResult.not_assessed"
                class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <UIcon name="i-lucide-info" class="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5"  />
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">Deze stof wordt niet beoordeeld</div>
                        <div class="text-sm text-gray-700 mt-1">
                            {{ validationResult.not_assessed_reason }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="!isEditing && !validationResult.can_validate && validationResult.missing_fields && validationResult.missing_fields.length > 0"
                class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <UIcon name="i-lucide-info" class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"  />
                    <div class="flex-1">
                        <div class="font-medium text-blue-900">Validatie niet mogelijk</div>
                        <div class="text-sm text-blue-700 mt-1">
                            Ontbrekende velden: {{ validationResult.missing_fields.join(', ') }}
                        </div>
                    </div>
                </div>
            </div>
            <!-- Validation warning -->
            <div v-if="!isEditing && validationResult.can_validate && validationResult.is_over_limit && !substance.human_override"
                class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                    <UIcon name="i-lucide-triangle-alert" class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"  />
                    <div class="flex-1">
                        <div class="font-medium text-red-900">Hoeveelheid overschrijdt limiet</div>
                        <div class="text-sm text-red-700 mt-1">
                            {{ validationResult.limit_exceeded }}
                        </div>
                        <div v-if="validationResult.matched_rule" class="text-sm text-red-600 mt-2">
                            Limiet: {{ validationResult.matched_rule.limit_value }} {{
                                validationResult.matched_rule.limit_unit }}
                            <span v-if="validationResult.matched_rule.packaging_group">
                                ({{ validationResult.matched_rule.packaging_group }})
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Substance } from '@/shared/interfaces/Substance'
import { validateSubstance } from '@/shared/helpers/adrValidation'

interface Props {
    substance: Substance
}

interface Emits {
    (e: 'update:substance', substance: Substance): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editedSubstance = ref<Substance>({ ...props.substance })

const validationResult = computed(() => validateSubstance(props.substance))

// Get available packaging groups based on selected ADR class
const availablePackagingGroups = computed(() => {
    const adrClass = editedSubstance.value.adr_class

    if (!adrClass) return []

    // Based on the ADR limits table
    const nvtOption = { label: 'N/A (Niet van toepassing)', value: 'N/A' }

    switch (adrClass) {
        case '3':
            return [
                { label: 'VP I', value: 'VP I' },
                { label: 'VP II', value: 'VP II' },
                { label: 'VP III', value: 'VP III' },
                nvtOption,
            ]
        case '5.2':
            return [
                { label: 'VP I', value: 'VP I' },
                { label: 'VP II', value: 'VP II' },
                { label: 'VP III', value: 'VP III' },
                nvtOption,
            ]
        case '6.1':
            return [
                { label: 'VP I', value: 'VP I' },
                { label: 'VP II', value: 'VP II' },
                { label: 'VP III', value: 'VP III' },
                nvtOption,
            ]
        case '6.2':
            return [
                { label: 'I1', value: 'I1' },
                { label: 'I2', value: 'I2' },
                nvtOption,
            ]
        case '8':
            return [
                { label: 'VP I', value: 'VP I' },
                { label: 'VP II', value: 'VP II' },
                { label: 'VP III', value: 'VP III' },
                nvtOption,
            ]
        default:
            // For other classes, no packaging group needed
            return []
    }
})

// Check if packaging group is required for the current ADR class
const packagingGroupRequired = computed(() => {
    // Explicitly access the property to ensure reactivity
    const adrClass = props.substance.adr_class
    const required = ['3', '5.2', '6.1', '6.2', '8'].includes(adrClass || '')
    return required
})

// Calculate converted quantity (liter to KG or KG to liter)
const convertedQuantity = computed(() => {
    if (!props.substance.quantity || !props.substance.number_of_items || !props.substance.specific_gravity || !props.substance.unit) {
        return null
    }

    const totalQuantity = props.substance.quantity * props.substance.number_of_items
    const sg = props.substance.specific_gravity
    const unit = props.substance.unit.toLowerCase()

    if (unit === 'liter') {
        // Convert liter to KG: liter * SG = KG
        return {
            value: (totalQuantity * sg).toFixed(2),
            unit: 'KG'
        }
    } else if (unit === 'kg') {
        // Convert KG to liter: KG / SG = liter
        return {
            value: (totalQuantity / sg).toFixed(2),
            unit: 'liter'
        }
    }

    return null
})

const startEditing = () => {
    editedSubstance.value = { ...props.substance }
    isEditing.value = true
}

// Watch for ADR class changes and clear packaging group if not needed
watch(() => editedSubstance.value.adr_class, (newClass) => {
    const requiresPackagingGroup = ['3', '5.2', '6.1', '6.2', '8'].includes(newClass || '')
    if (!requiresPackagingGroup) {
        editedSubstance.value.packaging_group = undefined
    }
})

const cancelEditing = () => {
    isEditing.value = false
    editedSubstance.value = { ...props.substance }
}

const saveEdits = () => {
    if (!editedSubstance.value.name) return

    // Reset override if validation-related fields changed
    const validationFieldsChanged =
        editedSubstance.value.adr_class !== props.substance.adr_class ||
        editedSubstance.value.packaging_group !== props.substance.packaging_group ||
        editedSubstance.value.quantity !== props.substance.quantity ||
        editedSubstance.value.unit !== props.substance.unit ||
        editedSubstance.value.specific_gravity !== props.substance.specific_gravity

    const updatedSubstance: Substance = {
        ...editedSubstance.value,
        human_override: validationFieldsChanged ? false : props.substance.human_override,
        human_override_reason: validationFieldsChanged ? undefined : props.substance.human_override_reason,
    }

    emit('update:substance', updatedSubstance)
    isEditing.value = false
}
</script>
