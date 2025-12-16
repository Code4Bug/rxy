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
    <div v-if="actions.length === 0" class="text-center italic mt-10">
      [NO DATA]
    </div>
    
    <div v-if="busyState" class="flex-1 flex flex-col items-center justify-center border border-white m-4 animate-pulse">
      <div class="text-xl mb-4 tracking-widest">{{ busyState.label }}...</div>
      <div class="w-2/3 h-4 border border-white relative">
        <div class="absolute top-0 left-0 bottom-0 bg-white" 
             :style="{ animation: `progress ${busyState.duration}ms linear forwards` }"></div>
      </div>
    </div>

    <div v-else class="flex-1 flex gap-4">
      <!-- Interaction Section -->
      <div class="flex-1 border-r-2 border-white pr-4">
        <h3 class="text-white text-xs mb-2 uppercase tracking-widest border-b border-gray-800 pb-1">ACTIONS</h3>
        <div class="grid grid-cols-2 gap-2">
          <button 
            v-for="action in interactActions" 
            :key="action.id"
            @click="$emit('trigger', action)"
            :disabled="action.disabled"
            class="p-2 border border-white text-left text-sm font-bold uppercase hover:bg-white hover:text-black transition-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative"
            :class="{'animate-pulse border-2': action.highlight}"
          >
            <span class="mr-1">></span>
            {{ action.label }}
            <span v-if="action.highlight" class="absolute top-1 right-1 text-xs animate-bounce">!</span>
          </button>
          <div v-if="interactActions.length === 0" class="text-gray-600 text-xs italic p-2">
            No actions available
          </div>
        </div>
      </div>

      <!-- Movement Section -->
      <div class="w-1/3">
        <h3 class="text-white text-xs mb-2 uppercase tracking-widest border-b border-gray-800 pb-1">TRAVEL</h3>
        <div class="flex flex-col gap-2">
           <button 
            v-for="action in moveActions" 
            :key="action.id"
            @click="$emit('trigger', action)"
            :disabled="action.disabled"
            class="p-2 border border-white text-left text-sm font-bold uppercase hover:bg-white hover:text-black transition-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="mr-1">GO:</span>
            {{ action.label.replace('前往: ', '') }}
          </button>
          <div v-if="moveActions.length === 0" class="text-gray-600 text-xs italic p-2">
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
