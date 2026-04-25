# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

**狮山花园** 是一款面向校园师生的花卉地图打卡 Web 应用。用户可以在地图上查看花卉分布、发布打卡帖子、查看其他用户动态，并积累等级与成就。

技术栈为 Vue 3 单页前端 + Flask REST API 后端。

## 常用命令

### 前端 (`Frontend/`)

| 命令 | 说明 |
|---------|-------------|
| `cd Frontend && npm install` | 安装依赖 |
| `cd Frontend && npm run dev` | 启动 Vite 开发服务器（默认端口 5173） |
| `cd Frontend && npm run dev:h5` | 同 `dev`，别名 |
| `cd Frontend && npm run build` | 构建生产版本 |
| `cd Frontend && npm run build:h5` | 同 `build`，别名 |
| `cd Frontend && npm run type-check` | 运行 `vue-tsc` 类型检查 |
| `cd Frontend && npm run preview` | 预览生产构建 |

### 后端 (`backend/`)

| 命令 | 说明 |
|---------|-------------|
| `cd backend && source venv/bin/activate` | 激活虚拟环境 |
| `cd backend && pip install -r requirements.txt` | 安装依赖 |
| `cd backend && python app.py` | 启动 Flask 开发服务器（调试模式，默认端口 5000） |
| `cd backend && flask db migrate -m "描述"` | 生成 Alembic 迁移 |
| `cd backend && flask db upgrade` | 执行迁移 |

### API 测试

`Frontend/api_test.sh` 可手动测试后端接口（针对旧版 `/api/...` 路径）：

```bash
cd Frontend
./api_test.sh login
./api_test.sh info
./api_test.sh health
```

## 架构说明

### 前端（Vue 3 + Vite + TypeScript）

前端为单页应用，采用 Vue 3 Composition API、Pinia 状态管理与 Vue Router。

**关键目录：**
- `src/views/` — 页面组件：`login.vue`（演示登录）、`Home.vue`（首页）、`Map.vue`（地图）、`Checkin.vue`（打卡发布）、`Garden.vue`（花园/成就）、`Profile.vue`（个人中心）、`UserDetail.vue`（用户详情）、`Navigation.vue`、`Register.vue`（**孤立文件：未在 `router.ts` 注册，无入口可达**）
- `src/components/` — 可复用组件：`BottomNav.vue`（底部导航）、`FlowerSuggest.vue`（花卉搜索建议）
- `src/icon/` — 底部导航 SVG 图标（`主页.svg`、`地图.svg`、`花园.svg`、`我的.svg`）
- `src/services/api.ts` — 集中式 API 客户端，封装 `fetch`。基础 URL 硬编码为 `http://101.37.240.166:3001`，API 路径前缀为 `/v1/...`。所有请求自动携带 `localStorage` 中的 JWT Token。
- `src/services/mockData.ts` — Mock 数据，包含用户、地点、打卡记录、成就。当前端请求后端失败时，stores 自动回退到这些数据。
- `src/stores/` — Pinia 状态仓库：`auth.ts`（登录/用户）、`location.ts`（地点数据）、`checkin.ts`（打卡帖子）、`achievement.ts`（成就）
- `src/router.ts` — 路由定义，带简易认证守卫（检查 `localStorage.getItem('token')`）。仅 `/login` 一条登录入口；所有其他路由需 `requiresAuth`。
- `vite.config.ts` — 配置 `@` 别名指向 `./src`。

**地图 SDK：** 使用高德地图（`@amap/amap-jsapi-loader` + `@amap/amap-jsapi-types`）。注意 `README.md` 提到的腾讯地图为旧设计文档，已不再适用。

**Mock 降级策略：** 当前端 stores 调用 API 失败时（如后端未启动或接口不匹配），会自动使用 `mockData.ts` 中的数据作为回退，保证页面仍可渲染。

**页面过渡：** `App.vue` 中定义了 `page-fade` 路由切换动画（淡入 + 上移）。

### 后端（Flask + SQLAlchemy + Flask-RESTful）

后端为单体 Flask 应用。

**关键文件：**
- `app.py` — 应用入口，初始化 Flask、SQLAlchemy、JWT、Migrate，注册 API 资源。
- `config.py` — 加载 `.env`，默认使用 SQLite（`sqlite:///flower.db`）。
- `models.py` — SQLAlchemy 模型：`User`、`Flower`、`Place`、`FlowerPlace`（关联表）、`Checkin`、`Achievement`、`Title`。
- `routes.py` — 所有 API 资源类，路径前缀为 `/api/...`。
- `flower_db.sqlite` — SQLite 数据文件，**已被 git 跟踪**（无 `.gitignore`）；本地修改可能产生意外的二进制 diff。
- `backend/src/` — 当前为空目录，无实际作用。

**认证：** 使用 `flask-jwt-extended`，登录/注册下发 Token，受保护接口需携带 `Authorization: Bearer <token>`。

**文件上传：** 图片保存在 `backend/uploads/`，通过 `/uploads/<filename>` 访问。

**数据库：** 使用 Flask-Migrate（Alembic），迁移文件在 `backend/migrations/`。

### 数据模型

`FlowerPlace` 为核心关联实体，连接 `Flower` 与 `Place`。打卡记录（`Checkin`）绑定到 `FlowerPlace`。

花期状态枚举：`dormant`（休眠）、`budding`（含苞）、`blooming`（盛开）、`withering`（凋谢）。

### 前后端 API 差异（重要）

当前分支的前端与后端存在 **API 路径不兼容**：

- 前端 `api.ts` 请求的是 `/v1/...`（如 `/v1/auth/login`、`/v1/users/me`、`/v1/checkins`）
- 后端 `routes.py` 提供的是 `/api/...`（如 `/api/user/login`、`/api/checkins`）
- 前端登录传参为 `{ code }`（微信登录），后端注册/登录接口接收 `{ username, password }`
- 前端 `Checkin` 绑定到 `location_id`，后端绑定到 `flower_place_id`

因此当前端直接对接现有后端时，所有 API 请求都会 404 或参数不匹配，stores 会全部回退到 Mock 数据。

**API 文档参考：** `doc/API.md`（项目级 API 设计）、`Frontend/API_DOC.md`（前端期望的 `/v1/...` 接口规范）、`backend/后端设计.md`（后端实现设计）。三者互不一致，使用时需对照实际代码确认。

## 重要提示

- **缺失 `extensions.py`：** `backend/app.py` 从 `extensions` 导入 `db`、`api`、`jwt`，但该文件不存在，后端无法直接启动。
- **前后端 API 不兼容：** 前端期望 `/v1/...` 接口，后端提供 `/api/...` 接口。修改任一端时需注意对齐。
- **登录为演示模式：** 前端登录页无真实表单，仅有"演示模式"按钮，点击后生成假 Token 并写入 Mock 用户数据。
- **`README.md` 是早期方案，已与实现脱节：** 根目录 `README.md` 描述的是"微信小程序 + Node.js + Express + MySQL + 腾讯地图"的原始设计；当前实际实现是"Vue 3 H5 + Flask + SQLite + 高德地图"。读 README 时不要把它当成现状说明。
- **无 `.gitignore` 文件：** 项目根目录没有 `.gitignore`，导致 `flower_db.sqlite`、`__pycache__/`、`venv/` 等都可能被意外提交。提交前请用 `git status` 仔细确认。
- **无测试套件：** 无单元测试、集成测试或 lint 配置。
- **Node 版本要求：**`^20.19.0 || >=22.12.0`。
- **后端无改动：** `vue-rcx-2` 分支的前端与 `main` 差异较大，但 `backend/` 目录与 `main` 完全一致。
