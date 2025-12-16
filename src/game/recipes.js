// 炼丹配方配置数据
export const recipeData = {
    // 基础丹药
    'qi_gathering_pill': {
        id: 'qi_gathering_pill',
        name: '聚气丹',
        description: '能够快速恢复内力的基础丹药，是修炼者的常备之物。',
        grade: 1, // 丹药品级
        materials: [
            { itemId: 'spirit_grass', count: 2, name: '灵草' },
            { itemId: 'blood_ginseng', count: 1, name: '血参' }
        ],
        baseSuccessRate: 0.7,
        refinementTime: 30000, // 30秒
        result: { 
            itemId: 'qi_gathering_pill', 
            count: 1,
            qualityRange: [1, 3] // 品质范围1-3
        },
        requirements: {
            alchemyLevel: 1,
            sect: null // 无门派要求
        }
    },
    'healing_pill': {
        id: 'healing_pill',
        name: '疗伤丹',
        description: '治疗外伤的丹药，能够快速恢复气血。',
        grade: 1,
        materials: [
            { itemId: 'spirit_grass', count: 1, name: '灵草' },
            { itemId: 'blood_ginseng', count: 2, name: '血参' },
            { itemId: 'healing_herb', count: 1, name: '疗伤草' }
        ],
        baseSuccessRate: 0.6,
        refinementTime: 45000, // 45秒
        result: { 
            itemId: 'healing_pill', 
            count: 1,
            qualityRange: [1, 3]
        },
        requirements: {
            alchemyLevel: 2
        }
    },
    
    // 中级丹药
    'foundation_pill': {
        id: 'foundation_pill',
        name: '筑基丹',
        description: '帮助修炼者突破筑基境的珍贵丹药，药效温和持久。',
        grade: 2,
        materials: [
            { itemId: 'amethyst_lotus', count: 1, name: '紫韵莲' },
            { itemId: 'spirit_grass', count: 3, name: '灵草' },
            { itemId: 'moonstone_powder', count: 1, name: '月石粉' }
        ],
        baseSuccessRate: 0.4,
        refinementTime: 120000, // 2分钟
        result: { 
            itemId: 'foundation_pill', 
            count: 1,
            qualityRange: [2, 4]
        },
        requirements: {
            alchemyLevel: 5,
            cultivation: '炼体境九重'
        }
    },
    'spirit_enhancement_pill': {
        id: 'spirit_enhancement_pill',
        name: '增灵丹',
        description: '能够永久提升修炼者悟性的稀有丹药。',
        grade: 2,
        materials: [
            { itemId: 'wisdom_fruit', count: 1, name: '智慧果' },
            { itemId: 'amethyst_lotus', count: 2, name: '紫韵莲' },
            { itemId: 'spirit_crystal', count: 1, name: '灵晶' }
        ],
        baseSuccessRate: 0.3,
        refinementTime: 180000, // 3分钟
        result: { 
            itemId: 'spirit_enhancement_pill', 
            count: 1,
            qualityRange: [2, 5]
        },
        requirements: {
            alchemyLevel: 8,
            sect: 'tianji_pavilion' // 天机阁专属
        }
    },
    
    // 高级丹药
    'golden_core_pill': {
        id: 'golden_core_pill',
        name: '金丹',
        description: '传说中的仙丹，能够让修炼者直接突破到金丹境界。',
        grade: 3,
        materials: [
            { itemId: 'dragon_blood_grass', count: 1, name: '龙血草' },
            { itemId: 'phoenix_feather', count: 1, name: '凤凰羽' },
            { itemId: 'amethyst_lotus', count: 5, name: '紫韵莲' },
            { itemId: 'heavenly_crystal', count: 1, name: '天晶石' }
        ],
        baseSuccessRate: 0.1,
        refinementTime: 600000, // 10分钟
        result: { 
            itemId: 'golden_core_pill', 
            count: 1,
            qualityRange: [4, 6]
        },
        requirements: {
            alchemyLevel: 15,
            cultivation: '筑基境圆满',
            sect: 'tianji_pavilion',
            reputation: { tianji_pavilion: 6000 }
        }
    }
}

// 丹药品质配置
export const pillQuality = {
    1: { name: '下品', multiplier: 1.0, color: 'text-gray-600' },
    2: { name: '中品', multiplier: 1.3, color: 'text-green-600' },
    3: { name: '上品', multiplier: 1.6, color: 'text-blue-600' },
    4: { name: '极品', multiplier: 2.0, color: 'text-purple-600' },
    5: { name: '完美', multiplier: 2.5, color: 'text-yellow-600' },
    6: { name: '传说', multiplier: 3.0, color: 'text-red-600' }
}

// 炼丹成功率影响因素
export const alchemyFactors = {
    // 玩家悟性对成功率的影响
    intelligenceBonus: {
        5: 0.0,
        6: 0.05,
        7: 0.1,
        8: 0.15,
        9: 0.2,
        10: 0.25
    },
    
    // 炼丹等级对成功率的影响
    levelBonus: {
        1: 0.0,
        5: 0.1,
        10: 0.2,
        15: 0.3,
        20: 0.4
    },
    
    // 材料品质对成功率的影响
    materialQualityBonus: {
        'common': 0.0,
        'uncommon': 0.05,
        'rare': 0.1,
        'epic': 0.15,
        'legendary': 0.2
    }
}