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
  <div class="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth pixel-panel border-0" ref="logContainer">
    <div 
      v-for="(log, index) in logStore.logs" 
      :key="index"
      class="border-l-4 pl-3 py-1 leading-relaxed"
      :class="{
        'border-white pixel-text-subtitle': log.type === 'info',
        'border-white pixel-text-label': log.type === 'combat',
        'border-white pixel-text-value': log.type === 'gain',
        'border-white bg-white text-black pixel-text-value px-2': log.type === 'danger'
      }"
    >
      <span class="mr-2 pixel-text-label opacity-75">[{{ formatTime(log.timestamp) }}]</span>
      <span class="tracking-wide">{{ log.message }}</span>
    </div>
  </div>
</template>
