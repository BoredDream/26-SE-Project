# 校园花卉地图小程序 - 后端服务

## 项目简介
校园花卉地图小程序后端服务，提供花卉地点管理、用户打卡、成就系统、排行榜等功能。

## 技术栈
- **后端框架**：Node.js + Express
- **数据库**：MySQL
- **缓存**：Redis
- **部署方式**：Docker + Docker Compose

## 部署准备
1. 安装 Docker 和 Docker Compose
2. 克隆项目代码到本地

## 部署步骤

### 1. 配置环境变量
根据需要修改 `.env.example` 文件中的配置，然后复制为 `.env` 文件：
```bash
cp .env.example .env
```

### 2. 启动服务
使用 Docker Compose 一键启动所有服务：
```bash
docker-compose up -d
```

### 3. 验证服务
服务启动后，可以通过以下方式验证：
- 后端服务：`http://localhost:6000/health`
- 数据库：`mysql://localhost:3340/campus_flower`
- Redis：`redis://localhost:6490`

## 环境变量说明

### 服务配置
- `PORT`：后端服务端口（默认：6000）

### 数据库配置
- `DB_HOST`：数据库主机
- `DB_PORT`：数据库端口（默认：3340）
- `DB_NAME`：数据库名称
- `DB_USER`：数据库用户名
- `DB_PASSWORD`：数据库密码

### Redis配置
- `REDIS_URL`：Redis连接地址

### 微信小程序配置
- `WX_APPID`：微信小程序AppID
- `WX_SECRET`：微信小程序AppSecret

### 腾讯云COS配置
- `COS_SECRET_ID`：腾讯云COS SecretId
- `COS_SECRET_KEY`：腾讯云COS SecretKey
- `COS_BUCKET`：COS存储桶名称
- `COS_REGION`：COS存储桶地区

### JWT配置
- `JWT_SECRET`：JWT签名密钥

## API接口

### 基础信息
- **Base URL**：`http://localhost:6000/v1`
- **请求格式**：`Content-Type: application/json`
- **鉴权**：JWT Bearer Token，登录后获取

### 主要接口

#### 用户模块
- `POST /auth/login` - 微信登录
- `GET /users/me` - 获取当前用户信息

#### 地点模块
- `GET /locations` - 获取地点列表
- `GET /locations/:id` - 获取地点详情

#### 打卡模块
- `POST /checkins` - 发布打卡
- `GET /locations/:id/checkins` - 获取地点打卡列表

#### 订阅模块
- `POST /subscriptions` - 订阅地点
- `GET /subscriptions` - 获取我的订阅列表

#### 成就模块
- `GET /users/me/achievements` - 获取我的成就
- `GET /users/me/titles` - 获取我的称号

#### 排行榜模块
- `GET /leaderboard/checkins` - 打卡王榜
- `GET /leaderboard/likes` - 点赞榜
- `GET /leaderboard/heatmap` - 热力图数据

## 项目结构
```
backend/
├── app.js                    # 应用入口
├── config/                   # 配置文件
│   ├── database.js           # 数据库配置
│   ├── redis.js              # Redis配置
│   └── jwt.js                # JWT配置
├── controllers/              # 控制器
│   ├── userController.js     # 用户控制器
│   ├── locationController.js # 地点控制器
│   └── ...                   # 其他控制器
├── models/                   # 数据库模型
├── middleware/               # 中间件
├── routes/                   # 路由
├── utils/                    # 工具函数
├── scripts/                  # 脚本文件
│   └── init.sql              # 数据库初始化脚本
├── Dockerfile                # Docker构建文件
├── docker-compose.yml        # Docker Compose配置
└── .env.example              # 环境变量模板
```

## 注意事项

1. 首次启动时，数据库会自动执行 `scripts/init.sql` 脚本初始化表结构
2. 默认管理员用户的 openid 为 `admin_openid`，需要替换为实际值
3. 图片上传功能需要配置腾讯云COS参数
4. 微信登录功能需要配置正确的 AppID 和 AppSecret

## 停止服务
```bash
docker-compose down
```

## 更新服务
```bash
docker-compose pull && docker-compose up -d
```