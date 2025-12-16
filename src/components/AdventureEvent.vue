<template>
  <div v-if="adventureStore.currentEvent" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
      <!-- 事件标题 -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-yellow-400">
          {{ adventureStore.currentEvent.name }}
        </h3>
        <button 
          @click="cancelEvent"
          class="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
      
      <!-- 事件描述 -->
      <div class="text-gray-300 mb-6 leading-relaxed">
        {{ adventureStore.currentEvent.description }}
      </div>
      
      <!-- 选择选项 -->
      <div class="space-y-3">
        <button
          v-for="choice in adventureStore.currentEvent.choices"
          :key="choice.id"
          @click="makeChoice(choice.id)"
          :disabled="!canMakeChoice(choice)"
          :class="[
            'w-full text-left p-3 rounded border transition-colors',
            canMakeChoice(choice)
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
          ]"
        >
          <div class="font-medium">{{ choice.text }}</div>
          <div v-if="choice.requirements" class="text-sm text-gray-400 mt-1">
            需要：{{ formatRequirements(choice.requirements) }}
          </div>
        </button>
      </div>
      
      <!-- 底部提示 -->
      <div class="mt-4 text-sm text-gray-500 text-center">
        选择你的行动，每个选择都可能带来不同的后果...
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdventureStore } from '../stores/adventure'
import { usePlayerStore } from '../stores/player'

const adventureStore = useAdventureStore()
const player = usePlayerStore()

// 检查是否可以做出选择
function canMakeChoice(choice) {
  if (!choice.requirements) return true
  
  const req = choice.requirements
  
  // 检查金钱要求
  if (req.gold && (player.stats.gold || 0) < req.gold) {
    return false
  }
  
  // 检查生命值要求
  if (req.hp && player.stats.hp < req.hp) {
    return false
  }
  
  // 检查内力要求
  if (req.mp && player.stats.mp < req.mp) {
    return false
  }
  
  // 检查物品要求
  if (req.items) {
    for (const item of req.items) {
      const hasItem = player.inventory.find(i => 
        i.id === item.id && i.count >= item.count
      )
      if (!hasItem) return false
    }
  }
  
  return true
}

// 格式化需求显示
function formatRequirements(requirements) {
  const reqs = []
  
  if (requirements.gold) {
    reqs.push(`${requirements.gold}金`)
  }
  
  if (requirements.hp) {
    reqs.push(`${requirements.hp}气血`)
  }
  
  if (requirements.mp) {
    reqs.push(`${requirements.mp}内力`)
  }
  
  if (requirements.items) {
    requirements.items.forEach(item => {
      reqs.push(`${item.name || item.id} x${item.count}`)
    })
  }
  
  return reqs.join('、')
}

// 做出选择
function makeChoice(choiceId) {
  adventureStore.makeChoice(choiceId)
}

// 取消事件
function cancelEvent() {
  adventureStore.cancelCurrentEvent()
}
</script>