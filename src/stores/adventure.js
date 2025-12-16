import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adventureData, adventureWeights } from '../game/adventures'
import { usePlayerStore } from './player'
import { useGameLogStore } from './gameLog'

export const useAdventureStore = defineStore('adventure', () => {
    const player = usePlayerStore()
    const gameLog = useGameLogStore()
    
    // 奇遇事件历史记录
    const eventHistory = ref([])
    
    // 当前触发的奇遇事件
    const currentEvent = ref(null)
    
    // 事件冷却时间记录
    const eventCooldowns = ref({})
    
    // 上次事件触发时间
    const lastEventTime = ref(0)
    
    // 位置事件历史（防止同一位置短时间内重复触发）
    const locationEventHistory = ref({})
    
    // 检查是否可以触发奇遇事件
    const canTriggerAdventure = computed(() => {
        const now = Date.now()
        const minInterval = 300000 // 5分钟最小间隔
        return now - lastEventTime.value >= minInterval
    })
    
    // 根据玩家状态计算奇遇触发概率
    function calculateTriggerChance(locationId) {
        let baseChance = 0.15 // 基础15%概率
        
        // 福源属性影响（如果有的话）
        const fortune = player.stats.fortune || 5
        const fortuneBonus = (fortune - 5) * 0.02 // 每点福源增加2%
        
        // 等级影响
        const levelBonus = Math.min(player.stats.level * 0.01, 0.1) // 最多10%
        
        // 位置历史影响（同一位置触发过会降低概率）
        const locationHistory = locationEventHistory.value[locationId] || []
        const locationPenalty = locationHistory.length * 0.05 // 每次触发降低5%
        
        const finalChance = Math.max(baseChance + fortuneBonus + levelBonus - locationPenalty, 0.05)
        return finalChance
    }
    
    // 尝试触发随机奇遇事件
    function tryTriggerAdventure(locationId) {
        if (!canTriggerAdventure.value) return false
        
        const triggerChance = calculateTriggerChance(locationId)
        if (Math.random() > triggerChance) return false
        
        // 选择可用的奇遇事件
        const availableEvents = getAvailableEvents(locationId)
        if (availableEvents.length === 0) return false
        
        // 根据权重随机选择事件
        const selectedEvent = selectRandomEvent(availableEvents)
        if (!selectedEvent) return false
        
        // 触发事件
        triggerEvent(selectedEvent, locationId)
        return true
    }
    
    // 获取当前位置可用的奇遇事件
    function getAvailableEvents(locationId) {
        const now = Date.now()
        const available = []
        
        Object.values(adventureData).forEach(event => {
            // 检查触发条件
            if (!checkEventConditions(event)) return
            
            // 检查位置限制
            if (event.triggerConditions.locations && 
                !event.triggerConditions.locations.includes(locationId)) return
            
            // 检查冷却时间
            const lastTrigger = eventCooldowns.value[event.id] || 0
            if (now - lastTrigger < event.cooldown) return
            
            available.push(event)
        })
        
        return available
    }
    
    // 检查事件触发条件
    function checkEventConditions(event) {
        const conditions = event.triggerConditions
        
        // 检查等级要求
        if (conditions.minLevel && player.stats.level < conditions.minLevel) {
            return false
        }
        
        // 检查修为要求
        if (conditions.cultivation && 
            !player.stats.cultivation.includes(conditions.cultivation)) {
            return false
        }
        
        // 检查福源要求
        if (conditions.福源 && (player.stats.fortune || 5) < conditions.福源) {
            return false
        }
        
        // 检查门派要求
        if (conditions.sect && player.sectData?.currentSect !== conditions.sect) {
            return false
        }
        
        return true
    }
    
    // 根据权重随机选择事件
    function selectRandomEvent(events) {
        if (events.length === 0) return null
        
        // 计算总权重
        let totalWeight = 0
        events.forEach(event => {
            totalWeight += adventureWeights[event.id] || 0.1
        })
        
        // 随机选择
        let random = Math.random() * totalWeight
        for (const event of events) {
            const weight = adventureWeights[event.id] || 0.1
            random -= weight
            if (random <= 0) {
                return event
            }
        }
        
        return events[0] // 备选
    }
    
    // 触发奇遇事件
    function triggerEvent(event, locationId) {
        currentEvent.value = {
            ...event,
            locationId,
            triggeredAt: Date.now()
        }
        
        lastEventTime.value = Date.now()
        
        // 记录位置历史
        if (!locationEventHistory.value[locationId]) {
            locationEventHistory.value[locationId] = []
        }
        locationEventHistory.value[locationId].push({
            eventId: event.id,
            time: Date.now()
        })
        
        // 显示事件描述
        gameLog.addLog(`【奇遇】${event.name}`, 'adventure')
        gameLog.addLog(event.description, 'adventure')
    }
    
    // 玩家做出选择
    function makeChoice(choiceId) {
        if (!currentEvent.value) return false
        
        const event = currentEvent.value
        const choice = event.choices.find(c => c.id === choiceId)
        if (!choice) return false
        
        // 检查选择条件
        if (!checkChoiceRequirements(choice)) {
            gameLog.addLog('你不满足这个选择的条件。', 'error')
            return false
        }
        
        // 执行选择结果
        executeChoiceResult(choice, event)
        
        // 记录事件历史
        eventHistory.value.push({
            eventId: event.id,
            choiceId: choiceId,
            time: Date.now(),
            location: event.locationId
        })
        
        // 设置冷却时间
        eventCooldowns.value[event.id] = Date.now()
        
        // 清除当前事件
        currentEvent.value = null
        
        return true
    }
    
    // 检查选择条件
    function checkChoiceRequirements(choice) {
        if (!choice.requirements) return true
        
        const req = choice.requirements
        
        // 检查金钱要求
        if (req.gold && (player.stats.gold || 0) < req.gold) {
            return false
        }
        
        // 检查生命值要求
        if (req.hp && player.stats.hp < req.hp) {
            return false
        }
        
        // 检查内力要求
        if (req.mp && player.stats.mp < req.mp) {
            return false
        }
        
        // 检查物品要求
        if (req.items) {
            for (const item of req.items) {
                const hasItem = player.inventory.find(i => 
                    i.id === item.id && i.count >= item.count
                )
                if (!hasItem) return false
            }
        }
        
        return true
    }
    
    // 执行选择结果
    function executeChoiceResult(choice, event) {
        const result = choice.results.success // 简化处理，暂时只考虑成功结果
        
        if (result.message) {
            gameLog.addLog(result.message, 'adventure')
        }
        
        if (result.rewards) {
            applyRewards(result.rewards)
        }
    }
    
    // 应用奖励
    function applyRewards(rewards) {
        // 经验奖励
        if (rewards.xp) {
            player.gainExp(rewards.xp)
            gameLog.addLog(`获得 ${rewards.xp} 点修炼经验！`, 'gain')
        }
        
        // 金钱奖励
        if (rewards.gold) {
            const currentGold = player.stats.gold || 0
            player.updateStat('gold', currentGold + rewards.gold)
            if (rewards.gold > 0) {
                gameLog.addLog(`获得 ${rewards.gold} 金！`, 'gain')
            } else {
                gameLog.addLog(`失去 ${Math.abs(rewards.gold)} 金。`, 'loss')
            }
        }
        
        // 生命值变化
        if (rewards.hp) {
            if (rewards.hp > 0) {
                player.heal(rewards.hp)
                gameLog.addLog(`恢复 ${rewards.hp} 点气血。`, 'gain')
            } else {
                player.takeDamage(Math.abs(rewards.hp))
                gameLog.addLog(`失去 ${Math.abs(rewards.hp)} 点气血。`, 'loss')
            }
        }
        
        // 内力变化
        if (rewards.mp) {
            if (rewards.mp > 0) {
                const newMp = Math.min(player.stats.maxMp, player.stats.mp + rewards.mp)
                player.updateStat('mp', newMp)
                gameLog.addLog(`恢复 ${rewards.mp} 点内力。`, 'gain')
            } else {
                player.consumeMp(Math.abs(rewards.mp))
                gameLog.addLog(`消耗 ${Math.abs(rewards.mp)} 点内力。`, 'loss')
            }
        }
        
        // 物品奖励
        if (rewards.items) {
            rewards.items.forEach(item => {
                player.addItem(item.id, item.count)
                // 动态导入物品数据
                import('../game/items').then(module => {
                    const itemName = module.itemData[item.id]?.name || item.id
                    gameLog.addLog(`获得 ${itemName} x${item.count}！`, 'gain')
                }).catch(() => {
                    gameLog.addLog(`获得 ${item.id} x${item.count}！`, 'gain')
                })
            })
        }
        
        // 称号奖励
        if (rewards.title) {
            player.title = rewards.title
            gameLog.addLog(`获得称号：${rewards.title}！`, 'gain')
        }
    }
    
    // 取消当前事件（玩家选择离开）
    function cancelCurrentEvent() {
        if (currentEvent.value) {
            gameLog.addLog('你选择离开，奇遇就此错过。', 'info')
            currentEvent.value = null
        }
    }
    
    // 获取事件历史统计
    const eventStats = computed(() => {
        const stats = {}
        eventHistory.value.forEach(record => {
            if (!stats[record.eventId]) {
                stats[record.eventId] = 0
            }
            stats[record.eventId]++
        })
        return stats
    })
    
    return {
        // 状态
        eventHistory,
        currentEvent,
        eventCooldowns,
        lastEventTime,
        locationEventHistory,
        
        // 计算属性
        canTriggerAdventure,
        eventStats,
        
        // 方法
        tryTriggerAdventure,
        makeChoice,
        cancelCurrentEvent,
        calculateTriggerChance
    }
})