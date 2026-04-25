# 后端修复与 API 对齐实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Flask 后端使其可启动，并将所有接口路径从 `/api/...` 对齐到 `/v1/...`，登录/注册支持演示模式，新增 `/v1/upload` 文件上传。

**Architecture:** 补全缺失的 `extensions.py` 解决循环导入；修改 `models.py` 补充注册/登录所需的 `username`/`password_hash` 字段；重写 `routes.py` 统一响应格式并支持 `mode: 'demo'` 登录分流；`app.py` 全面更新路由前缀。

**Tech Stack:** Flask, Flask-SQLAlchemy, Flask-RESTful, Flask-JWT-Extended, Flask-Migrate, Flask-CORS, SQLite

---

## 文件结构

| 文件 | 动作 | 说明 |
|------|------|------|
| `backend/extensions.py` | 创建 | 集中初始化 db, api, jwt，打破循环导入 |
| `backend/models.py` | 修改 | 改为 `from extensions import db`；User 模型加 `username`, `password_hash` 及密码方法 |
| `backend/config.py` | 修改 | 补 `JWT_SECRET_KEY` 开发默认值 |
| `backend/requirements.txt` | 修改 | 补 `flask-jwt-extended`, `Werkzeug` |
| `backend/routes.py` | 修改 | 资源类重命名/调整；响应格式统一；登录 mode 分流；Checkin 字段双写；新增 UploadResource |
| `backend/app.py` | 修改 | 路由前缀 `/api/...` → `/v1/...`；新增 `/v1/upload`、`/v1/auth/register`、`/v1/auth/login`、`/v1/health` |
| `backend/migrations/versions/...` | 创建（通过命令） | User 表结构变更迁移 |

---

## 前置检查

运行以下命令确认当前状态：

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/backend
python -c "from app import app"
```

预期输出：`ModuleNotFoundError: No module named 'extensions'`，证明循环导入/缺失扩展问题存在。

---

### Task 1: 创建 extensions.py 打破循环导入

**Files:**
- Create: `backend/extensions.py`

- [ ] **Step 1: 写入 extensions.py**

```python
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
api = Api()
jwt = JWTManager()
```

- [ ] **Step 2: 确认文件写入成功**

```bash
cat /home/yaoyao/vibe/se/26-SE-Project/backend/extensions.py
```

预期：显示上述三行初始化代码。

- [ ] **Step 3: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/extensions.py
git commit -m "feat(backend): add extensions.py to break circular imports"
```

---

### Task 2: 修复 models.py 循环导入并补充用户字段

**Files:**
- Modify: `backend/models.py`

当前 `models.py` 第 1 行为 `from app import db`，这会在 `app.py` 导入 `models` 时形成循环导入。同时后端注册/登录逻辑需要 `username` 和 `password_hash` 字段，但当前 `User` 模型缺失。

- [ ] **Step 1: 修改导入语句与 User 模型**

将 `backend/models.py` 完整替换为以下内容：

