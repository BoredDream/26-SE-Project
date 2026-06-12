# 狮山花园 · 前端设计现状文档

> 用途：提供给设计师作为重新设计的参考。覆盖范围仅微信小程序端（`Frontend-uni/`），帮助理解"现在是什么样、有哪些约束"，便于做出兼容当前架构的重设计建议。

---

## 0. 项目概述

**产品定位**：面向校园师生的花卉地图打卡 Web/小程序应用。用户能在地图上发现校园花卉、记录打卡帖子、查看他人动态、累积成就。

**技术栈**：
- Vue 3 + TypeScript + Pinia + Vue Router
- uni-app（Vite 编译）→ 同源产出 H5 与微信小程序双端
- 后端：Flask + SQLAlchemy + SQLite + JWT
- 小程序端用微信原生 `<map>`，H5 端用高德地图 SDK

**设计基线**：Material Design 3，种子色 **花园绿 `#4CAF50`**。所有色彩、字体、间距、形状、阴影都遵循 MD3 令牌体系，在 `Frontend-uni/src/uni.scss` 全局注入。

---

## 1. 设计语言（Design Tokens）

> 所有变量定义在 `Frontend-uni/src/uni.scss`，会被 uni-app 编译时自动注入每个组件的 `<style lang="scss">`，全局可用。重设计时若调整这些值，所有页面会同步生效。

### 1.1 配色系统

> 全部由花园绿 `#4CAF50` 通过 MD3 调色板算法推导，分语义组使用。

| 语义层 | 变量名 | 实际值 | 作用 |
|---|---|---|---|
| 主色 | `$md-primary` | `#4caf50` | 强调色、链接、按钮、徽章、激活态 |
| 主色对比 | `$md-on-primary` | `#ffffff` | 主色背景上的文字 |
| 主色容器 | `$md-primary-container` | `#c7ecc8` | 头像底色、tag 背景 |
| 主色容器对比 | `$md-on-primary-container` | `#08390f` | 主色容器上的文字 |
| 次色 | `$md-secondary` | `#52634f` | 灰绿，次要操作 |
| 次色容器 | `$md-secondary-container` | `#d5e8cf` | tonal 按钮、被选中 chip 背景 |
| 第三色 | `$md-tertiary` | `#38656a` | 灰青，点缀色（暂时未使用） |
| 第三色容器 | `$md-tertiary-container` | `#bcebf0` | 花期状态等点缀 |
| 页面背景 | `$md-background` | `#f6fbf2` | 整页背景（浅绿白） |
| 表面 | `$md-surface` | `#ffffff` | 卡片背景 |
| 表面变体 | `$md-surface-variant` | `#dfe4d7` | 进度条轨道 |
| 表面容器 | `$md-surface-container` | `#eef2e8` | 输入框、picker、被选中卡背景 |
| 表面容器高 | `$md-surface-container-high` | `#e7ebe1` | 评论项背景等更高层 |
| 主文字 | `$md-on-surface` | `#191d17` | 卡片上正文文字 |
| 辅助文字 | `$md-on-surface-variant` | `#43483f` | 副文本、placeholder |
| 轮廓 | `$md-outline` | `#73796c` | 较强边框 |
| 轮廓变体 | `$md-outline-variant` | `#c3c8b9` | 弱分隔、outlined 按钮边框 |
| 错误 | `$md-error` | `#ba1a1a` | 错误文字、警告 |
| 错误容器 | `$md-error-container` | `#ffdad6` | 错误提示背景 |
| 错误容器对比 | `$md-on-error-container` | `#410002` | 错误背景上的文字 |

**状态层透明度**：hover 0.08（8%）／pressed 0.12（12%）。

**整体印象**：极度偏绿，缺少其他色彩点缀，配色单一是当前最被诟病的痛点之一（见第 4 章）。

### 1.2 字体排版

> 通过 `@include md-type('角色名')` 调用，全局 11 种角色：

