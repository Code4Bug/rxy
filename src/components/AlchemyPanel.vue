<template>
  <div class="space-y-4">
    <!-- 炼丹等级信息 -->
    <div class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-purple-400 mb-3">炼丹修为</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-300">炼丹等级：</span>
          <span class="text-white font-medium">{{ alchemyStore.alchemyLevel }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-300">经验：</span>
          <span class="text-green-400">{{ alchemyStore.alchemyExp }} / {{ alchemyStore.alchemyExpToNext }}</span>
        </div>
        
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div 
            class="bg-purple-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(alchemyStore.alchemyExp / alchemyStore.alchemyExpToNext) * 100}%` }"
          ></div>
        </div>
        
        <div class="text-sm text-gray-400">
          成功率加成：{{ Math.floor(alchemyStore.successRate * 100) }}%
        </div>
      </div>
    </div>
    
    <!-- 炼制状态 -->
    <div v-if="alchemyStore.isRefining" class="bg-gray-800 border border-yellow-600 rounded p-4">
      <h3 class="text-lg font-bold text-yellow-400 mb-3">正在炼制</h3>
      
      <div class="space-y-3">
        <div class="text-white">
          炼制中：{{ getCurrentRecipe()?.name }}
        </div>
        
        <div class="w-full bg-gray-700 rounded-full h-3">
          <div 
            class="bg-yellow-600 h-3 rounded-full transition-all duration-1000"
            :style="{ width: `${alchemyStore.refinementProgress}%` }"
          ></div>
        </div>
        
        <div class="text-center text-sm text-gray-300">
          进度：{{ alchemyStore.refinementProgress }}%
        </div>
        
        <button
          @click="cancelRefinement"
          class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          中断炼制
        </button>
      </div>
    </div>
    
    <!-- 可用配方 -->
    <div v-if="!alchemyStore.isRefining" class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-blue-400 mb-3">丹方列表</h3>
      
      <div v-if="alchemyStore.availableRecipes.length === 0" class="text-gray-400 text-center py-4">
        暂无可用配方
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="recipe in alchemyStore.availableRecipes"
          :key="recipe.id"
          class="border border-gray-600 rounded p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-white font-medium">{{ recipe.name }}</h4>
            <span :class="getGradeColor(recipe.grade)" class="text-sm px-2 py-1 rounded">
              {{ recipe.grade }}品丹药
            </span>
          </div>
          
          <div class="text-sm text-gray-400 mb-3">
            {{ recipe.description }}
          </div>
          
          <!-- 材料需求 -->
          <div class="mb-3">
            <div class="text-sm text-gray-300 mb-1">所需材料：</div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="material in recipe.materials"
                :key="material.itemId"
                :class="[
                  'text-xs p-2 rounded',
                  hasEnoughMaterial(material) ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                ]"
              >
                {{ material.name }} x{{ material.count }}
                <span class="ml-1">
                  ({{ getMaterialCount(material.itemId) }})
                </span>
              </div>
            </div>
          </div>
          
          <!-- 炼制信息 -->
          <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span>成功率：{{ Math.floor(getRecipeSuccessRate(recipe) * 100) }}%</span>
            <span>耗时：{{ Math.floor(recipe.refinementTime / 1000) }}秒</span>
          </div>
          
          <button
            @click="startRefinement(recipe.id)"
            :disabled="!canRefineRecipe(recipe)"
            :class="[
              'w-full px-3 py-2 text-sm rounded transition-colors',
              canRefineRecipe(recipe)
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            ]"
          >
            {{ canRefineRecipe(recipe) ? '开始炼制' : '材料不足' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 炼丹统计 -->
    <div class="bg-gray-800 border border-gray-600 rounded p-4">
      <h3 class="text-lg font-bold text-green-400 mb-3">炼丹统计</h3>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="text-center">
          <div class="text-2xl font-bold text-white">{{ alchemyStore.refinementStats.totalAttempts }}</div>
          <div class="text-gray-400">总尝试</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-green-400">{{ alchemyStore.refinementStats.successfulRefinements }}</div>
          <div class="text-gray-400">成功次数</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-400">{{ alchemyStore.refinementStats.perfectPills }}</div>
          <div class="text-gray-400">完美丹药</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-red-400">{{ alchemyStore.refinementStats.failedAttempts }}</div>
          <div class="text-gray-400">失败次数</div>
        </div>
      </div>
      
      <div v-if="alchemyStore.refinementStats.totalAttempts > 0" class="mt-3 text-center text-sm text-gray-400">
        成功率：{{ Math.floor((alchemyStore.refinementStats.successfulRefinements / alchemyStore.refinementStats.totalAttempts) * 100) }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAlchemyStore } from '../stores/alchemy'
import { usePlayerStore } from '../stores/player'
import { recipeData } from '../game/recipes'

const alchemyStore = useAlchemyStore()
const player = usePlayerStore()

// 获取当前炼制的配方
function getCurrentRecipe() {
  if (!alchemyStore.currentRefinement) return null
  return recipeData[alchemyStore.currentRefinement.recipeId]
}

// 获取品级颜色
function getGradeColor(grade) {
  switch (grade) {
    case 1: return 'bg-gray-600 text-gray-100'
    case 2: return 'bg-green-600 text-green-100'
    case 3: return 'bg-blue-600 text-blue-100'
    default: return 'bg-purple-600 text-purple-100'
  }
}

// 检查材料是否足够
function hasEnoughMaterial(material) {
  const playerItem = player.inventory.find(item => item.id === material.itemId)
  return playerItem && playerItem.count >= material.count
}

// 获取玩家拥有的材料数量
function getMaterialCount(itemId) {
  const playerItem = player.inventory.find(item => item.id === itemId)
  return playerItem ? playerItem.count : 0
}

// 检查是否可以炼制配方
function canRefineRecipe(recipe) {
  return alchemyStore.canRefine(recipe.id).canRefine
}

// 获取配方成功率
function getRecipeSuccessRate(recipe) {
  // 这里简化计算，实际应该调用 alchemyStore 的方法
  return Math.min(recipe.baseSuccessRate + (alchemyStore.alchemyLevel * 0.05), 0.95)
}

// 开始炼制
function startRefinement(recipeId) {
  alchemyStore.startRefining(recipeId)
}

// 取消炼制
function cancelRefinement() {
  if (confirm('确定要中断炼制吗？材料将会浪费！')) {
    alchemyStore.cancelRefinement()
  }
}
</script>