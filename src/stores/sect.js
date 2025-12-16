import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sectData, sectRelations, sectSkills } from '../game/sects'
import { usePlayerStore } from './player'
import { useGameLogStore } from './gameLog'

export const useSectStore = defineStore('sect', () => {
    const player = usePlayerStore()
    const gameLog = useGameLogStore()
    
    // 当前加入的门派
    const currentSect = ref(null)
    
    // 各门派声望值
    const sectReputations = ref({})
    
    // 可加入的门派列表
    const availableSects = ref(Object.keys(sectData))
    
    // 门派任务完成记录
    const completedTasks = ref({})
    
    // 日常任务冷却时间
    const taskCooldowns = ref({})
    
    // 当前门派信息
    const currentSectInfo = computed(() => {
        return currentSect.value ? sectData[currentSect.value] : null
    })
    
    // 当前门派声望
    const currentSectReputation = computed(() => {
        return currentSect.value ? (sectReputations.value[currentSect.value] || 0) : 0
    })
    
    // 当前门派等级
    const currentSectRank = computed(() => {
        if (!currentSectInfo.value) return null
        
        const reputation = currentSectReputation.value
        const levels = currentSectInfo.value.reputationLevels
        
        let currentRank = null
        Object.entries(levels).forEach(([reqRep, rankInfo]) => {
            if (reputation >= parseInt(reqRep)) {
                currentRank = rankInfo
            }
        })
        
        return currentRank
    })
    
    // 可学习的门派技能
    const availableSectSkills = computed(() => {
        if (!currentSectInfo.value) return []
        
        const reputation = currentSectReputation.value
        const available = []
        
        currentSectInfo.value.exclusiveSkills.forEach(skillId => {
            const skill = sectSkills[skillId]
            if (skill && skill.requirements) {
                // 检查声望要求
                const reqRep = skill.requirements.reputation?.[currentSect.value] || 0
                if (reputation >= reqRep) {
                    // 检查是否已学会
                    const hasLearned = player.skills.some(s => s.id === skillId)
                    if (!hasLearned) {
                        available.push(skill)
                    }
                }
            }
        })
        
        return available
    })
    
    // 可执行的门派任务
    const availableSectTasks = computed(() => {
        if (!currentSectInfo.value) return []
        
        const now = Date.now()
        const available = []
        
        currentSectInfo.value.dailyTasks.forEach(task => {
            // 检查冷却时间（日常任务24小时冷却）
            const lastComplete = taskCooldowns.value[task.id] || 0
            const cooldown = 24 * 60 * 60 * 1000 // 24小时
            
            if (now - lastComplete >= cooldown) {
                // 检查任务要求
                if (checkTaskRequirements(task)) {
                    available.push(task)
                }
            }
        })
        
        return available
    })
    
    // 检查是否可以加入门派
    function canJoinSect(sectId) {
        const sect = sectData[sectId]
        if (!sect) return { canJoin: false, reason: '门派不存在' }
        
        // 已经加入其他门派
        if (currentSect.value && currentSect.value !== sectId) {
            return { canJoin: false, reason: '你已经加入了其他门派' }
        }
        
        // 已经是该门派成员
        if (currentSect.value === sectId) {
            return { canJoin: false, reason: '你已经是该门派的弟子' }
        }
        
        const req = sect.joinRequirements
        
        // 检查等级要求
        if (req.level && player.stats.level < req.level) {
            return { canJoin: false, reason: `需要达到${req.level}级` }
        }
        
        // 检查修为要求
        if (req.cultivation && !player.stats.cultivation.includes(req.cultivation)) {
            return { canJoin: false, reason: `需要达到${req.cultivation}` }
        }
        
        // 检查属性要求
        if (req.intelligence && (player.stats.intelligence || 5) < req.intelligence) {
            return { canJoin: false, reason: `需要悟性达到${req.intelligence}` }
        }
        
        // 检查阵营要求
        if (req.alignment && (player.stats.alignment || 'neutral') !== req.alignment) {
            return { canJoin: false, reason: '阵营不符合要求' }
        }
        
        // 检查声望要求（不能有负面声望）
        if (req.reputation) {
            for (const [sectId, minRep] of Object.entries(req.reputation)) {
                const currentRep = sectReputations.value[sectId] || 0
                if (currentRep < minRep) {
                    return { canJoin: false, reason: `在${sectData[sectId]?.name || sectId}的声望不足` }
                }
            }
        }
        
        return { canJoin: true }
    }
    
    // 加入门派
    function joinSect(sectId) {
        const checkResult = canJoinSect(sectId)
        if (!checkResult.canJoin) {
            gameLog.addLog(`无法加入门派：${checkResult.reason}`, 'error')
            return false
        }
        
        const sect = sectData[sectId]
        currentSect.value = sectId
        
        // 初始化声望
        if (!sectReputations.value[sectId]) {
            sectReputations.value[sectId] = 0
        }
        
        gameLog.addLog(`恭喜！你成功加入了【${sect.name}】！`, 'gain')
        gameLog.addLog(`你现在是${sect.name}的外门弟子。`, 'info')
        
        // 触发加入门派的任务进度
        // TODO: 集成任务系统后添加
        
        return true
    }
    
    // 离开门派
    function leaveSect() {
        if (!currentSect.value) {
            gameLog.addLog('你目前没有加入任何门派。', 'info')
            return false
        }
        
        const sectName = sectData[currentSect.value]?.name || '未知门派'
        gameLog.addLog(`你离开了【${sectName}】。`, 'info')
        gameLog.addLog('叛离门派会让你失去所有门派声望和特权。', 'warning')
        
        // 清除门派相关状态
        const oldSect = currentSect.value
        currentSect.value = null
        
        // 保留声望记录但设为负值（叛徒惩罚）
        if (sectReputations.value[oldSect] > 0) {
            sectReputations.value[oldSect] = -sectReputations.value[oldSect]
        }
        
        return true
    }
    
    // 增加门派声望
    function gainReputation(sectId, amount) {
        if (!sectReputations.value[sectId]) {
            sectReputations.value[sectId] = 0
        }
        
        const oldRep = sectReputations.value[sectId]
        sectReputations.value[sectId] += amount
        
        const sect = sectData[sectId]
        if (sect) {
            gameLog.addLog(`在【${sect.name}】的声望增加了 ${amount} 点！`, 'gain')
            
            // 检查是否升级
            checkReputationLevelUp(sectId, oldRep, sectReputations.value[sectId])
        }
    }
    
    // 检查声望等级提升
    function checkReputationLevelUp(sectId, oldRep, newRep) {
        const sect = sectData[sectId]
        if (!sect) return
        
        const levels = sect.reputationLevels
        
        // 找到新的等级
        let newRank = null
        let newRankRep = 0
        
        Object.entries(levels).forEach(([reqRep, rankInfo]) => {
            const repNum = parseInt(reqRep)
            if (newRep >= repNum && repNum > newRankRep) {
                newRank = rankInfo
                newRankRep = repNum
            }
        })
        
        // 找到旧的等级
        let oldRank = null
        let oldRankRep = 0
        
        Object.entries(levels).forEach(([reqRep, rankInfo]) => {
            const repNum = parseInt(reqRep)
            if (oldRep >= repNum && repNum > oldRankRep) {
                oldRank = rankInfo
                oldRankRep = repNum
            }
        })
        
        // 如果等级提升了
        if (newRankRep > oldRankRep && newRank) {
            gameLog.addLog(`恭喜！你在【${sect.name}】的地位提升了！`, 'gain')
            gameLog.addLog(`你现在是：${newRank.rank}`, 'gain')
            
            // 解锁新的特权和技能
            if (newRank.benefits) {
                gameLog.addLog(`解锁新特权：${newRank.benefits.join('、')}`, 'info')
            }
        }
    }
    
    // 学习门派技能
    function learnSectSkill(skillId) {
        const skill = sectSkills[skillId]
        if (!skill) {
            gameLog.addLog('技能不存在。', 'error')
            return false
        }
        
        // 检查是否是当前门派的技能
        if (!currentSectInfo.value?.exclusiveSkills.includes(skillId)) {
            gameLog.addLog('这不是你门派的技能。', 'error')
            return false
        }
        
        // 检查声望要求
        const reqRep = skill.requirements.reputation?.[currentSect.value] || 0
        if (currentSectReputation.value < reqRep) {
            gameLog.addLog(`声望不足，需要 ${reqRep} 点声望。`, 'error')
            return false
        }
        
        // 检查是否已学会
        const hasLearned = player.skills.some(s => s.id === skillId)
        if (hasLearned) {
            gameLog.addLog('你已经学会了这个技能。', 'info')
            return false
        }
        
        // 学习技能
        if (player.learnSkill(skillId)) {
            gameLog.addLog(`你学会了门派绝技【${skill.name}】！`, 'gain')
            gameLog.addLog(skill.description, 'info')
            return true
        }
        
        return false
    }
    
    // 检查任务要求
    function checkTaskRequirements(task) {
        if (!task.requirements) return true
        
        const req = task.requirements
        
        // 检查声望要求
        if (req.reputation) {
            for (const [sectId, minRep] of Object.entries(req.reputation)) {
                const currentRep = sectReputations.value[sectId] || 0
                if (currentRep < minRep) {
                    return false
                }
            }
        }
        
        return true
    }
    
    // 完成门派任务
    function completeSectTask(taskId) {
        const task = currentSectInfo.value?.dailyTasks.find(t => t.id === taskId)
        if (!task) {
            gameLog.addLog('任务不存在。', 'error')
            return false
        }
        
        // 检查是否在冷却中
        const now = Date.now()
        const lastComplete = taskCooldowns.value[taskId] || 0
        const cooldown = 24 * 60 * 60 * 1000 // 24小时
        
        if (now - lastComplete < cooldown) {
            const remainingTime = Math.ceil((cooldown - (now - lastComplete)) / (60 * 60 * 1000))
            gameLog.addLog(`任务冷却中，还需等待 ${remainingTime} 小时。`, 'error')
            return false
        }
        
        // 检查任务要求
        if (!checkTaskRequirements(task)) {
            gameLog.addLog('不满足任务要求。', 'error')
            return false
        }
        
        // 完成任务
        gameLog.addLog(`完成门派任务：${task.name}`, 'gain')
        gameLog.addLog(task.description, 'info')
        
        // 给予奖励
        applyTaskRewards(task.rewards)
        
        // 设置冷却时间
        taskCooldowns.value[taskId] = now
        
        // 记录完成次数
        if (!completedTasks.value[taskId]) {
            completedTasks.value[taskId] = 0
        }
        completedTasks.value[taskId]++
        
        return true
    }
    
    // 应用任务奖励
    function applyTaskRewards(rewards) {
        // 经验奖励
        if (rewards.xp) {
            player.gainExp(rewards.xp)
            gameLog.addLog(`获得 ${rewards.xp} 点修炼经验！`, 'gain')
        }
        
        // 声望奖励
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([sectId, amount]) => {
                gainReputation(sectId, amount)
            })
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
    }
    
    // 获取门派关系
    function getSectRelation(sectId) {
        if (!currentSect.value) return 'neutral'
        
        const relations = sectRelations[currentSect.value]
        if (!relations) return 'neutral'
        
        if (relations.allies.includes(sectId)) return 'ally'
        if (relations.enemies.includes(sectId)) return 'enemy'
        return 'neutral'
    }
    
    return {
        // 状态
        currentSect,
        sectReputations,
        availableSects,
        completedTasks,
        taskCooldowns,
        
        // 计算属性
        currentSectInfo,
        currentSectReputation,
        currentSectRank,
        availableSectSkills,
        availableSectTasks,
        
        // 方法
        canJoinSect,
        joinSect,
        leaveSect,
        gainReputation,
        learnSectSkill,
        completeSectTask,
        getSectRelation
    }
})