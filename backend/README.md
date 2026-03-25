# 校园花卉地图小程序后端

## 项目概述

校园花卉地图小程序后端是一个基于Node.js开发的RESTful API服务，为校园花卉地图小程序提供数据支持和业务逻辑处理。该系统包含用户认证、花卉地点管理、用户打卡、花期众包报告、成就与称号系统等核心功能，旨在为师生提供便捷的校园花卉信息查询和分享平台。

## 技术栈

- **Web框架**：Express.js
- **数据库**：MySQL 5.7+
- **缓存**：Redis
- **容器化**：Docker & Docker Compose
- **认证**：JWT (JSON Web Tokens)
- **对象存储**：腾讯云COS
- **图片处理**：Sharp
- **地理位置计算**：Geolib

## 核心功能

### 1. 用户认证

- 微信小程序登录与注册（基于OpenID）
- 微信网页扫码登录（基于微信开放平台OAuth2.0）
- JWT令牌生成与验证
- 用户角色管理（普通用户/管理员）

### 2. 花卉管理

- 花卉信息维护（名称、学名、描述、花期等）
- 花卉图片存储与管理
- 花卉分类与检索

### 3. 地点管理

- 花卉地点CRUD操作
- 地点坐标管理
- 地点打卡次数统计

### 4. 用户打卡

- 打卡位置验证（GPS）
- 打卡图片上传与存储
- 花期状态报告
- 打卡内容分享
- 打卡点赞与举报

### 5. 花期报告系统

- 用户众包花期报告
- 花期状态自动更新
- 花期变化通知

### 6. 成就与称号系统

- 多样化的成就系统
- 自动成就检测与解锁
- 用户称号管理
- 积分与等级体系

### 7. 订阅功能

- 花卉花期订阅
- 花期变化通知
- 个性化订阅管理

## 数据库设计

### 核心表结构

| 表名                  | 描述      |
| ------------------- | ------- |
| `users`             | 用户表     |
| `flowers`           | 花卉表     |
| `places`            | 地点表     |
| `flower_places`     | 花卉地点关联表 |
| `checkins`          | 打卡表     |
| `checkin_likes`     | 打卡点赞表   |
| `checkin_reports`   | 打卡举报表   |
| `subscriptions`     | 订阅表     |
| `achievements`      | 成就表     |
| `user_achievements` | 用户成就关联表 |
| `titles`            | 头衔表     |
| `user_titles`       | 用户头衔关联表 |

### 数据库初始化

使用提供的初始化脚本创建数据库和表结构：

```bash
# 通过Docker执行
mysql -u root -p < scripts/init.sql

# 或通过Docker Compose执行
docker-compose exec mysql mysql -u root -p campus_flower < scripts/init.sql
```

## 项目结构

```
.
├── src/                    # 源代码目录
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middlewares/        # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # 路由定义
│   ├── services/           # 业务逻辑层
│   └── index.js            # 入口文件
├── scripts/                # 脚本文件
│   └── init.sql           # 数据库初始化脚本
├── uploads/                # 临时上传文件
├── .env                    # 环境变量配置
├── .env.example            # 环境变量示例
├── Dockerfile              # Docker构建文件
├── docker-compose.yml      # Docker Compose配置
├── nginx.conf              # Nginx配置
├── package.json            # 项目依赖
└── README.md               # 项目说明文档
```

## 环境配置

### 1. 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据实际情况修改配置：

```bash
cp .env.example .env
```

配置内容包括：

- 数据库连接信息
- Redis连接信息
- JWT密钥
- 腾讯云COS配置

## 部署方式

### Docker部署（推荐）

使用Docker Compose一键部署整个后端服务：

```bash
# 构建并启动服务
docker-compose up -d --build

# 仅启动服务
docker-compose up -d
```

此命令将启动以下服务：

- MySQL 5.7
- Redis
- Node.js应用
- Nginx

### 服务管理命令

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart node-app

# 停止服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f node-app
```

## 开发指南

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
npm run dev
```

### 3. 代码风格

- 遵循JavaScript ES6+语法
- 使用Promise或async/await处理异步操作
- 保持代码模块化和可维护性

### 4. 数据库操作

- 使用MySQL连接池
- 避免直接执行SQL语句，使用参数化查询防止SQL注入
- 使用模型层封装数据库操作

### 5. API开发规范

- 遵循RESTful API设计规范
- 使用统一的响应格式
- 适当的错误处理和日志记录
- API版本控制

## API文档

### 基础URL

所有API请求的基础URL为：`http://your-domain.com/v1`

### 认证

