<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const query = ref('')
let debounceTimer

// Live-code prompt from technical_interview_questions.md §3.9 —
// try rebuilding this from scratch before peeking.
function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', query.value)
  }, 300)
}
</script>

<template>
  <input v-model="query" @input="onInput" placeholder="Search locations..." />
</template>
