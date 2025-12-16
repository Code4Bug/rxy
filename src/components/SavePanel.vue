<template>
  <div class="space-y-4">
    <!-- 当前存档信息 -->
    <div v-if="saveInfo" class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">当前存档</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">角色：</span>
          <span class="pixel-text-value">{{ saveInfo.playerName }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">境界：</span>
          <span class="pixel-text-value">{{ saveInfo.cultivation }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">位置：</span>
          <span class="pixel-text-value">{{ getLocationName(saveInfo.location) }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">保存时间：</span>
          <span class="pixel-text-label">{{ formatTime(saveInfo.timestamp) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">存档状态</h3>
      <div class="pixel-text-label text-center py-4">
        暂无存档数据
      </div>
    </div>
    
    <!-- 存档操作 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">存档操作</h3>
      
      <div class="space-y-2">
        <button
          @click="saveGame"
          class="w-full pixel-button"
          :disabled="isSaving"
        >
          {{ isSaving ? '保存中...' : '手动保存' }}
        </button>
        
        <button
          v-if="saveInfo"
          @click="loadGame"
          class="w-full pixel-button"
          :disabled="isLoading"
        >
          {{ isLoading ? '加载中...' : '重新加载' }}
        </button>
        
        <button
          @click="newGame"
          class="w-full pixel-button"
        >
          新游戏
        </button>
      </div>
    </div>
    
    <!-- 导入导出 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">存档管理</h3>
      
      <div class="space-y-2">
        <button
          v-if="saveInfo"
          @click="exportSave"
          class="w-full pixel-button"
        >
          导出存档
        </button>
        
        <div class="relative">
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileImport"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
          <button class="w-full pixel-button">
            导入存档
          </button>
        </div>
        
        <button
          v-if="saveInfo"
          @click="deleteSave"
          class="w-full pixel-button"
        >
          删除存档
        </button>
      </div>
    </div>
    
    <!-- 自动保存设置 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">自动保存</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="pixel-text-subtitle">状态：</span>
          <span class="pixel-text-value">{{ autoSaveEnabled ? '已启用' : '已禁用' }}</span>
        </div>
        
        <button
          @click="toggleAutoSave"
          class="w-full pixel-button"
        >
          {{ autoSaveEnabled ? '禁用自动保存' : '启用自动保存' }}
        </button>
        
        <div class="pixel-text-label text-center">
          自动保存间隔：30秒
        </div>
      </div>
    </div>
    
    <!-- 操作提示 -->
    <div v-if="message" class="pixel-container p-3">
      <div :class="[
        'pixel-text-subtitle text-center',
        messageType === 'success' ? '' : 'text-red-400'
      ]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useCombatStore } from '../stores/combat'
import { useGameLogStore } from '../stores/gameLog'
import { useQuestStore } from '../stores/quest'
import { useAlchemyStore } from '../stores/alchemy'
import { useSectStore } from '../stores/sect'
import { useAdventureStore } from '../stores/adventure'
import { SaveManager, AutoSaveManager } from '../utils/saveManager'
import { mapData } from '../game/map'

// 获取所有store
const player = usePlayerStore()
const world = useWorldStore()
const combat = useCombatStore()
const gameLog = useGameLogStore()
const quest = useQuestStore()
const alchemy = useAlchemyStore()
const sect = useSectStore()
const adventure = useAdventureStore()

const stores = {
  player,
  world,
  combat,
  gameLog,
  quest,
  alchemy,
  sect,
  adventure
}

// 响应式数据
const isSaving = ref(false)
const isLoading = ref(false)
const autoSaveEnabled = ref(true)
const message = ref('')
const messageType = ref('success')
const fileInput = ref(null)

// 存档信息
const saveInfo = computed(() => SaveManager.getSaveInfo())

// 生命周期
onMounted(() => {
  // 启动自动保存
  if (autoSaveEnabled.value) {
    AutoSaveManager.start(stores)
  }
  
  // 尝试加载存档
  if (SaveManager.hasSaveData()) {
    SaveManager.loadGame(stores)
    showMessage('存档加载成功', 'success')
  }
})

onUnmounted(() => {
  // 停止自动保存
  AutoSaveManager.stop()
})

// 方法
function showMessage(msg, type = 'success') {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

function getLocationName(locationId) {
  return mapData[locationId]?.name || '未知位置'
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN')
}

async function saveGame() {
  isSaving.value = true
  try {
    const success = SaveManager.saveGame(stores)
    if (success) {
      showMessage('游戏保存成功', 'success')
    } else {
      showMessage('保存失败', 'error')
    }
  } finally {
    isSaving.value = false
  }
}

async function loadGame() {
  isLoading.value = true
  try {
    const success = SaveManager.loadGame(stores)
    if (success) {
      showMessage('游戏加载成功', 'success')
    } else {
      showMessage('加载失败', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

function newGame() {
  if (confirm('确定要开始新游戏吗？当前进度将会丢失！')) {
    const success = SaveManager.newGame(stores)
    if (success) {
      showMessage('新游戏已开始', 'success')
      // 重新初始化游戏
      gameLog.addLog('你缓缓睁开双眼，发现自己身处一个陌生的山洞之中...', 'info')
      gameLog.addLog('脑海中一片混沌，唯有手中的古剑传来一丝冰凉。', 'info')
      gameLog.addLog(world.currentLocation.description, 'info')
    } else {
      showMessage('创建新游戏失败', 'error')
    }
  }
}

function exportSave() {
  const success = SaveManager.exportSave()
  if (success) {
    showMessage('存档导出成功', 'success')
  } else {
    showMessage('导出失败', 'error')
  }
}

async function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    await SaveManager.importSave(file, stores)
    showMessage('存档导入成功', 'success')
  } catch (error) {
    showMessage(`导入失败: ${error.message}`, 'error')
  }
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function deleteSave() {
  if (confirm('确定要删除存档吗？此操作不可恢复！')) {
    const success = SaveManager.deleteSave()
    if (success) {
      showMessage('存档已删除', 'success')
    } else {
      showMessage('删除失败', 'error')
    }
  }
}

function toggleAutoSave() {
  autoSaveEnabled.value = !autoSaveEnabled.value
  
  if (autoSaveEnabled.value) {
    AutoSaveManager.start(stores)
    showMessage('自动保存已启用', 'success')
  } else {
    AutoSaveManager.stop()
    showMessage('自动保存已禁用', 'success')
  }
}
</script>