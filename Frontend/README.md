# 花境 (Flower Garden) 前端 — Vue 3 H5

## 项目简介

花境前端基于 Vue 3 + TypeScript + Vite 构建，使用高德地图 JSAPI 2.0 提供花卉地图展示，Pinia 管理状态，Three.js 实现 3D 花圃效果。

## 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 7
- **状态管理**: Pinia 3
- **路由**: Vue Router 4
- **地图**: 高德地图 JSAPI 2.0 (`@amap/amap-jsapi-loader`)
- **3D 渲染**: Three.js 0.183
- **样式**: Sass (SCSS)

## 页面结构

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 主页，展示花卉卡片列表 |
| `/map` | Map | 高德地图，展示花卉地点与花期状态 |
| `/checkin` | Checkin | 打卡发布页 |
| `/garden` | Garden | 3D 花圃成就墙 |
| `/profile` | Profile | 个人中心 |
| `/login` | Login | 登录页 |
| `/register` | Register | 注册页 |
| `/user/:id` | UserDetail | 用户详情页 |
| `/navigation` | Navigation | 导航页 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 环境要求

- Node.js ≥ 20.19 或 ≥ 22.12
- 后端服务运行在 `http://localhost:5000`（可在 `services/api.ts` 中配置）

## 项目结构

```
src/
├── views/           # 页面组件
│   ├── Home.vue     # 主页
│   ├── Map.vue      # 地图页
│   ├── Checkin.vue  # 打卡页
│   ├── Garden.vue   # 花圃（3D）
│   ├── Profile.vue  # 个人中心
│   ├── login.vue    # 登录
│   ├── Register.vue # 注册
│   ├── UserDetail.vue # 用户详情
│   └── Navigation.vue # 导航
├── components/      # 公共组件
│   ├── BottomNav.vue    # 底部导航栏
│   └── FlowerSuggest.vue # 花卉搜索建议
├── services/        # API 服务层
│   ├── api.ts       # 后端 API 调用
│   └── mockData.ts  # Mock 数据（开发用）
├── stores/          # Pinia 状态管理
│   ├── auth.ts      # 认证状态
│   ├── checkin.ts   # 打卡状态
│   ├── location.ts  # 地点状态
│   └── achievement.ts # 成就状态
├── icon/            # SVG 图标
├── App.vue          # 根组件
├── main.ts          # 入口文件
└── router.ts        # 路由配置
```

## 相关文档

- [API 文档](API_DOC.md) — 后端接口详细说明
- [根目录 README](../README.md) — 项目整体说明
