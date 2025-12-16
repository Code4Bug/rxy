<template>
  <div class="space-y-4">
    <!-- 背包信息 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">背包</h3>
      
      <div class="flex justify-between items-center mb-2">
        <span class="pixel-text-subtitle">容量：</span>
        <span class="pixel-text-value">{{ player.inventory.length }}/{{ maxCapacity }}</span>
      </div>
      
      <div class="w-full bg-black border-2 border-white h-4">
        <div 
          class="bg-white h-full"
          :style="{ width: `${(player.inventory.length / maxCapacity) * 100}%` }"
        ></div>
      </div>
    </div>
    
    <!-- 物品分类 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">物品分类</h3>
      
      <div class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[
            'pixel-button text-xs',
            { 'active': activeCategory === category.id }
          ]"
        >
          {{ category.name }}
        </button>
      </div>
      
      <div class="pixel-divider"></div>
      
      <!-- 物品列表 -->
      <div class="space-y-2 max-h-80 overflow-y-auto">
        <div v-if="filteredItems.length === 0" class="pixel-text-label text-center py-4">
          {{ activeCategory === 'all' ? '背包空空如也' : '此分类暂无物品' }}
        </div>
        
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="pixel-container p-2"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h4 class="pixel-text-value">{{ getItemName(item.id) }}</h4>
              <p class="pixel-text-label">{{ getItemType(item.id) }}</p>
            </div>
            <div class="text-right">
              <span class="pixel-text-value">x{{ item.count }}</span>
            </div>
          </div>
          
          <div class="pixel-text-subtitle mb-2">
            {{ getItemDescription(item.id) }}
          </div>
          
          <!-- 物品属性 -->
          <div v-if="getItemStats(item.id)" class="mb-2">
            <div class="pixel-text-label mb-1">属性加成：</div>
            <div class="grid grid-cols-2 gap-1 text-xs">
              <div v-for="(value, stat) in getItemStats(item.id)" :key="stat">
                <span class="pixel-text-label">{{ getStatName(stat) }}:</span>
                <span class="pixel-text-value">+{{ value }}</span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              v-if="canUseItem(item.id)"
              @click="useItem(item.id)"
              class="pixel-button text-xs flex-1"
            >
              {{ getUseButtonText(item.id) }}
            </button>
            
            <button
              v-if="canEquipItem(item.id)"
              @click="equipItem(item.id)"
              class="pixel-button text-xs flex-1"
            >
              装备
            </button>
            
            <button
              @click="dropItem(item.id)"
              class="pixel-button text-xs"
            >
              丢弃
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背包统计 -->
    <div class="pixel-container p-3">
      <h3 class="pixel-text-title mb-3">物品统计</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-xl font-bold pixel-text-value">{{ itemStats.weapons }}</div>
          <div class="pixel-text-label">武器</div>
        </div>
        
        <div class="text-center">
          <div class="text-xl font-bold pixel-text-value">{{ itemStats.consumables }}</div>
          <div class="pixel-text-label">消耗品</div>
        </div>
        
        <div class="text-center">
          <div class="text-xl font-bold pixel-text-value">{{ itemStats.materials }}</div>
          <div class="pixel-text-label">材料</div>
        </div>
        
        <div class="text-center">
          <div class="text-xl font-bold pixel-text-value">{{ itemStats.misc }}</div>
          <div class="pixel-text-label">其他</div>
        </div>
      </div>
      
      <div class="pixel-divider"></div>
      
      <div class="flex justify-between">
        <span class="pixel-text-subtitle">总价值：</span>
        <span class="pixel-text-value">{{ totalValue }}金</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { itemData } from '../game/items'

const player = usePlayerStore()
const worldStore = useWorldStore()

// 背包容量
const maxCapacity = 50

// 当前选中的分类
const activeCategory = ref('all')

// 物品分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'weapon', name: '武器' },
  { id: 'armor', name: '防具' },
  { id: 'consumable', name: '消耗品' },
  { id: 'material', name: '材料' },
  { id: 'misc', name: '其他' }
]

// 过滤后的物品
const filteredItems = computed(() => {
  if (activeCategory.value === 'all') {
    return player.inventory
  }
  
  return player.inventory.filter(item => {
    const itemInfo = itemData[item.id]
    return itemInfo && itemInfo.type === activeCategory.value
  })
})

// 物品统计
const itemStats = computed(() => {
  const stats = {
    weapons: 0,
    consumables: 0,
    materials: 0,
    misc: 0
  }
  
  player.inventory.forEach(item => {
    const itemInfo = itemData[item.id]
    if (itemInfo) {
      switch (itemInfo.type) {
        case 'weapon':
          stats.weapons += item.count
          break
        case 'consumable':
          stats.consumables += item.count
          break
        case 'material':
          stats.materials += item.count
          break
        default:
          stats.misc += item.count
      }
    }
  })
  
  return stats
})

// 总价值
const totalValue = computed(() => {
  return player.inventory.reduce((total, item) => {
    const itemInfo = itemData[item.id]
    const value = itemInfo?.value || 0
    return total + (value * item.count)
  }, 0)
})

// 获取物品信息的辅助函数
function getItemName(itemId) {
  return itemData[itemId]?.name || itemId
}

function getItemType(itemId) {
  const typeNames = {
    weapon: '武器',
    armor: '防具',
    accessory: '饰品',
    consumable: '消耗品',
    material: '材料',
    misc: '杂物'
  }
  return typeNames[itemData[itemId]?.type] || '未知'
}

function getItemDescription(itemId) {
  return itemData[itemId]?.description || '暂无描述'
}

function getItemStats(itemId) {
  return itemData[itemId]?.stats
}

function getStatName(stat) {
  const statNames = {
    attack: '攻击',
    defense: '防御',
    maxHp: '生命',
    maxMp: '内力',
    agility: '身法'
  }
  return statNames[stat] || stat
}

function canUseItem(itemId) {
  const item = itemData[itemId]
  return item && (item.type === 'consumable' || item.effect)
}

function canEquipItem(itemId) {
  const item = itemData[itemId]
  return item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')
}

function getUseButtonText(itemId) {
  const item = itemData[itemId]
  if (item?.type === 'consumable') {
    return '使用'
  }
  if (item?.effect?.includes('learn_skill')) {
    return '学习'
  }
  return '使用'
}

function useItem(itemId) {
  worldStore.useItem(itemId)
}

function equipItem(itemId) {
  player.equipItem(itemId)
}

function dropItem(itemId) {
  if (confirm(`确定要丢弃【${getItemName(itemId)}】吗？`)) {
    player.removeItem(itemId, 1)
  }
}
</script>