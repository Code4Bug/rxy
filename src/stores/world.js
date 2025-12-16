import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mapData } from '../game/map'
import { itemData } from '../game/items'
import { useGameLogStore } from './gameLog'
import { usePlayerStore } from './player'
import { useCombatStore } from './combat'
import { useAdventureStore } from './adventure'
import { useQuestStore } from './quest'

export const useWorldStore = defineStore('world', () => {
    const currentLocationId = ref('cave_start')
    const gameLog = useGameLogStore()
    const player = usePlayerStore()
    const combatStore = useCombatStore()
    const adventureStore = useAdventureStore()
    const questStore = useQuestStore()

    // Track unique events state
    const worldState = ref({
        found_cave_book: false
    })

    const currentActionState = ref(null) // { id, label, startTime, duration }
    const isBusy = computed(() => !!currentActionState.value)

    const currentLocation = computed(() => mapData[currentLocationId.value])

    const availableActions = computed(() => {
        if (!currentLocation.value) return []

        // Base actions from map
        const actions = []

        if (currentLocation.value.actions) {
            currentLocation.value.actions.forEach(action => {
                // Filter functionality based on state
                if (action.id === 'search_cave' && worldState.value.found_cave_book) {
                    return // Don't show search if already found
                }

                // Add recommendation highlights
                let highlight = false
                let label = action.label

                if (action.id === 'search_cave' && !worldState.value.found_cave_book) {
                    highlight = true
                    label = `[!] ${label}`
                }

                if (action.id === 'gather_herbs') {
                    // Check if any node is off cooldown to recommend gathering
                    const now = Date.now()
                    const canGather = currentLocation.value.resources.some(node => {
                        const last = nodeCooldowns.value[`${currentLocationId.value}_${node.itemId}`] || 0
                        return now - last >= node.cooldown
                    })
                    if (canGather) {
                        highlight = true
                    }
                }

                if (action.id === 'read_inscription') {
                    highlight = true // Always a good idea to cultivate
                }

                // Add danger level indicator to label if not present
                // (Optional: You could do this in the component, but doing it here is easier for now)

                actions.push({ ...action, label, highlight })
            })
        }

        // Add movement actions
        if (currentLocation.value.exits) {
            Object.entries(currentLocation.value.exits).forEach(([dir, targetId]) => {
                const targetName = mapData[targetId]?.name || '未知'
                actions.push({
                    id: `move:${targetId}`,
                    label: `前往: ${targetName} (${dir})`,
                    type: 'move',
                    target: targetId
                })
            })
        }

        return actions
    })

    function moveTo(targetId) {
        if (mapData[targetId]) {
            currentLocationId.value = targetId
            gameLog.addLog(`你来到了【${mapData[targetId].name}】。`, 'info')
            gameLog.addLog(mapData[targetId].description, 'info')

            // 更新任务进度（访问位置）
            questStore.updateAllQuestProgress('visit_locations', targetId)

            // 尝试触发奇遇事件
            adventureStore.tryTriggerAdventure(targetId)

            // Trigger potential combat based on map data
            const location = mapData[targetId]
            if (location.enemies && location.enemies.length > 0) {
                // Base encounter chance increases with danger level
                const baseChance = 0.3 + (location.dangerLevel * 0.05)

                if (Math.random() < baseChance) {
                    // Pick an enemy
                    const rand = Math.random()
                    let cumulative = 0
                    let selectedEnemyId = location.enemies[0].id // Default to first

                    // Normalizing probabilities if they don't sum to 1, or just simple weight check
                    // Let's assume the chances in mapData are relative weights or individual probabilities?
                    // Previous data: [{id: 'wolf', chance: 0.3}]
                    // Let's treat 'chance' as relative weight for simplicity in selection,
                    // BUT we already passed the check for "Encounter happened".

                    // Actually, let's just pick one randomly based on weights
                    const totalWeight = location.enemies.reduce((acc, e) => acc + (e.chance || 0.1), 0)
                    let r = Math.random() * totalWeight

                    for (const enemy of location.enemies) {
                        r -= (enemy.chance || 0.1)
                        if (r <= 0) {
                            selectedEnemyId = enemy.id
                            break
                        }
                    }

                    combatStore.startCombat(selectedEnemyId)
                }
            }
        }
    }

    // Resource Cooldowns
    const nodeCooldowns = ref({})

    function handleAction(action) {
        if (isBusy.value) return

        if (action.duration) {
            // Optimization: If action is gather, check if anything is gatherable before waiting
            if (action.type === 'gather') {
                const hasResources = currentLocation.value.resources && currentLocation.value.resources.some(node => {
                    const now = Date.now()
                    const last = nodeCooldowns.value[`${currentLocationId.value}_${node.itemId}`] || 0
                    return now - last >= node.cooldown
                })

                if (!hasResources) {
                    executeAction(action)
                    return
                }
            }

            startBusyAction(action)
            return
        }

        executeAction(action)
    }

    function startBusyAction(action) {
        currentActionState.value = {
            id: action.id,
            label: action.label,
            startTime: Date.now(),
            duration: action.duration
        }

        setTimeout(() => {
            currentActionState.value = null
            executeAction(action)
        }, action.duration)
    }

    function executeAction(action) {
        if (action.type === 'move') {
            moveTo(action.target)
        } else if (action.type === 'gather') {
            executeGather(action)
        } else {
            // Handle specific map interactions
            switch (action.id) {
                case 'search_cave':
                    if (!worldState.value.found_cave_book) {
                        gameLog.addLog('你在角落里发现了一本泛黄的【基础内功】。', 'gain')
                        player.addItem('basic_script', 1)
                        worldState.value.found_cave_book = true
                    } else {
                        gameLog.addLog('这里已经被搜刮干净了。', 'info')
                    }
                    break
                case 'read_inscription':
                    gameLog.addLog('你仔细研读岩壁上的文字，顿觉醍醐灌顶，修为有所精进。', 'gain')
                    player.gainExp(20)
                    break
                case 'meditate':
                    gameLog.addLog('你静心打坐，贪婪地吸收着幽隐谷的灵气。', 'gain')
                    player.gainExp(15)
                    player.recover(10) // Hypothetical recover method or just log it
                    
                    // 更新任务进度
                    questStore.updateAllQuestProgress('meditate', currentLocationId.value)
                    break
                case 'search_ruins':
                    if (Math.random() < 0.3) {
                        gameLog.addLog('你在废墟中发现了一件【残破法器】！', 'gain')
                        player.addItem('ancient_relic', 1)
                    } else {
                        gameLog.addLog('你在废墟中翻找了半天，只找到一些碎瓦砾。', 'info')
                    }
                    break
                case 'rest':
                    gameLog.addLog('你在客栈中美美地睡了一觉，精神百倍。', 'gain')
                    player.recover(9999)
                    break
                default:
                    gameLog.addLog(`你尝试${action.label}，但什么也没发生。`, 'info')
            }
        }
    }

    function executeGather(action) {
        if (!currentLocation.value.resources) return

        let foundSomething = false
        const now = Date.now()

        currentLocation.value.resources.forEach(node => {
            // Check cooldown
            const lastGather = nodeCooldowns.value[`${currentLocationId.value}_${node.itemId}`] || 0
            if (now - lastGather < node.cooldown) return

            if (Math.random() < node.chance) {
                // Success
                const item = itemData[node.itemId]
                player.addItem(node.itemId, 1)
                gameLog.addLog(`你采集到了【${item.name}】。`, 'gain')
                foundSomething = true

                // Set cooldown
                nodeCooldowns.value[`${currentLocationId.value}_${node.itemId}`] = now
            }
        })

        if (!foundSomething) {
            gameLog.addLog('你四处搜寻了一番，但什么也没找到 (或资源尚未生长)。', 'info')
        }
    }

    async function useItem(itemId) {
        const item = itemData[itemId]
        if (!item) return

        // Check if player has item
        const hasItem = player.inventory.find(i => i.id === itemId)
        if (!hasItem) return

        let consumed = false

        if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || item.type === 'misc') {
            if (player.equipItem(itemId)) {
                gameLog.addLog(`你装备了【${item.name}】。`, 'info')
                // Equip consumes the item in inventory (logic is in player store)
                // consumed = false because equipItem handles removal
                return
            }
        }

        if (item.effect) {
            const [type, ...params] = item.effect.split(':')

            switch (type) {
                case 'learn_skill':
                    if (player.learnSkill(params[0])) {
                        let skillName = params[0]
                        try {
                            const module = await import('../game/skills')
                            skillName = module.skillData[params[0]]?.name || params[0]
                        } catch (e) { console.error(e) }

                        gameLog.addLog(`你研读了${item.name}，学会了【${skillName}】！`, 'gain')
                        consumed = true
                        
                        // 更新任务进度
                        questStore.updateAllQuestProgress('learn_skill', params[0])
                    } else {
                        gameLog.addLog(`你已经学会了${item.name}记载的武功，无需再次研读。`, 'info')
                    }
                    break
                case 'restore_hp':
                    const hpAmount = parseInt(params[0]) || 0
                    player.heal(hpAmount)
                    gameLog.addLog(`你服用了${item.name}，恢复了 ${hpAmount} 点气血。`, 'gain')
                    consumed = true
                    break
                case 'restore_mp':
                    const mpAmount = parseInt(params[0]) || 0
                    const newMp = Math.min(player.stats.maxMp, player.stats.mp + mpAmount)
                    player.updateStat('mp', newMp)
                    gameLog.addLog(`你服用了${item.name}，恢复了 ${mpAmount} 点内力。`, 'gain')
                    consumed = true
                    break
                case 'permanent_stat':
                    const statName = params[0]
                    const statAmount = parseInt(params[1]) || 1
                    if (statName === 'intelligence') {
                        player.addExtendedStat('intelligence', statAmount)
                        gameLog.addLog(`你服用了${item.name}，悟性永久提升 ${statAmount} 点！`, 'gain')
                    } else if (statName === 'fortune') {
                        player.addExtendedStat('fortune', statAmount)
                        gameLog.addLog(`你服用了${item.name}，福源永久提升 ${statAmount} 点！`, 'gain')
                    }
                    consumed = true
                    break
                case 'breakthrough_aid':
                    const targetCultivation = params[0]
                    gameLog.addLog(`你服用了${item.name}，感觉修为突破的瓶颈有所松动。`, 'gain')
                    gameLog.addLog(`这将大大增加你突破到${targetCultivation}的成功率。`, 'info')
                    consumed = true
                    break
                case 'breakthrough':
                    const newCultivation = params[0]
                    player.updateStat('cultivation', newCultivation)
                    gameLog.addLog(`你服用了${item.name}，修为直接突破到了${newCultivation}！`, 'gain')
                    gameLog.addLog('你感受到体内灵力澎湃，实力大幅提升！', 'gain')
                    consumed = true
                    
                    // 更新任务进度
                    questStore.updateAllQuestProgress('reach_cultivation', newCultivation)
                    break
                default:
                    gameLog.addLog(`你使用了${item.name}，但什么也没发生。`, 'info')
            }
        } else {
            gameLog.addLog(`${item.name}似乎不能直接使用。`, 'info')
        }

        if (consumed) {
            player.removeItem(itemId, 1)
        }
    }

    return { currentLocationId, currentLocation, availableActions, isBusy, currentActionState, moveTo, handleAction, useItem }
})
