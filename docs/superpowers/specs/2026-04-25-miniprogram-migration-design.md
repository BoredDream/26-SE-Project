# 狮山花园:H5 → 微信小程序双端迁移设计

**日期**:2026-04-25
**作者**:协作产出(brainstorming)
**当前分支**:`vue-rcx-2`(本工程目前唯一含完整前端代码的分支)
**目标分支**:`feat/miniprogram-migration`(从 `vue-rcx-2` 拉出,纯本地,不推送 GitHub)
**状态**:待用户审阅

---

## 0. 背景与目标

**背景**:`Frontend/` 当前是 Vue 3 + Vite + TypeScript 的 H5 单页应用,有 8 个页面 + 2 个组件;后端 `backend/` 是 Flask + SQLAlchemy + JWT,但缺 `extensions.py` 无法启动,且接口路径(`/api/...`)与前端期望(`/v1/...`)不匹配,前端通过 `mockData.ts` 全量降级渡过。

**目标**:用 uni-app 把前端改造为同源双端工程(H5 + 微信小程序),同步把后端补到可启动且与新约定的 `/v1/...` 路径对齐,演示模式跑通整条流程。

**非目标**:真实微信 `wx.login()` 联调、内容审核 / GPS 校验 / 推送 / 定时任务、自动化测试、生产部署。

---

## 1. 关键决策(已确认)

| # | 决策项 | 选择 |
|---|--------|------|
| 1 | 工程形态 | **uni-app**,H5 + 微信小程序 双端共存,一套源码 |
| 2 | 登录 | 两端均"演示模式",但走真实接口流程(`POST /v1/auth/login` Body `{ mode: 'demo' }`),后端用 `flask-jwt-extended` 签发标准 JWT |
| 3 | 地图供应商 | 两端统一 **腾讯地图**(H5 用 Web JS API v2,小程序端用原生 `<map>` + `uni.createMapContext`) |
| 4 | Three.js | 现有 `package.json` 的 `three` 依赖**未实际使用**,迁移时直接清除 |
| 5 | 后端 | 同步修复:补 `extensions.py`、把所有路径改为 `/v1/...`、补 `/v1/upload`、字段对齐 |
| 6 | 仓库布局 | 新建 `Frontend-uni/`,与现有 `Frontend/` 并行,迁移完成且双端验证后再决定是否归档旧目录 |
| 7 | 底部导航 | 删除自定义 `BottomNav.vue`,直接交给 uni-app 的 `tabBar` 配置 |
| 8 | Register | 迁过去并接入(后端补 `/v1/auth/register`、login 页加"去注册"按钮) |
| 9 | 地图抽象 | 引入一层 `MapAdapter` 接口,`Map.vue` / `Navigation.vue` 不直接调地图 SDK |
| 10 | 演示 token 形式 | 后端给固定 demo 用户签发的真实 JWT(不是字符串拼凑的假 token) |
| 11 | `/v1/upload` 实现 | 简易实现:文件落 `backend/uploads/`、返回相对 URL,生产改对象存储是后话 |
| 12 | 测试策略 | 不补自动化测试,采用分层手工 checklist + `verify-api.sh` 三接口冒烟 |

---

## 2. 总体架构与目录布局

