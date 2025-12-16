// 奇遇事件配置数据
export const adventureData = {
    'mysterious_merchant': {
        id: 'mysterious_merchant',
        name: '神秘商人',
        description: '一个身披斗篷的商人向你走来，他的眼中闪烁着精明的光芒。"这位道友，我这里有些好东西，不知你是否有兴趣？"',
        triggerConditions: { 
            minLevel: 3,
            locations: ['forest_path', 'mountain_trail', 'forest_entrance'] 
        },
        cooldown: 3600000, // 1小时冷却
        choices: [
            { 
                id: 'buy_pill', 
                text: '购买丹药 (100金)', 
                requirements: { gold: 100 },
                results: {
                    success: {
                        message: '你花费100金购买了一颗【聚气丹】。商人满意地点点头，消失在夜色中。',
                        rewards: { items: [{ id: 'qi_gathering_pill', count: 1 }], gold: -100 }
                    }
                }
            },
            { 
                id: 'ask_info', 
                text: '询问修炼心得',
                results: {
                    success: {
                        message: '商人神秘一笑："修炼之道，在于持之以恒。"你若有所悟，获得了一些修炼经验。',
                        rewards: { xp: 50 }
                    }
                }
            },
            { 
                id: 'ignore', 
                text: '无视离开',
                results: {
                    success: {
                        message: '你对商人视而不见，径直离开。商人摇摇头，叹息一声。',
                        rewards: {}
                    }
                }
            }
        ]
    },
    'ancient_cave': {
        id: 'ancient_cave',
        name: '远古洞穴',
        description: '你在山壁上发现了一个隐秘的洞穴，洞口散发着淡淡的灵气。洞穴深处似乎有什么东西在发光。',
        triggerConditions: { 
            minLevel: 5,
            locations: ['mountain_peak'],
            福源: 3 // 需要一定福源才能发现
        },
        cooldown: 7200000, // 2小时冷却
        choices: [
            { 
                id: 'explore_deep', 
                text: '深入探索',
                requirements: { hp: 50 },
                results: {
                    success: {
                        message: '你小心翼翼地深入洞穴，在最深处发现了一本【筑基心法】！但洞穴开始坍塌，你匆忙逃出。',
                        rewards: { items: [{ id: 'foundation_manual', count: 1 }], hp: -20 }
                    },
                    failure: {
                        message: '你的体力不足以支撑深入探索，只能遗憾地离开。',
                        rewards: {}
                    }
                }
            },
            { 
                id: 'collect_herbs', 
                text: '采集洞口灵草',
                results: {
                    success: {
                        message: '你在洞口采集到了一些【紫韵莲】，这些灵草品质极佳。',
                        rewards: { items: [{ id: 'amethyst_lotus', count: 2 }] }
                    }
                }
            },
            { 
                id: 'leave_carefully', 
                text: '谨慎离开',
                results: {
                    success: {
                        message: '你觉得此地过于危险，谨慎地离开了。有时候，保命比寻宝更重要。',
                        rewards: { xp: 10 }
                    }
                }
            }
        ]
    },
    'wandering_master': {
        id: 'wandering_master',
        name: '游方高人',
        description: '一位仙风道骨的老者坐在路边，正在品茶。他看到你走来，微笑着点点头："小友有修仙之资，不知是否愿意接受老夫的考验？"',
        triggerConditions: { 
            minLevel: 8,
            cultivation: '筑基境',
            locations: ['peaceful_valley', 'bamboo_grove', 'mountain_peak']
        },
        cooldown: 10800000, // 3小时冷却
        choices: [
            { 
                id: 'accept_test', 
                text: '接受考验',
                results: {
                    success: {
                        message: '老者满意地点头："不错，你的心性很好。这本【云游心法】就传授给你吧。"说完便飘然而去。',
                        rewards: { items: [{ id: 'wandering_technique', count: 1 }], xp: 100 }
                    }
                }
            },
            { 
                id: 'decline_politely', 
                text: '礼貌拒绝',
                results: {
                    success: {
                        message: '老者理解地点点头："修炼之路因人而异，你有自己的道路。"他赠送了你一些丹药作为鼓励。',
                        rewards: { items: [{ id: 'spirit_grass', count: 3 }] }
                    }
                }
            }
        ]
    }
}

// 奇遇触发权重配置
export const adventureWeights = {
    'mysterious_merchant': 0.15,
    'ancient_cave': 0.08,
    'wandering_master': 0.05
}