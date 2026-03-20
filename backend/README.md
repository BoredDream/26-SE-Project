# 校园花卉地图小程序 - 后端服务

## 项目简介
校园花卉地图小程序后端服务，提供花卉地点管理、用户打卡、成就系统、排行榜等功能。

## 技术栈
- **后端框架**：Java Spring Boot 2.7.18
- **数据库**：MySQL
- **缓存**：Redis
- **部署方式**：Docker + Docker Compose

## 部署准备
1. 安装 Docker 和 Docker Compose
2. 克隆项目代码到本地

## 本地开发

### 开发环境要求
- JDK 8 或以上版本
- Maven 3.6 或以上版本
- MySQL 8.0 或以上版本
- Redis 7.0 或以上版本

### 开发环境搭建

#### 1. 配置本地数据库和Redis
- 启动本地MySQL服务，创建数据库：`campus_flower`
- 启动本地Redis服务

#### 2. 配置应用属性
修改 `src/main/resources/application.properties` 文件，配置本地开发环境：
```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/campus_flower?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password

# Redis配置
spring.redis.host=localhost
spring.redis.port=6379

# 其他配置（微信小程序、COS等）
```

#### 3. 初始化数据库
执行 `scripts/init.sql` 脚本初始化数据库表结构。

#### 4. 启动项目
使用Maven命令启动项目：
```bash
mvn spring-boot:run
```
或使用IDE（如IntelliJ IDEA、Eclipse）直接运行 `BackendApplication.java` 类。

#### 5. 验证开发环境
服务启动后，可以通过以下方式验证：
- 访问 `http://localhost:6000/v1/locations` 测试API接口
- 检查数据库连接和Redis连接是否正常

## 部署步骤

### 1. 配置环境变量
根据需要修改 `docker-compose.yml` 文件中的环境变量配置，主要包括：
- 数据库连接信息
- 微信小程序配置
- 腾讯云COS配置
- JWT密钥

### 2. 启动服务
使用 Docker Compose 一键构建并启动所有服务：
```bash
docker-compose up -d --build
```

### 3. 验证服务
服务启动后，可以通过以下方式验证：
- 后端服务：`http://localhost:6000/v1/locations`（获取地点列表，应返回空数组或地点列表）
- 数据库：`mysql://localhost:3340/campus_flower`
- Redis：`redis://localhost:6490`

## 环境变量说明

### 服务配置
- `server.port`：后端服务在容器内的端口（默认：8080，外部访问端口映射为6000）

### 数据库配置
- `spring.datasource.url`：数据库连接URL
- `spring.datasource.username`：数据库用户名
- `spring.datasource.password`：数据库密码

### Redis配置
- `spring.redis.host`：Redis主机
- `spring.redis.port`：Redis端口（默认：6379）

### 微信小程序配置
- `wx.appid`：微信小程序AppID
- `wx.secret`：微信小程序AppSecret

### 腾讯云COS配置
- `cos.secret-id`：腾讯云COS SecretId
- `cos.secret-key`：腾讯云COS SecretKey
- `cos.bucket`：COS存储桶名称
- `cos.region`：COS存储桶地区

### JWT配置
- `jwt.secret`：JWT签名密钥
- `jwt.expiration`：JWT过期时间（毫秒，默认：86400000）

## API接口

### 基础信息
- **Base URL**：`http://localhost:6000/v1`
- **请求格式**：`Content-Type: application/json`
- **鉴权**：JWT Bearer Token，登录后获取

### 主要接口

#### 用户模块
- `POST /auth/login` - 微信登录
- `GET /users/me` - 获取当前用户信息
- `PATCH /users/me` - 更新用户信息

#### 地点模块
- `GET /locations` - 获取地点列表
- `GET /locations/:id` - 获取地点详情
- `PATCH /locations/{id}/status` - 更新花期状态（仅管理员）
- `POST /locations` - 创建地点（仅管理员）

#### 打卡模块
- `POST /checkins` - 发布打卡
- `GET /locations/:id/checkins` - 获取地点打卡列表
- `POST /checkins/{id}/like` - 点赞打卡
- `POST /checkins/{id}/report` - 举报打卡
- `GET /users/me/checkins` - 获取我的打卡记录

#### 订阅模块
- `POST /subscriptions` - 订阅地点
- `DELETE /subscriptions/{locationId}` - 取消订阅
- `GET /subscriptions` - 获取我的订阅列表

#### 成就模块
- `GET /users/me/achievements` - 获取我的成就
- `GET /users/me/titles` - 获取我的称号
- `GET /users/{id}/achievements` - 查看他人成就

#### 上传模块
- `POST /upload/image` - 上传图片

#### 排行榜模块
- `GET /leaderboard/checkins` - 打卡王榜
- `GET /leaderboard/likes` - 点赞榜
- `GET /leaderboard/heatmap` - 热力图数据

## 项目结构
```
backend/
├── src/main/java/com/example/backend/  # 源代码目录
│   ├── BackendApplication.java         # 应用入口
│   ├── model/                          # 数据库模型（JPA实体）
│   ├── repository/                     # 数据访问层（Spring Data JPA）
│   ├── service/                        # 业务逻辑层
│   ├── controller/                     # REST控制器
│   ├── config/                         # 配置类
│   ├── security/                       # 安全和认证组件
│   └── utils/                          # 工具类
├── src/main/resources/                 # 资源文件
│   └── application.properties          # 应用配置文件
├── pom.xml                             # Maven依赖配置
├── scripts/                            # 脚本文件
│   └── init.sql                        # 数据库初始化脚本
├── Dockerfile                          # Docker构建文件
├── docker-compose.yml                  # Docker Compose配置
└── README.md                           # 项目文档
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