```python
from extensions import db
from datetime import datetime
import enum
from werkzeug.security import generate_password_hash, check_password_hash

class UserRole(enum.Enum):
    USER = 'user'
    ADMIN = 'admin'

class BloomStatus(enum.Enum):
    DORMANT = 'dormant'
    BUDDING = 'budding'
    BLOOMING = 'blooming'
    WITHERING = 'withering'

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    openid = db.Column(db.String(64), unique=True, nullable=False)
    username = db.Column(db.String(64), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)
    nickname = db.Column(db.String(50), nullable=False)
    avatar_url = db.Column(db.String(500))
    role = db.Column(db.Enum(UserRole), default=UserRole.USER)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checkins = db.relationship('Checkin', backref='user', lazy=True)
    achievements = db.relationship('Achievement', secondary='achievements_users', backref='users')
    titles = db.relationship('Title', secondary='titles_users', backref='users')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

class Flower(db.Model):
    __tablename__ = 'flowers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    species = db.Column(db.String(100), nullable=False)
    scientific_name = db.Column(db.String(200))
    family = db.Column(db.String(100))
    genus = db.Column(db.String(100))
    bloom_status = db.Column(db.Enum(BloomStatus))
    historical_bloom_start = db.Column(db.String(20))
    historical_bloom_end = db.Column(db.String(20))
    cover_image = db.Column(db.String(500))
    description = db.Column(db.Text)
    places = db.relationship('Place', secondary='flower_places', backref='flowers')

class Place(db.Model):
    __tablename__ = 'places'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    latitude = db.Column(db.DECIMAL(10, 7), nullable=False)
    longitude = db.Column(db.DECIMAL(10, 7), nullable=False)

class FlowerPlace(db.Model):
    __tablename__ = 'flower_places'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    flower_id = db.Column(db.Integer, db.ForeignKey('flowers.id'), nullable=False)
    place_id = db.Column(db.Integer, db.ForeignKey('places.id'), nullable=False)
    checkins = db.relationship('Checkin', backref='flower_place', lazy=True)

class Checkin(db.Model):
    __tablename__ = 'checkins'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    flower_place_id = db.Column(db.Integer, db.ForeignKey('flower_places.id'), nullable=False)
    bloom_report = db.Column(db.Enum(BloomStatus), nullable=False)
    content = db.Column(db.Text)
    images = db.Column(db.JSON)
    likes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    description = db.Column(db.Text, nullable=False)

class Title(db.Model):
    __tablename__ = 'titles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    description = db.Column(db.Text, nullable=False)

achievements_users = db.Table('achievements_users',
    db.Column('id', db.Integer, primary_key=True, autoincrement=True),
    db.Column('achievements_id', db.Integer, db.ForeignKey('achievements.id'), nullable=False),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=False)
)

titles_users = db.Table('titles_users',
    db.Column('id', db.Integer, primary_key=True, autoincrement=True),
    db.Column('titles_id', db.Integer, db.ForeignKey('titles.id'), nullable=False),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=False)
)
```

变更点：
1. `from app import db` → `from extensions import db`
2. `User` 新增 `username` (unique, nullable)、`password_hash` (nullable)
3. `User` 新增 `set_password` / `check_password` 方法

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/models.py
git commit -m "feat(backend): fix circular import and add username/password to User model"
```

---

### Task 3: 更新 config.py 补全 JWT 与 CORS 配置

**Files:**
- Modify: `backend/config.py`

- [ ] **Step 1: 替换 config.py 内容**

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///flower.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key_change_me')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret_key_change_me')
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/config.py
git commit -m "feat(backend): add JWT_SECRET_KEY default to config"
```

---

### Task 4: 更新 requirements.txt

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: 替换 requirements.txt 内容**

```
Flask
Flask-SQLAlchemy
Flask-Migrate
Flask-RESTful
Flask-CORS
Flask-JWT-Extended
Werkzeug
PyMySQL
python-dotenv
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/requirements.txt
git commit -m "feat(backend): add flask-jwt-extended and Werkzeug to requirements"
```

---

### Task 5: 重写 routes.py — 响应标准化、登录分流、字段对齐

**Files:**
- Modify: `backend/routes.py`

这是本计划最大的改动。目标：
1. 所有响应统一为 `{ code, message, data }` 格式（列表直接放 data，不嵌套额外包装）
2. `UserRegister` 和 `UserLogin` 支持标准化响应
3. `UserLogin` 新增 `mode` 分流：`demo` 返回固定 demo 用户 JWT；`wx-code` 返回 501；默认走账号密码
4. `CheckinList` POST 改为接收 JSON（`location_id` 映射到 `flower_place_id`），`user_id` 从 JWT 取
5. `CheckinList` GET 响应中双写 `location_id`（取 `flower_place.place_id`）
6. `CheckinDetail` 响应中双写 `location_id`
7. 新增 `UploadResource` 处理单文件上传，返回 `{ url }`
8. `MapFlowers` 响应中保留 `flower_place_id`，同时新增 `location_id`（即 `place_id`）

