import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'mremote',
            filename: 'remoteEntry.js',
            exposes: {
                './Todo': './src/Todo.vue'
            },
            shared: {
                vue: {
                    singleton: true,
                    requiredVersion: '^3.2.0'
                }
            }
        })
    ],
    server: {
        port: 5002,
        strictPort: true
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                format: 'esm'
            }
        }
    }
})
