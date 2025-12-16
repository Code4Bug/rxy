<script setup>
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { useCombatStore } from '../stores/combat'
import { itemData } from '../game/items'
import { skillData } from '../game/skills'
import { computed, ref } from 'vue'
import SectPanel from './SectPanel.vue'
import AlchemyPanel from './AlchemyPanel.vue'
import QuestPanel from './QuestPanel.vue'
import MapPanel from './MapPanel.vue'
import SavePanel from './SavePanel.vue'
import InventoryPanel from './InventoryPanel.vue'

const player = usePlayerStore()
const worldStore = useWorldStore()
const combatStore = useCombatStore()

// 当前激活的标签页
const activeTab = ref('status')

// 标签页配置
const tabs = [
  { id: 'status', name: '状态' },
  { id: 'inventory', name: '背包' },
  { id: 'map', name: '地图' },
  { id: 'quest', name: '任务' },
  { id: 'sect', name: '门派' },
  { id: 'alchemy', name: '炼丹' },
  { id: 'save', name: '存档' }
]

const itemNames = computed(() => {
  const map = {}
  for (const key in itemData) {
    map[key] = itemData[key].name
  }
  return map
})

const skillNames = computed(() => {
  const map = {}
  for (const key in skillData) {
    map[key] = skillData[key].name
  }
  return map
})

function handleUseItem(itemId) {
  worldStore.useItem(itemId)
}
</script>

<template>
  <div class="w-96 h-screen overflow-hidden flex flex-col pixel-container border-l-0">
    <!-- 标签页导航 -->
    <div class="flex">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'pixel-tab flex-1',
          { 'active': activeTab === tab.id }
        ]"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- 标签页内容 -->
    <div class="flex-1 overflow-y-auto pixel-panel border-t-0">
      <!-- 角色状态页 -->
      <div v-if="activeTab === 'status'">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="pixel-text-title">{{ player.name }}</h2>
            <p class="pixel-text-label">[{{ player.title }}]</p>
          </div>
          <div class="text-right">
            <p class="pixel-text-value">{{ player.stats.cultivation }}</p>
          </div>
        </div>
        <div class="pixel-divider"></div>

        <!-- Location Info -->
        <div class="mb-4">
          <div class="flex justify-between items-end">
            <div>
              <span class="pixel-text-label block">LOCATION</span>
              <span class="pixel-text-value">{{ worldStore.currentLocation?.name }}</span>
            </div>
            <div class="text-right">
               <span class="pixel-text-label block">REGION</span>
               <span class="pixel-text-subtitle">{{ worldStore.currentLocation?.region || 'Unknown' }}</span>
            </div>
          </div>
          <div class="mt-1 flex justify-between items-center">
            <span class="pixel-text-label">DANGER</span>
            <span class="pixel-text-value">LV.{{ worldStore.currentLocation?.dangerLevel || 0 }}</span>
          </div>
        </div>
        <div class="pixel-divider"></div>
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="pixel-text-subtitle">HP</span>
            <span class="pixel-text-value">{{ player.stats.hp }}/{{ player.stats.maxHp }}</span>
          </div>
          <div class="flex justify-between">
            <span class="pixel-text-subtitle">MP</span>
            <span class="pixel-text-value">{{ player.stats.mp }}/{{ player.stats.maxMp }}</span>
          </div>
          
          <div class="pixel-divider"></div>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="pixel-text-label block">ATK</span>
              <span class="pixel-text-value">{{ player.stats.attack }}</span>
            </div>
            <div>
              <span class="pixel-text-label block">DEF</span>
              <span class="pixel-text-value">{{ player.stats.defense }}</span>
            </div>
            <div>
              <span class="pixel-text-label block">AGI</span>
              <span class="pixel-text-value">{{ player.stats.agility }}</span>
            </div>
          </div>
          
          <div class="pixel-divider"></div>

          <!-- Equipment -->
          <div class="mb-4">
            <h3 class="pixel-text-subtitle mb-2">EQUIPMENT</h3>
            <div class="space-y-1">
              <div class="flex justify-between pixel-list-item" @click="player.unequipItem('weapon')">
                <span class="pixel-text-label">WEAPON</span>
                <span>{{ player.equipment.weapon ? (itemNames[player.equipment.weapon] || player.equipment.weapon) : '-' }}</span>
              </div>
              <div class="flex justify-between pixel-list-item" @click="player.unequipItem('armor')">
                <span class="pixel-text-label">ARMOR</span>
                <span>{{ player.equipment.armor ? (itemNames[player.equipment.armor] || player.equipment.armor) : '-' }}</span>
              </div>
              <div class="flex justify-between pixel-list-item" @click="player.unequipItem('accessory')">
                <span class="pixel-text-label">ACC</span>
                <span>{{ player.equipment.accessory ? (itemNames[player.equipment.accessory] || player.equipment.accessory) : '-' }}</span>
              </div>
            </div>
          </div>
          
          <div class="pixel-divider"></div>
          
          <!-- Enemy Info (during combat) -->
          <div v-if="combatStore.isCombatActive && combatStore.currentEnemy" class="mb-4">
            <h3 class="pixel-text-subtitle mb-2">ENEMY</h3>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="pixel-text-label">NAME</span>
                <span class="pixel-text-value">{{ combatStore.currentEnemy.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="pixel-text-label">LEVEL</span>
                <span class="pixel-text-value">{{ combatStore.currentEnemy.level }}</span>
              </div>
              <div class="flex justify-between">
                <span class="pixel-text-label">HP</span>
                <span class="pixel-text-value">{{ combatStore.currentEnemy.hp }}/{{ combatStore.currentEnemy.maxHp }}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="pixel-text-subtitle mb-2">SKILLS</h3>
            <div v-if="player.skills.length === 0" class="pixel-text-label italic">
              [NONE]
            </div>
            <div v-else class="space-y-1">
              <div 
                v-for="skill in player.skills" 
                :key="skill.id"
                class="flex justify-between items-center pixel-list-item"
              >
                <span>{{ skillNames[skill.id] || skill.id }}</span>
                <span>Lv.{{ skill.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 背包页 -->
      <div v-else-if="activeTab === 'inventory'">
        <InventoryPanel />
      </div>
      
      <!-- 地图页 -->
      <div v-else-if="activeTab === 'map'">
        <MapPanel />
      </div>
      
      <!-- 任务页 -->
      <div v-else-if="activeTab === 'quest'">
        <QuestPanel />
      </div>
      
      <!-- 门派页 -->
      <div v-else-if="activeTab === 'sect'">
        <SectPanel />
      </div>
      
      <!-- 炼丹页 -->
      <div v-else-if="activeTab === 'alchemy'">
        <AlchemyPanel />
      </div>
      
      <!-- 存档页 -->
      <div v-else-if="activeTab === 'save'">
        <SavePanel />
      </div>
    </div>
  </div>
</template>