| 角色 | font-size | line-height | font-weight | 典型用途 |
|---|---|---|---|---|
| `display-small` | 34px | 42px | 600 | login logo 文字 |
| `headline-medium` | 26px | 34px | 600 | dialog 标题、garden hero 标题 |
| `headline-small` | 22px | 30px | 600 | 备用大标题 |
| `title-large` | 20px | 28px | 600 | 卡片大标题（profile name） |
| `title-medium` | 16px | 24px | 600 | section 标题（首页"花卉推荐"） |
| `title-small` | 14px | 20px | 600 | 花卡名、子标题 |
| `body-large` | 16px | 24px | 400 | 输入框文字 |
| `body-medium` | 14px | 21px | 400 | 帖子正文、对话内容 |
| `body-small` | 12px | 16px | 400 | 时间、辅助说明 |
| `label-large` | 14px | 20px | 600 | 按钮文字 |
| `label-medium` | 12px | 16px | 600 | 字段标签 |

字体族未显式声明，使用系统默认（iOS 苹方 / Android Roboto）。

### 1.3 间距栅格（4dp）

| 变量 | 像素 | 典型用法 |
|---|---|---|
| `$md-space-1` | 4px | 紧凑间隔（图标内边距） |
| `$md-space-2` | 8px | chip 内边距、小型组合 |
| `$md-space-3` | 12px | 卡片内段落间距、grid gap |
| `$md-space-4` | 16px | **页面默认 padding**、卡片间 gap |
| `$md-space-5` | 20px | dialog 内边距、组件大间距 |
| `$md-space-6` | 24px | dialog padding、login 页 padding |
| `$md-space-8` | 32px | 大留白（不常用） |

注意：没有 `$md-space-7`。

### 1.4 圆角规范

| 变量 | 像素 | 典型用法 |
|---|---|---|
| `$md-shape-xs` | 4px | （未广泛使用） |
| `$md-shape-sm` | 8px | 输入框、picker、chip |
| `$md-shape-md` | 12px | 帖子图片、缩略图 |
| `$md-shape-lg` | 16px | 卡片、花卡 |
| `$md-shape-xl` | 28px | logo 容器、login 卡 |
| `$md-shape-full` | 999px | 圆形（头像、徽章、进度条、芯片） |

### 1.5 阴影层级

> 偏绿调阴影（基色 `rgba(45, 70, 40, ...)`），通过 `@include md-elevation(0~5)` 调用：

| 层级 | box-shadow | 典型用途 |
|---|---|---|
| 0 | `none` | 扁平 |
| 1 | `0 1px 3px rgba(45,70,40,.12), 0 1px 2px rgba(45,70,40,.08)` | 默认卡片、app bar |
| 2 | `0 2px 6px rgba(45,70,40,.14), 0 1px 3px rgba(45,70,40,.1)` | hover 卡 |
| 3 | `0 4px 12px rgba(45,70,40,.16), 0 2px 5px rgba(45,70,40,.1)` | dialog、FAB |
| 4 | `0 6px 18px rgba(45,70,40,.18), 0 3px 8px rgba(45,70,40,.12)` | 强突出 |
| 5 | `0 10px 28px rgba(45,70,40,.2), 0 5px 12px rgba(45,70,40,.14)` | 抽屉、底部弹层 |

### 1.6 动效

