<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

interface Props {
    name?: string | unknown
    icon?: string | unknown
}

const props = defineProps<Props>()

// Support both 'name' and 'icon' props for compatibility
const iconName = computed(() => props.name || props.icon)

// Get the icon definition
const iconDefinition = computed(() => {
    const name = iconName.value

    // If not a string, pass through as component
    if (typeof name !== 'string') return name

    if (name.startsWith('i-')) {
        return name.slice(2).replace('-', ':')
    }

    return name
})
</script>

<template>
    <Icon v-if="typeof iconDefinition === 'string'" :icon="iconDefinition" v-bind="$attrs" />
    <component v-else-if="typeof iconName !== 'string' && iconName" :is="iconName" v-bind="$attrs" />
</template>
