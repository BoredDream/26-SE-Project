# 花境 (Flower Garden) 后端

## 项目简介

花境是一个花卉打卡系统后端服务，基于 Flask 框架开发，提供用户管理、花卉信息管理、地点管理、打卡记录、评论互动和成就系统等功能。

## 技术栈

- Python 3.12+
- Flask 3.1.3
- Flask-SQLAlchemy 3.1.1
- Flask-Migrate 4.1.0
- Flask-RESTful 0.3.10
- Flask-CORS 6.0.2
- Flask-JWT-Extended
- MySQL 8.0+ (生产环境)
- PyMySQL

## 项目结构

```
backend/
├── app.py              # 主应用文件，路由注册
├── config.py           # 配置类（读取 .env 环境变量）
├── extensions.py       # Flask 扩展初始化（db, api, jwt）
├── models.py           # 数据库模型
├── routes.py           # API 路由（Flask-RESTful Resource）
├── requirements.txt    # Python 依赖
├── .env                # 环境变量配置（不提交到 Git）
├── .env.example        # 环境变量示例
├── migrations/         # 数据库迁移文件（Alembic）
├── uploads/            # 用户上传文件目录
└── flower_db.sqlite    # SQLite 数据库文件（开发/测试用）
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd backend
```

### 2. 创建虚拟环境并安装依赖

```bash
# 安装 python3-venv（如果尚未安装）
sudo apt-get install -y python3.12-venv

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 配置环境变量

复制环境变量示例文件并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息：

```ini
# 数据库连接（MySQL 生产环境）
DATABASE_URL=mysql+pymysql://username:password@host:port/database?charset=utf8mb4

# 或使用 SQLite（本地开发）
# DATABASE_URL=sqlite:///flower_db.sqlite

# 应用密钥
SECRET_KEY=your_secret_key_here

# JWT 密钥（可选，默认使用 SECRET_KEY）
# JWT_SECRET_KEY=your_jwt_secret_key_here
```

### 4. 初始化数据库

```bash
# 初始化数据库迁移仓库（首次）
flask db init

# 生成迁移脚本
flask db migrate -m "Initial migration"

# 执行数据库迁移
flask db upgrade
```

### 5. 启动服务

```bash
# 开发模式（默认绑定 127.0.0.1:5000）
flask run --host=0.0.0.0 --port=5000
```

服务将运行在 http://localhost:5000

### 6. 使用重启脚本（推荐）

项目根目录提供了一键重启脚本：

```bash
# 重启所有服务（后端 + 前端 Vue3 + 前端 uni-app）
cd .. && ./restart.sh all

# 仅重启后端
./restart.sh backend
```

## API 文档

所有 API 端点统一使用 `/v1/` 前缀，响应格式统一为：

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

### 一、认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/auth/register` | 注册用户（支持表单含头像上传） |
| POST | `/v1/auth/login` | 登录（支持账号密码 / 微信 code 两种模式） |

### 二、用户相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/users/me` | 获取当前用户信息（含成就、称号等） |
| PUT | `/v1/users/me` | 修改当前用户信息（昵称、头像等） |
| GET | `/v1/users/me/achievements` | 获取当前用户已获得的成就 |
| GET | `/v1/users/me/titles` | 获取当前用户已获得的称号 |

### 三、花卉相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/flowers` | 获取花卉列表（支持按状态、种类筛选） |
| GET | `/v1/flowers/<id>` | 获取单个花卉详细信息（含地点列表） |
| GET | `/v1/flowers/<id>/bloom-status` | 获取花卉当前盛开状态（实时/平均） |
| GET | `/v1/flowers/<id>/checkins` | 获取某花卉下的所有打卡帖子 |

### 四、地点相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/locations` | 获取地点列表（支持按花卉种类筛选） |
| GET | `/v1/locations/<id>` | 获取地点详细信息（含该地花卉信息） |
| GET | `/v1/locations/<id>/checkins` | 获取某地点下的所有打卡帖子 |

### 五、地图相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/map/flowers` | 地图模式：返回所有花卉地点及状态（用于地图标注） |
| GET | `/v1/map/filter` | 地图筛选：按花卉种类返回地点坐标 |

### 六、打卡相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/checkins` | 提交打卡（图片、文字、状态、flower_place_id、时间） |
| GET | `/v1/checkins` | 获取打卡列表（支持按时间、状态、位置筛选） |
| GET | `/v1/checkins/<id>` | 获取单个打卡详情（含用户信息、花卉、地点） |
| POST | `/v1/checkins/<id>/like` | 点赞打卡 |
| POST | `/v1/checkins/<id>/dislike` | 取消点赞 |

