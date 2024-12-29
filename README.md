# Vite (Host) + Webpack (Remote) 모듈 페더레이션 설정

## 목표
- **Remote (Webpack)**에서 `remoteEntry.js`를 생성해 `Exposed.vue`를 노출  
- **Home (Vite)**이 그것을 가져와 `<RemoteExposed />`로 사용  
- 오류 없이 빌드 및 실행

---

## 폴더 구조

```plaintext
my-mf-project/
├── remote/                     # Webpack (리모트)
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── shims-vue.d.ts
│   ├── webpack.config.js
│   ├── index.html
│   └── src/
│       ├── main.ts
│       └── Exposed.vue
└── home/                       # Vite (호스트)
    ├── .gitignore
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.ts
        └── App.vue
```
1. Remote (Webpack, 리모트)
1-1) .gitignore
```plaintext
node_modules/
dist/
```
1-2) package.json
```json

{
  "name": "remote",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack --mode production",
    "serve": "serve dist -p 5001 --cors='*'"
  },
  "dependencies": {
    "vue": "^3.2.47"
  },
  "devDependencies": {
    "webpack": "^5.97.1",
    "webpack-cli": "^5.1.4",
    "vue-loader": "^17.0.0",
    "ts-loader": "^9.5.1",
    "mini-css-extract-plugin": "^2.7.5",
    "css-loader": "^6.7.3",
    "html-webpack-plugin": "^5.5.0",
    "typescript": "^4.9.5",
    "serve": "^14.0.1"
  }
}
```

1-3) tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "preserve"
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "shims-vue.d.ts"
  ],
  "exclude": ["node_modules"]
}
```

1-4) shims-vue.d.ts
```typescript
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```


1-5) webpack.config.js

```
javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/main.ts',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:5001/',
    clean: true,
    library: { name: 'remote', type: 'var' }
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin(),
    new ModuleFederationPlugin({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Exposed': './src/Exposed.vue'
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.2.0',
          eager: false
        }
      }
    })
  ]
};
1-6) index.html
html
코드 복사
<!DOCTYPE html>
<html>
  <head>
    <title>Webpack Remote</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

1-7) src/main.ts
```typescript
import { createApp } from 'vue'
import Exposed from './Exposed.vue'

createApp(Exposed).mount('#app')
```

1-8) src/Exposed.vue
```vue
코드 복사
<template>
  <div class="exposed">
    <h2>Exposed Component from Remote</h2>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.exposed {
  border: 1px dashed #999;
  padding: 8px;
  margin: 8px;
}
</style>
```

2. Home (Vite, 호스트)
3. 
2-1) .gitignore
```plaintext
node_modules/
dist/
```

2-2) package.json

```json
{
  "name": "home",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --port 5000",
    "build": "vite build",
    "serve": "vite preview --port 5000"
  },
  "dependencies": {
    "vue": "^3.2.47"
  },
  "devDependencies": {
    "typescript": "^4.9.5",
    "@vitejs/plugin-vue": "^4.0.0",
    "@originjs/vite-plugin-federation": "^1.3.6",
    "vite": "^4.0.5"
  }
}
```


2-3) tsconfig.json

```json

{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "preserve"
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```


2-4) vite.config.ts
```typescript

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
        remote: {
          external: 'http://localhost:5001/remoteEntry.js',
          format: 'var'
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
        format: 'esm'
      }
    }
  }
})
```


2-5) index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vite Host (Home)</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```


2-6) src/main.ts
```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```


2-7) src/App.vue

```vue
<template>
  <h1>HOME (Vite Host)</h1>
  <p>This is a local component in the host app.</p>
  <hr />
  <h3>Remote Component Below:</h3>
  <RemoteExposed />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const RemoteExposed = defineAsyncComponent(() => import('remote/Exposed'))
</script>
```


실행 방법
1. Remote (Webpack)
```bash
cd remote
pnpm install
pnpm build
pnpm serve
```


2. Home (Vite)
```bash
cd home
pnpm install
pnpm dev
```
브라우저에서 **http://localhost:5000**를 열어 <RemoteExposed />를 확인하세요.
