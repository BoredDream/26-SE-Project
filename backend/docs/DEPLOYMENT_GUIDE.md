# 校园花卉地图后端部署指南

## 1. 系统要求

| 系统/软件 | 版本要求 | 说明 |
|---------|---------|------|
| Linux | Ubuntu 20.04+ | 推荐使用LTS版本 |
| Node.js | ≥ 18.0.0 | 运行环境 |
| MySQL | ≥ 8.0 | 数据库（支持Docker部署） |
| Redis | ≥ 7.0 | 缓存 |
| Docker | ≥ 20.0.0 | 容器化部署（可选） |
| npm | ≥ 9.0.0 | 包管理工具 |

## 2. 部署方式

### 2.1 自动部署（推荐）

本项目提供了自动化部署脚本，可以一键完成所有部署步骤。

#### 步骤1：获取部署脚本

确保您已经在项目根目录下：

```bash
cd /mnt/d/软件工程/backend
```

#### 步骤2：执行部署脚本

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

#### 步骤3：配置环境变量

脚本会自动创建`.env`文件，您需要根据实际情况配置数据库和其他参数：

```bash
vi .env
```

#### 步骤4：完成部署

脚本会自动安装依赖、初始化数据库、配置系统服务并启动服务。

### 2.2 手动部署

#### 步骤1：安装依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装MySQL
apt install -y mysql-server mysql-client

# 安装Redis
apt install -y redis-server
```

#### 步骤2：配置MySQL

##### 2.2.1 传统方式部署

```bash
# 启动MySQL服务
systemctl start mysql
systemctl enable mysql

# 安全配置
mysql_secure_installation
```

创建数据库和用户：

```bash
mysql -u root -p

# 创建数据库
CREATE DATABASE campus_flower CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户
CREATE USER 'campus_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON campus_flower.* TO 'campus_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

##### 2.2.2 使用Docker部署MySQL（推荐）

如果您已安装Docker，可以使用以下命令快速部署MySQL：

```bash
# 拉取MySQL镜像
docker pull mysql:8.0

# 创建并启动MySQL容器
docker run -d --name campus-flower-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=campus_flower_root_pass \
  -e MYSQL_DATABASE=campus_flower \
  -e MYSQL_USER=campus_user \
  -e MYSQL_PASSWORD=campus_flower_pass \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 检查容器状态
docker ps
```

使用Docker容器的数据库连接信息：
- 数据库名：`campus_flower`
- 用户名：`campus_user`
- 密码：`campus_flower_pass`
- 主机：`127.0.0.1`
- 端口：`3306`

#### 步骤3：配置Redis

```bash
# 启动Redis服务
systemctl start redis-server
systemctl enable redis-server

# 可选：配置Redis密码
# vi /etc/redis/redis.conf
# 修改：requirepass your_redis_password
# 重启服务：systemctl restart redis-server
```

#### 步骤4：安装项目依赖

```bash
cd /mnt/d/软件工程/backend
npm install
```

#### 步骤5：配置环境变量

```bash
cp .env.example .env
vi .env
```

根据实际情况配置以下参数：

```env
# 服务配置
PORT=3000

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=campus_flower
DB_USER=campus_user
DB_PASSWORD=your_password

# Redis 配置
REDIS_URL=redis://127.0.0.1:6379

# 微信配置
WX_APPID=your_wechat_appid
WX_SECRET=your_wechat_secret

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

#### 步骤6：初始化数据库

##### 6.1 传统MySQL部署

```bash
# 检查init.sql文件是否存在
if [ -f "./scripts/init.sql" ]; then
    mysql -u campus_user -pyour_password campus_flower < ./scripts/init.sql
    echo "数据库初始化完成"
else
    echo "警告：scripts/init.sql文件不存在，跳过数据库初始化"
fi
```

##### 6.2 Docker MySQL部署

```bash
# 检查init.sql文件是否存在
if [ -f "./scripts/init.sql" ]; then
    docker exec -i campus-flower-mysql mysql -u campus_user -pcampus_flower_pass campus_flower < ./scripts/init.sql
    echo "数据库初始化完成"
