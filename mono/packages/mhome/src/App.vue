<template>
  <h1>Welcome to mhome</h1>
  <p>This is the host app in the mono repository.</p>

  <h3>Remote Component (mremote):</h3>
  <component :is="RemoteTodo" v-if="RemoteTodo" />
  <p v-else>Loading mremote component...</p>

  <h3>Remote Component (remote):</h3>
  <component :is="RemoteExposed" v-if="RemoteExposed" />
  <p v-else>Loading remote component...</p>

  <h2>Remote2 Component:</h2>
  <component :is="RemoteExposed2" v-if="RemoteExposed2" />
  <p v-else-if="error">Failed to load remote2 component: {{ error }}</p>
  <p v-else>Loading remote2 component...</p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const RemoteTodo = ref(null);
const RemoteExposed = ref(null);
const RemoteExposed2 = ref(null);
const error = ref<string | null>(null);

// Load components dynamically
onMounted(async () => {
  try {
    RemoteTodo.value = (await import('mremote/Todo')).default;
    RemoteExposed.value = (await import('remote/Exposed')).default;
    RemoteExposed2.value = (await import('remote2/ExposedComponent')).default;
  } catch (err) {
    console.error('Error loading remote components:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';
  }
});
</script>
