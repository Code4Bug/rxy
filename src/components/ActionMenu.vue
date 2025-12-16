<script setup>
import { computed } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  busyState: {
    type: Object,
    default: null
  }
})

defineEmits(['trigger'])

const moveActions = computed(() => props.actions.filter(a => a.type === 'move'))
const interactActions = computed(() => props.actions.filter(a => a.type !== 'move'))
</script>

<template>
  <div class="border-t-2 border-white p-4 h-56 bg-black flex flex-col gap-4">
    <div v-if="actions.length === 0" class="text-center pixel-text-label mt-10">
      [NO DATA]
    </div>
    
    <div v-if="busyState" class="flex-1 flex flex-col items-center justify-center pixel-container m-4">
      <div class="pixel-text-title mb-4">{{ busyState.label }}...</div>
      <div class="w-2/3 h-6 bg-black border-2 border-white relative">
        <div class="absolute top-0 left-0 bottom-0 bg-white progress-bar" 
             :style="{ animation: `progress ${busyState.duration}ms linear forwards` }"></div>
      </div>
    </div>

    <div v-else class="flex-1 flex gap-4">
      <!-- Interaction Section -->
      <div class="flex-1 border-r-2 border-white pr-4">
        <h3 class="pixel-text-subtitle mb-2 pb-1">ACTIONS</h3>
        <div class="pixel-divider mb-2"></div>
        <div class="grid grid-cols-2 gap-2">
          <button 
            v-for="action in interactActions" 
            :key="action.id"
            @click="$emit('trigger', action)"
            :disabled="action.disabled"
            :class="[
              'pixel-button text-left relative',
              action.highlight && 'border-4',
              action.disabled && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <span class="mr-1">></span>
            {{ action.label }}
            <span v-if="action.highlight" class="absolute top-1 right-1 pixel-text-label">!</span>
          </button>
          <div v-if="interactActions.length === 0" class="pixel-text-label p-2">
            No actions available
          </div>
        </div>
      </div>

      <!-- Movement Section -->
      <div class="w-1/3">
        <h3 class="pixel-text-subtitle mb-2 pb-1">TRAVEL</h3>
        <div class="pixel-divider mb-2"></div>
        <div class="flex flex-col gap-2">
           <button 
            v-for="action in moveActions" 
            :key="action.id"
            @click="$emit('trigger', action)"
            :disabled="action.disabled"
            :class="[
              'pixel-button text-left',
              action.disabled && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <span class="mr-1">GO:</span>
            {{ action.label.replace('前往: ', '') }}
          </button>
          <div v-if="moveActions.length === 0" class="pixel-text-label p-2">
            No exits
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}
</style>