else
    echo "警告：scripts/init.sql文件不存在，跳过数据库初始化"
fi
```

#### 步骤7：启动服务

```bash
# 直接启动（测试用）
node src/app.js

# 或者使用PM2管理进程
npm install -g pm2
pm start
```

## 3. 系统服务配置

### 3.1 配置Systemd服务

创建服务文件：

```bash
vi /etc/systemd/system/campus-flower-api.service
```

添加以下内容：

```ini
[Unit]
Description=Campus Flower Map API Service
After=network.target mysql.service redis-server.service

[Service]
Type=simple
WorkingDirectory=/mnt/d/软件工程/backend
ExecStart=/usr/bin/node src/app.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 3.2 管理服务

```bash
# 重新加载systemd
systemctl daemon-reload

# 启动服务
systemctl start campus-flower-api.service

# 停止服务
systemctl stop campus-flower-api.service

# 重启服务
systemctl restart campus-flower-api.service

# 查看服务状态
systemctl status campus-flower-api.service

# 设置开机自启
systemctl enable campus-flower-api.service

# 查看日志
journalctl -u campus-flower-api.service -f
```

## 4. 验证部署

### 4.1 健康检查

```bash
curl http://localhost:3000/v1/health
```

预期输出：

```json
{"status":"ok","message":"Campus Flower API is running","timestamp":"2026-03-15T14:00:00.000Z"}
```

### 4.2 测试登录接口

```bash
curl -X POST -H "Content-Type: application/json" -d '{"code":"test_code","userInfo":{"nickName":"测试用户","avatarUrl":"http://example.com/avatar.jpg"}}' http://localhost:3000/v1/auth/login
```

预期输出：

```json
{"code":0,"message":"登录成功","data":{"user":{...},"token":"...","stats":{...}}}
```

## 5. 常见问题

### 5.1 数据库连接失败

- 检查`.env`文件中的数据库配置是否正确
- 确保MySQL服务正在运行
- 检查数据库用户权限

### 5.2 Redis连接失败

- 检查Redis服务是否正在运行
- 确保Redis配置正确
- 检查防火墙设置

### 5.3 服务启动失败

- 查看服务日志：`journalctl -u campus-flower-api.service -f`
- 检查端口是否被占用：`lsof -i :3000`
- 确保环境变量配置正确

### 5.4 接口返回500错误

- 查看服务日志获取详细错误信息
- 检查数据库连接状态
- 确保所有依赖都已正确安装

## 6. 性能优化

### 6.1 配置Node.js进程

使用PM2管理多个Node.js进程：

```bash
npm install -g pm2
pm run start:pm2
```

### 6.2 配置Nginx反向代理

```bash
# 安装Nginx
apt install -y nginx

# 配置Nginx
vi /etc/nginx/sites-available/campus-flower-api
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/campus-flower-api /etc/nginx/sites-enabled/
systemctl restart nginx
```

### 6.3 配置SSL证书

推荐使用Let's Encrypt获取免费SSL证书：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

## 7. 监控与维护

### 7.1 查看日志

```bash
# 系统服务日志
journalctl -u campus-flower-api.service -f

# 应用日志（如果配置了）
tail -f logs/app.log
```

### 7.2 定期备份

```bash
# 备份数据库
mysqldump -u campus_user -pyour_password campus_flower > campus_flower_backup_$(date +%Y%m%d).sql

# 备份配置文件
cp .env .env_backup_$(date +%Y%m%d)
```

### 7.3 升级项目

```bash
# 停止服务
systemctl stop campus-flower-api.service

# 拉取最新代码
git pull

# 更新依赖
npm install

# 重启服务
systemctl start campus-flower-api.service
```

## 8. 联系方式

如果您在部署过程中遇到任何问题，请联系技术支持：

- 邮箱：support@campusflower.com
- 文档：https://docs.campusflower.com
- 社区：https://forum.campusflower.com

---

**版本历史：**
- v1.0 (2026-03-15)：初始版本
- v1.1 (2026-03-16)：优化部署脚本，添加SSL配置