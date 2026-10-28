<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-circle-check" class="h-5 w-5 text-green-600" />
      <h3 class="text-lg font-semibold">Extractie voltooid</h3>
    </div>

    <!-- Basic Product Information -->
    <UCard>
      <template #header>
        <h4 class="text-md font-semibold">Basisinformatie</h4>
      </template>
      <div class="space-y-4">
        <!-- Product Name -->
        <DataField label="Productnaam" :value="data.product_name" :confidence="data.confidence?.product_name" />

        <!-- EAN Code -->
        <DataField label="EAN Barcode" :value="data.ean_code" :confidence="data.confidence?.ean_code" monospace />

        <!-- Batch Number -->
        <DataField label="Batchnummer" :value="data.batch_number" :confidence="data.confidence?.batch_number" />

        <!-- Production Date -->
        <DataField label="Productiedatum" :value="data.production_date"
          :confidence="data.confidence?.production_date" />

        <!-- Expiration Date -->
        <DataField label="Vervaldatum" :value="data.expiration_date"
          :confidence="data.confidence?.expiration_date" />

        <!-- Origin -->
        <DataField label="Herkomst" :value="data.origin" :confidence="data.confidence?.origin" />
      </div>
    </UCard>

    <!-- Safety Information -->
    <UCard v-if="hasSafetyInfo">
      <template #header>
        <h4 class="text-md font-semibold">Veiligheidsinformatie</h4>
      </template>
      <div class="space-y-4">
        <!-- Dangerous Icons -->
        <ArrayField label="Gevaarpictogrammen" :values="data.dangerous_icons"
          :confidence="data.confidence?.dangerous_icons" />

        <!-- Hazard Statements -->
        <ArrayField label="Gevarenaanduidingen" :values="data.hazard_statements"
          :confidence="data.confidence?.hazard_statements" />

        <!-- Precautionary Statements -->
        <ArrayField label="Veiligheidsaanbevelingen" :values="data.precautionary_statements"
          :confidence="data.confidence?.precautionary_statements" />
      </div>
    </UCard>

    <!-- Instructions & Safety Measures -->
    <UCard v-if="hasInstructions">
      <template #header>
        <h4 class="text-md font-semibold">Instructies & veiligheidsmaatregelen</h4>
      </template>
      <div class="space-y-4">
        <!-- Safety Instructions -->
        <DataField label="Veiligheidsinstructies" :value="data.safety_instructions"
          :confidence="data.confidence?.safety_instructions" multiline />

        <!-- Storage Requirements -->
        <DataField label="Opslagvereisten" :value="data.storage_requirements"
          :confidence="data.confidence?.storage_requirements" multiline />

        <!-- First Aid -->
        <DataField label="Eerste hulp maatregelen" :value="data.first_aid" :confidence="data.confidence?.first_aid"
          multiline />

        <!-- Fire Fighting -->
        <DataField label="Brandbestrijdingsmaatregelen" :value="data.fire_fighting"
          :confidence="data.confidence?.fire_fighting" multiline />
      </div>
    </UCard>

    <!-- Image Preview -->
    <UCard v-if="imageUrl">
      <template #header>
        <h4 class="text-md font-semibold">Gescande afbeelding</h4>
      </template>
      <img :src="imageUrl" alt="Gescand product" class="w-full max-w-2xl rounded-lg mx-auto" />
    </UCard>

    <div class="flex gap-2">
      <UButton color="primary" icon="i-lucide-rotate-ccw" @click="$emit('tryAnother')">
        Scan nog een product
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import type { ExtractionResult } from '@/shared/interfaces/ExtractionResult'

const props = defineProps<{
  data: ExtractionResult
  imageUrl?: string
}>()

defineEmits<{
  tryAnother: []
}>()

// Check if safety info section should be displayed
const hasSafetyInfo = computed(() => {
  return (
    props.data.dangerous_icons?.length ||
    props.data.hazard_statements?.length ||
    props.data.precautionary_statements?.length
  )
})

// Check if instructions section should be displayed
const hasInstructions = computed(() => {
  return (
    props.data.safety_instructions ||
    props.data.storage_requirements ||
    props.data.first_aid ||
    props.data.fire_fighting
  )
})

/**
 * Confidence Badge Component
 * Displays confidence score with color coding
 */
const ConfidenceBadge = defineComponent({
  name: 'ConfidenceBadge',
  props: {
    confidence: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const color = computed(() => {
      if (props.confidence >= 0.8) return 'green'
      if (props.confidence >= 0.5) return 'yellow'
      return 'red'
    })

    const percentage = computed(() => {
      return Math.round(props.confidence * 100)
    })

    return () =>
      h(
        'span',
        {
          class: [
            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
            color.value === 'green' &&
            'bg-green-50 text-green-700 ring-green-600/20',
            color.value === 'yellow' &&
            'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
            color.value === 'red' && 'bg-red-50 text-red-700 ring-red-600/20',
          ],
        },
        `${percentage.value}% betrouwbaarheid`
      )
  },
})

/**
 * Data Field Component
 * Displays a single data field with label, value, and optional confidence badge
 */
const DataField = defineComponent({
  name: 'DataField',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
    },
    monospace: {
      type: Boolean,
      default: false,
    },
    multiline: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () =>
      h('div', [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700 mb-1' },
          props.label
        ),
        h('div', { class: 'flex items-start gap-2' }, [
          h(
            'p',
            {
              class: [
                props.multiline ? 'text-sm whitespace-pre-wrap' : 'text-base',
                props.monospace ? 'font-mono' : '',
                'text-gray-900',
              ],
            },
            props.value || 'Niet gevonden'
          ),
          props.confidence !== null && props.confidence !== undefined
            ? h(ConfidenceBadge, { confidence: props.confidence })
            : null,
        ]),
      ])
  },
})

/**
 * Array Field Component
 * Displays an array of values as a list with optional confidence badge
 */
const ArrayField = defineComponent({
  name: 'ArrayField',
  props: {
    label: {
      type: String,
      required: true,
    },
    values: {
      type: Array as () => string[] | undefined,
      default: () => [],
    },
    confidence: {
      type: Number,
      default: null,
    },
  },
  setup(props) {
    return () =>
      h('div', [
        h(
          'label',
          { class: 'block text-sm font-medium text-gray-700 mb-1' },
          props.label
        ),
        h('div', { class: 'flex items-start gap-2' }, [
          h('div', { class: 'flex-1' }, [
            props.values && props.values.length > 0
              ? h(
                'ul',
                { class: 'list-disc list-inside space-y-1' },
                props.values.map((value, index) =>
                  h(
                    'li',
                    { key: index, class: 'text-sm text-gray-900' },
                    value
                  )
                )
              )
              : h(
                'p',
                { class: 'text-base text-gray-900' },
                'Niet gevonden'
              ),
          ]),
          props.confidence !== null && props.confidence !== undefined
            ? h(ConfidenceBadge, { confidence: props.confidence })
            : null,
        ]),
      ])
  },
})
</script>
