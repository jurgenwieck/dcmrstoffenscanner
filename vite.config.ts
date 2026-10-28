import ui from '@nuxt/ui/vite'
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import overwriteUiconPlugin from './vite-plugin-overwrite-uicon.ts'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        overwriteUiconPlugin(), // Overwrite Icon.vue to SmartIcon.vue
        vue(),
    vueDevTools(),
    tailwindcss(),
    ui({
            components: {
                resolvers: [
                    (componentName: string) => {
                        if (componentName === 'UIcon') {
                            return { name: 'default', from: '@/components/SmartIcon.vue' }
                        }
                    },
                ],
            },
            ui: { colors: { neutral: 'zinc' } } })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
