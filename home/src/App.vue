<template>
  <h1>HOME (Vite Host)</h1>
  <p>This is a local component in the host app.</p>

  <hr />

  <h3>Remote Component Below:</h3>
  <RemoteExposed />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// "remote/Exposed" == remoteEntry에서 exposes: { './Exposed': './src/Todo.vue' }
const RemoteExposed = defineAsyncComponent(() => import('remote/Exposed'))
</script>