### 七、评论相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/checkins/<checkin_id>/comments` | 获取打卡评论列表 |
| POST | `/v1/checkins/<checkin_id>/comments` | 发表评论 |
| DELETE | `/v1/checkins/<checkin_id>/comments/<comment_id>` | 删除评论 |

### 八、成就相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/achievements` | 获取所有成就列表 |

### 九、其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/health` | 健康检查 |
| POST | `/v1/upload` | 文件上传 |
| GET | `/uploads/<filename>` | 获取上传的文件 |

## 数据库设计

### 1. users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 用户唯一标识 |
| username | String(50) | 用户名（唯一） |
| password_hash | String(128) | 密码哈希 |
| nickname | String(50) | 用户昵称 |
| avatar_url | String(500) | 头像 URL |
| role | Enum('user','admin') | 角色 |
| created_at | DateTime | 注册时间 |
| updated_at | DateTime | 最后更新时间 |

### 2. flowers（花卉表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 花卉 ID |
| species | String(100) | 花卉品种名称 |
| scientific_name | String(200) | 学名 |
| family | String(100) | 所属科 |
| genus | String(100) | 所属属 |
| bloom_status | Enum | 花期状态 |
| historical_bloom_start | String(10) | 历史平均始花期（MM-DD） |
| historical_bloom_end | String(10) | 历史平均末花期（MM-DD） |
| cover_image | String(500) | 封面图 URL |
| description | Text | 花卉详细描述 |

### 3. places（地点表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 地点 ID |
| name | String(100) | 地点名称 |
| description | Text | 地点描述 |
| latitude | Float | 纬度 |
| longitude | Float | 经度 |

### 4. flower_places（花卉-地点关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 关联 ID |
| flower_id | Integer (FK) | 关联花卉表 ID |
| place_id | Integer (FK) | 关联地点表 ID |

### 5. checkins（打卡记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 打卡 ID |
| user_id | Integer (FK) | 打卡用户 ID |
| flower_place_id | Integer (FK) | 打卡的具体花卉地点 ID |
| bloom_report | Enum | 用户目击状态 |
| content | Text | 打卡文字内容 |
| images | Text (JSON) | 图片 URL 数组 |
| likes_count | Integer | 点赞数 |
| created_at | DateTime | 打卡时间 |

### 6. checkin_likes（点赞表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 点赞 ID |
| user_id | Integer (FK) | 用户 ID |
| checkin_id | Integer (FK) | 打卡 ID |
| created_at | DateTime | 点赞时间 |

### 7. checkin_comments（评论表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 评论 ID |
| checkin_id | Integer (FK) | 打卡 ID |
| user_id | Integer (FK) | 评论用户 ID |
| content | Text | 评论内容 |
| created_at | DateTime | 评论时间 |

### 8. achievements（成就表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 成就 ID |
| name | String(100) | 成就名称 |
| description | Text | 成就描述 |
| icon | String(500) | 图标 URL |
| condition_type | String(50) | 达成条件类型 |
| condition_value | Integer | 达成条件值 |

### 9. achievements_users（成就-用户关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 关联 ID |
| achievement_id | Integer (FK) | 关联成就表 ID |
| user_id | Integer (FK) | 关联用户表 ID |

### 10. titles（称号表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 称号 ID |
| name | String(100) | 称号名称 |
| description | Text | 称号描述 |
| icon | String(500) | 图标 URL |

### 11. titles_users（称号-用户关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 关联 ID |
| title_id | Integer (FK) | 关联称号表 ID |
| user_id | Integer (FK) | 关联用户表 ID |

## 测试示例

### 注册用户

```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","nickname":"测试用户"}'
```

### 用户登录（账号密码模式）

```bash
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mode":"password","username":"testuser","password":"123456"}'
```

### 用户登录（微信 code 模式）

```bash
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mode":"wechat","code":"<wechat_code>"}'
```

### 获取花卉列表

```bash
curl http://localhost:5000/v1/flowers
```

### 健康检查

```bash
curl http://localhost:5000/v1/health
```

## 注意事项

1. 本项目使用 MySQL 作为生产环境数据库，本地开发可使用 SQLite
2. 所有 API 端点统一使用 `/v1/` 前缀，响应格式统一为 `{code, message, data}`
3. 需要认证的接口需在请求头携带 `Authorization: Bearer <token>`
4. 所有 API 端点支持跨域请求（CORS）
5. 服务默认运行在 5000 端口，可根据需要修改
6. 开发环境下开启了 debug 模式，生产环境应关闭

## 许可证

MIT
