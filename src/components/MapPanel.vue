<template>
  <div class="space-y-4">
    <!-- 当前位置信息 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">当前位置</h3>
      
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">地点：</span>
          <span class="pixel-text-value">{{ worldStore.currentLocation?.name }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">区域：</span>
          <span class="pixel-text-value">{{ worldStore.currentLocation?.region }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="pixel-text-subtitle">危险度：</span>
          <span class="pixel-text-value">{{ getDangerText(worldStore.currentLocation?.dangerLevel) }}</span>
        </div>
      </div>
      
      <div class="pixel-divider"></div>
      
      <div class="pixel-text-subtitle">
        {{ worldStore.currentLocation?.description }}
      </div>
    </div>
    
    <!-- 可达位置 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">可前往</h3>
      
      <div v-if="!availableExits.length" class="pixel-text-label text-center py-2">
        暂无可前往的位置
      </div>
      
      <div v-else class="space-y-2">
        <button
          v-for="exit in availableExits"
          :key="exit.id"
          @click="worldStore.moveTo(exit.id)"
          class="w-full pixel-button text-left"
        >
          <span class="mr-2">→</span>
          {{ exit.name }}
          <span class="pixel-text-label ml-2">({{ exit.region }})</span>
        </button>
      </div>
    </div>
    
    <!-- 区域地图 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">区域地图</h3>
      
      <div class="space-y-3">
        <div
          v-for="region in regions"
          :key="region.name"
          class="pixel-container p-2"
        >
          <h4 class="pixel-text-subtitle mb-2">{{ region.name }}</h4>
          
          <div class="space-y-1">
            <div
              v-for="location in region.locations"
              :key="location.id"
              :class="[
                'flex justify-between items-center p-1 pixel-list-item',
                location.id === worldStore.currentLocationId && 'bg-white text-black'
              ]"
              @click="location.id === worldStore.currentLocationId ? null : quickTravel(location.id)"
            >
              <div class="flex items-center">
                <span class="mr-2">{{ location.id === worldStore.currentLocationId ? '●' : '○' }}</span>
                <span>{{ location.name }}</span>
              </div>
              <span class="pixel-text-label">
                {{ getDangerLevel(location.dangerLevel) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 探索统计 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">探索进度</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ visitedCount }}</div>
          <div class="pixel-text-label">已探索</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold pixel-text-value">{{ totalCount }}</div>
          <div class="pixel-text-label">总地点</div>
        </div>
      </div>
      
      <div class="mt-3">
        <div class="w-full bg-black border-2 border-white h-4">
          <div 
            class="bg-white h-full"
            :style="{ width: `${explorationProgress}%` }"
          ></div>
        </div>
        <div class="text-center pixel-text-label mt-1">
          探索度：{{ explorationProgress }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWorldStore } from '../stores/world'
import { usePlayerStore } from '../stores/player'
import { mapData } from '../game/map'

const worldStore = useWorldStore()
const playerStore = usePlayerStore()

// 按区域分组的地点
const regions = computed(() => {
  const regionMap = {}
  
  Object.values(mapData).forEach(location => {
    const regionName = location.region
    if (!regionMap[regionName]) {
      regionMap[regionName] = {
        name: regionName,
        locations: []
      }
    }
    regionMap[regionName].locations.push(location)
  })
  
  // 按危险度排序每个区域的地点
  Object.values(regionMap).forEach(region => {
    region.locations.sort((a, b) => a.dangerLevel - b.dangerLevel)
  })
  
  return Object.values(regionMap)
})

// 当前可前往的位置
const availableExits = computed(() => {
  const exits = worldStore.currentLocation?.exits || {}
  return Object.values(exits).map(locationId => mapData[locationId]).filter(Boolean)
})

// 探索统计
const visitedLocations = computed(() => {
  // 从玩家数据中获取已访问的位置
  const playerData = playerStore.adventureData || { visitedLocations: [] }
  const visited = new Set(playerData.visitedLocations || [])
  
  // 确保当前位置被标记为已访问
  visited.add(worldStore.currentLocationId)
  
  return visited
})

const visitedCount = computed(() => visitedLocations.value.size)
const totalCount = computed(() => Object.keys(mapData).length)
const explorationProgress = computed(() => 
  Math.floor((visitedCount.value / totalCount.value) * 100)
)

// 获取危险度文本
function getDangerText(level) {
  if (level === 0) return '安全'
  if (level <= 2) return '较低'
  if (level <= 5) return '中等'
  if (level <= 8) return '较高'
  return '极高'
}

// 获取危险度等级显示
function getDangerLevel(level) {
  return `Lv.${level}`
}

// 快速旅行（如果已访问过）
function quickTravel(locationId) {
  // 这里可以添加快速旅行的逻辑
  // 暂时只显示信息
  console.log(`尝试快速旅行到: ${locationId}`)
}
</script>