| 类型 | 变量 | 值 |
|---|---|---|
| 时长 - 短 | `$md-duration-short` | 150ms（按钮、点击反馈） |
| 时长 - 中 | `$md-duration-medium` | 250ms（弹窗、抽屉） |
| 时长 - 长 | `$md-duration-long` | 350ms（轮播） |
| 缓动 - 标准 | `$md-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| 缓动 - 强调 | `$md-easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)`（同上）|

---

## 2. 全局结构

### 2.1 路由表

> 来源：`Frontend-uni/src/pages.json`。共 **9 个页面**，全部使用 `navigationStyle: "custom"`（隐藏系统导航栏，由 `<md-app-bar>` 自绘）。无系统 tabBar（被自定义底部操作栏替代）。

| 路径 | 文件 | 名称 | 登录可达 |
|---|---|---|---|
| `/pages/login/login` | login.vue | 登录 | 公开 |
| `/pages/register/register` | register.vue | 注册 | 公开 |
| `/pages/home/home` | home.vue | 首页 | 需要 |
| `/pages/map/map` | map.vue | 地图 | 需要 |
| `/pages/checkin/checkin` | checkin.vue | 打卡 | 需要 |
| `/pages/garden/garden` | garden.vue | 花园 | 需要 |
| `/pages/profile/profile` | profile.vue | 我的 | 需要 |
| `/pages/user-detail/user-detail` | user-detail.vue | 用户详情 | 需要 |
| `/pages/navigation/navigation` | navigation.vue | 导航 | 需要 |

底部操作栏的"tab 槽"对应 4 个页面：**home / map / garden / profile**，发布按钮居中跳到 checkin 页。

### 2.2 自定义底部操作栏（核心导航）

> 文件：`Frontend-uni/src/components/bottom-action-bar/bottom-action-bar.vue`。被引入到 home/map/garden/profile 四个页面的根 view 底部。

**布局**：固定 `position: fixed; bottom: 0; left:0; right:0`，高 60px + iOS safe-area-inset-bottom 内边距，5 槽 flex 等分：

```
┌──────────────────────────────────────┐
│  🏠主页   🗺️地图   ⊕发布   🌱花园   👤我的  │  <- 60px 高
└──────────────────────────────────────┘
                  ↑
              凸起按钮
            56×56 圆形
       绿底 #4CAF50 + 阴影
        上移 18px 凸出
```

- 普通 4 槽：图标 24×24 + 11px 标签文字，激活时图标和文字都换成绿色（`#4caf50`）
- 中间发布槽：56×56 圆形浮起 18px，绿底（`#4caf50`）+ 阴影 `0 4px 12px rgba(76,175,80,0.4)`
- 加号用两条 `<view>`（横竖各 3px×24px）叠加构造，几何精确居中（不依赖字体）
- 切 tab 用 `uni.reLaunch`，发布跳 `uni.navigateTo`

### 2.3 通用组件

| 组件 | 路径 | 视觉与作用 |
|---|---|---|
| `<md-app-bar>` | `components/md-app-bar/` | 自绘导航栏，高 56px + statusBar，左可选返回箭头 ←，居中标题 `title-large` |
| `<md-card>` | `components/md-card/` | variant: `elevated`（白底+ev1 阴影，默认）/ `filled`（灰底 `#eef2e8`）/ `outlined`（白底+边框）。默认 padding 16px，圆角 16px |
| `<md-button>` | `components/md-button/` | variant: `filled`（绿底白字）/ `tonal`（次色容器）/ `outlined`（白底绿边）/ `text`（纯文字）。min-height 44px，圆角 999px |
| `<md-fab>` | `components/md-fab/` | 浮动按钮，56×56 圆形，默认右下 fixed。`extended` 模式可加文字。**已在小程序端被底部操作栏替代** |
| `<md-chip>` | `components/md-chip/` | 高 34px，圆角 8px。未选中：白底+灰边框；选中：`secondary-container` 绿灰底 |
| `<md-text-field>` | `components/md-text-field/` | 标签 + 输入框。框背景 `surface-container` 灰，底边线获焦时变绿（`primary`），可显示字数 |
| `<comment-sheet>` | `components/comment-sheet/` | 底部弹层，从下滑入，圆角 `lg lg 0 0`，列表 + 输入框 + 发送按钮 |
| `<flower-suggest>` | `components/flower-suggest/` | 关键词搜索 → 显示 15 种花卉 chip 列表，flex wrap |

---

## 3. 页面清单

> 每个页面统一描述：**功能 / UI / 布局 / 配色 / 交互 / 已知问题**

### 3.1 login.vue — 登录页