```
26-SE-Project/
├── Frontend/                       # 现有 Vite + Vue 3 H5 工程,迁移期间不动
│                                   # 用作可运行参考与对照
├── Frontend-uni/                   # 新工程:uni-app(Vue 3 + Vite + TS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── login/login.vue
│   │   │   ├── register/register.vue
│   │   │   ├── home/home.vue
│   │   │   ├── map/map.vue
│   │   │   ├── checkin/checkin.vue
│   │   │   ├── garden/garden.vue
│   │   │   ├── profile/profile.vue
│   │   │   ├── user-detail/user-detail.vue
│   │   │   └── navigation/navigation.vue
│   │   ├── components/
│   │   │   └── flower-suggest/flower-suggest.vue
│   │   ├── stores/                 # Pinia(等同原 src/stores/,几乎零改)
│   │   │   ├── auth.ts
│   │   │   ├── location.ts
│   │   │   ├── checkin.ts
│   │   │   └── achievement.ts
│   │   ├── services/
│   │   │   ├── api.ts              # uni.request,跨端通吃
│   │   │   ├── mockData.ts         # 直接复制
│   │   │   ├── storage.ts          # token 持久化封装
│   │   │   └── platform/
│   │   │       └── map/
│   │   │           ├── index.ts    # MapAdapter 接口 + 平台分流
│   │   │           ├── map.h5.ts   # 腾讯 Web JS v2 实现
│   │   │           └── map.mp.ts   # uni 原生 <map> 实现
│   │   ├── utils/
│   │   │   └── auth-guard.ts       # 替代 vue-router beforeEach
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── pages.json              # 路由 + tabBar 声明
│   │   ├── manifest.json           # 双端编译目标 + AppID 占位
│   │   └── uni.scss
│   ├── static/                     # uni-app 约定的静态资源目录
│   │   ├── icon/                   # 底栏图标(沿用现有 SVG)
│   │   └── carousel/               # Home 轮播图(替代 Unsplash 外链)
│   ├── scripts/
│   │   └── verify-api.sh           # 后端冒烟脚本
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── extensions.py               # 新增
│   ├── app.py                      # /api/... → /v1/...,新增 /v1/upload
│   ├── routes.py                   # 资源类重命名、字段对齐、登录 mode 分流
│   ├── config.py                   # JWT_SECRET_KEY 加默认值
│   ├── models.py                   # 不动
│   ├── migrations/                 # 不动
│   ├── uploads/                    # 不动(/v1/upload 落地处)
│   └── ...
├── docs/superpowers/specs/2026-04-25-miniprogram-migration-design.md
└── CLAUDE.md
```

**产物**:
- H5:`Frontend-uni/dist/build/h5/` 静态站点
- 小程序:`Frontend-uni/dist/build/mp-weixin/` 导入微信开发者工具

**路由迁移**:`vue-router` 完全弃用,所有页面在 `pages.json` 注册;鉴权守卫从 `router.ts` 的 `beforeEach` 搬到 `utils/auth-guard.ts`,在 `App.vue.onLaunch` 与每个 `requiresAuth` 页面的 `onShow` 调用一次,无 token 则 `uni.reLaunch({ url: '/pages/login/login' })`。

---

## 3. 平台抽象层与共享层

### 3.1 通用层(零分叉)

| 现有 | 改造 |
|------|------|
| `src/services/api.ts` 用 `fetch` | 改用 `uni.request`,封装一致的 Promise 接口 |
| `localStorage.getItem/setItem`(3 处) | 抽出 `services/storage.ts`,内部 `uni.getStorageSync/setStorageSync` |
| `window.setInterval`(Home.vue 轮播) | 改用全局 `setInterval`(uni 两端都支持) |
| `mockData.ts` | 原样复制 |
| `stores/*.ts` (Pinia) | 原样复制,只把 `localStorage` 调用替换成 `storage.ts` |
| `services/api.ts` 类型定义 | 原样复制 |

`mockData.ts` 降级策略保留:store 中 `try/catch` 包裹接口调用,失败回退到 mock。

### 3.2 地图抽象(MapAdapter)

```ts
// services/platform/map/index.ts(伪代码)
export interface MapAdapter {
  init(container: any, opts: { center: [number, number]; zoom: number }): Promise<void>
  setMarkers(markers: Marker[]): void
  drawRoute(points: [number, number][]): void
  destroy(): void
}

// #ifdef H5
import { createH5Adapter } from './map.h5'
export const createMap: () => MapAdapter = createH5Adapter
// #endif
// #ifdef MP-WEIXIN
import { createMpAdapter } from './map.mp'
export const createMap: () => MapAdapter = createMpAdapter
// #endif
```

`Map.vue` 与 `Navigation.vue` 只调 `createMap()`,不感知底层 SDK。

### 3.3 图片选取与上传

- `<input type="file">` → `uni.chooseImage`(两端通用)
- `fetch` 上传 → `uni.uploadFile`(指向 `/v1/upload`)

### 3.4 token 与认证