- [ ] **Step 1: 完整替换 routes.py**

```python
import os
from extensions import api, db, jwt
from flask_restful import Resource, reqparse
from models import User, Flower, Place, FlowerPlace, Checkin, Achievement, Title, BloomStatus
from flask import request, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime

# 通用响应包装
def success(data=None, message='ok', code=200):
    return {'code': code, 'message': message, 'data': data}, code

def error(message, code=400):
    return {'code': code, 'message': message, 'data': None}, code

# 用户相关API
class AuthRegister(Resource):
    def post(self):
        # 检查是否是文件上传请求
        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            avatar_url = None
            if avatar_file and avatar_file.filename:
                filename = secure_filename(avatar_file.filename)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                avatar_file.save(file_path)
                avatar_url = url_for('uploads', filename=filename, _external=True)
            username = request.form.get('username')
            password = request.form.get('password')
            nickname = request.form.get('nickname')
            if not username or not password or not nickname:
                return error('Missing required parameters', 400)
        else:
            parser = reqparse.RequestParser()
            parser.add_argument('username', required=True)
            parser.add_argument('password', required=True)
            parser.add_argument('nickname', required=True)
            parser.add_argument('avatar_url')
            args = parser.parse_args()
            username = args['username']
            password = args['password']
            nickname = args['nickname']
            avatar_url = args.get('avatar_url')

        if User.query.filter_by(username=username).first():
            return error('User already exists', 400)

        user = User(
            openid='manual_' + username,
            username=username,
            nickname=nickname,
            avatar_url=avatar_url
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return success({
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'nickname': user.nickname,
                'avatar_url': user.avatar_url,
                'role': user.role.value,
                'level': 1,
                'exp': 0,
                'total_checkins': 0,
            }
        }, 'User created successfully', 201)

class AuthLogin(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('mode', required=True)
        parser.add_argument('code')
        parser.add_argument('username')
        parser.add_argument('password')
        args = parser.parse_args()
        mode = args['mode']

        if mode == 'demo':
            # 演示模式：查找或创建 demo 用户
            demo_user = User.query.filter_by(username='demo_user').first()
            if not demo_user:
                demo_user = User(
                    openid='demo_openid',
                    username='demo_user',
                    nickname='花园探索者',
                    avatar_url=''
                )
                demo_user.set_password('demo')
                db.session.add(demo_user)
                db.session.commit()
            access_token = create_access_token(identity=str(demo_user.id))
            return success({
                'token': access_token,
                'user': {
                    'id': demo_user.id,
                    'username': demo_user.username,
                    'nickname': demo_user.nickname,
                    'avatar_url': demo_user.avatar_url,
                    'role': demo_user.role.value,
                    'level': 8,
                    'exp': 1250,
                    'total_checkins': 47,
                }
            })

        if mode == 'wx-code':
            return error('WeChat login not implemented', 501)

        # 默认账号密码登录
        username = args.get('username')
        password = args.get('password')
        if not username or not password:
            return error('Username and password required', 400)

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return error('Invalid username or password', 401)

        access_token = create_access_token(identity=str(user.id))
        return success({
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'nickname': user.nickname,
                'avatar_url': user.avatar_url,
                'role': user.role.value,
                'level': 1,
                'exp': 0,
                'total_checkins': len(user.checkins),
            }
        })

class UserMe(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return error('User not found', 404)
        return success({
            'id': user.id,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url,
            'role': user.role.value,
            'level': 1,
            'exp': 0,
            'total_checkins': len(user.checkins),
            'achievements': [a.description for a in user.achievements],
            'titles': [t.description for t in user.titles]
        })

    @jwt_required()
    def put(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return error('User not found', 404)
        parser = reqparse.RequestParser()
        parser.add_argument('nickname')
        parser.add_argument('avatar_url')
        args = parser.parse_args()
        if args.get('nickname'):
            user.nickname = args['nickname']
        if args.get('avatar_url'):
            user.avatar_url = args['avatar_url']
        db.session.commit()
        return success(message='User info updated successfully')

# 花卉相关API
class FlowerList(Resource):
    def get(self):
        status = request.args.get('status')
        species = request.args.get('species')
        query = Flower.query
        if status:
            query = query.filter_by(bloom_status=BloomStatus(status))
        if species:
            query = query.filter(Flower.species.like(f'%{species}%'))
        flowers = query.all()
        return success([{
            'id': f.id,
            'species': f.species,
            'scientific_name': f.scientific_name,
            'bloom_status': f.bloom_status.value if f.bloom_status else None,
            'cover_image': f.cover_image
        } for f in flowers])

class FlowerDetail(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return error('Flower not found', 404)
        places = [{
            'id': p.id,
            'name': p.name,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in flower.places]
        return success({
            'id': flower.id,
            'species': flower.species,
            'scientific_name': flower.scientific_name,
            'family': flower.family,
            'genus': flower.genus,
            'bloom_status': flower.bloom_status.value if flower.bloom_status else None,
            'historical_bloom_start': flower.historical_bloom_start,
            'historical_bloom_end': flower.historical_bloom_end,
            'cover_image': flower.cover_image,
            'description': flower.description,
            'places': places
        })

class FlowerBloomStatus(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return error('Flower not found', 404)
        return success({
            'current_status': flower.bloom_status.value if flower.bloom_status else None,
            'historical_bloom_start': flower.historical_bloom_start,
            'historical_bloom_end': flower.historical_bloom_end
        })

# 地点与地图相关API（术语统一为 location，但内部仍用 Place）
class LocationList(Resource):
    def get(self):
        flower_id = request.args.get('flower_id')
        if flower_id:
            flower = Flower.query.get(flower_id)
            if not flower:
                return error('Flower not found', 404)
            places = flower.places
        else:
            places = Place.query.all()
        return success([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in places])

class LocationDetail(Resource):
    def get(self, id):
        place = Place.query.get(id)
        if not place:
            return error('Place not found', 404)
        flowers = [{
            'id': f.id,
            'species': f.species,
            'bloom_status': f.bloom_status.value if f.bloom_status else None
        } for f in place.flowers]
        return success({
            'id': place.id,
            'name': place.name,
            'description': place.description,
            'latitude': float(place.latitude),
            'longitude': float(place.longitude),
            'flowers': flowers
        })

class MapFlowers(Resource):
    def get(self):
        flower_places = FlowerPlace.query.all()
        result = []
        for fp in flower_places:
            flower = fp.flower
            place = Place.query.get(fp.place_id)
            if flower and place:
                result.append({
                    'flower_place_id': fp.id,
                    'flower_id': flower.id,
                    'flower_name': flower.species,
                    'place_id': place.id,
                    'location_id': place.id,
                    'place_name': place.name,
                    'latitude': float(place.latitude),
                    'longitude': float(place.longitude),
                    'bloom_status': flower.bloom_status.value if flower.bloom_status else None
                })
        return success(result)

class MapFilter(Resource):
    def get(self):
        flower_id = request.args.get('flower_id')
        if not flower_id:
            return error('Flower ID is required', 400)
        flower = Flower.query.get(flower_id)
        if not flower:
            return error('Flower not found', 404)
        places = flower.places
        return success([{
            'place_id': p.id,
            'location_id': p.id,
            'place_name': p.name,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in places])

# 打卡/帖子相关API
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class CheckinList(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        parser = reqparse.RequestParser()
        parser.add_argument('location_id', type=int, required=True)
        parser.add_argument('content')
        parser.add_argument('images', type=list, location='json')
        parser.add_argument('bloom_report')
        args = parser.parse_args()

        # 将 location_id (Place.id) 映射到 flower_place_id
        flower_place = FlowerPlace.query.filter_by(place_id=args['location_id']).first()
        if not flower_place:
            return error('Invalid location_id', 400)

        checkin = Checkin(
            user_id=user_id,
            flower_place_id=flower_place.id,
            bloom_report=BloomStatus(args.get('bloom_report', 'blooming')),
            content=args.get('content', ''),
            images=args.get('images', [])
        )
        db.session.add(checkin)
        db.session.commit()
        return success({
            'id': checkin.id,
            'user_id': checkin.user_id,
            'flower_place_id': checkin.flower_place_id,
            'location_id': flower_place.place_id,
            'bloom_report': checkin.bloom_report.value,
            'content': checkin.content,
            'images': checkin.images,
            'likes_count': checkin.likes_count,
            'created_at': checkin.created_at.isoformat()
        }, 'Checkin created successfully', 201)

    def get(self):
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')
        status = request.args.get('status')
        place_id = request.args.get('place_id')

        query = Checkin.query
        if start_time:
            query = query.filter(Checkin.created_at >= datetime.fromisoformat(start_time))
        if end_time:
            query = query.filter(Checkin.created_at <= datetime.fromisoformat(end_time))
        if status:
            query = query.filter_by(bloom_report=BloomStatus(status))
        if place_id:
            flower_places = FlowerPlace.query.filter_by(place_id=place_id).all()
            fp_ids = [fp.id for fp in flower_places]
            if fp_ids:
                query = query.filter(Checkin.flower_place_id.in_(fp_ids))

        checkins = query.order_by(Checkin.created_at.desc()).all()
        result = []
        for c in checkins:
            fp = FlowerPlace.query.get(c.flower_place_id)
            result.append({
                'id': c.id,
                'user_id': c.user_id,
                'flower_place_id': c.flower_place_id,
                'location_id': fp.place_id if fp else None,
                'bloom_report': c.bloom_report.value,
                'content': c.content,
                'images': c.images,
                'likes_count': c.likes_count,
                'created_at': c.created_at.isoformat()
            })
        return success(result)

class CheckinDetail(Resource):
    def get(self, id):
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        user = User.query.get(checkin.user_id)
        flower_place = FlowerPlace.query.get(checkin.flower_place_id)
        flower = Flower.query.get(flower_place.flower_id) if flower_place else None
        place = Place.query.get(flower_place.place_id) if flower_place else None
        return success({
            'id': checkin.id,
            'user': {
                'id': user.id,
                'nickname': user.nickname,
                'avatar_url': user.avatar_url
            },
            'flower': {
                'id': flower.id,
                'species': flower.species
            } if flower else None,
            'place': {
                'id': place.id,
                'name': place.name
            } if place else None,
            'flower_place_id': checkin.flower_place_id,
            'location_id': place.id if place else None,
            'bloom_report': checkin.bloom_report.value,
            'content': checkin.content,
            'images': checkin.images,
            'likes_count': checkin.likes_count,
            'created_at': checkin.created_at.isoformat()
        })

class CheckinLike(Resource):
    def put(self, id):
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        checkin.likes_count += 1
        db.session.commit()
        return success({'likes_count': checkin.likes_count})

class FlowerCheckins(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return error('Flower not found', 404)
        flower_places = FlowerPlace.query.filter_by(flower_id=id).all()
        fp_ids = [fp.id for fp in flower_places]
        if not fp_ids:
            return success([])
        checkins = Checkin.query.filter(Checkin.flower_place_id.in_(fp_ids)).order_by(Checkin.created_at.desc()).all()
        return success([{
            'id': c.id,
            'user_id': c.user_id,
            'bloom_report': c.bloom_report.value,
            'content': c.content,
            'images': c.images,
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat()
        } for c in checkins])

class LocationCheckins(Resource):
    def get(self, id):
        place = Place.query.get(id)
        if not place:
            return error('Place not found', 404)
        flower_places = FlowerPlace.query.filter_by(place_id=id).all()
        fp_ids = [fp.id for fp in flower_places]
        if not fp_ids:
            return success([])
        checkins = Checkin.query.filter(Checkin.flower_place_id.in_(fp_ids)).order_by(Checkin.created_at.desc()).all()
        return success([{
            'id': c.id,
            'user_id': c.user_id,
            'bloom_report': c.bloom_report.value,
            'content': c.content,
            'images': c.images,
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat()
        } for c in checkins])

# 成就与称号相关API
class AchievementList(Resource):
    def get(self):
        achievements = Achievement.query.all()
        return success([{
            'id': a.id,
            'description': a.description
        } for a in achievements])

class UserAchievements(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return error('User not found', 404)
        return success([{
            'id': a.id,
            'description': a.description
        } for a in user.achievements])

class UserTitles(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return error('User not found', 404)
        return success([{
            'id': t.id,
            'description': t.description
        } for t in user.titles])

# 文件上传
class UploadResource(Resource):
    @jwt_required()
    def post(self):
        if 'file' not in request.files:
            return error('No file part', 400)
        file = request.files['file']
        if file.filename == '':
            return error('No selected file', 400)
        filename = secure_filename(file.filename)
        # 避免重名覆盖
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(datetime.utcnow().timestamp())}{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        file_url = url_for('uploads', filename=filename, _external=True)
        return success({'url': file_url}, 'Upload successful', 201)
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/routes.py
git commit -m "feat(backend): align routes to /v1/ contract, demo login, location_id dual-write, add upload"
```