- **功能**：演示模式一键登录（点击调用 `/v1/auth/login {mode:'demo'}` 拿真实 JWT）；跳转注册页
- **UI**：Logo（72×72 圆角 28px，`primary-container` 底，居中"狮"字）+ 标题 + 描述 + 两个按钮
- **布局**：单列居中竖排，整页 padding 24px
- **配色**：背景沿用页面背景 `#f6fbf2`，logo 底 `#c7ecc8`，文字 `primary` 绿
- **交互**：演示按钮 `filled`，注册按钮 `outlined`，错误提示用 `error-container` 红
- **已知问题**：视觉单一，无品牌插画/动画

### 3.2 register.vue — 注册页

- **功能**：用户名+密码+昵称 三字段注册
- **UI**：`<md-app-bar>` + 卡片 + 3 个 `<md-text-field>` + 提交按钮
- **布局**：与 login 一致，body 单列 gap 16px
- **配色**：基础灰底输入框 + 绿色提交按钮
- **交互**：提交成功后 `reLaunch` 到首页
- **已知问题**：缺少表单校验反馈（如密码强度提示），错误信息只用一行红字

### 3.3 home.vue — 首页

> 信息密度最大、最重要的页面。

- **功能**：浏览花卉推荐 / 滑动浏览花园帖子 / 点赞 / 评论 / 跳转地图过滤花种 / 跳转用户详情
- **UI 区块**（从上到下）：
  1. **`<md-app-bar>`** "狮山花园"
  2. **Hero 轮播**（`<swiper>`）：3 张 FlowerDemo 图轮播，200px 高，4.5s 切换，500ms 过渡。指示器：白色半透明圆点，激活白
  3. **花卉推荐**横滑卡片：200×150 图 + 花种/地点/状态点，圆角 16px，hover 上浮 2px+阴影加深
  4. **花园帖子流**：排序芯片"最新"/"最热" + 卡片列表
     - 帖子卡：40×40 圆头像（首字母）+ 昵称 + 时间 + 正文 + 图片网格 + 花种 chip + 点赞♥/评论按钮
     - 图片网格：1 张 4:3 / 2 张 1:1 双联 / 3 张左大右小双格 / 4-9 张 3 列 1:1，超过 9 张第 9 格加 `+N` 黑色半透明覆盖
  5. **下拉加载**：`onReachBottom` 触发，无手动按钮；底部固定提示"上拉加载更多..." 或 "—— 已经到底啦 ——"（左右两条 32px 灰线）
- **浮动元素**：
  - **回到顶部按钮**：滚动 360px 后显示，44×44 圆形 fixed 右下 bottom 110px，半透明白底+柔和阴影，绿色 ↑
  - **评论抽屉**：点击评论按钮弹出 `<comment-sheet>`
  - **底部操作栏**：`<bottom-action-bar current="home">`
- **配色**：白卡 + 浅绿背景 + 绿色强调（点赞已点、解锁标记、状态点）
- **交互**：点击图片调 `uni.previewImage` 全屏预览
- **已知问题**：Hero 仅纯图轮播，缺品牌识别度强的标语/装饰

### 3.4 map.vue — 花卉地图

- **功能**：在地图上看校园花卉分布；按花种过滤；点 marker 跳导航
- **UI**：
  - 顶部过滤区：搜索输入框（搜花名）+ 横滚 chip 行（"全部" + 各花种）
  - 主体：H5 用 `<view id="map-panel">`（高德 SDK）；小程序用 `<map>` 原生组件
  - markers：32×32 默认样式 + title
- **布局**：上 filter + 下 map（flex:1）
- **配色**：过滤区白底 + ev1 阴影分层；chip 选中态绿灰
- **交互**：搜索输入实时刷新 markers；点 marker 跳 `/pages/navigation`
- **过滤参数传入**：home 跳过来时，先 `setStorageSync('pending_map_filter', flowerName)`，再 `switchTab`；map 在 `onShow` 读取后清除
- **已知问题**：地图区缺自定义 marker 样式（小程序原生 marker 较朴素）

### 3.5 checkin.vue — 发布打卡

