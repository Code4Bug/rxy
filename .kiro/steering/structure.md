# 项目结构与架构模式

## 目录结构
```
src/
├── components/          # Vue组件
│   ├── ActionMenu.vue   # 操作菜单组件
│   ├── MainDisplay.vue  # 主显示区组件
│   └── StatusPanel.vue  # 状态面板组件
├── stores/              # Pinia状态管理
│   ├── combat.js        # 战斗状态
│   ├── gameLog.js       # 游戏日志
│   ├── player.js        # 玩家数据
│   └── world.js         # 世界状态
├── game/                # 游戏数据配置
│   ├── enemies.js       # 敌人数据
│   ├── items.js         # 物品数据
│   ├── map.js           # 地图数据
│   └── skills.js        # 技能数据
├── assets/              # 静态资源
│   ├── logo.svg         # 图标
│   └── main.css         # 全局样式
├── App.vue              # 根组件
└── main.js              # 应用入口
```

## 架构模式

### 组件架构
- **App.vue**: 根组件，负责整体布局和状态协调
- **MainDisplay.vue**: 游戏文本显示区，展示剧情和系统消息
- **ActionMenu.vue**: 交互菜单，根据游戏状态动态显示可用操作
- **StatusPanel.vue**: 角色状态面板，显示属性、装备、技能等信息

### 状态管理架构
- **player.js**: 玩家核心数据（属性、装备、技能、背包）
- **world.js**: 世界状态（当前位置、可用操作、环境交互）
- **combat.js**: 战斗系统（战斗状态、敌人、战斗操作）
- **gameLog.js**: 游戏日志系统（消息历史、文本显示）

### 数据配置架构
- **items.js**: 物品配置数据（装备属性、消耗品效果）
- **enemies.js**: 敌人配置数据（属性、技能、掉落）
- **skills.js**: 技能配置数据（效果、消耗、学习条件）
- **map.js**: 地图配置数据（位置、连接、事件）

## 设计原则
- **单一职责**: 每个store和组件职责明确
- **数据驱动**: UI完全由状态数据驱动
- **配置分离**: 游戏数据与逻辑代码分离
- **响应式设计**: 充分利用Vue3响应式系统
- **模块化**: 功能模块独立，便于维护扩展