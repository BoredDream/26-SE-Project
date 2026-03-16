# 校园花卉地图小程序后端 API

## 项目介绍
校园花卉地图小程序的后端 API 服务，基于 Node.js + Express 开发，提供花卉地点管理、用户打卡、订阅通知、成就系统等功能。

## 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 18.x | 运行环境 |
| Express | ^4.18 | Web 框架 |
| MySQL | ≥ 8.0 | 数据库（支持Docker部署） |
| Redis | ≥ 7.0 | 缓存 |
| JWT | ^9.0 | 认证 |
| node-cron | ^3.0 | 定时任务 |
| multer | ^1.4 | 文件上传 |
| sharp | ^0.33 | 图片处理 |
| express-rate-limit | ^7.5 | 接口限流 |
| geolib | ^3.3 | GPS距离计算 |

## 项目结构

```
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middlewares/    # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── services/       # 业务逻辑
│   ├── utils/          # 工具函数
│   ├── cron/           # 定时任务
│   └── app.js          # 应用入口
├── scripts/            # 脚本文件
├── tests/              # 测试文件
├── .env.example        # 环境变量模板
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 环境变量配置

1. 复制环境变量模板文件
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置相关参数

## 安装依赖

```bash
npm install
```

## 数据库初始化

### 传统MySQL部署

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE campus_flower CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 创建用户
mysql -u root -p -e "CREATE USER 'campus_user'@'localhost' IDENTIFIED BY 'your_password'; GRANT ALL PRIVILEGES ON campus_flower.* TO 'campus_user'@'localhost'; FLUSH PRIVILEGES;"

# 导入初始化脚本
mysql -u campus_user -pyour_password campus_flower < scripts/init.sql
```

### Docker MySQL部署

```bash
# 启动MySQL容器

docker run -d --name campus-flower-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=campus_flower_root_pass \
  -e MYSQL_DATABASE=campus_flower \
  -e MYSQL_USER=campus_user \
  -e MYSQL_PASSWORD=campus_flower_pass \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 导入初始化脚本
docker exec -i campus-flower-mysql mysql -u campus_user -pcampus_flower_pass campus_flower < scripts/init.sql
```

## 启动服务

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

## API 文档

### 健康检查
- `GET /v1/health` - 检查服务状态

### 认证相关
- `POST /v1/auth/login` - 微信登录
- `GET /v1/auth/me` - 获取当前用户信息
- `PUT /v1/auth/me` - 更新用户信息

### 地点相关
- `GET /v1/locations` - 获取地点列表
- `GET /v1/locations/:id` - 获取地点详情
- `GET /v1/locations/nearby` - 获取附近地点
- `POST /v1/locations` - 创建地点（管理员）
- `PUT /v1/locations/:id` - 更新地点（管理员）
- `DELETE /v1/locations/:id` - 删除地点（管理员）

### 打卡相关
- `POST /v1/checkins` - 创建打卡记录
- `GET /v1/checkins/:id` - 获取打卡详情
- `GET /v1/checkins/location/:locationId` - 获取地点的打卡记录
- `GET /v1/checkins/user/me` - 获取用户的打卡记录

### 订阅相关
- `POST /v1/subscriptions` - 订阅地点
- `DELETE /v1/subscriptions/:locationId` - 取消订阅
- `GET /v1/subscriptions/:locationId/check` - 检查是否已订阅
- `GET /v1/subscriptions/user/me` - 获取用户的订阅列表

### 点赞相关
- `POST /v1/likes/:checkinId` - 点赞打卡记录
- `DELETE /v1/likes/:checkinId` - 取消点赞
- `GET /v1/likes/:checkinId/check` - 检查是否已点赞
- `GET /v1/likes/:checkinId/list` - 获取打卡记录的点赞列表
- `GET /v1/likes/user/me` - 获取用户的点赞记录

### 成就相关
- `GET /v1/achievements/user/me` - 获取用户的成就列表
- `GET /v1/achievements/user/me/stats` - 获取用户的成就统计
- `GET /v1/achievements/user/me/location/:locationId` - 获取用户在特定地点的成就

