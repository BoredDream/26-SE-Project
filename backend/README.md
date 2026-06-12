# 花卉打卡系统后端

## 项目简介

这是一个基于Flask框架开发的花卉打卡系统后端服务，提供用户管理、花卉信息管理、地点管理、打卡记录和成就系统等功能。

## 技术栈

- Python 3.12+
- Flask 3.1.3
- Flask-SQLAlchemy 3.1.1
- Flask-Migrate 4.1.0
- Flask-RESTful 0.3.10
- Flask-CORS 6.0.2
- SQLite (开发环境)

## 项目结构

```
├── app.py              # 主应用文件
├── config.py           # 配置文件
├── models.py           # 数据库模型
├── routes.py           # API路由
├── requirements.txt    # 依赖文件
├── .env                # 环境变量
├── migrations/         # 数据库迁移文件
└── flower.db           # SQLite数据库文件
```

## 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd back
   ```

2. **安装依赖**

   ```bash
   # 安装python3-venv (如果尚未安装)
   sudo apt-get install -y python3.12-venv
   
   # 创建虚拟环境
   python3 -m venv venv
   
   # 激活虚拟环境
   source venv/bin/activate
   
   # 安装依赖
   pip install -r requirements.txt
   ```

3. **初始化数据库**

   ```bash
   # 初始化数据库迁移
   flask db init
   
   # 创建迁移文件
   flask db migrate -m "Initial migration"
   
   # 执行迁移
   flask db upgrade
   ```

4. **启动服务**

   ```bash
   flask run --host=0.0.0.0 --port=5000
   ```

   服务将运行在 http://localhost:5000

## API文档

### 一、用户相关API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user/register` | 注册用户 |
| POST | `/api/user/login` | 用户登录（微信OpenID） |
| GET | `/api/user/info` | 获取当前用户信息（含徽章、称号等） |
| PUT | `/api/user/info` | 修改用户信息（昵称、头像等） |

### 二、花卉相关API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/flowers` | 获取花卉列表（支持按状态、种类筛选） |
| GET | `/api/flowers/:id` | 获取单个花卉详细信息（含地点列表） |
| GET | `/api/flowers/:id/bloom-status` | 获取花卉当前盛开状态（实时/平均） |

### 三、地点与地图相关API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/places` | 获取地点列表（支持按花卉种类筛选） |
| GET | `/api/places/:id` | 获取地点详细信息（含该地花卉信息） |
| GET | `/api/map/flowers` | 地图模式：返回所有花卉地点及状态（用于地图标注） |
| GET | `/api/map/filter` | 地图筛选：按花卉种类返回地点坐标 |

### 四、打卡/帖子相关API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/checkins` | 打卡提交（图片、文字、状态、flower_place_id、时间） |
| GET | `/api/checkins` | 获取打卡列表（支持按时间、状态、位置筛选） |
| GET | `/api/checkins/:id` | 获取单个打卡详情（含用户信息、花卉、地点） |
| PUT | `/api/checkins/:id/like` | 点赞/取消点赞 |
| GET | `/api/flowers/:id/checkins` | 获取某花卉下的所有打卡帖子（按时间排序） |
| GET | `/api/places/:id/checkins` | 获取某地点下的所有打卡帖子 |

### 五、成就与称号相关API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/achievements` | 获取所有成就列表 |
| GET | `/api/user/achievements` | 获取当前用户已获得的成就 |
| GET | `/api/user/titles` | 获取当前用户已获得的称号 |

## 数据库设计

### 1. users (用户表)
- id: 用户唯一标识
- openid: 微信OpenID，用于登录绑定
- nickname: 用户昵称
- avatar_url: 头像URL
- role: 角色（user/ admin）
- created_at: 注册时间
- updated_at: 最后更新时间

### 2. flowers (花卉表)
- id: 花卉ID
- species: 花卉品种名称
- scientific_name: 学名
- family: 所属科
- genus: 所属属
- bloom_status: 花期状态
- historical_bloom_start: 历史平均始花期
- historical_bloom_end: 历史平均末花期
- cover_image: 封面图URL
- description: 花卉详细描述

### 3. places (地点表)
- id: 地点ID
- name: 地点名称
- description: 地点描述
- latitude: 纬度
- longitude: 经度

### 4. flower_places (花卉-地点关联表)
- id: 关联ID
- flower_id: 关联花卉表ID
- place_id: 关联地点表ID

### 5. checkins (打卡记录表)
- id: 打卡ID
- user_id: 打卡用户ID
- flower_place_id: 打卡的具体花卉地点ID
- bloom_report: 用户目击状态
- content: 打卡文字内容
- images: 图片对象数组
- likes_count: 点赞数
- created_at: 打卡时间

### 6. achievements (成就表)
- id: 成就ID
- description: 成就描述

### 7. achievements_users (成就-用户关联表)
- id: 关联ID
- achievements_id: 关联成就表ID
- user_id: 关联用户表ID

### 8. titles (称号表)
- id: 称号ID
- description: 称号描述

### 9. titles_users (称号-用户关联表)
- id: 关联ID
- titles_id: 关联称号表ID
- user_id: 关联用户表ID

## 测试示例

### 注册用户

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_openid","nickname":"测试用户"}'
```

### 用户登录

```bash
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_openid"}'
```

## 注意事项

1. 本项目使用SQLite作为开发环境数据库，生产环境建议使用MySQL或PostgreSQL
2. 所有API端点都支持跨域请求
3. 服务默认运行在5000端口，可根据需要修改
4. 开发环境下开启了debug模式，生产环境应关闭

## 许可证

MIT
