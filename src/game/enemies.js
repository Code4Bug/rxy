export const enemyData = {
    'wild_wolf': {
        id: 'wild_wolf',
        name: '野狼',
        level: 1,
        hp: 30,
        maxHp: 30,
        attack: 8,
        defense: 2,
        exp: 10,
        drops: [
            { itemId: 'wolf_tooth', chance: 0.3 }
        ],
        description: '一只双眼泛着绿光的野狼，呲牙咧嘴，似乎饿了很久。'
    },
    'bandit': {
        id: 'bandit',
        name: '流寇',
        level: 3,
        hp: 80,
        maxHp: 80,
        attack: 15,
        defense: 5,
        exp: 25,
        drops: [
            { itemId: 'broken_sword', chance: 0.2 },
            { itemId: 'cloth_armor', chance: 0.1 }
        ],
        description: '面目狰狞的流寇，手中挥舞着一把锈迹斑斑的砍刀。'
    },
    'spirit_beast': {
        id: 'spirit_beast',
        name: '守护灵兽',
        level: 8,
        hp: 250,
        maxHp: 250,
        attack: 35,
        defense: 15,
        exp: 80,
        drops: [
            { itemId: 'amethyst_lotus', chance: 0.4 },
            { itemId: 'beast_core', chance: 0.2 }
        ],
        description: '浑身散发着淡紫色光芒的灵兽，守护着幽隐谷的宝物。'
    },
    'sect_disciple': {
        id: 'sect_disciple',
        name: '宗门弃徒',
        level: 5,
        hp: 120,
        maxHp: 120,
        attack: 25,
        defense: 8,
        exp: 40,
        drops: [
            { itemId: 'basic_script', chance: 0.1 }
        ],
        description: '身穿破旧宗门服饰的修仙者，眼神中充满了疯狂。'
    }
}
