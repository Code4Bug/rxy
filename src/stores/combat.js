import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGameLogStore } from './gameLog'
import { usePlayerStore } from './player'
import { enemyData } from '../game/enemies'
import { itemData } from '../game/items'
import { skillData } from '../game/skills'

export const useCombatStore = defineStore('combat', () => {
    const isCombatActive = ref(false)
    const currentEnemy = ref(null)
    const gameLog = useGameLogStore()
    const player = usePlayerStore()

    // Computed actions for the menu
    const combatActions = computed(() => {
        if (!isCombatActive.value) return []

        const actions = [
            { id: 'attack', label: '普通攻击' }
        ]

        // Add learnt skills that are active (external/light)
        player.skills.forEach(s => {
            // We need to look up skill type from skillData? 
            // Ideally player skills should store ref to data or we look it up
            // For now assuming we can look up by ID
            // Import skillData inside computed? No, imports are top level generally.
            // Let's assume skillData is available or we import it.
            // We haven't imported skillData. Let's add import.
            // But simpler: just add all skills as actions for now
            const sData = skillData[s.id]
            if (sData && (sData.type === 'external' || sData.type === 'light')) {
                actions.push({ id: `skill:${s.id}`, label: sData.name })
            }
        })

        actions.push({ id: 'flee', label: '逃跑' })
        return actions
    })

    function startCombat(enemyId) {
        const enemyTemplate = enemyData[enemyId]
        if (!enemyTemplate) {
            console.error('Enemy not found:', enemyId)
            return
        }

        // Clone enemy so we don't mutate base stats
        currentEnemy.value = { ...enemyTemplate, hp: enemyTemplate.maxHp }
        isCombatActive.value = true

        gameLog.addLog(`遭遇敌人：【${currentEnemy.value.name}】！`, 'danger')
        gameLog.addLog(currentEnemy.value.description, 'info')
    }

    function endCombat(won) {
        isCombatActive.value = false
        if (won) {
            gameLog.addLog(`战斗胜利！获得了 ${currentEnemy.value.exp} 点修为。`, 'gain')
            player.gainExp(currentEnemy.value.exp)

            // 更新任务进度 - 战斗胜利
            // 需要动态导入questStore以避免循环依赖
            import('./quest').then(module => {
                const questStore = module.useQuestStore()
                questStore.updateAllQuestProgress('win_battles')
                questStore.updateAllQuestProgress('defeat_enemies', currentEnemy.value.id)
            }).catch(console.error)

            // Drop loot
            if (currentEnemy.value.drops) {
                currentEnemy.value.drops.forEach(drop => {
                    if (Math.random() < drop.chance) {
                        player.addItem(drop.itemId, 1)
                        const itemName = itemData[drop.itemId]?.name || drop.itemId
                        gameLog.addLog(`获得了战利品：【${itemName}】`, 'gain')
                    }
                })
            }
        } else {
            gameLog.addLog('战斗失败...你昏迷了过去。', 'danger')
            // Todo: Death penalty
        }
        currentEnemy.value = null
    }

    function handlePlayerAttack() {
        if (!currentEnemy.value) return

        // Player hits Enemy
        // Simple damage formula: (Atk - EnemyDef) * random(0.8, 1.2)
        const dmg = Math.max(1, Math.floor((player.stats.attack - currentEnemy.value.defense) * (0.8 + Math.random() * 0.4)))
        currentEnemy.value.hp -= dmg
        gameLog.addLog(`你对 ${currentEnemy.value.name} 造成 ${dmg} 点伤害。`, 'combat')

        if (currentEnemy.value.hp <= 0) {
            endCombat(true)
            return
        }

        // Enemy Turn
        enemyTurn()
    }

    function handleSkill(skillId) {
        if (!currentEnemy.value) return

        const skill = skillData[skillId]
        if (!skill) return

        // Check MP
        if (!player.consumeMp(skill.mpCost)) {
            gameLog.addLog('内力不足，无法施展武功！', 'info')
            return
        }

        // Calculate Effect
        let dmg = 0
        if (skill.damageScale) {
            const baseDmg = (player.stats.attack - currentEnemy.value.defense)
            dmg = Math.max(1, Math.floor(baseDmg * skill.damageScale * (0.9 + Math.random() * 0.2)))
        }

        currentEnemy.value.hp -= dmg
        gameLog.addLog(`你施展【${skill.name}】，造成 ${dmg} 点伤害！`, 'combat')

        if (currentEnemy.value.hp <= 0) {
            endCombat(true)
            return
        }

        enemyTurn()
    }

    function enemyTurn() {
        if (!currentEnemy.value) return

        // Enemy hits Player
        const dmg = Math.max(1, Math.floor((currentEnemy.value.attack - player.stats.defense) * (0.8 + Math.random() * 0.4)))
        player.takeDamage(dmg)

        gameLog.addLog(`${currentEnemy.value.name} 对你造成 ${dmg} 点伤害！`, 'danger')

        if (player.stats.hp <= 0) {
            endCombat(false)
        }
    }

    function flee() {
        // Simple chance to flee based on Agility comparison logic could go here
        const success = Math.random() > 0.3
        if (success) {
            gameLog.addLog('你狼狈地逃离了战斗。', 'info')
            isCombatActive.value = false
            currentEnemy.value = null
        } else {
            gameLog.addLog('逃跑失败！', 'danger')
            enemyTurn()
        }
    }

    function handleAction(action) {
        if (action.id === 'attack') {
            handlePlayerAttack()
        } else if (action.id === 'flee') {
            flee()
        } else if (action.id.startsWith('skill:')) {
            const skillId = action.id.split(':')[1]
            handleSkill(skillId)
        } else {
            gameLog.addLog('该功能尚未实装', 'info')
        }
    }

    return { isCombatActive, currentEnemy, combatActions, startCombat, handleAction }
})
