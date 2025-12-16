<script setup>
import { useGameLogStore } from '../stores/gameLog'
import { watch, nextTick, ref } from 'vue'

const logStore = useGameLogStore()
const logContainer = ref(null)

// Auto-scroll to bottom when new logs are added
watch(() => logStore.logs.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})

// Helper to color logs
function getLogClass(type) {
  switch (type) {
    case 'combat': return 'text-red-400'
    case 'gain': return 'text-yellow-400'
    case 'danger': return 'text-purple-400 font-bold'
    default: return 'text-gray-300'
  }
}

// Helper to format time
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth" ref="logContainer">
    <div 
      v-for="(log, index) in logStore.logs" 
      :key="index"
      class="text-sm border-l-2 pl-2 py-1 leading-relaxed"
      :class="{
        'border-white text-white': log.type === 'info',
        'border-gray-500 text-gray-400': log.type === 'combat',
        'border-white font-bold': log.type === 'gain',
        'border-white bg-white text-black': log.type === 'danger'
      }"
    >
      <span class="mr-2 opacity-50">[{{ formatTime(log.timestamp) }}]</span>
      <span class="tracking-wide">{{ log.message }}</span>
    </div>
  </div>
</template>