- `services/storage.ts` 暴露 `getToken / setToken / clearToken`
- `utils/auth-guard.ts` 在 `App.vue.onLaunch` + 每个受保护页 `onShow` 调用
- `auth` store 的 `login()` 调 `POST /v1/auth/login`,Body 带 `mode: 'demo'`,接收返回的 JWT,写 storage

### 3.5 双端差异决策一览

| 关注点 | H5 | 微信小程序 |
|-------|----|-----------|
| HTTP | `uni.request`(底层 fetch) | `uni.request`(底层 wx.request) |
| 持久化 | `uni.setStorageSync`(localStorage) | `uni.setStorageSync`(wx.setStorageSync) |
| 地图 | 腾讯 Web JS API v2 | 原生 `<map>` + `uni.createMapContext` |
| 图片选取 | `uni.chooseImage` | `uni.chooseImage` |
| 路由跳转 | `uni.navigateTo / reLaunch` | 同左 |
| 顶/底 Tab | uni `tabBar`(两端一致) | 同左 |
| Three.js | 移除依赖 | 移除依赖 |
| 外链图(Unsplash) | 直连 OK | **必须改用 `static/` 本地占位图** |

---

## 4. 页面与组件改造规则

### 4.1 模板标签替换表

| Vue 3 H5 | uni-app | 备注 |
|----------|---------|------|
| `<div>` | `<view>` | 最常见容器替换 |
| `<span>` | `<text>` | 行内文字必须放 `<text>`,小程序 `<view>` 内裸文字会被吞 |
| `<img>` | `<image>` | 默认 320×240 inline,需显式宽高或 `mode="widthFix"` |
| `<button>` | `<button>` | 小程序版默认带边框/灰底,要 reset |
| `<input>` | `<input>` | 一致 |
| `<a href>` | `<navigator url="">` | 或用 `uni.navigateTo` |
| `v-html` | 不可用 | Home.vue 没用,无影响 |
| `:class`/`:style` | 一致 | ✅ |
| `@click` | `@click` 或 `@tap` | 都支持 |

### 4.2 路由替换

| 现有(vue-router) | uni-app |
|------|------|
| `useRouter().push('/home')` | `uni.navigateTo({ url: '/pages/home/home' })` |
| `useRouter().replace('/login')` | `uni.reLaunch({ url: '/pages/login/login' })` |
| `useRoute().params.id` | 页面 `onLoad(options)` 接 `options.id` |
| `<router-view>` | 自动:每 page 独立栈 |
| `<router-link>` | `<navigator>` |

### 4.3 滚动与样式

- 滚监听用 `onPageScroll` / `onReachBottom`,**不要**再写 DOM scroll 事件
- 长度单位推荐 `rpx`(750 屏宽 = 750rpx),也可继续用 `px`,容器层用 rpx 适配小屏
- `position: fixed` 底部加 `padding-bottom: env(safe-area-inset-bottom)`
- SCSS 继续用,`sass-embedded` 已在 deps

### 4.4 页面动作清单

| 页面 | 主要改造点 | 难度 |
|------|----------|------|
| login.vue | 表单/按钮替换;调 `api.login({ mode: 'demo' })`;加"去注册"链接 | ★ |
| register.vue | 复用现有 Register.vue 表单;调 `api.register({ username, password })` | ★ |
| Home.vue | 标签替换;轮播改 `<swiper>`;Unsplash 换本地图 | ★★ |
| Map.vue | 调 `services/platform/map`,UI 不变 | ★★★ |
| Navigation.vue | 同 Map.vue,加 polyline 路径绘制 | ★★ |
| Checkin.vue | `<input file>` → `uni.chooseImage`;`uni.uploadFile` 上传 | ★★ |
| Garden.vue | 标签替换 + 网格样式微调 | ★ |
| Profile.vue | 标签替换;头像 `<image mode="aspectFill">` | ★ |
| UserDetail.vue | 标签替换 + `onLoad` 取参数 | ★ |

### 4.5 组件

| 组件 | 改造 |
|------|------|
| `BottomNav.vue` | **删除**——交给 `pages.json` 的 `tabBar` |
| `FlowerSuggest.vue` | 标签替换,逻辑不动 |

