# 校园花卉地图小程序后端

## 项目概述

校园花卉地图小程序后端是一个基于Node.js开发的RESTful API服务，为校园花卉地图小程序提供数据支持和业务逻辑处理。该系统包含用户认证、花卉地点管理、用户打卡与审核、花期众包投票、成就与称号系统等核心功能。

## 技术栈

- **Web框架**：Express.js
- **数据库**：MySQL 5.7
- **缓存**：Redis
- **反向代理**：Nginx
- **容器化**：Docker & Docker Compose
- **认证**：JWT (JSON Web Tokens)
- **对象存储**：腾讯云COS

## 核心功能

### 1. 用户认证
- 微信小程序登录（基于OpenID）
- JWT令牌生成与验证
- 用户角色管理（普通用户/管理员）

### 2. 花卉地点管理
- 花卉地点CRUD操作
- 花卉信息维护（名称、科属、花期等）
- 花卉图片存储与管理

### 3. 用户打卡
- 打卡位置验证（GPS）
- 打卡图片上传
- 花期状态报告

### 4. 打卡审核
- 管理员审核打卡信息
- 违规打卡处理

### 5. 花期众包投票
- 用户对花期状态进行投票
- 基于投票结果自动更新花期状态
- 投票记录管理

### 6. 成就与称号系统
- 成就解锁条件设置
- 成就自动检测与解锁
- 用户称号管理

### 7. 订阅功能
- 花卉花期订阅
- 花期变化通知

## 项目结构

```
.
├── src/
│   ├── config/          # 配置文件
│   │   ├── cos.js       # 腾讯云COS配置
│   │   ├── database.js  # 数据库配置
│   │   ├── jwt.js       # JWT配置
│   │   └── redis.js     # Redis配置
│   ├── controllers/     # 控制器
│   │   ├── achievements.js
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── checkins.js
│   │   ├── locations.js
│   │   ├── subscriptions.js
│   │   └── titles.js
│   ├── middlewares/     # 中间件
│   │   └── auth.js      # 认证中间件
│   ├── routes/          # 路由
│   │   ├── achievements.js
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── checkins.js
│   │   ├── locations.js
│   │   ├── subscriptions.js
│   │   └── titles.js
│   ├── services/        # 服务层
│   │   ├── achievementService.js
│   │   ├── auditService.js
│   │   ├── titleService.js
│   │   └── voteService.js
│   └── index.js         # 入口文件
├── scripts/             # 脚本文件
│   └── init.sql         # 数据库初始化脚本
├── ssl/                 # SSL证书
├── uploads/             # 临时上传文件
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── Dockerfile           # Docker配置
├── docker-compose.yml   # Docker Compose配置
├── nginx.conf           # Nginx配置
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## 环境配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据实际情况修改配置：

```bash
cp .env.example .env
```

配置内容包括：
- 数据库连接信息
- Redis连接信息
- JWT密钥
- 腾讯云COS配置
- 服务器端口

## 部署方式

### 1. Docker部署（推荐）

使用Docker Compose一键部署整个后端服务：

```bash
docker-compose up -d
```

此命令将启动以下服务：
- MySQL 5.7
- Redis
- Node.js应用
- Nginx

### 2. 传统部署

#### 2.1 安装依赖

```bash
npm install
```

#### 2.2 启动服务

```bash
node src/index.js
```

## API文档

### 认证相关

- `POST /v1/auth/login` - 微信登录
- `POST /v1/auth/logout` - 退出登录

### 花卉地点

- `GET /v1/locations` - 获取所有花卉地点
- `GET /v1/locations/:id` - 获取单个花卉地点详情
- `POST /v1/locations` - 创建花卉地点（管理员）
- `PUT /v1/locations/:id` - 更新花卉地点（管理员）
- `DELETE /v1/locations/:id` - 删除花卉地点（管理员）

### 打卡管理

- `POST /v1/checkins` - 创建打卡
- `GET /v1/checkins/user` - 获取用户打卡记录
- `GET /v1/checkins/pending` - 获取待审核打卡（管理员）
- `PUT /v1/checkins/:id/audit` - 审核打卡（管理员）

### 成就与称号

- `GET /v1/achievements` - 获取所有成就
- `GET /v1/achievements/user` - 获取用户已解锁成就
- `GET /v1/titles` - 获取所有称号
- `GET /v1/titles/user` - 获取用户称号

### 订阅功能

- `POST /v1/subscriptions` - 订阅花卉花期
- `GET /v1/subscriptions/user` - 获取用户订阅列表
- `DELETE /v1/subscriptions/:id` - 取消订阅

## 开发指南

### 1. 代码风格
- 遵循JavaScript ES6+语法
- 使用Promise或async/await处理异步操作
- 保持代码模块化和可维护性

### 2. 数据库操作
- 使用MySQL连接池
- 避免直接执行SQL语句，使用参数化查询防止SQL注入
- 数据库迁移和初始化使用`scripts/init.sql`脚本

### 3. 错误处理
- 统一的错误响应格式
- 适当的错误日志记录

## 注意事项

1. 确保Docker和Docker Compose已正确安装
2. 修改`.env`文件中的配置时，注意敏感信息的保护
3. 开发环境和生产环境的配置应分开管理
4. 定期备份数据库数据
5. 注意图片存储的安全性和性能优化

## 许可证

MIT

## 联系方式

如有问题或建议，请联系项目维护人员。
