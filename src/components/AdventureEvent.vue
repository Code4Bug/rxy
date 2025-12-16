<template>
  <div v-if="adventureStore.currentEvent" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="pixel-container p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
      <!-- 事件标题 -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="pixel-text-title">
          {{ adventureStore.currentEvent.name }}
        </h3>
        <button 
          @click="cancelEvent"
          class="pixel-button text-xl px-2 py-0"
        >
          ×
        </button>
      </div>
      
      <div class="pixel-divider mb-4"></div>
      
      <!-- 事件描述 -->
      <div class="pixel-text-subtitle mb-6 leading-relaxed">
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
            'w-full text-left pixel-list-item p-3',
            !canMakeChoice(choice) && 'opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="pixel-text-value">{{ choice.text }}</div>
          <div v-if="choice.requirements" class="pixel-text-label mt-1">
            需要：{{ formatRequirements(choice.requirements) }}
          </div>
        </button>
      </div>
      
      <!-- 底部提示 -->
      <div class="mt-4 pixel-text-label text-center">
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