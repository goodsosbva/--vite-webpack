<template>
  <h1>Welcome to mhome</h1>
  <p>This is the host app in the mono repository.</p>

  <h3>Remote Component (mremote):</h3>
  <RemoteTodo />

  <h3>Remote Component (remote):</h3>
  <RemoteExposed />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const RemoteTodo = defineAsyncComponent(() => import('mremote/Todo'))
const RemoteExposed = defineAsyncComponent(() => import('remote/Exposed'))
</script>
