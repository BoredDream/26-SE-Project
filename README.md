# 🌸 花境 (Flower Garden)

<div align="center">

**不再错过每一次花开**

*一款基于 Vue 3 的校园花卉实时地图 H5，用众包打卡驱动花期数据，让校园里的每一朵花都被记录、被分享、被珍藏。*

---

![版本](https://img.shields.io/badge/version-1.1.0-52B788?style=flat-square)
![Vue 3](https://img.shields.io/badge/Vue_3-3.5-4FC08D?style=flat-square&logo=vue.js)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/license-MIT-F48FB1?style=flat-square)

</div>

---

## ✨ 产品简介

> **花境**是一款面向校园师生的花卉打卡 H5 应用。校园里的花每年如期绽放，却总有人因为不知道地点、错过花期而留下遗憾。花境以高德地图为载体，通过用户众包打卡实时维护花期状态，让每一位同学都能在最美的时刻赶到最美的地点。

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

- 高德地图展示所有花卉地点
- 花点颜色实时反映花期状态
- 按花期状态一键筛选
- 花卉种类筛选

</td>
<td width="50%">

### 📸 打卡众包系统

- 上传现场照片，选择对应花卉与地点
- 花期状态可选填
- 图片上传支持
- 评论互动

</td>
</tr>
<tr>
<td width="50%">

### 🏆 成就花圃

- 打卡新花种，花圃生长对应盆栽
- 多种成就解锁
- 六种称号，记录每个里程碑

</td>
<td width="50%">

### 👤 个人中心

- 查看个人打卡记录
- 成就与称号展示
- 用户信息管理

</td>
</tr>
</table>

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────┐
│              前端 (Vue 3 H5)                  │
│    主页  ·  地图  ·  打卡  ·  花圃  ·  我的   │
│    Vue 3 + TypeScript + Pinia + Vue Router   │
│    高德地图 JSAPI 2.0                        │
└──────────────────┬──────────────────────────┘
                   │ HTTPS (RESTful JSON API)
┌──────────────────▼──────────────────────────┐
│              后端 (Flask)                     │
│  Python 3.12 + Flask 3.1                     │
│  ├── 用户认证 (JWT)    ├── 花卉/地点管理       │
│  ├── 打卡系统          ├── 评论互动            │
│  ├── 成就/称号系统     └── 文件上传            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              数据层                            │
│  MySQL 8.0（11张业务表）                      │
│  SQLite（本地开发可选）                        │
└─────────────────────────────────────────────┘
```

### 技术选型

| 层级   | 技术                        | 版本          |
| ------ | --------------------------- | ------------- |
| 前端   | Vue 3 + TypeScript          | 3.5+          |
| 前端   | Pinia（状态管理）            | 3.0+          |
| 前端   | Vue Router                  | 4.6+          |
| 地图   | 高德地图 JSAPI 2.0          | 最新稳定版     |
| 前端   | Three.js（3D 花圃）         | 0.183+        |
| 后端   | Python + Flask              | 3.12+ / 3.1+  |
| 数据库 | MySQL                       | 8.0+          |
| ORM    | Flask-SQLAlchemy            | 3.1+          |
| 认证   | Flask-JWT-Extended          | -             |

---

## 🚀 快速开始

### 环境准备

```bash
# Python 版本要求 ≥ 3.12
python3 --version

# Node.js 版本要求 ≥ 20.19
node -v

# 克隆项目
git clone https://github.com/your-org/flower-garden.git
cd flower-garden
```

### 后端启动

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库连接等信息

# 初始化数据库
flask db upgrade

# 启动服务
flask run --host=0.0.0.0 --port=5000
```

### 前端启动（Vue 3 H5）

```bash
cd Frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 前端启动（uni-app，支持微信小程序）

```bash
cd Frontend-uni

# 安装依赖
npm install

# 启动 H5 开发服务器
npm run dev:h5

# 编译微信小程序
npm run build:mp-weixin
```

### 一键重启

项目根目录提供了一键重启脚本：

```bash
# 重启所有服务
./restart.sh all

# 仅重启后端
./restart.sh backend

# 仅重启前端 Vue3
./restart.sh frontend

# 仅重启前端 uni-app
./restart.sh frontend-uni
```

---

## 📁 项目结构

```
flower-garden/
├── backend/                  # Flask 后端
│   ├── app.py                # 主应用入口
│   ├── config.py             # 配置类
│   ├── extensions.py         # Flask 扩展初始化
│   ├── models.py             # 数据库模型（11张表）
│   ├── routes.py             # API 路由
│   ├── requirements.txt      # Python 依赖
│   ├── .env                  # 环境变量（不提交）
│   ├── .env.example          # 环境变量示例
│   ├── migrations/           # 数据库迁移
│   └── uploads/              # 上传文件
│
├── Frontend/                 # Vue 3 H5 前端
│   ├── src/
│   │   ├── views/            # 页面组件
│   │   ├── components/       # 公共组件
│   │   ├── services/         # API 服务层
│   │   ├── stores/           # Pinia 状态管理
│   │   └── router.ts         # 路由配置
│   ├── package.json
│   └── vite.config.ts
│
├── Frontend-uni/             # uni-app 前端（H5 + 微信小程序）
│   ├── src/
│   │   ├── pages/            # 页面
│   │   └── manifest.json     # 应用配置
│   ├── package.json
│   └── vite.config.mjs
│
├── DB-Design/                # 数据库设计文档
├── docs/                     # 项目文档
├── static/                   # 静态资源
├── restart.sh                # 一键重启脚本
├── CLAUDE.md                 # AI 辅助开发指南
└── README.md                 # 本文件
```

---

## 🗄 数据库设计

系统共 11 张核心数据表：

| 表名               | 说明                      |
| ------------------ | ------------------------- |
| `users`            | 用户基础信息，含用户名密码与角色 |
| `flowers`          | 花卉品种信息                |
| `places`           | 地点信息，含坐标             |
| `flower_places`    | 花卉-地点多对多关联          |
| `checkins`         | 用户打卡记录                |
| `checkin_likes`    | 打卡点赞记录                |
| `checkin_comments` | 打卡评论                   |
| `achievements`     | 成就定义                   |
| `achievements_users` | 用户-成就关联             |
| `titles`           | 称号定义                   |
| `titles_users`     | 用户-称号关联               |

---

## 📡 核心 API

所有 API 统一使用 `/v1/` 前缀，响应格式为 `{code, message, data}`。

| 方法   | 路径                                   | 说明              |
| ------ | -------------------------------------- | ----------------- |
| POST   | `/v1/auth/register`                    | 用户注册           |
| POST   | `/v1/auth/login`                       | 用户登录           |
| GET    | `/v1/users/me`                         | 获取当前用户信息    |
| GET    | `/v1/flowers`                          | 获取花卉列表        |
| GET    | `/v1/flowers/<id>`                     | 花卉详情           |
| GET    | `/v1/locations`                        | 获取地点列表        |
| GET    | `/v1/map/flowers`                      | 地图花卉数据        |
| POST   | `/v1/checkins`                         | 发布打卡           |
| GET    | `/v1/checkins`                         | 打卡列表           |
| POST   | `/v1/checkins/<id>/like`               | 点赞打卡           |
| GET    | `/v1/checkins/<id>/comments`           | 获取评论           |
| POST   | `/v1/checkins/<id>/comments`           | 发表评论           |
| GET    | `/v1/achievements`                     | 成就列表           |
| GET    | `/v1/users/me/achievements`            | 我的成就           |
| GET    | `/v1/health`                           | 健康检查           |

> 完整接口文档见 [`Frontend/API_DOC.md`](Frontend/API_DOC.md)

---

## 🎯 称号系统

| 称号       | 解锁条件          |
| ---------- | ----------------- |
| 🌱 花卉初探者 | 完成第 1 次打卡   |
| 🌸 花卉观察员 | 累计打卡 10 次    |
| 📸 最美摄影师 | 单条打卡获赞超过 50 |
| 🔍 探花使     | 某地点某花期首位打卡者 |
| 🌳 四季守望者 | 同一地点春夏秋冬各打卡一次 |
| 👑 打卡王     | 当月打卡数量第一名 |

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# Fork 本仓库后
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

本项目基于 [MIT License](./LICENSE) 开源。

---

<div align="center">

**花境 (Flower Garden)** · 让校园的美被记录、被分享、被珍藏

*Made with 🌸 by HuaJi Team*

</div>
