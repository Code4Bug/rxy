# 技术栈与开发规范

## 核心技术栈
- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **样式框架**: Tailwind CSS
- **构建工具**: Vite
- **包管理**: npm

## 项目依赖
### 生产依赖
- `vue`: ^3.4.21 - 核心框架
- `pinia`: ^2.1.7 - 状态管理

### 开发依赖
- `@vitejs/plugin-vue`: ^5.0.4 - Vue插件
- `tailwindcss`: ^3.4.1 - CSS框架
- `autoprefixer`: ^10.4.18 - CSS后处理
- `postcss`: ^8.4.35 - CSS处理器

## 常用命令
```bash
# 安装依赖
npm install

# 开发服务器 (热重载)
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 开发环境要求
- Node.js >= 18.0.0
- 推荐IDE: VS Code + Vue (Official) 插件
- 推荐浏览器: Chrome/Edge (支持Vue DevTools)

## 代码规范
- 使用 Composition API 而非 Options API
- 组件采用 `<script setup>` 语法
- 状态管理统一使用 Pinia stores
- 样式使用 Tailwind CSS 类名，避免自定义CSS
- 文件命名采用 PascalCase (组件) 或 camelCase (工具文件)
- 所有注释和变量命名使用中文