- **功能**：填写内容 + 选/拍照片（最多 9 张）+ 选地点 + 选花期状态 → 上传发布
- **UI**：3 个 elevated 卡片堆叠
  1. **打卡内容**：textarea，最多 1000 字，显示字数
  2. **照片**：`X/9` 计数器；3 列网格；已选图（删除按钮 ✕）+ "+相册选择"占位+"📷拍照"占位
  3. **打卡信息**：picker 选地点 + status chip 选花期（含苞/盛开/凋零）
- **布局**：body flex column gap 16px，最后是块状提交按钮 + 底部小字 tip
- **配色**：白卡 + 浅灰输入区，按钮主色绿
- **交互**：
  - 相册：`uni.chooseImage({sourceType:['album'], count: 9-existing})`
  - 拍照：`uni.chooseImage({sourceType:['camera'], count: 1})`
  - 已选图点击预览
  - 提交：先上传图片 → POST checkin → `reLaunch` 回首页
- **已知问题**：textarea 仅靠 border-bottom 提示，焦点态视觉较弱

### 3.6 garden.vue — 花园成就墙

> 最近重设计过的页面，已有花园主题。

- **功能**：以花种为单位的"图鉴成就"。打过该花种卡的就解锁
- **UI 区块**：
  1. **Hero banner**：花园绿渐变（`#3a7d44 → #6fbb6b`，135°）+ 圆点纹理（径向渐变 3 点 140×140 平铺）+ 🌿🌸🍃 emoji 装饰飘在右上 + 横置进度条 + "X / 12 种"统计
  2. **花卡网格**：2 列，每格 aspect-ratio 1:1
     - 解锁：彩色 FlowerDemo 图 + 右上 ✓ 绿圆徽章（26×26 阴影）+ "已打卡 N 次"绿粗体
     - 未解锁：灰度 + 暗渐变遮罩 + 🔒 + "前往地图打卡解锁"灰字
  3. **底部 hint**：「花开知春来 · 用打卡留住每一次绽放」
- **详情弹窗**：80×80 花图 + 名称 + 次数 + 该花种的所有打卡帖子列表
- **配色**：hero 绿渐变 + 白卡 + 解锁绿强调
- **交互**：点花卡弹详情 dialog
- **已知问题**：emoji 装饰不是品牌化插画

### 3.7 profile.vue — 我的

- **功能**：用户信息（昵称/等级/经验/打卡数/徽章数）+ 成长进度 + 我的帖子列表
- **UI**：3 个 elevated 卡
  1. **个人卡**：64×64 圆头像（首字母+绿色容器底） + 昵称/角色 + 三列统计（数字 `title-large` 绿 + 标签）
  2. **成长进度**：标题 + 8px 高进度条 + "等级 N · X%"
  3. **我的帖子**：标题+"查看全部"文字按钮 + 帖子卡列表
- **布局**：body flex column gap 16px
- **配色**：白卡 + 浅灰背景 + 绿色数字强调
- **交互**：点击帖子跳 user-detail
- **已知问题**：头像无图片占位（仅文字）；统计数字虽大但无图标点缀

### 3.8 user-detail.vue — 用户详情

- **功能**：查看任意用户的资料 + 近期帖子
- **UI**：用户卡（头像+等级+经验条）+ 帖子列表（同 home 风格简化版，含图片网格）
- **布局**：单列卡片堆叠
- **配色**：与 profile 一致
- **交互**：图片可点击预览
- **已知问题**：与 profile 重复元素多，缺少差异化（如关注按钮、互动数据）

### 3.9 navigation.vue — 步行导航

- **功能**：从用户位置导航到某花卉地点
- **UI**：地图容器（同 map.vue）+ 底部卡片（距离/预计时间/分割线）
- **布局**：纵向 flex，地图 flex:1，卡片 fixed bottom
- **配色**：白底 + 主色蓝箭头（地图原生）
- **交互**：从 map 的 marker 跳过来，携带 lng/lat/name 参数
- **已知问题**：路径绘制依赖平台原生能力，样式不统一

---

## 4. 已知设计痛点（重设计优先级）

