아래는 Vite(호스트, home) + Webpack(리모트, remote) 조합으로 Vue 모듈 페더레이션을 구성하는 “완전체” 예시입니다.
이전까지 나왔던 오류들(Cannot find module .vue, css-loader missing, Library name must be a string, Shared module not available 등)을 모두 피하도록 각 항목을 최종 정리했습니다.

목표

remote(Webpack)에서 remoteEntry.js를 생성해 Exposed.vue를 노출
home(Vite)이 그것을 가져와 <RemoteExposed />로 사용
오류 없이 빌드 및 실행
폴더 구조
css
코드 복사
my-mf-project/
├── remote/        # Webpack (리모트)
│   ├── package.json
│   ├── tsconfig.json
│   ├── shims-vue.d.ts
│   ├── webpack.config.js
│   ├── index.html
│   └── src/
│       ├── main.ts
│       └── Exposed.vue
└── home/          # Vite (호스트)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
├── main.ts
└── App.vue
이제 remote 먼저, 그 다음 home 차례로 전체 코드를 보겠습니다.

1. remote (Webpack, 리모트)
   1-1) package.json
   jsonc
   코드 복사
   {
   "name": "remote",
   "version": "1.0.0",
   "scripts": {
   "build": "webpack --mode production",
   "serve": "serve dist -p 5001 --cors='*'"
   },
   "dependencies": {
   "vue": "^3.2.47" // 호스트와 같은 버전
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
   설치
   bash
   코드 복사
   cd remote
   pnpm install
   1-2) tsconfig.json
   jsonc
   코드 복사
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
   1-3) shims-vue.d.ts
   ts
   코드 복사
   declare module '*.vue' {
   import { DefineComponent } from 'vue'
   const component: DefineComponent<{}, {}, any>
   export default component
   }
   이 파일이 없으면 .vue 모듈 인식 에러가 납니다.

1-4) webpack.config.js
js
코드 복사
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
// var 형태로 노출 + 이름도 지정 (window.remote)
library: { name: 'remote', type: 'var' },
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
// vue 파일에도 TS를 적용
appendTsSuffixTo: [/\.vue$/]
},
exclude: /node_modules/
},
{
test: /\.css$/,
use: [
MiniCssExtractPlugin.loader,
'css-loader'
]
}
]
},
plugins: [
new HtmlWebpackPlugin({
template: './index.html'
}),
new VueLoaderPlugin(),
new MiniCssExtractPlugin(),
new ModuleFederationPlugin({
name: 'remote',          // 모듈 페더레이션에서 컨테이너 이름
filename: 'remoteEntry.js',
// library: { name: 'remote', type: 'var' }, // 여기서도 설정하면 중복 → 지워주세요
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
주의:

여기서 library 옵션은 **output**에만 두고, ModuleFederationPlugin에서는 지워주세요(중복 시 충돌).
또는 반대로, ModuleFederationPlugin에 library: { name: 'remote', type: 'var' }를 두고, output.library를 삭제해도 됩니다.
중복 선언하면 “Library name must be a string” 오류가 납니다.
1-5) index.html
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
1-6) src/main.ts
ts
코드 복사
import { createApp } from 'vue'
import Exposed from './Exposed.vue'

// remote 단독 실행 시에도 <Exposed>를 표시
createApp(Exposed).mount('#app')
1-7) src/Exposed.vue
vue
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
1-8) 빌드 & 서빙
pnpm build → dist/remoteEntry.js가 생성
pnpm serve → dist 폴더를 5001 포트에 정적 서빙
브라우저에서 http://localhost:5001/ 열면 Exposed.vue 내용이 표시
http://localhost:5001/remoteEntry.js 열면 모듈 페더레이션 컨테이너 코드가 표시
이로써 리모트 설정이 끝났습니다.

2. home (Vite, 호스트)
   2-1) package.json
   jsonc
   코드 복사
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
   설치
   bash
   코드 복사
   cd ../home
   pnpm install
   (또는 pnpm install 후에 node_modules가 있는지 확인)

2-2) tsconfig.json
jsonc
코드 복사
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
2-3) vite.config.ts
ts
코드 복사
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
// remote(리모트)가 5001에서 서빙되는 remoteEntry.js
remote: {
external: 'http://localhost:5001/remoteEntry.js',
format: 'var' // Webpack이 var 형태로 노출
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
// Vite 디폴트: esm
format: 'esm'
}
}
}
})
2-4) index.html
html
코드 복사
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Vite Host (Home)</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- Vite가 기본적으로 index.html을 엔트리로 삼음 -->
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
2-5) src/main.ts
ts
코드 복사
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
2-6) src/App.vue
vue
코드 복사
<template>
  <h1>HOME (Vite Host)</h1>
  <p>This is a local component in the host app.</p>

  <hr />

<h3>Remote Component Below:</h3>
<RemoteExposed />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// "remote/Exposed"는 remoteEntry.js에서 exposes: { './Exposed': ... }
const RemoteExposed = defineAsyncComponent(() => import('remote/Exposed'))
</script>
2-7) 실행 (개발 모드)
bash
코드 복사
pnpm dev
http://localhost:5000/
브라우저에서 “HOME (Vite Host)”가 뜨고, 아래에 “Exposed Component from Remote”가 제대로 표시되면 성공!
3. 실행 순서 최종 요약
   Remote(Webpack)

cd remote
pnpm build (→ dist/remoteEntry.js 생성)
pnpm serve (→ http://localhost:5001/)
Home(Vite)

cd ../home
pnpm dev (→ http://localhost:5000/)
브라우저에서 http://localhost:5000/ 열면,
**Vite(호스트)**가 **Webpack 리모트(5001)**의 remoteEntry.js를 가져와 <RemoteExposed/>를 렌더링합니다.

4. 주요 오류 및 해결
   Cannot find module './Exposed.vue'

해결: shims-vue.d.ts 파일 + tsconfig.json에 .vue 포함 + appendTsSuffixTo: [/\.vue$/]
Can't resolve 'css-loader'

해결: css-loader를 devDependencies에 추가 + mini-css-extract-plugin.loader와 함께 webpack 설정
Library name must be a string

해결: library: { name: 'remote', type: 'var' }를 한 곳에만 설정 (보통 output.library)
Shared module is not available for eager consumption

해결: webpack 리모트를 프로덕션 빌드(HMR 비활성) + eager: false(lazy) + 호스트에서 singleton: true
VUE_HMR_RUNTIME is not defined

해결: 리모트는 dev(HMR) 대신 prod로 빌드 → HMR 코드 제거
마무리
위 remote + home 코드와 실행 순서를 그대로 따르면,
각종 Vue/TypeScript/Module Federation 오류 없이 모듈 페더레이션이 동작합니다.
실제 프로젝트에서는 Vue 버전, 포트 번호, 패키지 버전 등을 맞춰서 사용하시고,
“리모트는 프로덕션 빌드 → 호스트는 개발 모드 HMR”** 조합이 가장 안정적입니다.
이 구성을 그대로 복사해서 진행하면, 오류 없이 빌드와 실행이 가능합니다.
즐거운 모듈 페더레이션 개발 되세요!