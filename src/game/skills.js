export const skillData = {
    'basic_meditation': {
        id: 'basic_meditation',
        name: '基础吐纳法',
        type: 'internal', // internal, external, light
        description: '道家入门的呼吸法门，可缓慢增加内力上限。',
        level: 1,
        maxLevel: 10,
        effects: {
            maxMp: 10 // Per level
        }
    },
    'basic_sword': {
        id: 'basic_sword',
        name: '基础剑法',
        type: 'external',
        description: '江湖中常见的剑术，招式简单实用。',
        level: 1,
        maxLevel: 10,
        damageScale: 1.2,
        mpCost: 5,
        cooldown: 0
    },
    'iron_palm': {
        id: 'iron_palm',
        name: '铁砂掌',
        type: 'external',
        description: '刚猛霸道的掌法，需以药物淬炼双手方可大成。',
        level: 1,
        maxLevel: 10,
        damageScale: 1.5,
        mpCost: 15,
        cooldown: 0 // Cooldown management in combat not yet implemented fully, keeps simple
    },
    'cloud_steps': {
        id: 'cloud_steps',
        name: '云踪步',
        type: 'light',
        description: '身法飘忽不定，如云雾般难以捉摸，增加闪避。',
        level: 1,
        maxLevel: 10,
        dodgeRate: 0.1,
        mpCost: 10,
        cooldown: 0
    }
}
