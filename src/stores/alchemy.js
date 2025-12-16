import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recipeData, pillQuality, alchemyFactors } from '../game/recipes'
import { itemData } from '../game/items'
import { usePlayerStore } from './player'
import { useGameLogStore } from './gameLog'

export const useAlchemyStore = defineStore('alchemy', () => {
    const player = usePlayerStore()
    const gameLog = useGameLogStore()
    
    // 炼丹等级和经验
    const alchemyLevel = ref(1)
    const alchemyExp = ref(0)
    const alchemyExpToNext = ref(100)
    
    // 已知配方
    const knownRecipes = ref(['qi_gathering_pill']) // 默认知道聚气丹配方
    
    // 炼制状态
    const isRefining = ref(false)
    const currentRefinement = ref(null) // { recipeId, startTime, duration }
    
    // 炼丹统计
    const refinementStats = ref({
        totalAttempts: 0,
        successfulRefinements: 0,
        perfectPills: 0,
        failedAttempts: 0
    })
    
    // 炼丹成功率加成（来自装备、技能等）
    const successRateBonus = ref(0)
    const qualityBonus = ref(0)
    
    // 可用配方列表
    const availableRecipes = computed(() => {
        return knownRecipes.value
            .map(recipeId => recipeData[recipeId])
            .filter(recipe => recipe && checkRecipeRequirements(recipe))
    })
    
    // 当前炼丹进度
    const refinementProgress = computed(() => {
        if (!isRefining.value || !currentRefinement.value) return 0
        
        const elapsed = Date.now() - currentRefinement.value.startTime
        const progress = Math.min(elapsed / currentRefinement.value.duration, 1)
        return Math.floor(progress * 100)
    })
    
    // 炼丹成功率
    const successRate = computed(() => {
        return Math.min(alchemyLevel.value * 0.05 + successRateBonus.value, 0.95) // 最高95%
    })
    
    // 学习新配方
    function learnRecipe(recipeId) {
        if (knownRecipes.value.includes(recipeId)) {
            gameLog.addLog('你已经掌握了这个配方。', 'info')
            return false
        }
        
        const recipe = recipeData[recipeId]
        if (!recipe) {
            gameLog.addLog('配方不存在。', 'error')
            return false
        }
        
        knownRecipes.value.push(recipeId)
        gameLog.addLog(`你学会了【${recipe.name}】的炼制方法！`, 'gain')
        gameLog.addLog(recipe.description, 'info')
        
        return true
    }
    
    // 检查配方要求
    function checkRecipeRequirements(recipe) {
        if (!recipe.requirements) return true
        
        const req = recipe.requirements
        
        // 检查炼丹等级
        if (req.alchemyLevel && alchemyLevel.value < req.alchemyLevel) {
            return false
        }
        
        // 检查修为要求
        if (req.cultivation && !player.stats.cultivation.includes(req.cultivation)) {
            return false
        }
        
        // 检查门派要求
        if (req.sect && player.sectData?.currentSect !== req.sect) {
            return false
        }
        
        // 检查声望要求
        if (req.reputation) {
            for (const [sectId, minRep] of Object.entries(req.reputation)) {
                const currentRep = player.sectData?.sectReputations[sectId] || 0
                if (currentRep < minRep) {
                    return false
                }
            }
        }
        
        return true
    }
    
    // 检查是否可以炼制
    function canRefine(recipeId) {
        const recipe = recipeData[recipeId]
        if (!recipe) {
            return { canRefine: false, reason: '配方不存在' }
        }
        
        // 检查是否已知配方
        if (!knownRecipes.value.includes(recipeId)) {
            return { canRefine: false, reason: '未掌握此配方' }
        }
        
        // 检查配方要求
        if (!checkRecipeRequirements(recipe)) {
            return { canRefine: false, reason: '不满足配方要求' }
        }
        
        // 检查是否正在炼制
        if (isRefining.value) {
            return { canRefine: false, reason: '正在炼制其他丹药' }
        }
        
        // 检查材料
        const missingMaterials = []
        recipe.materials.forEach(material => {
            const hasItem = player.inventory.find(item => 
                item.id === material.itemId && item.count >= material.count
            )
            if (!hasItem) {
                const itemName = itemData[material.itemId]?.name || material.itemId
                missingMaterials.push(`${itemName} x${material.count}`)
            }
        })
        
        if (missingMaterials.length > 0) {
            return { 
                canRefine: false, 
                reason: `缺少材料：${missingMaterials.join('、')}` 
            }
        }
        
        return { canRefine: true }
    }
    
    // 开始炼制
    function startRefining(recipeId) {
        const checkResult = canRefine(recipeId)
        if (!checkResult.canRefine) {
            gameLog.addLog(`无法炼制：${checkResult.reason}`, 'error')
            return false
        }
        
        const recipe = recipeData[recipeId]
        
        // 消耗材料
        recipe.materials.forEach(material => {
            player.removeItem(material.itemId, material.count)
        })
        
        // 开始炼制
        isRefining.value = true
        currentRefinement.value = {
            recipeId,
            startTime: Date.now(),
            duration: recipe.refinementTime
        }
        
        gameLog.addLog(`开始炼制【${recipe.name}】...`, 'info')
        gameLog.addLog('丹炉中火焰升腾，药香四溢。', 'info')
        
        // 设置完成定时器
        setTimeout(() => {
            completeRefinement()
        }, recipe.refinementTime)
        
        return true
    }
    
    // 完成炼制
    function completeRefinement() {
        if (!isRefining.value || !currentRefinement.value) return
        
        const recipe = recipeData[currentRefinement.value.recipeId]
        if (!recipe) return
        
        // 计算成功率
        const finalSuccessRate = calculateSuccessRate(recipe)
        const isSuccess = Math.random() < finalSuccessRate
        
        // 更新统计
        refinementStats.value.totalAttempts++
        
        if (isSuccess) {
            // 炼制成功
            refinementStats.value.successfulRefinements++
            
            // 计算丹药品质
            const quality = calculatePillQuality(recipe)
            const qualityInfo = pillQuality[quality]
            
            if (quality >= 5) {
                refinementStats.value.perfectPills++
            }
            
            // 生成丹药
            const pillId = recipe.result.itemId
            const count = recipe.result.count
            
            player.addItem(pillId, count)
            
            gameLog.addLog(`炼制成功！获得【${qualityInfo.name}${recipe.name}】 x${count}`, 'gain')
            
            if (quality >= 4) {
                gameLog.addLog('丹药品质极佳，散发着诱人的光泽！', 'gain')
            }
            
            // 获得炼丹经验
            const expGain = recipe.grade * 20 + quality * 5
            gainAlchemyExp(expGain)
            
        } else {
            // 炼制失败
            refinementStats.value.failedAttempts++
            gameLog.addLog(`炼制失败！丹炉中传出一声闷响，药材化为灰烬。`, 'loss')
            
            // 失败也有少量经验
            const expGain = recipe.grade * 5
            gainAlchemyExp(expGain)
        }
        
        // 重置炼制状态
        isRefining.value = false
        currentRefinement.value = null
    }
    
    // 计算炼制成功率
    function calculateSuccessRate(recipe) {
        let rate = recipe.baseSuccessRate
        
        // 炼丹等级加成
        const levelBonus = alchemyFactors.levelBonus[alchemyLevel.value] || 0
        rate += levelBonus
        
        // 悟性加成
        const intelligence = player.stats.intelligence || 5
        const intBonus = alchemyFactors.intelligenceBonus[intelligence] || 0
        rate += intBonus
        
        // 装备和技能加成
        rate += successRateBonus.value
        
        // 门派技能加成（天机阁炼丹精通）
        const hasAlchemyMastery = player.skills.some(s => s.id === 'alchemy_mastery')
        if (hasAlchemyMastery) {
            rate += 0.2 // 20%加成
        }
        
        return Math.min(rate, 0.95) // 最高95%成功率
    }
    
    // 计算丹药品质
    function calculatePillQuality(recipe) {
        const qualityRange = recipe.result.qualityRange
        const minQuality = qualityRange[0]
        const maxQuality = qualityRange[1]
        
        // 基础品质随机
        let quality = minQuality + Math.floor(Math.random() * (maxQuality - minQuality + 1))
        
        // 炼丹等级影响品质
        const levelBonus = Math.floor(alchemyLevel.value / 5)
        quality += levelBonus
        
        // 悟性影响品质
        const intelligence = player.stats.intelligence || 5
        if (intelligence >= 8) {
            quality += 1
        }
        
        // 品质加成
        quality += qualityBonus.value
        
        // 门派技能加成
        const hasAlchemyMastery = player.skills.some(s => s.id === 'alchemy_mastery')
        if (hasAlchemyMastery && Math.random() < 0.1) {
            quality += 1 // 10%概率额外+1品质
        }
        
        return Math.min(Math.max(quality, 1), 6) // 品质范围1-6
    }
    
    // 获得炼丹经验
    function gainAlchemyExp(amount) {
        alchemyExp.value += amount
        gameLog.addLog(`炼丹经验 +${amount}`, 'gain')
        
        // 检查升级
        while (alchemyExp.value >= alchemyExpToNext.value) {
            levelUpAlchemy()
        }
    }
    
    // 炼丹等级提升
    function levelUpAlchemy() {
        alchemyExp.value -= alchemyExpToNext.value
        alchemyLevel.value++
        alchemyExpToNext.value = Math.floor(alchemyExpToNext.value * 1.5)
        
        gameLog.addLog(`炼丹等级提升！当前等级：${alchemyLevel.value}`, 'gain')
        gameLog.addLog('你对炼丹之道有了更深的理解。', 'info')
        
        // 等级提升奖励
        if (alchemyLevel.value % 5 === 0) {
            gameLog.addLog('炼丹技艺大幅提升，成功率和品质都有所改善！', 'gain')
        }
    }
    
    // 中断炼制
    function cancelRefinement() {
        if (!isRefining.value) return false
        
        gameLog.addLog('你中断了炼制过程，材料已经浪费。', 'warning')
        
        isRefining.value = false
        currentRefinement.value = null
        
        return true
    }
    
    // 获取材料信息
    function getMaterialInfo(materialId) {
        const item = itemData[materialId]
        if (!item) return null
        
        const playerItem = player.inventory.find(i => i.id === materialId)
        const hasCount = playerItem ? playerItem.count : 0
        
        return {
            ...item,
            hasCount,
            sufficient: hasCount > 0
        }
    }
    
    // 获取配方详细信息
    function getRecipeDetails(recipeId) {
        const recipe = recipeData[recipeId]
        if (!recipe) return null
        
        const materials = recipe.materials.map(material => {
            const info = getMaterialInfo(material.itemId)
            return {
                ...material,
                ...info,
                sufficient: info.hasCount >= material.count
            }
        })
        
        const canRefineResult = canRefine(recipeId)
        
        return {
            ...recipe,
            materials,
            canRefine: canRefineResult.canRefine,
            reason: canRefineResult.reason,
            successRate: calculateSuccessRate(recipe)
        }
    }
    
    return {
        // 状态
        alchemyLevel,
        alchemyExp,
        alchemyExpToNext,
        knownRecipes,
        isRefining,
        currentRefinement,
        refinementStats,
        successRateBonus,
        qualityBonus,
        
        // 计算属性
        availableRecipes,
        refinementProgress,
        successRate,
        
        // 方法
        learnRecipe,
        canRefine,
        startRefining,
        cancelRefinement,
        getMaterialInfo,
        getRecipeDetails,
        gainAlchemyExp,
        
        // 重置方法
        $reset: () => {
            alchemyLevel.value = 1
            alchemyExp.value = 0
            knownRecipes.value = ['qi_gathering_pill']
            isRefining.value = false
            currentRefinement.value = null
            refinementStats.value = {
                totalAttempts: 0,
                successfulRefinements: 0,
                perfectPills: 0,
                failedAttempts: 0
            }
            successRateBonus.value = 0
            qualityBonus.value = 0
        }
    }
})