---

### Task 6: 更新 app.py — 路由前缀与新增端点

**Files:**
- Modify: `backend/app.py`

- [ ] **Step 1: 完整替换 app.py**

```python
from flask import Flask, render_template
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from extensions import db, api, jwt

# 导入模型和路由
from models import User, Flower, Place, FlowerPlace, Checkin, Achievement, Title
from routes import (
    AuthRegister, AuthLogin, UserMe,
    FlowerList, FlowerDetail, FlowerBloomStatus,
    LocationList, LocationDetail, MapFlowers, MapFilter,
    CheckinList, CheckinDetail, CheckinLike, FlowerCheckins, LocationCheckins,
    AchievementList, UserAchievements, UserTitles,
    UploadResource
)

app = Flask(__name__)
app.config.from_object(Config)

# CORS 允许本地开发来源
CORS(app, resources={r"/v1/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]}})

db.init_app(app)
jwt.init_app(app)
migrate = Migrate(app, db)

# 注册API路由（全部改为 /v1/... 前缀）
api.add_resource(AuthRegister, '/v1/auth/register')
api.add_resource(AuthLogin, '/v1/auth/login')
api.add_resource(UserMe, '/v1/users/me')
api.add_resource(FlowerList, '/v1/flowers')
api.add_resource(FlowerDetail, '/v1/flowers/<int:id>')
api.add_resource(FlowerBloomStatus, '/v1/flowers/<int:id>/bloom-status')
api.add_resource(LocationList, '/v1/locations')
api.add_resource(LocationDetail, '/v1/locations/<int:id>')
api.add_resource(MapFlowers, '/v1/map/flowers')
api.add_resource(MapFilter, '/v1/map/filter')
api.add_resource(CheckinList, '/v1/checkins')
api.add_resource(CheckinDetail, '/v1/checkins/<int:id>')
api.add_resource(CheckinLike, '/v1/checkins/<int:id>/like')
api.add_resource(FlowerCheckins, '/v1/flowers/<int:id>/checkins')
api.add_resource(LocationCheckins, '/v1/locations/<int:id>/checkins')
api.add_resource(AchievementList, '/v1/achievements')
api.add_resource(UserAchievements, '/v1/users/me/achievements')
api.add_resource(UserTitles, '/v1/users/me/titles')
api.add_resource(UploadResource, '/v1/upload')

# 初始化API
api.init_app(app)

# 根前端页面
@app.route('/')
def home():
    return render_template('index.html')

# 健康检查端点（统一到 /v1）
@app.route('/v1/health')
def health_check():
    return {'code': 200, 'message': 'ok', 'data': {'status': 'ok'}}, 200

# 服务上传的图片
import os
from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def uploads(filename):
    return send_from_directory('uploads', filename)

# 测试前端页面
@app.route('/test')
def test_frontend():
    return render_template('test_frontend.html')

if __name__ == "__main__":
    app.run(debug=True)
```

