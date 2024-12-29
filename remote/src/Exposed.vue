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
