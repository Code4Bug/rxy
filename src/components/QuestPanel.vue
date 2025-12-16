<template>
  <div class="space-y-4">
    <!-- 主线任务进度 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">主线进度</h3>
      
      <div v-if="questStore.mainQuestProgress.current" class="space-y-2">
        <div class="pixel-text-value">
          {{ questStore.mainQuestProgress.current.name }}
        </div>
        <div class="pixel-text-subtitle">
          {{ questStore.mainQuestProgress.current.description }}
        </div>
        <div class="w-full bg-black border-2 border-white h-4">
          <div 
            class="bg-white h-full"
            :style="{ width: `${calculateProgress(questStore.mainQuestProgress.current)}%` }"
          ></div>
        </div>
        <div class="pixel-text-label">
          进度：{{ calculateProgress(questStore.mainQuestProgress.current) }}%
        </div>
      </div>
      
      <div v-else class="pixel-text-label text-center py-2">
        暂无进行中的主线任务
      </div>
      
      <div class="pixel-text-label mt-2">
        已完成主线：{{ questStore.mainQuestProgress.completed }} / {{ questStore.mainQuestProgress.total }}
      </div>
    </div>
    
    <!-- 活跃任务列表 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">进行中的任务</h3>
      
      <div v-if="questStore.activeQuests.length === 0" class="pixel-text-label text-center py-4">
        暂无进行中的任务
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="quest in questStore.activeQuests"
          :key="quest.id"
          class="pixel-container p-2"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="pixel-text-value">{{ quest.name }}</h4>
            <div class="flex items-center space-x-2">
              <span class="pixel-text-label px-2 py-1 border border-white">
                {{ getQuestTypeName(quest.type) }}
              </span>
              <button
                v-if="quest.type !== 'main'"
                @click="abandonQuest(quest.id)"
                class="pixel-button text-xs"
              >
                放弃
              </button>
            </div>
          </div>
          
          <div class="pixel-text-subtitle mb-3">
            {{ quest.description }}
          </div>
          
          <!-- 任务目标 -->
          <div class="space-y-2">
            <div
              v-for="(objective, index) in quest.objectives"
              :key="index"
              class="pixel-text-subtitle"
            >
              <div class="flex items-center justify-between">
                <span :class="isObjectiveCompleted(objective) ? 'line-through' : ''">
                  {{ objective.description }}
                </span>
                <span class="pixel-text-value">
                  {{ formatObjectiveProgress(objective) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 任务奖励 -->
          <div v-if="quest.rewards" class="mt-3 pixel-text-label">
            奖励：{{ formatRewards(quest.rewards) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可接受任务 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">可接受任务</h3>
      
      <div v-if="questStore.availableQuests.length === 0" class="pixel-text-label text-center py-4">
        暂无可接受的任务
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="questId in questStore.availableQuests"
          :key="questId"
          class="pixel-container p-2"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="pixel-text-value">{{ getQuestData(questId)?.name }}</h4>
            <span class="pixel-text-label px-2 py-1 border border-white">
              {{ getQuestTypeName(getQuestData(questId)?.type) }}
            </span>
          </div>
          
          <div class="pixel-text-subtitle mb-3">
            {{ getQuestData(questId)?.description }}
          </div>
          
          <!-- 任务目标预览 -->
          <div class="mb-3">
            <div class="pixel-text-label mb-1">任务目标：</div>
            <div class="space-y-1">
              <div
                v-for="(objective, index) in getQuestData(questId)?.objectives"
                :key="index"
                class="pixel-text-label"
              >
                • {{ objective.description }}
              </div>
            </div>
          </div>
          
          <!-- 任务奖励预览 -->
          <div v-if="getQuestData(questId)?.rewards" class="mb-3 pixel-text-label">
            奖励：{{ formatRewards(getQuestData(questId).rewards) }}
          </div>
          
          <button
            @click="acceptQuest(questId)"
            :disabled="!questStore.canAcceptQuest(questId).canAccept"
            :class="[
              'w-full pixel-button',
              !questStore.canAcceptQuest(questId).canAccept && 'opacity-50 cursor-not-allowed'
            ]"
          >
            {{ questStore.canAcceptQuest(questId).canAccept ? '接受任务' : '条件不足' }}
          </button>
          
          <div v-if="!questStore.canAcceptQuest(questId).canAccept" class="pixel-text-label mt-1">
            {{ questStore.canAcceptQuest(questId).reason }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已完成任务 -->
    <div v-if="questStore.completedQuests.length > 0" class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">已完成任务</h3>
      
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="quest in questStore.completedQuests.slice(-10)"
          :key="quest.id + quest.completedAt"
          class="flex items-center justify-between p-2 pixel-container"
        >
          <div class="flex-1">
            <div class="pixel-text-subtitle">{{ quest.name }}</div>
            <div class="pixel-text-label">
              {{ formatCompletedTime(quest.completedAt) }}
            </div>
          </div>
          <span class="pixel-text-label px-2 py-1 border border-white">
            {{ getQuestTypeName(quest.type) }}
          </span>
        </div>
      </div>
      
      <div class="pixel-text-label mt-2 text-center">
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