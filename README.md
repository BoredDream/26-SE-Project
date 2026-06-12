# 🌸 狮山花园

<div align="center">

**不再错过每一次花开**

*一款校园花卉实时地图应用，用众包打卡驱动花期数据，让校园里的每一朵花都被记录、被分享、被珍藏。*

---

![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js)
![uni-app](https://img.shields.io/badge/uni--app-H5%20%2B%20%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F-2B9939?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/license-MIT-F48FB1?style=flat-square)

</div>

---

## ✨ 产品简介

> **狮山花园**是一款面向校园师生的花卉地图打卡应用。校园里的花每年如期绽放，却总有人因为不知道地点、错过花期而留下遗憾。狮山花园以校园地图为载体，通过用户众包打卡实时维护花期状态，让每一位同学都能在最美的时刻赶到最美的地点。

### 核心理念

```
打卡即数据  ·  花开即通知  ·  赏花不错过
```

每一次打卡既是内容产出，也是花期数据贡献，形成无需专职运营的自驱动飞轮。

---

## 🗺 功能一览

<table>
<tr>
<td width="50%">

### 🌸 实时花卉地图

- 校园地图展示所有花卉地点
- 花点状态实时反映花期（休眠 / 含苞 / 盛开 / 凋谢）
- 按花卉品种与花期状态筛选
- 小程序端微信原生地图，H5 端高德地图

</td>
<td width="50%">

### 📸 打卡动态

- 上传现场照片，绑定花卉地点发布打卡
- 首页动态流浏览全校打卡
- 点赞、评论互动
- 查看其他用户主页与动态

</td>
</tr>
<tr>
<td width="50%">

### 🔔 订阅与通知

- 订阅感兴趣的花卉
- 花开时站内通知，不再错过
- 通知一键已读

</td>
<td width="50%">

### 🏆 成就花园

- 打卡解锁成就与盆栽
- 多种称号记录每个里程碑
- 个人花园展示收集进度

</td>
</tr>
</table>

---

## 🏗 技术架构

```
┌──────────────────────────────────────────────┐
│        前端 uni-app（Frontend-uni/）           │
│   Vue 3 + TypeScript + Pinia + Vite          │
│   一套代码 → H5 与微信小程序双端                 │
│   （另有早期 Vue 3 H5 版本 Frontend/，         │
│     含 Playwright E2E 测试）                  │
└──────────────────┬───────────────────────────┘
                   │ HTTP  /v1/... REST API
┌──────────────────▼───────────────────────────┐
│        后端 Flask（backend/）                  │
│   Flask + Flask-RESTful + SQLAlchemy         │
│   JWT 认证（flask-jwt-extended）              │
│   Flask-Migrate（Alembic）数据库迁移           │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│        数据层                                  │
│   SQLite（开发默认，可经 .env 切换）            │
│   图片上传至 backend/uploads/ 本地存储          │
└──────────────────────────────────────────────┘
```

### 技术选型

| 层级 | 技术 |
| ---- | ---- |
| 前端框架 | Vue 3 + TypeScript + Pinia（uni-app，Vite 编译） |
| 前端产物 | H5 网页 + 微信小程序双端 |
| 地图 | 微信原生 `<map>`（小程序端）/ 高德地图 SDK（H5 端） |
| 后端 | Python Flask + Flask-RESTful |
| ORM / 迁移 | SQLAlchemy + Flask-Migrate（Alembic） |
| 认证 | JWT（flask-jwt-extended） |
| 数据库 | SQLite |
| E2E 测试 | Playwright（`Frontend/tests/e2e/`） |

---

## 📁 项目结构

```
26-SE-Project/
├── Frontend-uni/        # 主前端：uni-app（H5 + 微信小程序双端）
│   └── src/
│       ├── pages/       # 页面：home / map / checkin / garden / profile 等
│       ├── components/  # 可复用组件
│       ├── services/    # API 客户端与 Mock 数据
│       ├── stores/      # Pinia 状态仓库
│       └── static/      # 图标等静态资源
├── Frontend/            # 早期 Vue 3 H5 单页版本（保留，含 Playwright E2E 测试）
│   ├── src/
│   └── tests/e2e/       # Playwright 用例与截图基线
├── backend/             # Flask 后端
│   ├── app.py           # 应用入口与 /v1 路由注册
│   ├── models.py        # SQLAlchemy 模型
│   ├── routes.py        # API 资源实现
│   ├── services/        # 成就 / 称号 / 通知业务逻辑
│   ├── migrations/      # Alembic 数据库迁移
│   └── uploads/         # 用户上传图片
├── DB-Design/           # 数据库设计文档
├── Presentation/        # 答辩材料
└── 运行指南.md           # 本地运行与微信开发者工具联调指南
```

---

## 🚀 快速开始

### 后端启动

后端监听 `http://127.0.0.1:5000`，提供 `/v1/...` 接口。

```bash
cd backend
python3 -m venv venv            # 首次需要
source venv/bin/activate
pip install -r requirements.txt # 首次需要
python app.py
```

验证：`curl http://127.0.0.1:5000/` 返回 `Backend is running` 即正常。

### 前端启动（Frontend-uni，主前端）

```bash
cd Frontend-uni
npm install              # 首次需要

npm run dev:h5           # H5 端开发调试
npm run dev:mp-weixin    # 微信小程序端（watch 编译，产物 → dist/dev/mp-weixin）
npm run build:h5         # H5 生产构建
npm run build:mp-weixin  # 小程序生产构建
npm run type-check       # TypeScript 类型检查
```

小程序端编译后，用微信开发者工具导入 `Frontend-uni/dist/dev/mp-weixin`，并在「本地设置」勾选**不校验合法域名**以联调本地后端。详见 [运行指南.md](./运行指南.md)。

> API 地址配置在 `Frontend-uni/src/services/api.ts` 的 `API_BASE_URL`。后端不可用时前端自动回退到内置 Mock 数据，页面仍可正常浏览。

### 早期 H5 版本（Frontend，可选）

```bash
cd Frontend
npm install --legacy-peer-deps
npm run dev              # Vite 开发服务器（端口 5173）
npm run test:e2e         # Playwright E2E 测试（首次需 npx playwright install chromium）
```

---

## 📡 核心 API

后端提供 `/v1/...` REST 接口，JWT 认证（`Authorization: Bearer <token>`）。

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| POST | `/v1/auth/register` · `/v1/auth/login` | 注册 / 登录，下发 JWT |
| GET  | `/v1/users/me` | 当前用户信息 |
| GET  | `/v1/flowers` · `/v1/locations` | 花卉 / 地点列表与详情 |
| GET  | `/v1/map/flowers` · `/v1/map/filter` | 地图花卉点位与筛选 |
| POST | `/v1/checkins` | 发布打卡 |
| POST | `/v1/checkins/:id/like` · `/v1/checkins/:id/comments` | 点赞 / 评论 |
| GET  | `/v1/users/me/achievements` · `/v1/users/me/titles` | 我的成就 / 称号 |
| POST | `/v1/flowers/:id/subscribe` | 订阅花卉 |
| GET  | `/v1/users/me/notifications` | 我的通知 |
| POST | `/v1/upload` | 图片上传 |

> 完整接口文档见 [Frontend/API_DOC.md](./Frontend/API_DOC.md)

---

## 🗄 数据模型

| 模型 | 说明 |
| ---- | ---- |
| `User` | 用户信息与角色 |
| `Flower` / `Place` / `FlowerPlace` | 花卉、地点及其关联（打卡绑定到 FlowerPlace） |
| `Checkin` / `Comment` / `Like` | 打卡及其评论、点赞 |
| `Achievement` / `Title` | 成就与称号 |
| `Subscription` / `Notification` | 花卉订阅与站内通知 |

花期状态枚举：`dormant`（休眠）/ `budding`（含苞）/ `blooming`（盛开）/ `withering`（凋谢）。

---

## 🤝 贡献指南

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: 添加xxx功能"
git push origin feature/your-feature-name
# 提交 Pull Request
```

### Commit 规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式调整
refactor: 重构
test:     测试相关
chore:    构建/工具链
```

---

## 📄 开源协议

本项目基于 MIT License 开源。

---

<div align="center">

**狮山花园** · 让校园的美被记录、被分享、被珍藏

</div>
