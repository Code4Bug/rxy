import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { itemData } from '../game/items'

export const usePlayerStore = defineStore('player', () => {
    const name = ref('任逍遥')
    const title = ref('无名小卒')

    // Base Attributes (Trainable)
    const baseStats = ref({
        maxHp: 100,
        maxMp: 50,
        attack: 10,
        defense: 5,
        agility: 5,
        maxXp: 100,
        level: 1,
        cultivation: '炼体境1重'
    })

    // Current Status (Fluctuating)
    const status = ref({
        hp: 100,
        mp: 50,
        xp: 0
    })

    // Equipment
    const equipment = ref({
        weapon: null, // itemId
        armor: null,  // itemId
        accessory: null // itemId
    })

    // Inventory
    const inventory = ref([])

    // Skills
    const skills = ref([])

    // 新增系统数据
    // 门派相关数据
    const sectData = ref({
        currentSect: null,
        sectReputations: {},
        sectRank: null
    })

    // 炼丹相关数据
    const alchemyData = ref({
        level: 1,
        exp: 0,
        knownRecipes: ['qi_gathering_pill'],
        successCount: 0
    })

    // 任务相关数据
    const questData = ref({
        activeQuests: [],
        completedQuests: [],
        questProgress: {}
    })

    // 奇遇相关数据
    const adventureData = ref({
        eventHistory: [],
        lastEventTime: 0,
        eventCooldowns: {}
    })

    // 扩展属性（福源、悟性等）
    const extendedStats = ref({
        fortune: 5,      // 福源，影响奇遇触发
        intelligence: 5, // 悟性，影响炼丹和学习
        alignment: 'neutral', // 阵营：good/neutral/evil
        gold: 100        // 金钱
    })

    // Computed effective stats
    const stats = computed(() => {
        let s = { ...baseStats.value, ...status.value, ...extendedStats.value }

        // Add equipment bonuses
        Object.values(equipment.value).forEach(itemId => {
            if (!itemId) return
            const item = itemData[itemId]
            if (item && item.stats) {
                if (item.stats.attack) s.attack += item.stats.attack
                if (item.stats.defense) s.defense += item.stats.defense
                if (item.stats.maxHp) s.maxHp += item.stats.maxHp
                if (item.stats.maxMp) s.maxMp += item.stats.maxMp
                if (item.stats.agility) s.agility += item.stats.agility
            }
        })

        // Ensure HP/MP don't exceed Max (visual clamp, though distinct from logic)
        // s.hp = Math.min(s.hp, s.maxHp)
        // s.mp = Math.min(s.mp, s.maxMp)

        return s
    })

    // State
    const location = ref('cave_start')

    function takeDamage(amount) {
        status.value.hp = Math.max(0, status.value.hp - amount)
    }

    function heal(amount) {
        status.value.hp = Math.min(stats.value.maxHp, status.value.hp + amount)
    }

    function recover(amount) {
        heal(amount)
        status.value.mp = Math.min(stats.value.maxMp, status.value.mp + amount)
    }

    function consumeMp(amount) {
        if (status.value.mp >= amount) {
            status.value.mp -= amount
            return true
        }
        return false
    }

    function gainExp(amount) {
        status.value.xp += amount
        if (status.value.xp >= baseStats.value.maxXp) {
            levelUp()
        }
    }

    function levelUp() {
        baseStats.value.level++
        status.value.xp -= baseStats.value.maxXp
        baseStats.value.maxXp = Math.floor(baseStats.value.maxXp * 1.5)

        // Stat growth
        baseStats.value.maxHp += 10
        baseStats.value.maxMp += 5
        baseStats.value.attack += 2
        baseStats.value.defense += 1

        // Full heal based on new max
        status.value.hp = stats.value.maxHp
        status.value.mp = stats.value.maxMp

        baseStats.value.cultivation = `炼体境${baseStats.value.level}重`
        
        // 更新任务进度 - 等级提升
        // 动态导入避免循环依赖
        import('./quest').then(module => {
            const questStore = module.useQuestStore()
            questStore.updateAllQuestProgress('reach_level', baseStats.value.level)
        }).catch(console.error)
    }

    function equipItem(itemId) {
        const item = itemData[itemId]
        if (!item) return false

        // Determine slot
        let slot = null
        if (item.type === 'weapon') slot = 'weapon'
        if (item.type === 'armor') slot = 'armor' // Assuming we have armor type items soon
        if (item.type === 'accessory' || item.type === 'misc') slot = 'accessory' // Misc as acc for now?

        if (!slot) return false

        // Unequip current if exists
        if (equipment.value[slot]) {
            addItem(equipment.value[slot], 1)
        }

        // Equip new (remove from inventory first)
        if (removeItem(itemId, 1)) {
            equipment.value[slot] = itemId
            return true
        }
        return false
    }

    function unequipItem(slot) {
        if (equipment.value[slot]) {
            addItem(equipment.value[slot], 1)
            equipment.value[slot] = null
            return true
        }
        return false
    }

    function learnSkill(skillId) {
        if (!skills.value.find(s => s.id === skillId)) {
            skills.value.push({
                id: skillId,
                level: 1,
                exp: 0
            })
            return true
        }
        return false
    }

    function addItem(itemId, count = 1) {
        const existing = inventory.value.find(i => i.id === itemId)
        if (existing) {
            existing.count += count
        } else {
            inventory.value.push({ id: itemId, count })
        }
    }

    function removeItem(itemId, count = 1) {
        const index = inventory.value.findIndex(i => i.id === itemId)
        if (index > -1) {
            inventory.value[index].count -= count
            if (inventory.value[index].count <= 0) {
                inventory.value.splice(index, 1)
            }
            return true
        }
        return false
    }

    function updateStat(stat, value) {
        if (baseStats.value[stat] !== undefined) {
            baseStats.value[stat] = value
        }
        if (status.value[stat] !== undefined) {
            status.value[stat] = value
        }
    }

    // 更新扩展属性
    function updateExtendedStat(stat, value) {
        if (extendedStats.value[stat] !== undefined) {
            extendedStats.value[stat] = value
        }
    }

    // 增加扩展属性
    function addExtendedStat(stat, amount) {
        if (extendedStats.value[stat] !== undefined) {
            extendedStats.value[stat] += amount
        }
    }

    // 重置到初始状态
    function $reset() {
        name.value = '任逍遥'
        title.value = '无名小卒'
        
        baseStats.value = {
            maxHp: 100,
            maxMp: 50,
            attack: 10,
            defense: 5,
            agility: 5,
            maxXp: 100,
            level: 1,
            cultivation: '炼体境1重'
        }
        
        status.value = {
            hp: 100,
            mp: 50,
            xp: 0
        }
        
        equipment.value = {
            weapon: null,
            armor: null,
            accessory: null
        }
        
        inventory.value = []
        skills.value = []
        location.value = 'cave_start'
        
        sectData.value = {
            currentSect: null,
            sectReputations: {},
            sectRank: null
        }
        
        alchemyData.value = {
            level: 1,
            exp: 0,
            knownRecipes: ['qi_gathering_pill'],
            successCount: 0
        }
        
        questData.value = {
            activeQuests: [],
            completedQuests: [],
            questProgress: {}
        }
        
        adventureData.value = {
            eventHistory: [],
            lastEventTime: 0,
            eventCooldowns: {}
        }
        
        extendedStats.value = {
            fortune: 5,
            intelligence: 5,
            alignment: 'neutral',
            gold: 100
        }
    }

    return {
        name, title, stats, baseStats, status, equipment, inventory, skills, location,
        sectData, alchemyData, questData, adventureData, extendedStats,
        updateStat, addItem, removeItem, equipItem, unequipItem,
        learnSkill, takeDamage, heal, recover, consumeMp, gainExp,
        updateExtendedStat, addExtendedStat, $reset
    }
})