- [ ] **Step 2: Commit**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/app.py
git commit -m "feat(backend): update app.py to /v1/ prefix and add CORS"
```

---

### Task 7: 生成数据库迁移并升级

**Files:**
- 自动生成: `backend/migrations/versions/...`

由于 `User` 模型新增了 `username` 和 `password_hash` 字段，需要对现有 SQLite 数据库执行迁移。

- [ ] **Step 1: 确保虚拟环境已激活并安装依赖**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/backend
source venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 2: 生成迁移脚本**

```bash
flask db migrate -m "add username and password_hash to users"
```

预期：命令成功，在 `migrations/versions/` 下生成新文件。

- [ ] **Step 3: 执行迁移**

```bash
flask db upgrade
```

预期：`INFO  [alembic.runtime.migration] Context impl SQLiteImpl.` 且无报错。

- [ ] **Step 4: Commit 迁移文件**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project
git add backend/migrations/versions/
git commit -m "feat(backend): migrate User model to add username and password_hash"
```

---

### Task 8: 启动验证与冒烟测试

- [ ] **Step 1: 启动后端**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project/backend
source venv/bin/activate
python app.py
```

预期：Flask 在 `http://127.0.0.1:5000` 启动，无 ImportError、无循环导入异常。

- [ ] **Step 2: 在另一个终端执行 verify-api.sh 核心请求**

