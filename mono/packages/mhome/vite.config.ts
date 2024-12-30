import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'mhome',
            filename: 'remoteEntry.js',
            remotes: {
                mremote: 'http://localhost:5002/assets/remoteEntry.js',
                remote: {
                    external: 'http://localhost:5001/remoteEntry.js',
                    format: 'var',
                },
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
        port: 5000,
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
