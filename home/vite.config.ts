import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'home',
            filename: 'remoteEntry.js',
            remotes: {
                // remote 프로젝트가 http://localhost:5001/ 에서 서빙 중
                remote: {
                    external: 'http://localhost:5001/remoteEntry.js',
                    format: 'var' // Webpack에서 var로 노출
                }
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
                // Vite는 기본 esm 출력
                format: 'esm'
            }
        }
    }
})
