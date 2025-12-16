// 门派系统配置数据
export const sectData = {
    'qingshan_sect': {
        id: 'qingshan_sect',
        name: '青山派',
        description: '以剑法闻名的正道门派，门下弟子个个剑术精湛，行走江湖时以侠义著称。',
        type: 'righteous', // 正道
        joinRequirements: { 
            level: 5, 
            cultivation: '筑基境',
            reputation: { qingshan_sect: 0 } // 无负面声望即可
        },
        location: 'qingshan_mountain',
        exclusiveSkills: ['qingshan_sword_art', 'cloud_step_technique', 'righteous_qi_method'],
        reputationLevels: {
            0: { rank: '外门弟子', benefits: ['basic_training'] },
            1000: { rank: '内门弟子', benefits: ['advanced_training', 'sect_library'] },
            3000: { rank: '核心弟子', benefits: ['master_guidance', 'secret_techniques'] },
            8000: { rank: '长老', benefits: ['sect_management', 'forbidden_arts'] }
        },
        dailyTasks: [
            {
                id: 'sword_practice',
                name: '剑法修炼',
                description: '在练武场修炼剑法',
                rewards: { xp: 30, reputation: { qingshan_sect: 10 } }
            },
            {
                id: 'help_juniors',
                name: '指导师弟',
                description: '帮助新入门的师弟师妹',
                requirements: { reputation: { qingshan_sect: 1000 } },
                rewards: { xp: 50, reputation: { qingshan_sect: 20 } }
            }
        ]
    },
    'xuanyin_sect': {
        id: 'xuanyin_sect',
        name: '玄阴宗',
        description: '修炼阴寒功法的魔道宗门，门人行事诡秘，但实力强横。',
        type: 'demonic', // 魔道
        joinRequirements: { 
            level: 6, 
            cultivation: '筑基境',
            alignment: 'evil' // 需要邪恶倾向
        },
        location: 'dark_valley',
        exclusiveSkills: ['xuanyin_palm', 'shadow_escape', 'soul_devouring_art'],
        reputationLevels: {
            0: { rank: '外门弟子', benefits: ['dark_training'] },
            1200: { rank: '内门弟子', benefits: ['forbidden_knowledge'] },
            4000: { rank: '护法', benefits: ['demonic_artifacts'] },
            10000: { rank: '长老', benefits: ['sect_secrets', 'blood_rituals'] }
        },
        dailyTasks: [
            {
                id: 'dark_meditation',
                name: '阴寒修炼',
                description: '在阴煞之地修炼功法',
                rewards: { xp: 40, reputation: { xuanyin_sect: 15 } }
            }
        ]
    },
    'tianji_pavilion': {
        id: 'tianji_pavilion',
        name: '天机阁',
        description: '以炼丹制器闻名的中立门派，不参与正邪之争，专注于修仙技艺的研究。',
        type: 'neutral', // 中立
        joinRequirements: { 
            level: 7, 
            cultivation: '筑基境',
            intelligence: 8 // 需要较高悟性
        },
        location: 'floating_island',
        exclusiveSkills: ['alchemy_mastery', 'artifact_crafting', 'formation_array'],
        reputationLevels: {
            0: { rank: '学徒', benefits: ['basic_recipes'] },
            800: { rank: '炼丹师', benefits: ['advanced_recipes', 'pill_furnace'] },
            2500: { rank: '大师', benefits: ['rare_recipes', 'master_workshop'] },
            6000: { rank: '宗师', benefits: ['legendary_recipes', 'sect_treasury'] }
        },
        dailyTasks: [
            {
                id: 'refine_pills',
                name: '炼制丹药',
                description: '为门派炼制基础丹药',
                rewards: { xp: 25, reputation: { tianji_pavilion: 12 }, items: [{ id: 'spirit_grass', count: 1 }] }
            },
            {
                id: 'research_formation',
                name: '阵法研究',
                description: '研究古老的阵法典籍',
                requirements: { reputation: { tianji_pavilion: 800 } },
                rewards: { xp: 60, reputation: { tianji_pavilion: 25 } }
            }
        ]
    }
}

// 门派关系配置
export const sectRelations = {
    'qingshan_sect': {
        allies: [],
        enemies: ['xuanyin_sect'],
        neutral: ['tianji_pavilion']
    },
    'xuanyin_sect': {
        allies: [],
        enemies: ['qingshan_sect'],
        neutral: ['tianji_pavilion']
    },
    'tianji_pavilion': {
        allies: [],
        enemies: [],
        neutral: ['qingshan_sect', 'xuanyin_sect']
    }
}

// 门派专属技能数据
export const sectSkills = {
    // 青山派技能
    'qingshan_sword_art': {
        id: 'qingshan_sword_art',
        name: '青山剑法',
        description: '青山派的基础剑法，招式朴实无华但威力不俗。',
        type: 'combat',
        requirements: { sect: 'qingshan_sect', reputation: { qingshan_sect: 0 } },
        effects: { attack: 8, agility: 3 }
    },
    'cloud_step_technique': {
        id: 'cloud_step_technique',
        name: '踏云步',
        description: '青山派的轻功身法，如踏云而行。',
        type: 'movement',
        requirements: { sect: 'qingshan_sect', reputation: { qingshan_sect: 1000 } },
        effects: { agility: 10, dodge: 15 }
    },
    'righteous_qi_method': {
        id: 'righteous_qi_method',
        name: '浩然正气诀',
        description: '青山派的内功心法，修炼正气，可抵御邪法。',
        type: 'internal',
        requirements: { sect: 'qingshan_sect', reputation: { qingshan_sect: 3000 } },
        effects: { maxMp: 50, defense: 8, resistance: 'demonic' }
    },
    
    // 玄阴宗技能
    'xuanyin_palm': {
        id: 'xuanyin_palm',
        name: '玄阴掌',
        description: '玄阴宗的阴寒掌法，掌力阴毒，中者如坠冰窟。',
        type: 'combat',
        requirements: { sect: 'xuanyin_sect', reputation: { xuanyin_sect: 0 } },
        effects: { attack: 10, special: 'cold_damage' }
    },
    'shadow_escape': {
        id: 'shadow_escape',
        name: '影遁术',
        description: '玄阴宗的遁术，可融入阴影之中。',
        type: 'utility',
        requirements: { sect: 'xuanyin_sect', reputation: { xuanyin_sect: 1200 } },
        effects: { agility: 15, stealth: 20 }
    },
    
    // 天机阁技能
    'alchemy_mastery': {
        id: 'alchemy_mastery',
        name: '炼丹精通',
        description: '天机阁的炼丹技艺，大幅提升炼丹成功率。',
        type: 'crafting',
        requirements: { sect: 'tianji_pavilion', reputation: { tianji_pavilion: 0 } },
        effects: { alchemy_success_rate: 0.2, alchemy_quality: 0.1 }
    },
    'formation_array': {
        id: 'formation_array',
        name: '阵法精通',
        description: '天机阁的阵法技艺，可布置各种辅助阵法。',
        type: 'utility',
        requirements: { sect: 'tianji_pavilion', reputation: { tianji_pavilion: 2500 } },
        effects: { formation_power: 1.5 }
    }
}