export const mapData = {
    'cloud_village': {
        id: 'cloud_village',
        name: '云隐村',
        region: '新人村',
        dangerLevel: 0,
        description: '一个与世隔绝的小山村，村民们过着日出而作、日落而息的平静生活。',
        exits: {
            'mountain_path': 'cave_start',
            'forest': 'forest_entrance'
        },
        actions: [
            { id: 'rest', label: '客栈休息', duration: 3000 } // Rest action
        ]
    },
    'cave_start': {
        id: 'cave_start',
        name: '天弃洞',
        region: '后山',
        dangerLevel: 1,
        description: '一个潮湿阴暗的岩洞，四周长满了青苔。岩壁上似乎有一些古老的刻痕。',
        exits: {
            'out': 'cloud_village'
        },
        actions: [
            { id: 'search_cave', label: '搜寻', duration: 2000 },
            { id: 'read_inscription', label: '研读刻痕', duration: 5000 }
        ]
    },
    'forest_entrance': {
        id: 'forest_entrance',
        name: '迷雾林边缘',
        region: '迷雾林',
        dangerLevel: 2,
        description: '一片终年被迷雾笼罩的森林，据说深处有灵药生长。隐约可以听到深处传来的兽吼声。',
        exits: {
            'village': 'cloud_village',
            'deep': 'forest_inner',
            'temple': 'old_temple'
        },
        resources: [
            { type: 'herb', itemId: 'spirit_grass', chance: 0.6, cooldown: 60000 },
            { type: 'herb', itemId: 'blood_ginseng', chance: 0.2, cooldown: 120000 }
        ],
        enemies: [
            { id: 'wild_wolf', chance: 0.3 }
        ],
        actions: [
            { id: 'gather_herbs', label: '采集草药', type: 'gather', duration: 3000 }
        ]
    },
    'forest_inner': {
        id: 'forest_inner',
        name: '迷雾林深处',
        region: '迷雾林',
        dangerLevel: 5,
        description: '迷雾更加浓重了，几乎伸手不见五指。这里的树木扭曲怪异，仿佛在注视着你。',
        exits: {
            'out': 'forest_entrance',
            'valley': 'hidden_valley'
        },
        resources: [
            { type: 'herb', itemId: 'blood_ginseng', chance: 0.4, cooldown: 120000 }
        ],
        enemies: [
            { id: 'wild_wolf', chance: 0.4 },
            { id: 'spirit_beast', chance: 0.1 }
        ],
        actions: [
            { id: 'gather_herbs', label: '采集草药', type: 'gather', duration: 3000 }
        ]
    },
    'hidden_valley': {
        id: 'hidden_valley',
        name: '幽隐谷',
        region: '秘境',
        dangerLevel: 8,
        description: '穿过迷雾林，眼前豁然开朗。这里鸟语花香，灵气充沛，仿佛世外桃源。',
        exits: {
            'out': 'forest_inner',
            'ruins': 'sect_ruins'
        },
        resources: [
            { type: 'herb', itemId: 'amethyst_lotus', chance: 0.15, cooldown: 300000 }
        ],
        enemies: [
            { id: 'spirit_beast', chance: 0.3 }
        ],
        actions: [
            { id: 'gather_herbs', label: '采集草药', type: 'gather', duration: 4000 },
            { id: 'meditate', label: '打坐调息', duration: 5000 }
        ]
    },
    'old_temple': {
        id: 'old_temple',
        name: '破败古庙',
        region: '迷雾林',
        dangerLevel: 3,
        description: '一座荒废已久的古庙，断壁残垣中依稀可见当年的辉煌。',
        exits: {
            'forest': 'forest_entrance'
        },
        enemies: [
            { id: 'bandit', chance: 0.4 }
        ],
        actions: [
            { id: 'pray', label: '参拜', duration: 2000 }
        ]
    },
    'sect_ruins': {
        id: 'sect_ruins',
        name: '宗门遗址',
        region: '遗迹',
        dangerLevel: 10,
        description: '曾经显赫一时的宗门，如今只剩下一片废墟。空气中弥漫着肃杀之气。',
        exits: {
            'valley': 'hidden_valley'
        },
        enemies: [
            { id: 'sect_disciple', chance: 0.4 },
            { id: 'bandit', chance: 0.2 }
        ],
        actions: [
            { id: 'search_ruins', label: '搜寻遗物', duration: 4000 }
        ]
    },
    
    // 新增位置供奇遇系统使用
    'forest_path': {
        id: 'forest_path',
        name: '林间小径',
        region: '迷雾林',
        dangerLevel: 3,
        description: '一条蜿蜒的小径穿过茂密的森林，两旁古树参天，偶尔有鸟鸣声传来。',
        exits: {
            'entrance': 'forest_entrance',
            'inner': 'forest_inner'
        },
        resources: [
            { type: 'herb', itemId: 'spirit_grass', chance: 0.4, cooldown: 90000 }
        ],
        enemies: [
            { id: 'wild_wolf', chance: 0.2 }
        ],
        actions: [
            { id: 'gather_herbs', label: '采集草药', type: 'gather', duration: 3000 }
        ]
    },
    
    'mountain_trail': {
        id: 'mountain_trail',
        name: '山间古道',
        region: '青山',
        dangerLevel: 4,
        description: '一条古老的山道，石阶斑驳，两侧悬崖峭壁。远处可见云雾缭绕的山峰。',
        exits: {
            'village': 'cloud_village',
            'peak': 'mountain_peak'
        },
        resources: [
            { type: 'mineral', itemId: 'moonstone_powder', chance: 0.1, cooldown: 180000 }
        ],
        enemies: [
            { id: 'bandit', chance: 0.3 }
        ],
        actions: [
            { id: 'gather_herbs', label: '采集矿物', type: 'gather', duration: 4000 }
        ]
    },
    
    'mountain_peak': {
        id: 'mountain_peak',
        name: '青山之巅',
        region: '青山',
        dangerLevel: 6,
        description: '青山的最高峰，云雾缭绕，视野开阔。这里灵气浓郁，是修炼的绝佳之地。',
        exits: {
            'trail': 'mountain_trail'
        },
        resources: [
            { type: 'herb', itemId: 'amethyst_lotus', chance: 0.08, cooldown: 360000 }
        ],
        actions: [
            { id: 'meditate', label: '山顶修炼', duration: 8000 },
            { id: 'gather_herbs', label: '采集灵草', type: 'gather', duration: 5000 }
        ]
    },
    
    'peaceful_valley': {
        id: 'peaceful_valley',
        name: '宁静谷',
        region: '秘境',
        dangerLevel: 1,
        description: '一个与世隔绝的山谷，溪水潺潺，花香阵阵。这里远离尘嚣，是静心修炼的好地方。',
        exits: {
            'valley': 'hidden_valley'
        },
        resources: [
            { type: 'herb', itemId: 'healing_herb', chance: 0.5, cooldown: 120000 }
        ],
        actions: [
            { id: 'meditate', label: '静心修炼', duration: 6000 },
            { id: 'gather_herbs', label: '采集药草', type: 'gather', duration: 3000 }
        ]
    },
    
    'bamboo_grove': {
        id: 'bamboo_grove',
        name: '翠竹林',
        region: '竹海',
        dangerLevel: 2,
        description: '一片翠绿的竹林，竹叶沙沙作响，清风徐来。据说常有高人在此隐居修炼。',
        exits: {
            'valley': 'peaceful_valley'
        },
        resources: [
            { type: 'herb', itemId: 'spirit_grass', chance: 0.3, cooldown: 100000 }
        ],
        actions: [
            { id: 'meditate', label: '竹林悟道', duration: 7000 },
            { id: 'gather_herbs', label: '采集竹叶', type: 'gather', duration: 2000 }
        ]
    }
}
