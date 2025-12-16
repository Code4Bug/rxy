// 任务系统配置数据
export const questData = {
    // 主线任务
    'first_cultivation': {
        id: 'first_cultivation',
        name: '初入修仙路',
        description: '学会第一个内功心法，踏上修仙之路。',
        type: 'main',
        chapter: 1,
        objectives: [
            { 
                type: 'learn_skill', 
                target: 'basic_meditation', 
                current: 0, 
                required: 1,
                description: '学会基础内功'
            }
        ],
        rewards: { 
            xp: 100, 
            items: [{ id: 'spirit_grass', count: 3 }],
            title: '修仙新人'
        },
        nextQuest: 'first_breakthrough'
    },
    'first_breakthrough': {
        id: 'first_breakthrough',
        name: '初次突破',
        description: '达到炼体境三重，感受修为提升的喜悦。',
        type: 'main',
        chapter: 1,
        objectives: [
            { 
                type: 'reach_level', 
                target: 3, 
                current: 0, 
                required: 1,
                description: '达到3级'
            }
        ],
        rewards: { 
            xp: 200, 
            items: [{ id: 'broken_sword', count: 1 }],
            gold: 50
        },
        nextQuest: 'explore_world'
    },
    'explore_world': {
        id: 'explore_world',
        name: '初探江湖',
        description: '探索不同的地点，了解这个修仙世界。',
        type: 'main',
        chapter: 2,
        objectives: [
            { 
                type: 'visit_locations', 
                target: ['forest_path', 'mountain_trail', 'peaceful_valley'], 
                current: [], 
                required: 3,
                description: '探索3个不同地点'
            }
        ],
        rewards: { 
            xp: 300, 
            items: [{ id: 'basic_map', count: 1 }]
        },
        nextQuest: 'join_sect'
    },
    'join_sect': {
        id: 'join_sect',
        name: '拜入门派',
        description: '选择一个门派加入，开始系统的修炼。',
        type: 'main',
        chapter: 3,
        objectives: [
            { 
                type: 'join_sect', 
                target: 'any', 
                current: 0, 
                required: 1,
                description: '加入任意门派'
            }
        ],
        rewards: { 
            xp: 500, 
            items: [{ id: 'sect_token', count: 1 }]
        },
        nextQuest: 'first_alchemy'
    },
    'first_alchemy': {
        id: 'first_alchemy',
        name: '初试炼丹',
        description: '学习炼丹技艺，炼制你的第一颗丹药。',
        type: 'main',
        chapter: 4,
        objectives: [
            { 
                type: 'refine_pill', 
                target: 'any', 
                current: 0, 
                required: 1,
                description: '成功炼制一颗丹药'
            }
        ],
        rewards: { 
            xp: 400, 
            items: [{ id: 'basic_furnace', count: 1 }],
            alchemyXp: 100
        }
    },
    
    // 支线任务 - 青山派
    'qingshan_initiation': {
        id: 'qingshan_initiation',
        name: '青山入门试炼',
        description: '完成青山派的入门试炼，证明你的剑道天赋。',
        type: 'side',
        faction: 'qingshan_sect',
        objectives: [
            { 
                type: 'defeat_enemies', 
                target: 'training_dummy', 
                current: 0, 
                required: 5,
                description: '击败5个训练木人'
            },
            { 
                type: 'meditate', 
                target: 'sword_hall', 
                current: 0, 
                required: 3,
                description: '在剑堂冥想3次'
            }
        ],
        rewards: { 
            xp: 200, 
            reputation: { qingshan_sect: 100 },
            items: [{ id: 'qingshan_sword', count: 1 }]
        }
    },
    'qingshan_herb_gathering': {
        id: 'qingshan_herb_gathering',
        name: '为师门采药',
        description: '师父需要一些灵草来炼制丹药，帮助受伤的师兄弟。',
        type: 'side',
        faction: 'qingshan_sect',
        repeatable: true,
        objectives: [
            { 
                type: 'collect_items', 
                target: 'spirit_grass', 
                current: 0, 
                required: 10,
                description: '收集10株灵草'
            }
        ],
        rewards: { 
            xp: 150, 
            reputation: { qingshan_sect: 50 },
            gold: 30
        }
    },
    
    // 支线任务 - 天机阁
    'tianji_alchemy_test': {
        id: 'tianji_alchemy_test',
        name: '炼丹师考核',
        description: '通过天机阁的炼丹师考核，获得正式的炼丹师资格。',
        type: 'side',
        faction: 'tianji_pavilion',
        objectives: [
            { 
                type: 'refine_pills', 
                target: 'qi_gathering_pill', 
                current: 0, 
                required: 5,
                description: '成功炼制5颗聚气丹'
            },
            { 
                type: 'achieve_quality', 
                target: 'upper_grade', 
                current: 0, 
                required: 1,
                description: '炼制出1颗上品丹药'
            }
        ],
        rewards: { 
            xp: 300, 
            reputation: { tianji_pavilion: 200 },
            items: [{ id: 'alchemy_badge', count: 1 }],
            alchemyXp: 200
        }
    },
    
    // 日常任务
    'daily_cultivation': {
        id: 'daily_cultivation',
        name: '日常修炼',
        description: '坚持每日修炼，积少成多方能成就大道。',
        type: 'daily',
        objectives: [
            { 
                type: 'meditate', 
                target: 'any', 
                current: 0, 
                required: 3,
                description: '冥想修炼3次'
            }
        ],
        rewards: { 
            xp: 100, 
            items: [{ id: 'spirit_grass', count: 1 }]
        }
    },
    'daily_combat': {
        id: 'daily_combat',
        name: '实战历练',
        description: '通过战斗来磨练武艺和心性。',
        type: 'daily',
        objectives: [
            { 
                type: 'win_battles', 
                target: 'any', 
                current: 0, 
                required: 3,
                description: '获得3次战斗胜利'
            }
        ],
        rewards: { 
            xp: 120, 
            gold: 20
        }
    },
    
    // 成就任务
    'alchemy_master': {
        id: 'alchemy_master',
        name: '炼丹大师',
        description: '成为真正的炼丹大师，掌握高深的炼丹技艺。',
        type: 'achievement',
        objectives: [
            { 
                type: 'reach_alchemy_level', 
                target: 10, 
                current: 0, 
                required: 1,
                description: '炼丹等级达到10级'
            },
            { 
                type: 'refine_perfect_pills', 
                target: 'any', 
                current: 0, 
                required: 10,
                description: '炼制10颗完美品质丹药'
            }
        ],
        rewards: { 
            xp: 1000, 
            title: '炼丹大师',
            items: [{ id: 'master_furnace', count: 1 }]
        }
    },
    'sect_elder': {
        id: 'sect_elder',
        name: '门派长老',
        description: '在门派中获得崇高地位，成为德高望重的长老。',
        type: 'achievement',
        objectives: [
            { 
                type: 'reach_reputation', 
                target: 8000, 
                current: 0, 
                required: 1,
                description: '在任意门派声望达到8000'
            }
        ],
        rewards: { 
            xp: 2000, 
            title: '门派长老',
            items: [{ id: 'elder_token', count: 1 }]
        }
    }
}

