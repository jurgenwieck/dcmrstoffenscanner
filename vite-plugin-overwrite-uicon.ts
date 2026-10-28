import { Plugin } from 'vite'
export default function overwriteUiconPlugin(): Plugin {
    return {
        name: 'redirect-icon-imports',
        enforce: 'pre',
        resolveId(source, importer) {
            // Catch imports of Icon.vue from Button.vue or other Nuxt UI components
            if (source === './Icon.vue' && importer?.includes('@nuxt/ui/dist/runtime/components')) {
                return this.resolve('@/components/SmartIcon.vue', importer, { skipSelf: true })
            }
        },
    }
}