---

## 5. 后端修复与 API 对齐

### 5.1 修复后端启动

新增 `backend/extensions.py`:

```python
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
api = Api()
jwt = JWTManager()
```

`config.py` 给 `JWT_SECRET_KEY` 加开发默认值;`Flask-CORS` 配置允许 `http://localhost:5173` 与微信开发者工具来源。

### 5.2 路径对齐表

| 资源 | 旧 | 新 | 备注 |
|------|----|----|------|
| 注册 | `POST /api/user/register` | `POST /v1/auth/register` | 改名 + 字段标准化,响应 `{ token, user }` |
| 登录 | `POST /api/user/login`(账号密码) | `POST /v1/auth/login` | 重写:接受 `{ mode, code?, username?, password? }`,按 mode 分流 |
| 当前用户 | `GET /api/user/info` | `GET /v1/users/me` | 改名 |
| 用户成就 | `GET /api/user/achievements` | `GET /v1/users/me/achievements` | 改名 |
| 用户称号 | `GET /api/user/titles` | `GET /v1/users/me/titles` | 改名 |
| 花卉列表 | `GET /api/flowers` | `GET /v1/flowers` | 改前缀 |
| 花卉详情 | `GET /api/flowers/<id>` | `GET /v1/flowers/:id` | |
| 花期状态 | `GET /api/flowers/<id>/bloom-status` | `GET /v1/flowers/:id/bloom-status` | |
| 地点列表 | `GET /api/places` | `GET /v1/locations` | 术语统一为 location |
| 地点详情 | `GET /api/places/<id>` | `GET /v1/locations/:id` | |
| 地图花点 | `GET /api/map/flowers` | `GET /v1/map/flowers` | |
| 地图筛选 | `GET /api/map/filter` | `GET /v1/map/filter` | |
| 打卡列表 | `GET/POST /api/checkins` | `GET/POST /v1/checkins` | 字段加 `location_id` |
| 打卡详情 | `GET /api/checkins/<id>` | `GET /v1/checkins/:id` | |
| 点赞 | `POST /api/checkins/<id>/like` | `POST /v1/checkins/:id/like` | |
| 花卉相关打卡 | `GET /api/flowers/<id>/checkins` | `GET /v1/flowers/:id/checkins` | |
| 地点相关打卡 | `GET /api/places/<id>/checkins` | `GET /v1/locations/:id/checkins` | |
| 成就列表 | `GET /api/achievements` | `GET /v1/achievements` | |
| 健康检查 | `GET /health`(根路径) | `GET /v1/health` | 当前 `app.py` 注册在根路径,统一到 `/v1/...` |
| 文件上传 | (无) | `POST /v1/upload` | **新增**,落 `backend/uploads/`,返回 `{ url }` |

### 5.3 字段语义对齐

| 痛点 | 当前 | 修复 |
|------|------|------|
| `Checkin` 关联 | 后端 `flower_place_id`,前端 `location_id` | 序列化双写,响应/请求体均含 `location_id` |
| 登录响应 | 后端 `{ access_token }` | 统一为 `{ code, message, data: { token, user } }` |
| 注册响应 | 维持 `{ username, password }` 入参 | 响应同登录,注册即登录 |

### 5.4 后端文件改动

- `extensions.py` — **新增**
- `app.py` — `add_resource` 路径改 `/v1/...`,新增 `/v1/upload`、`/v1/auth/register`、`/v1/auth/login` 路由
- `routes.py` — 重命名资源类、调整序列化、登录 `mode` 分流、新增 register/upload 资源
- `config.py` — `JWT_SECRET_KEY` / `SECRET_KEY` 默认值
- `requirements.txt` — 必要时加 `Werkzeug`(文件保存)
- `migrations/` — **不改**

### 5.5 不在范围

- 真实微信 `code2Session`(`mode: 'wx-code'` 分支返回 501)
- 内容审核 / GPS 距离校验 / 推送 / 定时任务
- HTTPS / 域名备案

---

## 6. 测试与验证

### 6.1 三层验证

**Layer A:通用层** 迁完后用 H5 跑完整套验证,无需等小程序工程起来。

