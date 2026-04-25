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
