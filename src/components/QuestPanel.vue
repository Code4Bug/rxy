<template>
  <div class="space-y-4">
    <!-- 主线任务进度 -->
    <div class="bg-gray-800 border border-yellow-600 rounded p-4">
      <h3 class="text-lg font-bold text-yellow-400 mb-3">主线进度</h3>
      
      <div v-if="questStore.mainQuestProgress.current" class="space-y-2">
        <div class="text-white font-medium">
          {{ questStore.mainQuestProgress.current.name }}
        </div>
        <div class="text-sm text-gray-400">
          {{ questStore.mainQuestProgress.current.description }}
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div 
            class="bg-yellow-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${calculateProgress(questStore.mainQuestProgress.current)}%` }"
          ></div>
        </div>
        <div class="text-xs text-gray-400">
          进度：{{ calculateProgress(questStore.mainQuestProgress.current) }}%
        </div>
      </div>
      
      <div v-else class="text-gray-400 text-center py-2">
        暂无进行中的主线任务
      </div>
      
      <div class="text-xs text-gray-500 mt-2">
        已完成主线：{{ questStore.mainQuestProgress.completed }} / {{ questStore.mainQuestProgress.total }}
      </div>
    </div>
    
    <!-- 活跃任务列表 -->
    <div class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-blue-400 mb-3">进行中的任务</h3>
      
      <div v-if="questStore.activeQuests.length === 0" class="text-gray-400 text-center py-4">
        暂无进行中的任务
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="quest in questStore.activeQuests"
          :key="quest.id"
          class="border border-gray-600 rounded p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-white font-medium">{{ quest.name }}</h4>
            <div class="flex items-center space-x-2">
              <span :class="getQuestTypeColor(quest.type)" class="text-xs px-2 py-1 rounded">
                {{ getQuestTypeName(quest.type) }}
              </span>
              <button
                v-if="quest.type !== 'main'"
                @click="abandonQuest(quest.id)"
                class="text-red-400 hover:text-red-300 text-xs"
              >
                放弃
              </button>
            </div>
          </div>
          
          <div class="text-sm text-gray-400 mb-3">
            {{ quest.description }}
          </div>
          
          <!-- 任务目标 -->
          <div class="space-y-2">
            <div
              v-for="(objective, index) in quest.objectives"
              :key="index"
              class="text-sm"
            >
              <div class="flex items-center justify-between">
                <span :class="isObjectiveCompleted(objective) ? 'text-green-400 line-through' : 'text-gray-300'">
                  {{ objective.description }}
                </span>
                <span :class="isObjectiveCompleted(objective) ? 'text-green-400' : 'text-yellow-400'">
                  {{ formatObjectiveProgress(objective) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 任务奖励 -->
          <div v-if="quest.rewards" class="mt-3 text-xs text-green-300">
            奖励：{{ formatRewards(quest.rewards) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可接受任务 -->
    <div class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-green-400 mb-3">可接受任务</h3>
      
      <div v-if="questStore.availableQuests.length === 0" class="text-gray-400 text-center py-4">
        暂无可接受的任务
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="questId in questStore.availableQuests"
          :key="questId"
          class="border border-gray-600 rounded p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-white font-medium">{{ getQuestData(questId)?.name }}</h4>
            <span :class="getQuestTypeColor(getQuestData(questId)?.type)" class="text-xs px-2 py-1 rounded">
              {{ getQuestTypeName(getQuestData(questId)?.type) }}
            </span>
          </div>
          
          <div class="text-sm text-gray-400 mb-3">
            {{ getQuestData(questId)?.description }}
          </div>
          
          <!-- 任务目标预览 -->
          <div class="mb-3">
            <div class="text-xs text-gray-500 mb-1">任务目标：</div>
            <div class="space-y-1">
              <div
                v-for="(objective, index) in getQuestData(questId)?.objectives"
                :key="index"
                class="text-xs text-gray-400"
              >
                • {{ objective.description }}
              </div>
            </div>
          </div>
          
          <!-- 任务奖励预览 -->
          <div v-if="getQuestData(questId)?.rewards" class="mb-3 text-xs text-green-300">
            奖励：{{ formatRewards(getQuestData(questId).rewards) }}
          </div>
          
          <button
            @click="acceptQuest(questId)"
            :disabled="!questStore.canAcceptQuest(questId).canAccept"
            :class="[
              'w-full px-3 py-2 text-sm rounded transition-colors',
              questStore.canAcceptQuest(questId).canAccept
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            ]"
          >
            {{ questStore.canAcceptQuest(questId).canAccept ? '接受任务' : '条件不足' }}
          </button>
          
          <div v-if="!questStore.canAcceptQuest(questId).canAccept" class="text-xs text-red-400 mt-1">
            {{ questStore.canAcceptQuest(questId).reason }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已完成任务 -->
    <div v-if="questStore.completedQuests.length > 0" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-gray-400 mb-3">已完成任务</h3>
      
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="quest in questStore.completedQuests.slice(-10)"
          :key="quest.id + quest.completedAt"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <div class="flex-1">
            <div class="text-sm text-gray-300">{{ quest.name }}</div>
            <div class="text-xs text-gray-500">
              {{ formatCompletedTime(quest.completedAt) }}
            </div>
          </div>
          <span :class="getQuestTypeColor(quest.type)" class="text-xs px-2 py-1 rounded">
            {{ getQuestTypeName(quest.type) }}
          </span>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 mt-2 text-center">
        总计完成：{{ questStore.completedQuests.length }} 个任务
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuestStore } from '../stores/quest'
import { questData, questTypes } from '../game/quests'

const questStore = useQuestStore()

// 获取任务数据
function getQuestData(questId) {
  return questData[questId]
}

// 获取任务类型颜色
function getQuestTypeColor(type) {
  const colors = {
    'main': 'bg-yellow-600 text-yellow-100',
    'side': 'bg-blue-600 text-blue-100',
    'daily': 'bg-green-600 text-green-100',
    'achievement': 'bg-purple-600 text-purple-100'
  }
  return colors[type] || 'bg-gray-600 text-gray-100'
}

// 获取任务类型名称
function getQuestTypeName(type) {
  return questTypes[type]?.name || '未知'
}

// 计算任务进度
function calculateProgress(quest) {
  if (!quest.objectives || quest.objectives.length === 0) return 100
  
  let totalProgress = 0
  quest.objectives.forEach(objective => {
    let objProgress = 0
    if (Array.isArray(objective.current)) {
      objProgress = Math.min(objective.current.length / objective.required, 1)
    } else {
      objProgress = Math.min(objective.current / objective.required, 1)
    }
    totalProgress += objProgress
  })
  
  return Math.floor((totalProgress / quest.objectives.length) * 100)
}

// 检查目标是否完成
function isObjectiveCompleted(objective) {
  if (Array.isArray(objective.current)) {
    return objective.current.length >= objective.required
  } else {
    return objective.current >= objective.required
  }
}

// 格式化目标进度
function formatObjectiveProgress(objective) {
  if (Array.isArray(objective.current)) {
    return `${objective.current.length}/${objective.required}`
  } else {
    return `${objective.current}/${objective.required}`
  }
}

// 格式化奖励
function formatRewards(rewards) {
  const rewardTexts = []
  
  if (rewards.xp) {
    rewardTexts.push(`经验 ${rewards.xp}`)
  }
  
  if (rewards.gold) {
    rewardTexts.push(`${rewards.gold}金`)
  }
  
  if (rewards.items) {
    rewards.items.forEach(item => {
      rewardTexts.push(`${item.id} x${item.count}`)
    })
  }
  
  if (rewards.title) {
    rewardTexts.push(`称号：${rewards.title}`)
  }
  
  if (rewards.reputation) {
    Object.entries(rewards.reputation).forEach(([sect, amount]) => {
      rewardTexts.push(`${sect}声望 ${amount}`)
    })
  }
  
  return rewardTexts.join('、') || '无'
}

// 格式化完成时间
function formatCompletedTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${Math.floor(diff / 86400000)}天前`
  }
}

// 接受任务
function acceptQuest(questId) {
  questStore.acceptQuest(questId)
}

// 放弃任务
function abandonQuest(questId) {
  if (confirm('确定要放弃这个任务吗？')) {
    questStore.abandonQuest(questId)
  }
}
</script>