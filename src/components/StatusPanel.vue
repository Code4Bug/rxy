<script setup>
import { usePlayerStore } from '../stores/player'
import { useWorldStore } from '../stores/world'
import { itemData } from '../game/items'
import { skillData } from '../game/skills'
import { computed, ref } from 'vue'
import SectPanel from './SectPanel.vue'
import AlchemyPanel from './AlchemyPanel.vue'
import QuestPanel from './QuestPanel.vue'

const player = usePlayerStore()
const worldStore = useWorldStore()

// 当前激活的标签页
const activeTab = ref('status')

// 标签页配置
const tabs = [
  { id: 'status', name: '状态' },
  { id: 'quest', name: '任务' },
  { id: 'sect', name: '门派' },
  { id: 'alchemy', name: '炼丹' }
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
  <div class="fixed top-4 right-4 bg-black border-2 border-white w-80 shadow-none max-h-screen overflow-hidden flex flex-col">
    <!-- 标签页导航 -->
    <div class="flex border-b-2 border-white">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex-1 px-2 py-1 text-xs uppercase font-bold transition-none',
          activeTab === tab.id 
            ? 'bg-white text-black' 
            : 'bg-black text-white hover:bg-gray-800'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- 标签页内容 -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- 角色状态页 -->
      <div v-if="activeTab === 'status'">
        <div class="flex items-center justify-between mb-2 border-b-2 border-white pb-2">
          <div>
            <h2 class="text-lg font-bold uppercase tracking-widest">{{ player.name }}</h2>
            <p class="text-xs uppercase">[{{ player.title }}]</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold">{{ player.stats.cultivation }}</p>
          </div>
        </div>

        <!-- Location Info -->
        <div class="mb-4 border-b-2 border-white pb-2">
          <div class="flex justify-between items-end">
            <div>
              <span class="text-xs uppercase block text-gray-400">LOCATION</span>
              <span class="font-bold">{{ worldStore.currentLocation?.name }}</span>
            </div>
            <div class="text-right">
               <span class="text-xs uppercase block text-gray-400">REGION</span>
               <span class="text-xs">{{ worldStore.currentLocation?.region || 'Unknown' }}</span>
            </div>
          </div>
          <div class="mt-1 flex justify-between items-center text-xs">
            <span class="uppercase text-gray-400">DANGER</span>
            <span class="font-bold">LV.{{ worldStore.currentLocation?.dangerLevel || 0 }}</span>
          </div>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>HP</span>
            <span>{{ player.stats.hp }}/{{ player.stats.maxHp }}</span>
          </div>
          <div class="flex justify-between">
            <span>MP</span>
            <span>{{ player.stats.mp }}/{{ player.stats.maxMp }}</span>
          </div>
          
          <div class="h-0.5 bg-white my-2"></div>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-xs block uppercase">ATK</span>
              <span>{{ player.stats.attack }}</span>
            </div>
            <div>
              <span class="text-xs block uppercase">DEF</span>
              <span>{{ player.stats.defense }}</span>
            </div>
            <div>
              <span class="text-xs block uppercase">AGI</span>
              <span>{{ player.stats.agility }}</span>
            </div>
          </div>
          
          <div class="h-0.5 bg-white my-2"></div>

          <!-- Equipment -->
          <div class="mb-2">
            <h3 class="text-xs mb-1 uppercase underline decoration-2">EQUIPMENT</h3>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between cursor-pointer hover:bg-white hover:text-black px-1" @click="player.unequipItem('weapon')">
                <span class="text-gray-500">WEAPON</span>
                <span>{{ player.equipment.weapon ? (itemNames[player.equipment.weapon] || player.equipment.weapon) : '-' }}</span>
              </div>
              <div class="flex justify-between cursor-pointer hover:bg-white hover:text-black px-1" @click="player.unequipItem('armor')">
                <span class="text-gray-500">ARMOR</span>
                <span>{{ player.equipment.armor ? (itemNames[player.equipment.armor] || player.equipment.armor) : '-' }}</span>
              </div>
              <div class="flex justify-between cursor-pointer hover:bg-white hover:text-black px-1" @click="player.unequipItem('accessory')">
                <span class="text-gray-500">ACC</span>
                <span>{{ player.equipment.accessory ? (itemNames[player.equipment.accessory] || player.equipment.accessory) : '-' }}</span>
              </div>
            </div>
          </div>
          
          <div class="h-0.5 bg-white my-2"></div>
          
          <div>
            <h3 class="text-xs mb-1 uppercase underline decoration-2">INVENTORY</h3>
            <div v-if="player.inventory.length === 0" class="text-xs italic">
              [EMPTY]
            </div>
            <div v-else class="space-y-1">
              <div 
                v-for="item in player.inventory" 
                :key="item.id"
                class="flex justify-between items-center text-xs p-1 border border-transparent hover:border-white hover:bg-white hover:text-black cursor-pointer transition-none"
                @click="handleUseItem(item.id)"
              >
                <span>
                  {{ itemNames[item.id] || item.id }}
                </span>
                <span>x{{ item.count }}</span>
              </div>
            </div>
          </div>

          <div class="h-0.5 bg-white my-2"></div>
          
          <div>
            <h3 class="text-xs mb-1 uppercase underline decoration-2">SKILLS</h3>
            <div v-if="player.skills.length === 0" class="text-xs italic">
              [NONE]
            </div>
            <div v-else class="space-y-1">
              <div 
                v-for="skill in player.skills" 
                :key="skill.id"
                class="flex justify-between items-center text-xs p-1 border border-white"
              >
                <span>{{ skillNames[skill.id] || skill.id }}</span>
                <span>Lv.{{ skill.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 门派页 -->
      <div v-else-if="activeTab === 'sect'">
        <SectPanel />
      </div>
      
      <!-- 炼丹页 -->
      <div v-else-if="activeTab === 'alchemy'">
        <AlchemyPanel />
      </div>
      
      <!-- 任务页 -->
      <div v-else-if="activeTab === 'quest'">
        <QuestPanel />
      </div>
    </div>
  </div>
</template>