| 验证项 | 手段 |
|-------|------|
| `uni.request` 替换 `fetch` 后,登录/获取地点/获取打卡接口能拿数据 | 浏览器 devtools Network |
| 后端不可达时 store 仍降级到 `mockData` | 关掉后端,刷新 H5,看 console + 页面有数据 |
| `storage.ts` 写入 token 后路由守卫放行 | 手动操作 |
| Pinia store 双端 reactivity 一致 | 切换排序、点赞 |

**Layer B:页面与组件** 每页 H5 + 微信开发者工具双端验证。

| 项 | H5 | 小程序 |
|----|----|-------|
| 页面打得开,无白屏 | 浏览器 | 工具页面切换 |
| 跳转/参数传递 | 地址栏 | AppData / Console |
| 接口走 `uni.request` 且降级正常 | Network | Network |
| 样式不错位(尤其 fixed 与安全区) | 多分辨率(375/414/768) | 真机扫二维码,iPhone+Android 各看一台 |

**Layer C:全链路冒烟**

```
登录(演示)→ 首页加载推荐与动态 → 点进打卡详情 →
跳到地图 → 切到打卡发布、选图上传、提交 → 回首页看到新动态 →
进入花园看成就 → 进入个人中心
```

通过标准:两端整条流程能跑完,无 fatal,接口调用率 ≥ 80%(允许 mock 降级)。

### 6.2 自动化脚本

`Frontend-uni/scripts/verify-api.sh`:发起 `/v1/health`、`/v1/auth/login {mode:'demo'}`、`/v1/checkins?limit=1` 三次请求,确认契约对齐。

### 6.3 类型检查

`npm run type-check` 在每次大块改动后跑一次。`tsconfig` 严格度沿用,不调高。

### 6.4 验收准入(DoD)

- [ ] `cd Frontend-uni && npm run dev:h5` 起 H5 预览,9 个页面(8 + register)全可达
- [ ] `cd Frontend-uni && npm run dev:mp-weixin` 编译产物在微信开发者工具能跑,9 个页面全可达
- [ ] `cd backend && python app.py` 正常启动,所有 `/v1/...` 接口返回 200
- [ ] 演示登录两端走通,token 持久化,刷新免重登
- [ ] 注册流程两端走通(账号密码,后端真实建档,返回真 JWT)
- [ ] 地图两端能渲染、加载花点、点击 marker 弹出信息卡
- [ ] 打卡发布两端能选图、上传成功、首页看到新条
- [ ] `verify-api.sh` 通过
- [ ] 旧 `Frontend/` 暂留,README 标记 deprecated

---

## 7. 风险与回退

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| uni-app 在 Vite 7 / TS 5.9 上有兼容坑 | 中 | 工程起不来 | 起 `Frontend-uni/` 时锁定 uni-app 推荐的 Vite/TS 版本组合;不强求与 `Frontend/` 同版本 |
| 腾讯地图 web key 与小程序 key 是两套需分别申请 | 高 | 卡地图渲染 | 占位 key 写到配置,先完成 UI 与抽象层,key 后补 |
| `Checkin` 字段 `location_id` 双写导致响应膨胀 | 低 | 包体大几个字节 | 可接受 |
| Unsplash 外链替换为 static/ 的本地图后 H5 体验变化 | 低 | 视觉略不同 | 设计阶段已确认本地化,可接受 |
| 后端跑通后 mock 降级路径反被 hide | 低 | 故障不易暴露 | 验证 Layer A 时强制关后端跑一次 |
| 旧 `Frontend/` 与新工程同时存在,文档/合并易乱 | 中 | 协作误解 | 旧目录顶部加 README "DEPRECATED",并在 CLAUDE.md 同步 |

**回退**:本次工作在 `feat/miniprogram-migration` 分支隔离;若决定放弃,直接弃分支,不影响 `vue-rcx-2` / `main`。

---

## 8. 后续步骤

1. 用户审阅本设计文档
2. 调用 `superpowers:writing-plans` 编写实施计划(分阶段、可勾选)
3. 在 `feat/miniprogram-migration` 分支按计划执行
