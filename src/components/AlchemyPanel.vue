<template>
  <div class="space-y-4">
    <!-- 炼丹等级信息 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">炼丹修为</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">炼丹等级：</span>
          <span class="pixel-text-value">{{ alchemyStore.alchemyLevel }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">经验：</span>
          <span class="pixel-text-value">{{ alchemyStore.alchemyExp }} / {{ alchemyStore.alchemyExpToNext }}</span>
        </div>
        
        <div class="w-full bg-black border-2 border-white h-4">
          <div 
            class="bg-white h-full"
            :style="{ width: `${(alchemyStore.alchemyExp / alchemyStore.alchemyExpToNext) * 100}%` }"
          ></div>
        </div>
        
        <div class="pixel-text-label">
          成功率加成：{{ Math.floor(alchemyStore.successRate * 100) }}%
        </div>
      </div>
    </div>
    
    <!-- 炼制状态 -->
    <div v-if="alchemyStore.isRefining" class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">正在炼制</h3>
      
      <div class="space-y-3">
        <div class="pixel-text-value">
          炼制中：{{ getCurrentRecipe()?.name }}
        </div>
        
        <div class="w-full bg-black border-2 border-white h-4">
          <div 
            class="bg-white h-full"
            :style="{ width: `${alchemyStore.refinementProgress}%` }"
          ></div>
        </div>
        
        <div class="text-center pixel-text-subtitle">
          进度：{{ alchemyStore.refinementProgress }}%
        </div>
        
        <button
          @click="cancelRefinement"
          class="w-full pixel-button"
        >
          中断炼制
        </button>
      </div>
    </div>
    
    <!-- 可用配方 -->
    <div v-if="!alchemyStore.isRefining" class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">丹方列表</h3>
      
      <div v-if="alchemyStore.availableRecipes.length === 0" class="pixel-text-label text-center py-4">
        暂无可用配方
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="recipe in alchemyStore.availableRecipes"
          :key="recipe.id"
          class="pixel-container p-2"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="pixel-text-value">{{ recipe.name }}</h4>
            <span class="pixel-text-label px-2 py-1 border border-white">
              {{ recipe.grade }}品丹药
            </span>
          </div>
          
          <div class="pixel-text-subtitle mb-3">
            {{ recipe.description }}
          </div>
          
          <!-- 材料需求 -->
          <div class="mb-3">
            <div class="pixel-text-subtitle mb-1">所需材料：</div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="material in recipe.materials"
                :key="material.itemId"
                :class="[
                  'pixel-text-label p-2 border-2',
                  hasEnoughMaterial(material) ? 'border-white' : 'border-white opacity-50'
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
          <div class="flex items-center justify-between pixel-text-label mb-3">
            <span>成功率：{{ Math.floor(getRecipeSuccessRate(recipe) * 100) }}%</span>
            <span>耗时：{{ Math.floor(recipe.refinementTime / 1000) }}秒</span>
          </div>
          
          <button
            @click="startRefinement(recipe.id)"
            :disabled="!canRefineRecipe(recipe)"
            :class="[
              'w-full pixel-button',
              !canRefineRecipe(recipe) && 'opacity-50 cursor-not-allowed'
            ]"
          >
            {{ canRefineRecipe(recipe) ? '开始炼制' : '材料不足' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 炼丹统计 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">炼丹统计</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ alchemyStore.refinementStats.totalAttempts }}</div>
          <div class="pixel-text-label">总尝试</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ alchemyStore.refinementStats.successfulRefinements }}</div>
          <div class="pixel-text-label">成功次数</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ alchemyStore.refinementStats.perfectPills }}</div>
          <div class="pixel-text-label">完美丹药</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ alchemyStore.refinementStats.failedAttempts }}</div>
          <div class="pixel-text-label">失败次数</div>
        </div>
      </div>
      
      <div v-if="alchemyStore.refinementStats.totalAttempts > 0" class="mt-3 text-center pixel-text-label">
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