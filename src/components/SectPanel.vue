<template>
  <div class="space-y-4">
    <!-- 当前门派信息 -->
    <div v-if="sectStore.currentSect" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-blue-400 mb-3">当前门派</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-300">门派：</span>
          <span class="text-white font-medium">{{ sectStore.currentSectInfo?.name }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-300">地位：</span>
          <span class="text-yellow-400">{{ sectStore.currentSectRank?.rank || '外门弟子' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-300">声望：</span>
          <span class="text-green-400">{{ sectStore.currentSectReputation }}</span>
        </div>
        
        <div class="text-sm text-gray-400 mt-2">
          {{ sectStore.currentSectInfo?.description }}
        </div>
      </div>
      
      <!-- 门派特权 -->
      <div v-if="sectStore.currentSectRank?.benefits" class="mt-3">
        <div class="text-sm text-gray-300 mb-1">当前特权：</div>
        <div class="text-xs text-blue-300">
          {{ sectStore.currentSectRank.benefits.join('、') }}
        </div>
      </div>
    </div>
    
    <!-- 可学习技能 -->
    <div v-if="sectStore.availableSectSkills.length > 0" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-purple-400 mb-3">门派武学</h3>
      
      <div class="space-y-2">
        <div
          v-for="skill in sectStore.availableSectSkills"
          :key="skill.id"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <div class="flex-1">
            <div class="text-white font-medium">{{ skill.name }}</div>
            <div class="text-sm text-gray-400">{{ skill.description }}</div>
          </div>
          <button
            @click="learnSkill(skill.id)"
            class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            学习
          </button>
        </div>
      </div>
    </div>
    
    <!-- 门派任务 -->
    <div v-if="sectStore.availableSectTasks.length > 0" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-green-400 mb-3">门派任务</h3>
      
      <div class="space-y-2">
        <div
          v-for="task in sectStore.availableSectTasks"
          :key="task.id"
          class="flex items-center justify-between p-2 bg-gray-700 rounded"
        >
          <div class="flex-1">
            <div class="text-white font-medium">{{ task.name }}</div>
            <div class="text-sm text-gray-400">{{ task.description }}</div>
            <div class="text-xs text-green-300 mt-1">
              奖励：经验 {{ task.rewards.xp }}
              <span v-if="task.rewards.reputation">
                、声望 {{ Object.values(task.rewards.reputation)[0] }}
              </span>
              <span v-if="task.rewards.gold">、{{ task.rewards.gold }}金</span>
            </div>
          </div>
          <button
            @click="completeTask(task.id)"
            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
    
    <!-- 可加入门派 -->
    <div v-if="!sectStore.currentSect" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-yellow-400 mb-3">可加入门派</h3>
      
      <div class="space-y-3">
        <div
          v-for="sectId in sectStore.availableSects"
          :key="sectId"
          class="border border-gray-600 rounded p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-white font-medium">{{ getSectData(sectId)?.name }}</h4>
            <span :class="getSectTypeColor(getSectData(sectId)?.type)" class="text-sm px-2 py-1 rounded">
              {{ getSectTypeText(getSectData(sectId)?.type) }}
            </span>
          </div>
          
          <div class="text-sm text-gray-400 mb-3">
            {{ getSectData(sectId)?.description }}
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-500">
              要求：{{ formatJoinRequirements(getSectData(sectId)?.joinRequirements) }}
            </div>
            
            <button
              @click="joinSect(sectId)"
              :disabled="!sectStore.canJoinSect(sectId).canJoin"
              :class="[
                'px-3 py-1 text-sm rounded transition-colors',
                sectStore.canJoinSect(sectId).canJoin
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              ]"
            >
              {{ sectStore.canJoinSect(sectId).canJoin ? '加入' : '条件不足' }}
            </button>
          </div>
          
          <div v-if="!sectStore.canJoinSect(sectId).canJoin" class="text-xs text-red-400 mt-1">
            {{ sectStore.canJoinSect(sectId).reason }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 离开门派按钮 -->
    <div v-if="sectStore.currentSect" class="text-center">
      <button
        @click="leaveSect"
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
      >
        离开门派
      </button>
      <div class="text-xs text-gray-500 mt-1">
        警告：离开门派将失去所有声望和特权
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSectStore } from '../stores/sect'
import { sectData } from '../game/sects'

const sectStore = useSectStore()

// 获取门派数据
function getSectData(sectId) {
  return sectData[sectId]
}

// 获取门派类型颜色
function getSectTypeColor(type) {
  switch (type) {
    case 'righteous': return 'bg-blue-600 text-blue-100'
    case 'demonic': return 'bg-red-600 text-red-100'
    case 'neutral': return 'bg-gray-600 text-gray-100'
    default: return 'bg-gray-600 text-gray-100'
  }
}

// 获取门派类型文本
function getSectTypeText(type) {
  switch (type) {
    case 'righteous': return '正道'
    case 'demonic': return '魔道'
    case 'neutral': return '中立'
    default: return '未知'
  }
}

// 格式化加入要求
function formatJoinRequirements(requirements) {
  if (!requirements) return '无特殊要求'
  
  const reqs = []
  
  if (requirements.level) {
    reqs.push(`${requirements.level}级`)
  }
  
  if (requirements.cultivation) {
    reqs.push(requirements.cultivation)
  }
  
  if (requirements.intelligence) {
    reqs.push(`悟性${requirements.intelligence}`)
  }
  
  if (requirements.alignment) {
    const alignmentText = {
      'good': '善良阵营',
      'evil': '邪恶阵营',
      'neutral': '中立阵营'
    }
    reqs.push(alignmentText[requirements.alignment] || requirements.alignment)
  }
  
  return reqs.length > 0 ? reqs.join('、') : '无特殊要求'
}

// 加入门派
function joinSect(sectId) {
  sectStore.joinSect(sectId)
}

// 离开门派
function leaveSect() {
  if (confirm('确定要离开门派吗？这将失去所有声望和特权！')) {
    sectStore.leaveSect()
  }
}

// 学习技能
function learnSkill(skillId) {
  sectStore.learnSectSkill(skillId)
}

// 完成任务
function completeTask(taskId) {
  sectStore.completeSectTask(taskId)
}
</script>