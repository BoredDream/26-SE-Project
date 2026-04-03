# 🌸 狮山花园

<div align="center">

![狮山花园 Banner](https://img.shields.io/badg狮山花园狮山花园-校园花卉地图小程序-2E7D32?style=for-the-badge&logo=wechat&logoColor=white)

**不再错过每一次花开**

*一款基于微信小程序的校园花卉实时地图，用众包打卡驱动花期数据，让校园里的每一朵花都被记录、被分享、被珍藏。*

---

![版本](https://img.shields.io/badge/version-1.1.0-52B788?style=flat-square)
![微信小程序](https://img.shields.io/badge/微信小程序-基础库≥3.0-07C160?style=flat-square&logo=wechat)
![Node.js](https://img.shields.io/badge/Node.js-≥18.x-339933?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/license-MIT-F48FB1?style=flat-square)

</div>

---

## ✨ 产品简介

> **狮山花园**是一款面向校园师生的微信小程序。校园里的花每年如期绽放，却总有人因为不知道地点、错过花期而留下遗憾。狮山花园以校园地图为载体，通过用户众包打卡实时维护花期状态，让每一位同学都能在最美的时刻赶到最美的地点。

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
- 花点颜色实时反映花期状态
- 热力图叠加，直观显示打卡热度
- 按花期状态一键筛选

</td>
<td width="50%">

### 📸 打卡众包系统

- 上传现场照片，选择对应地点
- 花期状态可选填，不强制
- GPS 后台静默校验（150m 范围）
- AI 内容审核自动把关

</td>
</tr>
<tr>
<td width="50%">

### 🔔 花开通知

- 订阅感兴趣的花卉地点
- 花开时微信推送，不再错过
- 同一花期只推一次，不打扰
- 称号解锁同步通知

</td>
<td width="50%">

### 🏆 成就花圃

- 打卡新花种，花圃生长对应盆栽
- GPS 验证到访 → 金色盆栽
- 未验证 → 银色盆栽，可补打升级
- 六种称号，记录每个里程碑

</td>
</tr>
</table>

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────┐
│              微信小程序客户端                  │
│    主页  ·  地图  ·  打卡  ·  排行  ·  我的   │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│              后端服务层                        │
│  Node.js 18 + Express                        │
│  ├── 地图服务      ├── 打卡服务（GPS校验）     │
│  ├── 审核服务      ├── 成就服务               │
│  ├── 通知服务      └── 定时任务（5个）         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              数据层                            │
│  MySQL 8.0（7张业务表）                       │
│  Redis 7.0（缓存 · 推送防重）                  │
│  腾讯云 COS（图片三级存储）                    │
└─────────────────────────────────────────────┘
```

### 技术选型

| 层级   | 技术                | 版本        |
| ---- | ----------------- | --------- |
| 前端   | 微信小程序（原生）         | 基础库 ≥ 3.0 |
| 地图   | 腾讯地图 SDK          | 最新稳定版     |
| 后端   | Node.js + Express | ≥ 18.x    |
| 数据库  | MySQL             | ≥ 8.0     |
| 缓存   | Redis             | ≥ 7.0     |
| 对象存储 | 腾讯云 COS           | -         |
| 推送   | 微信订阅消息            | -         |
| 部署   | 微信云开发             | -         |

---

## 🚀 快速开始

### 环境准备

```bash
# Node.js 版本要求 ≥ 18
node -v

# 克隆项目
git clone https://github.com/your-org/huaji-miniprogram.git
cd huaji-miniprogram
```

### 后端启动

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库、微信、COS 等配置

# 初始化数据库
mysql -u root -p campus_flower < scripts/init.sql

# 启动开发服务
npm run dev
```

### 前端启动

```bash
# 1. 下载微信开发者工具
#    https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

# 2. 导入 miniprogram/ 目录

# 3. 填写你的 AppID

# 4. 开启「不校验合法域名」（仅本地开发）
```

### 环境变量说明

```env
# 服务配置
PORT=3000

# 数据库
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=campus_flower
DB_USER=root
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://127.0.0.1:6379

# 微信小程序（在微信公众平台获取）
WX_APPID=wx1234567890abcdef
WX_SECRET=xxxxxxxxxxxxxxxx

# 腾讯云 COS
COS_SECRET_ID=AKIDxxxxxxx
COS_SECRET_KEY=xxxxxxx
COS_BUCKET=flower-1234567890
COS_REGION=ap-guangzhou

# JWT
JWT_SECRET=your_random_long_secret
```

---

## 📁 项目结构

```
huaji-miniprogram/
├── miniprogram/              # 微信小程序前端
│   ├── pages/
│   │   ├── home/             # 主页
│   │   ├── map/              # 地图页
│   │   ├── checkin/          # 打卡发布页
│   │   ├── leaderboard/      # 排行榜
│   │   ├── profile/          # 我的
│   │   └── garden/           # 花圃成就墙
│   ├── components/
│   │   ├── custom-tab-bar/   # 自定义底部导航
│   │   ├── location-card/    # 地点卡片
│   │   └── pot-card/         # 花圃盆栽卡片
│   ├── utils/
│   │   ├── request.js        # 网络请求封装
│   │   ├── auth.js           # 登录态管理
│   │   └── geo.js            # GPS 静默获取
│   └── constants/
│       ├── bloom.js          # 花期状态枚举
│       └── achievement.js    # 成就配置
│
├── server/                   # Node.js 后端
│   ├── routes/               # API 路由
│   ├── services/             # 业务逻辑
│   │   ├── auditService.js   # AI 内容审核
│   │   ├── achievementService.js
│   │   ├── notifyService.js  # 推送服务
│   │   └── voteService.js    # 花期投票
│   ├── utils/
│   │   ├── geo.js            # Haversine 距离计算
│   │   ├── db.js             # MySQL 连接池
│   │   └── redis.js          # Redis 客户端
│   ├── cron/
│   │   └── tasks.js          # 定时任务
│   └── scripts/
│       └── init.sql          # 数据库初始化
│
└── docs/                     # 项目文档
    ├── PRD.md                # 产品设计文档
    ├── API.md                # 接口文档
    └── ER.drawio             # 数据库 ER 图
```

---

## 🗄 数据库设计

系统共7张核心数据表：

| 表名              | 说明                      |
| --------------- | ----------------------- |
| `users`         | 用户基础信息，含微信 openid 与角色   |
| `locations`     | 花卉地点，含坐标、品种、花期状态        |
| `checkins`      | 用户打卡，含图片、GPS校验、审核状态     |
| `subscriptions` | 用户订阅关系                  |
| `likes`         | 打卡点赞记录                  |
| `achievements`  | 花圃成就，每用户每花种唯一，grade 可升级 |
| `titles`        | 称号解锁记录                  |

---

## 📡 核心 API

| 方法   | 路径                       | 说明              |
| ---- | ------------------------ | --------------- |
| POST | `/auth/login`            | 微信登录，code 换 JWT |
| GET  | `/locations`             | 获取花卉地点列表        |
| GET  | `/locations/:id`         | 地点详情 + 打卡动态     |
| POST | `/checkins`              | 发布打卡            |
| POST | `/upload/image`          | 上传图片（三级处理）      |
| GET  | `/users/me/achievements` | 我的花圃            |
| GET  | `/leaderboard/checkins`  | 打卡王榜            |
| GET  | `/leaderboard/heatmap`   | 热力图数据           |

> 完整接口文档见 [docs/API.md](./docs/API.md)

---

## 🎯 称号系统

| 称号       | 解锁条件          |
| -------- | ------------- |
| 🌱 花卉初探者 | 完成第 1 次打卡     |
| 🌸 花卉观察员 | 累计打卡 10 次     |
| 📸 最美摄影师 | 单条打卡获赞超过 50   |
| 🔍 探花使   | 某地点某花期首位打卡者   |
| 🌳 四季守望者 | 同一地点春夏秋冬各打卡一次 |
| 👑 打卡王   | 当月打卡数量第一名     |

---

## ⏰ 定时任务

| 任务       | 执行时间         | 说明                    |
| -------- | ------------ | --------------------- |
| 月度打卡王评选  | 每月 1 日 00:05 | 统计上月打卡数，授予称号并推送       |
| 花期预测提醒   | 每日 08:00     | 提前 7 天推送「即将开放」通知      |
| 清理审核积压   | 每日 02:00     | pending 超 24h 的内容自动通过 |
| 更新热力数据   | 每小时          | 更新各地点 checkin_count   |
| 清理防重 key | 每年 1 月 1 日   | 清空 Redis 上年推送防重记录     |

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

**狮山花园** · 让校园的美被记录、被分享、被珍藏

*Made with 🌸 by HuaJi Team*

</div>
