from flask import Flask, render_template
from flask_migrate import Migrate
from config import Config
from extensions import db, api, jwt

# 导入模型和路由
from models import User, Flower, Place, FlowerPlace, Checkin, Achievement, Title
from routes import (
    UserRegister, UserLogin, UserInfo,
    FlowerList, FlowerDetail, FlowerBloomStatus,
    PlaceList, PlaceDetail, MapFlowers, MapFilter,
    CheckinList, CheckinDetail, CheckinLike, FlowerCheckins, PlaceCheckins,
    AchievementList, UserAchievements, UserTitles
)

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
jwt.init_app(app)
migrate = Migrate(app, db)

# 注册API路由
api.add_resource(UserRegister, '/api/user/register')
api.add_resource(UserLogin, '/api/user/login')
api.add_resource(UserInfo, '/api/user/info')
api.add_resource(FlowerList, '/api/flowers')
api.add_resource(FlowerDetail, '/api/flowers/<int:id>')
api.add_resource(FlowerBloomStatus, '/api/flowers/<int:id>/bloom-status')
api.add_resource(PlaceList, '/api/places')
api.add_resource(PlaceDetail, '/api/places/<int:id>')
api.add_resource(MapFlowers, '/api/map/flowers')
api.add_resource(MapFilter, '/api/map/filter')
api.add_resource(CheckinList, '/api/checkins')
api.add_resource(CheckinDetail, '/api/checkins/<int:id>')
api.add_resource(CheckinLike, '/api/checkins/<int:id>/like')
api.add_resource(FlowerCheckins, '/api/flowers/<int:id>/checkins')
api.add_resource(PlaceCheckins, '/api/places/<int:id>/checkins')
api.add_resource(AchievementList, '/api/achievements')
api.add_resource(UserAchievements, '/api/user/achievements')
api.add_resource(UserTitles, '/api/user/titles')

# 初始化API
api.init_app(app)

# 根前端页面
@app.route('/')
def home():
    return render_template('index.html')

# 健康检查端点
@app.route('/health')
def health_check():
    return {'status': 'ok'}, 200

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