// 任务类型配置
export const questTypes = {
    'main': { name: '主线任务', color: 'text-yellow-600', priority: 1 },
    'side': { name: '支线任务', color: 'text-blue-600', priority: 2 },
    'daily': { name: '日常任务', color: 'text-green-600', priority: 3 },
    'achievement': { name: '成就任务', color: 'text-purple-600', priority: 4 }
}

// 任务目标类型处理
export const objectiveHandlers = {
    'learn_skill': (objective, skillId) => {
        if (objective.target === skillId || objective.target === 'any') {
            objective.current = Math.min(objective.current + 1, objective.required)
        }
    },
    'reach_level': (objective, level) => {
        objective.current = Math.max(objective.current, level)
    },
    'visit_locations': (objective, locationId) => {
        if (objective.target.includes(locationId) && !objective.current.includes(locationId)) {
            objective.current.push(locationId)
        }
    },
    'join_sect': (objective, sectId) => {
        if (objective.target === sectId || objective.target === 'any') {
            objective.current = 1
        }
    },
    'refine_pill': (objective, pillId) => {
        if (objective.target === pillId || objective.target === 'any') {
            objective.current = Math.min(objective.current + 1, objective.required)
        }
    },
    'collect_items': (objective, itemId, count = 1) => {
        if (objective.target === itemId) {
            objective.current = Math.min(objective.current + count, objective.required)
        }
    },
    'defeat_enemies': (objective, enemyId) => {
        if (objective.target === enemyId || objective.target === 'any') {
            objective.current = Math.min(objective.current + 1, objective.required)
        }
    },
    'win_battles': (objective) => {
        objective.current = Math.min(objective.current + 1, objective.required)
    },
    'meditate': (objective, location = 'any') => {
        if (objective.target === location || objective.target === 'any') {
            objective.current = Math.min(objective.current + 1, objective.required)
        }
    }
}