import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questData, questTypes, objectiveHandlers } from '../game/quests'
import { usePlayerStore } from './player'
import { useGameLogStore } from './gameLog'

export const useQuestStore = defineStore('quest', () => {
    const player = usePlayerStore()
    const gameLog = useGameLogStore()
    
    // 活跃任务列表
    const activeQuests = ref([])
    
    // 已完成任务列表
    const completedQuests = ref([])
    
    // 可接受任务列表
    const availableQuests = ref(['first_cultivation']) // 初始主线任务
    
    // 日常任务重置时间
    const dailyResetTime = ref(0)
    
    // 任务进度缓存
    const questProgress = ref({})
    
    // 按类型分组的活跃任务
    const questsByType = computed(() => {
        const grouped = {}
        
        Object.keys(questTypes).forEach(type => {
            grouped[type] = activeQuests.value.filter(quest => quest.type === type)
        })
        
        return grouped
    })
    
    // 主线任务进度
    const mainQuestProgress = computed(() => {
        const mainQuests = activeQuests.value.filter(q => q.type === 'main')
        const completedMainQuests = completedQuests.value.filter(q => q.type === 'main')
        
        return {
            current: mainQuests.length > 0 ? mainQuests[0] : null,
            completed: completedMainQuests.length,
            total: Object.values(questData).filter(q => q.type === 'main').length
        }
    })
    
    // 检查任务是否可接受
    function canAcceptQuest(questId) {
        const quest = questData[questId]
        if (!quest) return { canAccept: false, reason: '任务不存在' }
        
        // 检查是否已接受
        if (activeQuests.value.some(q => q.id === questId)) {
            return { canAccept: false, reason: '任务已接受' }
        }
        
        // 检查是否已完成
        if (completedQuests.value.some(q => q.id === questId)) {
            if (!quest.repeatable) {
                return { canAccept: false, reason: '任务已完成' }
            }
        }
        
        // 检查日常任务重置
        if (quest.type === 'daily') {
            const now = Date.now()
            const lastReset = dailyResetTime.value
            const dayInMs = 24 * 60 * 60 * 1000
            
            if (now - lastReset >= dayInMs) {
                // 重置日常任务
                resetDailyQuests()
            }
            
            // 检查今日是否已完成
            const todayCompleted = completedQuests.value.some(q => 
                q.id === questId && q.completedAt > lastReset
            )
            if (todayCompleted) {
                return { canAccept: false, reason: '今日已完成' }
            }
        }
        
        // 检查前置任务
        if (quest.prerequisite) {
            const hasPrerequisite = completedQuests.value.some(q => q.id === quest.prerequisite)
            if (!hasPrerequisite) {
                return { canAccept: false, reason: '需要完成前置任务' }
            }
        }
        
        // 检查等级要求
        if (quest.levelRequirement && player.stats.level < quest.levelRequirement) {
            return { canAccept: false, reason: `需要达到${quest.levelRequirement}级` }
        }
        
        // 检查门派要求
        if (quest.faction && player.sectData?.currentSect !== quest.faction) {
            return { canAccept: false, reason: '需要加入对应门派' }
        }
        
        return { canAccept: true }
    }
    
    // 接受任务
    function acceptQuest(questId) {
        const checkResult = canAcceptQuest(questId)
        if (!checkResult.canAccept) {
            gameLog.addLog(`无法接受任务：${checkResult.reason}`, 'error')
            return false
        }
        
        const quest = questData[questId]
        const questInstance = {
            ...quest,
            acceptedAt: Date.now(),
            objectives: quest.objectives.map(obj => ({ ...obj })) // 深拷贝目标
        }
        
        activeQuests.value.push(questInstance)
        
        // 从可接受列表中移除
        const index = availableQuests.value.indexOf(questId)
        if (index > -1) {
            availableQuests.value.splice(index, 1)
        }
        
        gameLog.addLog(`接受任务：【${quest.name}】`, 'quest')
        gameLog.addLog(quest.description, 'info')
        
        return true
    }
    
    // 更新任务进度
    function updateProgress(questId, progressType, ...args) {
        const quest = activeQuests.value.find(q => q.id === questId)
        if (!quest) return false
        
        let progressMade = false
        
        quest.objectives.forEach(objective => {
            if (objective.type === progressType) {
                const handler = objectiveHandlers[progressType]
                if (handler) {
                    const oldCurrent = objective.current
                    handler(objective, ...args)
                    
                    if (objective.current !== oldCurrent) {
                        progressMade = true
                        
                        // 显示进度更新
                        if (Array.isArray(objective.current)) {
                            gameLog.addLog(`任务进度：${objective.description} (${objective.current.length}/${objective.required})`, 'quest')
                        } else {
                            gameLog.addLog(`任务进度：${objective.description} (${objective.current}/${objective.required})`, 'quest')
                        }
                    }
                }
            }
        })
        
        // 检查任务是否完成
        if (progressMade && isQuestCompleted(quest)) {
            completeQuest(questId)
        }
        
        return progressMade
    }
    
    // 检查任务是否完成
    function isQuestCompleted(quest) {
        return quest.objectives.every(objective => {
            if (Array.isArray(objective.current)) {
                return objective.current.length >= objective.required
            } else {
                return objective.current >= objective.required
            }
        })
    }
    
    // 完成任务
    function completeQuest(questId) {
        const questIndex = activeQuests.value.findIndex(q => q.id === questId)
        if (questIndex === -1) return false
        
        const quest = activeQuests.value[questIndex]
        
        // 移动到已完成列表
        const completedQuest = {
            ...quest,
            completedAt: Date.now()
        }
        completedQuests.value.push(completedQuest)
        activeQuests.value.splice(questIndex, 1)
        
        gameLog.addLog(`任务完成：【${quest.name}】`, 'gain')
        
        // 给予奖励
        if (quest.rewards) {
            applyQuestRewards(quest.rewards)
        }
        
        // 解锁后续任务
        if (quest.nextQuest) {
            unlockQuest(quest.nextQuest)
        }
        
        // 触发任务完成事件
        triggerQuestEvents(quest)
        
        return true
    }
    
    // 应用任务奖励
    function applyQuestRewards(rewards) {
        // 经验奖励
        if (rewards.xp) {
            player.gainExp(rewards.xp)
            gameLog.addLog(`获得 ${rewards.xp} 点修炼经验！`, 'gain')
        }
        
        // 金钱奖励
        if (rewards.gold) {
            const currentGold = player.stats.gold || 0
            player.updateStat('gold', currentGold + rewards.gold)
            gameLog.addLog(`获得 ${rewards.gold} 金！`, 'gain')
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
        
        // 声望奖励
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([sectId, amount]) => {
                // 需要集成门派系统
                gameLog.addLog(`声望增加：${sectId} +${amount}`, 'gain')
            })
        }
        
        // 炼丹经验奖励
        if (rewards.alchemyXp) {
            // 需要集成炼丹系统
            gameLog.addLog(`炼丹经验 +${rewards.alchemyXp}`, 'gain')
        }
    }
    
    // 解锁新任务
    function unlockQuest(questId) {
        if (!availableQuests.value.includes(questId)) {
            availableQuests.value.push(questId)
            
            const quest = questData[questId]
            if (quest) {
                gameLog.addLog(`解锁新任务：【${quest.name}】`, 'quest')
            }
        }
    }
    
    // 触发任务相关事件
    function triggerQuestEvents(quest) {
        // 主线任务完成后的特殊处理
        if (quest.type === 'main') {
            gameLog.addLog('主线剧情推进！', 'info')
        }
        
        // 成就任务完成后的特殊处理
        if (quest.type === 'achievement') {
            gameLog.addLog('恭喜达成成就！', 'gain')
        }
    }
    
    // 重置日常任务
    function resetDailyQuests() {
        const now = Date.now()
        dailyResetTime.value = now
        
        // 将今日完成的日常任务重新加入可接受列表
        const dailyQuests = Object.values(questData).filter(q => q.type === 'daily')
        dailyQuests.forEach(quest => {
            if (!availableQuests.value.includes(quest.id)) {
                availableQuests.value.push(quest.id)
            }
        })
        
        gameLog.addLog('日常任务已重置！', 'info')
    }
    
    // 放弃任务
    function abandonQuest(questId) {
        const questIndex = activeQuests.value.findIndex(q => q.id === questId)
        if (questIndex === -1) return false
        
        const quest = activeQuests.value[questIndex]
        
        // 只有支线任务和日常任务可以放弃
        if (quest.type === 'main') {
            gameLog.addLog('主线任务无法放弃。', 'error')
            return false
        }
        
        activeQuests.value.splice(questIndex, 1)
        
        // 重新加入可接受列表
        if (!availableQuests.value.includes(questId)) {
            availableQuests.value.push(questId)
        }
        
        gameLog.addLog(`放弃任务：【${quest.name}】`, 'warning')
        return true
    }
    
    // 获取任务详细信息
    function getQuestDetails(questId) {
        const quest = questData[questId]
        if (!quest) return null
        
        const activeQuest = activeQuests.value.find(q => q.id === questId)
        const isActive = !!activeQuest
        const isCompleted = completedQuests.value.some(q => q.id === questId)
        const canAcceptResult = canAcceptQuest(questId)
        
        return {
            ...quest,
            isActive,
            isCompleted,
            canAccept: canAcceptResult.canAccept,
            reason: canAcceptResult.reason,
            objectives: activeQuest ? activeQuest.objectives : quest.objectives,
            progress: activeQuest ? calculateQuestProgress(activeQuest) : 0
        }
    }
    
    // 计算任务完成度
    function calculateQuestProgress(quest) {
        if (!quest || !quest.objectives || quest.objectives.length === 0) return 100
        
        let totalProgress = 0
        quest.objectives.forEach(objective => {
            let objProgress = 0
            const current = objective.current || 0
            const required = objective.required || 1
            
            if (Array.isArray(current)) {
                objProgress = Math.min(current.length / required, 1)
            } else {
                objProgress = Math.min(current / required, 1)
            }
            totalProgress += objProgress
        })
        
        return Math.floor((totalProgress / quest.objectives.length) * 100)
    }
    
    // 全局任务进度更新（供其他系统调用）
    function updateAllQuestProgress(progressType, ...args) {
        let anyProgress = false
        
        activeQuests.value.forEach(quest => {
            if (updateProgress(quest.id, progressType, ...args)) {
                anyProgress = true
            }
        })
        
        return anyProgress
    }
    
    // 初始化任务系统
    function initializeQuests() {
        // 添加初始可用任务
        const initialQuests = Object.values(questData).filter(quest => 
            quest.type === 'daily' || (quest.type === 'main' && quest.chapter === 1)
        )
        
        initialQuests.forEach(quest => {
            if (!availableQuests.value.includes(quest.id)) {
                availableQuests.value.push(quest.id)
            }
        })
        
        // 设置日常任务重置时间
        if (dailyResetTime.value === 0) {
            dailyResetTime.value = Date.now()
        }
    }
    
    return {
        // 状态
        activeQuests,
        completedQuests,
        availableQuests,
        dailyResetTime,
        questProgress,
        
        // 计算属性
        questsByType,
        mainQuestProgress,
        
        // 方法
        canAcceptQuest,
        acceptQuest,
        updateProgress,
        completeQuest,
        abandonQuest,
        getQuestDetails,
        updateAllQuestProgress,
        initializeQuests,
        resetDailyQuests,
        
        // 重置方法
        $reset: () => {
            activeQuests.value = []
            completedQuests.value = []
            availableQuests.value = []
            dailyResetTime.value = 0
            questProgress.value = {}
        }
    }
})