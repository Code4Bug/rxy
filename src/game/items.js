export const itemData = {
    'yupei': {
        id: 'yupei',
        name: '神秘玉佩',
        type: 'misc',
        description: '一块温润的玉佩，上面刻着“任逍遥”三个字。',
        rarity: 'rare'
    },
    'broken_sword': {
        id: 'broken_sword',
        name: '生锈断剑',
        type: 'weapon',
        description: '一把断裂的铁剑，锈迹斑斑，但依稀可见昔日的锋利。',
        stats: { attack: 5 },
        rarity: 'common'
    },
    'basic_script': {
        id: 'basic_script',
        name: '基础内功',
        type: 'book',
        description: '一本泛黄的线装书，记载着粗浅的呼吸吐纳之法。',
        effect: 'learn_skill:basic_meditation',
        rarity: 'common'
    },
    // Materials / Herbs
    'spirit_grass': {
        id: 'spirit_grass',
        name: '灵草',
        type: 'material',
        description: '蕴含微弱灵气的草药，是炼制凝气丹的基础材料。',
        rarity: 'common'
    },
    'blood_ginseng': {
        id: 'blood_ginseng',
        name: '血参',
        type: 'material',
        description: '通体血红的人参，能够极大地补充气血。',
        rarity: 'uncommon'
    },
    'amethyst_lotus': {
        id: 'amethyst_lotus',
        name: '紫韵莲',
        type: 'material',
        description: '生长在灵气充裕之地的莲花，花瓣呈紫晶状，是筑基丹的主材。',
        rarity: 'rare'
    },
    'ancient_relic': {
        id: 'ancient_relic',
        name: '残破法器',
        type: 'misc',
        description: '从遗迹中挖掘出的法器碎片，虽然失去了灵性，但材质非凡。',
        rarity: 'rare'
    },
    
    // 炼丹材料扩展
    'healing_herb': {
        id: 'healing_herb',
        name: '疗伤草',
        type: 'material',
        description: '具有治疗功效的草药，是炼制疗伤丹的必需材料。',
        rarity: 'common'
    },
    'moonstone_powder': {
        id: 'moonstone_powder',
        name: '月石粉',
        type: 'material',
        description: '月光石研磨而成的粉末，蕴含纯净的月华之力。',
        rarity: 'uncommon'
    },
    'wisdom_fruit': {
        id: 'wisdom_fruit',
        name: '智慧果',
        type: 'material',
        description: '传说中能够增长智慧的神奇果实，极其罕见。',
        rarity: 'rare'
    },
    'spirit_crystal': {
        id: 'spirit_crystal',
        name: '灵晶',
        type: 'material',
        description: '凝聚了大量灵气的水晶，是高级丹药的重要材料。',
        rarity: 'rare'
    },
    'dragon_blood_grass': {
        id: 'dragon_blood_grass',
        name: '龙血草',
        type: 'material',
        description: '传说沾染了真龙之血的灵草，拥有不可思议的药效。',
        rarity: 'legendary'
    },
    'phoenix_feather': {
        id: 'phoenix_feather',
        name: '凤凰羽',
        type: 'material',
        description: '凤凰的羽毛，蕴含涅槃重生的神秘力量。',
        rarity: 'legendary'
    },
    'heavenly_crystal': {
        id: 'heavenly_crystal',
        name: '天晶石',
        type: 'material',
        description: '天外飞来的神秘晶石，据说是仙界的产物。',
        rarity: 'legendary'
    },
    
    // 丹药
    'qi_gathering_pill': {
        id: 'qi_gathering_pill',
        name: '聚气丹',
        type: 'consumable',
        description: '能够快速恢复内力的基础丹药。',
        effect: 'restore_mp:30',
        rarity: 'common'
    },
    'healing_pill': {
        id: 'healing_pill',
        name: '疗伤丹',
        type: 'consumable',
        description: '治疗外伤的丹药，能够快速恢复气血。',
        effect: 'restore_hp:50',
        rarity: 'common'
    },
    'foundation_pill': {
        id: 'foundation_pill',
        name: '筑基丹',
        type: 'consumable',
        description: '帮助修炼者突破筑基境的珍贵丹药。',
        effect: 'breakthrough_aid:筑基境',
        rarity: 'uncommon'
    },
    'spirit_enhancement_pill': {
        id: 'spirit_enhancement_pill',
        name: '增灵丹',
        type: 'consumable',
        description: '能够永久提升修炼者悟性的稀有丹药。',
        effect: 'permanent_stat:intelligence:1',
        rarity: 'rare'
    },
    'golden_core_pill': {
        id: 'golden_core_pill',
        name: '金丹',
        type: 'consumable',
        description: '传说中的仙丹，能够让修炼者直接突破到金丹境界。',
        effect: 'breakthrough:金丹境',
        rarity: 'legendary'
    },
    
    // 门派相关物品
    'qingshan_sword': {
        id: 'qingshan_sword',
        name: '青山剑',
        type: 'weapon',
        description: '青山派制式长剑，剑身刻有青山二字。',
        stats: { attack: 12, agility: 2 },
        rarity: 'uncommon'
    },
    'sect_token': {
        id: 'sect_token',
        name: '门派令牌',
        type: 'misc',
        description: '证明门派弟子身份的令牌。',
        rarity: 'uncommon'
    },
    'alchemy_badge': {
        id: 'alchemy_badge',
        name: '炼丹师徽章',
        type: 'misc',
        description: '天机阁颁发的炼丹师资格证明。',
        rarity: 'rare'
    },
    'elder_token': {
        id: 'elder_token',
        name: '长老令',
        type: 'misc',
        description: '门派长老的身份象征，拥有极高的权威。',
        rarity: 'epic'
    },
    
    // 炼丹工具
    'basic_furnace': {
        id: 'basic_furnace',
        name: '基础丹炉',
        type: 'tool',
        description: '最基础的炼丹炉，适合炼制低级丹药。',
        effect: 'alchemy_bonus:0.1',
        rarity: 'common'
    },
    'master_furnace': {
        id: 'master_furnace',
        name: '大师丹炉',
        type: 'tool',
        description: '炼丹大师使用的高级丹炉，大幅提升炼丹成功率。',
        effect: 'alchemy_bonus:0.3',
        rarity: 'epic'
    },
    
    // 其他物品
    'basic_map': {
        id: 'basic_map',
        name: '江湖地图',
        type: 'misc',
        description: '记录了附近地区的简易地图。',
        rarity: 'common'
    },
    'foundation_manual': {
        id: 'foundation_manual',
        name: '筑基心法',
        type: 'book',
        description: '记录筑基境修炼方法的珍贵典籍。',
        effect: 'learn_skill:foundation_method',
        rarity: 'rare'
    },
    'wandering_technique': {
        id: 'wandering_technique',
        name: '云游心法',
        type: 'book',
        description: '游方高人传授的独特心法，能够提升修炼效率。',
        effect: 'learn_skill:wandering_meditation',
        rarity: 'rare'
    },
    
    // 新增缺失的物品
    'healing_herb': {
        id: 'healing_herb',
        name: '疗伤草',
        type: 'material',
        description: '具有治疗功效的草药，是炼制疗伤丹的必需材料。',
        rarity: 'common'
    }
}
