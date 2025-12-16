<script setup>
import { onMounted, computed } from 'vue'
import MainDisplay from './components/MainDisplay.vue'
import ActionMenu from './components/ActionMenu.vue'
import StatusPanel from './components/StatusPanel.vue'
import AdventureEvent from './components/AdventureEvent.vue'
import { useGameLogStore } from './stores/gameLog'
import { useWorldStore } from './stores/world'
import { useCombatStore } from './stores/combat'
import { useQuestStore } from './stores/quest'

const logStore = useGameLogStore()
const worldStore = useWorldStore()
const combatStore = useCombatStore()
const questStore = useQuestStore()

const currentActions = computed(() => {
  return combatStore.isCombatActive ? combatStore.combatActions : worldStore.availableActions
})

const currentActionHandler = computed(() => {
  return combatStore.isCombatActive ? combatStore.handleAction : worldStore.handleAction
})

onMounted(() => {
  // 检查是否有存档，如果没有则初始化新游戏
  const hasSave = localStorage.getItem('rxy_game_save')
  
  if (!hasSave) {
    // 初始化任务系统
    questStore.initializeQuests()
    
    logStore.addLog('你缓缓睁开双眼，发现自己身处一个陌生的山洞之中...', 'info')
    logStore.addLog('脑海中一片混沌，唯有手中的古剑传来一丝冰凉。', 'info')
    logStore.addLog(worldStore.currentLocation.description, 'info')
    
    // 自动接受初始任务
    if (questStore.availableQuests.includes('first_cultivation')) {
      questStore.acceptQuest('first_cultivation')
    }
  }
})
</script>

<template>
  <div class="h-screen w-screen bg-black text-white flex relative overflow-hidden">
    <!-- Main Content Area - 左侧 -->
    <div class="flex-1 flex flex-col min-h-0 border-r-2 border-white">
      
      <!-- Top: Game Log -->
      <MainDisplay />

      <!-- Bottom: Action Menu -->
      <ActionMenu 
        :actions="currentActions"
        :busy-state="worldStore.currentActionState"
        @trigger="currentActionHandler"
      />
    </div>

    <!-- Overlay UI - 右侧状态面板 -->
    <div class="relative z-20">
      <StatusPanel />
    </div>
    
    <!-- Background Decoration: Scanlines -->
    <div class="absolute inset-0 pointer-events-none opacity-10 z-0" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 3px);"></div>
    
    <!-- 奇遇事件弹窗 -->
    <AdventureEvent />
  </div>
</template>