> 这里列出当前最被用户/开发反馈、或显著影响品牌感的设计问题。重设计时可优先突破。

### 高优先级

1. **整体配色单一**：除主色绿，二色/三色几乎未使用，全屏满目绿+白+浅灰，视觉缺层次和品牌情绪。建议引入第二个调性色（如花瓣粉、阳光黄）做点缀。
2. **图标体系混乱**：底部栏用 PNG，页面内大量使用 emoji（🔒 📷 🌿 🌸 🍃 ↑ ✕ ✓ ♥ ♡）。emoji 在不同设备字体下渲染不一致，专业感差。建议引入一套品牌 SVG 图标。
3. **Hero / Banner 弱**：除 garden 新增的渐变 hero，home 顶部只有 200px 轮播图。首页是用户最常停留的页面，缺乏品牌识别度强的标语、插画、欢迎语等。
4. **微动效贫乏**：当前只有按钮 hover scale、卡片上浮。"花园"主题没有体现到动效里——缺花瓣飘落、解锁庆祝、点赞收藏动画等品牌化转场。

### 中优先级

5. **空状态 / Loading 设计缺失**：列表空了只显示一行小字（"暂无帖子"），没有插画、引导操作或骨架屏。
6. **默认头像是文字首字**：在 `primary-container` 底色上显示昵称首字。缺少品牌化的默认头像（如各种小花图标）。
7. **状态标签简陋**：花期状态用绿色小圆点 + 文字。建议引入花期阶段色（含苞玫红/盛开亮粉/凋零灰褐）。
8. **typography 单一**：所有文字 weight 只用 400 / 600，没用到 italic/light，对比可以更丰富。

### 低优先级（架构能力相关）

9. **暗色模式未规划**：所有颜色变量只有亮色一套。若计划支持暗色，需要镜像扩展。
10. **缺少响应式断点**：当前固定 mobile 布局，未考虑 iPad / 折叠屏 / 横屏等场景。
11. **无可访问性规范**：未明确触控目标最小尺寸（应 ≥ 44×44px）、对比度（WCAG AA）、焦点态可见性等。

---

## 5. 重设计建议落点

如果想保留架构不动地做"皮肤级"重设计：
- **改 `Frontend-uni/src/uni.scss`** 的颜色/字体/圆角/阴影变量值 → 全站自动生效
- **改 `bottom-action-bar.vue`** 的样式 → 影响所有 tab 页底部
- **替换 `src/static/icon/*.png` 与花卉图** → 底部栏图标与花卡封面

如果想做"页面级"重构：
- 各页面 `.vue` 文件中 `<style scoped>` 块互相独立，可单页改造而不影响其他页
- 业务逻辑（`<script setup>`）尽量保持不变，只调整 template/style

如果想引入新组件库（如 uView、TDesign）：
- 当前所有 `md-*` 组件位于 `Frontend-uni/src/components/`，可整组替换
- 业务页通过 easycom 自动注册，不需手动改 import

---

## 附：关键文件清单

| 类别 | 路径 |
|---|---|
| 设计令牌 | `Frontend-uni/src/uni.scss` |
| 路由配置 | `Frontend-uni/src/pages.json` |
| 全局 App | `Frontend-uni/src/App.vue` |
| 页面 | `Frontend-uni/src/pages/{login,register,home,map,checkin,garden,profile,user-detail,navigation}/<name>.vue` |
| 通用组件 | `Frontend-uni/src/components/{md-app-bar,md-card,md-button,md-fab,md-chip,md-text-field,bottom-action-bar,comment-sheet,flower-suggest}/` |
| 静态资源 | `Frontend-uni/src/static/icon/`（底栏图标） `Frontend-uni/src/static/flowers/`（12 种花卉图）`Frontend-uni/src/static/carousel/`（3 张轮播图） |
| Pinia stores | `Frontend-uni/src/stores/{auth,location,checkin,achievement}.ts` |
| API 客户端 | `Frontend-uni/src/services/api.ts` |