大多数API需要认证，认证方式为在请求头中添加`Authorization: Bearer <token>`，其中`<token>`为登录后获取的JWT令牌。

### 主要API端点

#### 1. 认证路由 `/v1/auth`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| POST | `/login` | 微信小程序登录 | 否 | 否 |
| POST | `/register` | 微信小程序注册/更新用户信息 | 否 | 否 |
| GET  | `/web/login` | 获取网页微信登录二维码 | 否 | 否 |
| GET  | `/web/login/status` | 检查网页登录状态 | 否 | 否 |
| GET  | `/web/callback` | 网页微信登录回调 | 否 | 否 |
| POST | `/logout` | 退出登录 | 是 | 否 |
| POST | `/update` | 更新微信用户信息 | 是 | 否 |

#### 2. 用户路由 `/v1/users`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/me` | 获取当前登录用户信息 | 是 | 否 |
| PUT  | `/me` | 更新当前用户信息 | 是 | 否 |
| GET  | `/` | 获取用户列表 | 是 | 是 |
| GET  | `/:id` | 获取单个用户信息 | 是 | 否 |
| POST | `/` | 创建用户 | 否 | 否 |
| PUT  | `/:id` | 更新用户信息 | 是 | 否 |
| DELETE | `/:id` | 删除用户 | 是 | 是 |

#### 3. 地点路由 `/v1/locations`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/` | 获取所有花卉地点 | 否 | 否 |
| GET  | `/:id` | 获取单个花卉地点详情 | 否 | 否 |
| POST | `/` | 创建花卉地点 | 是 | 是 |
| PUT  | `/:id` | 更新花卉地点 | 是 | 是 |
| DELETE | `/:id` | 删除花卉地点 | 是 | 是 |
| PATCH | `/:id/status` | 更新花期状态 | 是 | 是 |
| POST | `/:id/vote` | 花期状态投票 | 是 | 否 |

#### 4. 打卡路由 `/v1/checkins`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| POST | `/` | 创建打卡 | 是 | 否 |
| GET  | `/me` | 获取我的打卡列表 | 是 | 否 |
| GET  | `/place/:placeId` | 获取某地点的打卡列表 | 是 | 否 |
| GET  | `/flower/:flowerId` | 获取某花卉的打卡列表 | 是 | 否 |
| GET  | `/:id` | 获取单个打卡详情 | 是 | 否 |
| PUT  | `/:id` | 更新打卡内容 | 是 | 否 |
| DELETE | `/:id` | 删除打卡 | 是 | 否 |
| POST | `/:id/like` | 点赞打卡 | 是 | 否 |
| POST | `/:id/report` | 举报打卡 | 是 | 否 |
| GET  | `/:id/likes` | 获取打卡点赞用户列表 | 是 | 否 |

#### 5. 花卉路由 `/v1/flowers`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/` | 获取花卉列表 | 是 | 否 |
| GET  | `/:id` | 获取单个花卉详情 | 是 | 否 |
| POST | `/` | 创建花卉信息 | 是 | 是 |
| PUT  | `/:id` | 更新花卉信息 | 是 | 是 |
| DELETE | `/:id` | 删除花卉 | 是 | 是 |

#### 6. 成就与称号

##### 成就路由 `/v1/achievements`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/` | 获取所有成就 | 否 | 否 |
| GET  | `/me` | 获取我的成就 | 是 | 否 |
| GET  | `/user/:id` | 查看他人成就 | 否 | 否 |

##### 称号路由 `/v1/titles`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/` | 获取所有称号 | 否 | 否 |
| GET  | `/me` | 获取我的称号 | 是 | 否 |

#### 7. 订阅功能 `/v1/subscriptions`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| POST | `/` | 订阅花卉花期 | 是 | 否 |
| GET  | `/` | 获取我的订阅列表 | 是 | 否 |
| DELETE | `/:locationId` | 取消订阅 | 是 | 否 |

#### 8. 管理员路由 `/v1/admin`

| 方法 | 路径 | 功能 | 认证 | 管理员 |
|------|------|------|------|--------|
| GET  | `/stats` | 获取统计数据 | 是 | 是 |
| GET  | `/checkins/pending` | 待复核举报列表 | 是 | 是 |
| PATCH | `/checkins/:id/audit` | 审核操作 | 是 | 是 |

## 注意事项

1. 确保Docker和Docker Compose已正确安装（如果使用Docker部署）
2. 修改`.env`文件中的配置时，注意敏感信息的保护
3. 开发环境和生产环境的配置应分开管理
4. 定期备份数据库数据
5. 注意图片存储的安全性和性能优化

## 许可证

MIT

## 联系方式

如有问题或建议，请联系项目维护人员。