### 上传相关
- `POST /v1/upload/image` - 图片上传（三级分辨率处理）
- `POST /v1/upload/images` - 批量图片上传

### 管理员相关
- `GET /v1/admin/checkins/pending` - 待复核打卡列表
- `PATCH /v1/admin/checkins/:id/audit` - 审核打卡记录
- `GET /v1/admin/reports/pending` - 待复核举报列表
- `PATCH /v1/admin/reports/:id/handle` - 处理举报
- `PATCH /v1/admin/locations/:id/status` - 更新花期状态

### 举报相关
- `POST /v1/checkins/:id/report` - 举报打卡记录

### 排行榜相关
- `GET /v1/leaderboard/checkins` - 打卡王榜
- `GET /v1/leaderboard/likes` - 点赞榜
- `GET /v1/leaderboard/heatmap` - 地图热力数据

### 成就扩展
- `GET /v1/achievements/users/:id/achievements` - 查看他人花圃

## 核心业务特性

### GPS校验机制
- 使用Haversine公式计算用户与地点的距离
- 验证用户是否在地点150米半径内
- 影响成就等级（金/银成就）

### 花期众包投票
- 24小时内60%用户投票相同则自动更新地点花期状态
- 支持的状态：budding（含苞待放）、blooming（盛开）、withering（凋谢）

### 图片分级存储
- 使用sharp处理三级分辨率
  - original: 原始分辨率，质量90%
  - standard: 标准分辨率（1024x1024），质量80%
  - thumb: 缩略图（300x300），质量70%

### 成就与称号系统
- **成就系统**：根据打卡地点数量和GPS验证状态授予成就
- **称号系统**：
  - 首次打卡 - 花卉初探者
  - 打卡10次 - 花卉观察员
  - 四季守望者 - 同一地点春夏秋冬各≥1次打卡
  - 月度打卡王 - 每月打卡次数最多
  - 其他称号 - 根据用户行为自动解锁

### 图片上传限制
- 文件大小限制：10MB
- 格式限制：JPEG/PNG/GIF
- 频率限制：每小时20张

## 定时任务

- `5 0 1 * *` - 评选月度打卡王
- `0 8 * * *` - 花期预测提醒
- `0 2 * * *` - 清理审核积压
- `0 * * * *` - 更新热力数据
- `0 0 1 1 *` - 清理过期通知标记

## 安全与性能

### 接口限流
- 普通接口：15分钟内100个请求
- 上传接口：1小时内20个请求
- 健康检查和排行榜接口不受限制

### 错误处理
- 数据库连接失败时服务继续运行
- Redis连接失败时服务降级运行
- 详细的错误日志记录

## 测试

```bash
npm test
```

## 部署

### 微信云开发

推荐使用微信云开发部署，降低运维成本。

### 自建服务器

1. 安装 Node.js、MySQL、Redis
2. 配置环境变量
3. 启动服务

### Docker部署

1. **安装Docker和Docker Compose**
   - 确保系统已安装Docker和Docker Compose
   - 参考官方文档：[Docker安装](https://docs.docker.com/get-docker/)、[Docker Compose安装](https://docs.docker.com/compose/install/)

2. **配置环境变量**
   ```bash
   # 复制Docker环境变量模板
   cp .env.docker .env
   # 根据实际情况修改.env文件
   ```

3. **启动服务**
   ```bash
   # 构建并启动所有服务
   docker-compose up -d
   
   # 查看服务状态
   docker-compose ps
   
   # 查看日志
   docker-compose logs -f
   ```

4. **访问服务**
   - 后端服务：http://localhost:3000
   - MySQL数据库：localhost:3306
   - Redis：localhost:6379

5. **停止服务**
   ```bash
   # 停止所有服务
   docker-compose down
   
   # 停止并删除数据卷
   docker-compose down -v
   ```

## 许可证

ISC