```bash
cd /home/yaoyao/vibe/se/26-SE-Project

# 健康检查
curl -s http://127.0.0.1:5000/v1/health | python -m json.tool
# 预期: { "code": 200, "data": { "status": "ok" }, "message": "ok" }

# 演示登录
curl -s -X POST http://127.0.0.1:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mode":"demo"}' | python -m json.tool
# 预期: code 200, data.token 为 JWT 字符串, data.user.nickname 为 "花园探索者"

# 获取打卡列表（无需认证，验证字段包含 location_id）
curl -s http://127.0.0.1:5000/v1/checkins?limit=1 | python -m json.tool
# 预期: code 200, data 列表中每项含 location_id
```

- [ ] **Step 3: 若全部通过，停止后端并 Commit**

```bash
# 在前端终端按 Ctrl+C 停止 Flask
cd /home/yaoyao/vibe/se/26-SE-Project
git status
# 确认无未提交改动后
git log --oneline -5
```

---

## 自我审查

**1. Spec coverage:**
- 补 `extensions.py` → Task 1
- 路径 `/api/...` → `/v1/...` → Task 6 (app.py)
- 登录 `mode` 分流（demo / wx-code / 密码） → Task 5 (AuthLogin)
- 注册接口 `/v1/auth/register` → Task 5 (AuthRegister) + Task 6
- 新增 `/v1/upload` → Task 5 (UploadResource) + Task 6
- Checkin `location_id` 双写 → Task 5 (CheckinList, CheckinDetail)
- 响应格式统一 `{ code, message, data }` → Task 5 中所有资源类
- 后端启动修复 → Task 1-4 解决循环导入与缺失依赖
- JWT_SECRET_KEY 默认值 → Task 3
- `verify-api.sh` 三接口冒烟 → Task 8

**2. Placeholder scan:** 无 TBD/TODO/"implement later"。所有步骤均含完整代码或精确命令。

**3. Type consistency:** `location_id` 在 CheckinList POST/GET、CheckinDetail、MapFlowers 中均一致映射到 `place_id`。`AuthRegister` / `AuthLogin` / `UserMe` 返回的 user 字典均含 `level`, `exp`, `total_checkins` 默认/计算值，与前端 `api.ts` 的 `User` 接口对齐。
