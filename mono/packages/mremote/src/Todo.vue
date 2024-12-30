<template>
  <div class="todo-list">
    <h2>Remote Todo List</h2>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">{{ task }}</li>
    </ul>
    <input v-model="newTask" placeholder="New task" />
    <button @click="addTask">Add Task</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tasks = ref<string[]>(['Task 1', 'Task 2'])
const newTask = ref('')

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push(newTask.value)
    newTask.value = ''
  }
}
</script>

<style scoped>
.todo-list {
  border: 1px dashed #ccc;
  padding: 8px;
}
</style>
