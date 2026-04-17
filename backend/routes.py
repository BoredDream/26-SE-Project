import os
from extensions import api, db, jwt
from flask_restful import Resource, reqparse
from models import User, Flower, Place, FlowerPlace, Checkin, Achievement, Title, BloomStatus
from flask import request, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime

# 用户相关API
class UserRegister(Resource):
    def post(self):
        # 检查是否是文件上传请求
        if 'avatar' in request.files:
            # 处理文件上传
            avatar_file = request.files['avatar']
            avatar_url = None
            if avatar_file and avatar_file.filename:
                # 安全处理文件名
                filename = secure_filename(avatar_file.filename)
                # 保存文件
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                avatar_file.save(file_path)
                # 生成文件URL
                avatar_url = url_for('uploads', filename=filename, _external=True)
            
            # 获取其他表单数据
            username = request.form.get('username')
            password = request.form.get('password')
            nickname = request.form.get('nickname')
            
            # 验证必填参数
            if not username or not password or not nickname:
                return {'message': 'Missing required parameters'}, 400
        else:
            # 处理JSON请求
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
            return {'message': 'User already exists'}, 400
        
        user = User(
            username=username,
            nickname=nickname,
            avatar_url=avatar_url
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        # 生成JWT令牌
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url,
            'role': user.role.value,
            'access_token': access_token,
            'message': 'User created successfully'
        }, 201

class UserLogin(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True)
        parser.add_argument('password', required=True)
        args = parser.parse_args()
        
        user = User.query.filter_by(username=args['username']).first()
        if not user or not user.check_password(args['password']):
            return {'message': 'Invalid username or password'}, 401
        
        # 生成JWT令牌
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url,
            'role': user.role.value,
            'access_token': access_token
        }, 200

class UserInfo(Resource):
    @jwt_required()
    def get(self):
        # 从JWT令牌中获取当前用户ID
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        return {
            'id': user.id,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url,
            'role': user.role.value,
            'achievements': [a.description for a in user.achievements],
            'titles': [t.description for t in user.titles]
        }, 200
    
    @jwt_required()
    def put(self):
        # 从JWT令牌中获取当前用户ID
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument('nickname')
        parser.add_argument('avatar_url')
        args = parser.parse_args()
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        if args.get('nickname'):
            user.nickname = args['nickname']
        if args.get('avatar_url'):
            user.avatar_url = args['avatar_url']
        
        db.session.commit()
        return {'message': 'User info updated successfully'}, 200

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
        return [{
            'id': f.id,
            'species': f.species,
            'scientific_name': f.scientific_name,
            'bloom_status': f.bloom_status.value if f.bloom_status else None,
            'cover_image': f.cover_image
        } for f in flowers], 200

class FlowerDetail(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return {'message': 'Flower not found'}, 404
        
        places = [{
            'id': p.id,
            'name': p.name,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in flower.places]
        
        return {
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
        }, 200

class FlowerBloomStatus(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return {'message': 'Flower not found'}, 404
        
        # 这里可以添加实时状态计算逻辑
        return {
            'current_status': flower.bloom_status.value if flower.bloom_status else None,
            'historical_bloom_start': flower.historical_bloom_start,
            'historical_bloom_end': flower.historical_bloom_end
        }, 200

# 地点与地图相关API
class PlaceList(Resource):
    def get(self):
        flower_id = request.args.get('flower_id')
        
        if flower_id:
            flower = Flower.query.get(flower_id)
            if not flower:
                return {'message': 'Flower not found'}, 404
            places = flower.places
        else:
            places = Place.query.all()
        
        return [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in places], 200

class PlaceDetail(Resource):
    def get(self, id):
        place = Place.query.get(id)
        if not place:
            return {'message': 'Place not found'}, 404
        
        flowers = [{
            'id': f.id,
            'species': f.species,
            'bloom_status': f.bloom_status.value if f.bloom_status else None
        } for f in place.flowers]
        
        return {
            'id': place.id,
            'name': place.name,
            'description': place.description,
            'latitude': float(place.latitude),
            'longitude': float(place.longitude),
            'flowers': flowers
        }, 200

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
                    'place_name': place.name,
                    'latitude': float(place.latitude),
                    'longitude': float(place.longitude),
                    'bloom_status': flower.bloom_status.value if flower.bloom_status else None
                })
        
        return result, 200

class MapFilter(Resource):
    def get(self):
        flower_id = request.args.get('flower_id')
        if not flower_id:
            return {'message': 'Flower ID is required'}, 400
        
        flower = Flower.query.get(flower_id)
        if not flower:
            return {'message': 'Flower not found'}, 404
        
        places = flower.places
        return [{
            'place_id': p.id,
            'place_name': p.name,
            'latitude': float(p.latitude),
            'longitude': float(p.longitude)
        } for p in places], 200

# 打卡/帖子相关API

# 确保上传目录存在
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

class CheckinList(Resource):
    def post(self):
        # 获取表单数据
        user_id = request.form.get('user_id')
        flower_place_id = request.form.get('flower_place_id')
        bloom_report = request.form.get('bloom_report')
        content = request.form.get('content')
        
        # 验证必填参数
        if not user_id or not flower_place_id or not bloom_report:
            return {'message': 'Missing required parameters'}, 400
        
        # 处理文件上传
        images = []
        if 'images' in request.files:
            # 检查是否是多个文件
            files = request.files.getlist('images')
            for file in files:
                if file and file.filename:
                    # 安全处理文件名
                    filename = secure_filename(file.filename)
                    # 保存文件
                    file_path = os.path.join(UPLOAD_FOLDER, filename)
                    file.save(file_path)
                    # 生成文件URL
                    file_url = url_for('uploads', filename=filename, _external=True)
                    images.append(file_url)
        
        checkin = Checkin(
            user_id=user_id,
            flower_place_id=flower_place_id,
            bloom_report=BloomStatus(bloom_report),
            content=content,
            images=images
        )
        db.session.add(checkin)
        db.session.commit()
        return {'id': checkin.id, 'message': 'Checkin created successfully', 'images': images}, 201
    
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
            # 通过flower_place_id关联查询
            flower_places = FlowerPlace.query.filter_by(place_id=place_id).all()
            fp_ids = [fp.id for fp in flower_places]
            if fp_ids:
                query = query.filter(Checkin.flower_place_id.in_(fp_ids))
        
        checkins = query.order_by(Checkin.created_at.desc()).all()
        return [{
            'id': c.id,
            'user_id': c.user_id,
            'flower_place_id': c.flower_place_id,
            'bloom_report': c.bloom_report.value,
            'content': c.content,
            'images': c.images,
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat()
        } for c in checkins], 200

class CheckinDetail(Resource):
    def get(self, id):
        checkin = Checkin.query.get(id)
        if not checkin:
            return {'message': 'Checkin not found'}, 404
        
        user = User.query.get(checkin.user_id)
        flower_place = FlowerPlace.query.get(checkin.flower_place_id)
        flower = Flower.query.get(flower_place.flower_id)
        place = Place.query.get(flower_place.place_id)
        
        return {
            'id': checkin.id,
            'user': {
                'id': user.id,
                'nickname': user.nickname,
                'avatar_url': user.avatar_url
            },
            'flower': {
                'id': flower.id,
                'species': flower.species
            },
            'place': {
                'id': place.id,
                'name': place.name
            },
            'bloom_report': checkin.bloom_report.value,
            'content': checkin.content,
            'images': checkin.images,
            'likes_count': checkin.likes_count,
            'created_at': checkin.created_at.isoformat()
        }, 200

class CheckinLike(Resource):
    def put(self, id):
        checkin = Checkin.query.get(id)
        if not checkin:
            return {'message': 'Checkin not found'}, 404
        
        # 简单实现：每次调用增加一个点赞
        checkin.likes_count += 1
        db.session.commit()
        return {'likes_count': checkin.likes_count}, 200

class FlowerCheckins(Resource):
    def get(self, id):
        flower = Flower.query.get(id)
        if not flower:
            return {'message': 'Flower not found'}, 404
        
        # 获取该花卉所有关联的flower_place_ids
        flower_places = FlowerPlace.query.filter_by(flower_id=id).all()
        fp_ids = [fp.id for fp in flower_places]
        
        if not fp_ids:
            return [], 200
        
        checkins = Checkin.query.filter(Checkin.flower_place_id.in_(fp_ids)).order_by(Checkin.created_at.desc()).all()
        return [{
            'id': c.id,
            'user_id': c.user_id,
            'bloom_report': c.bloom_report.value,
            'content': c.content,
            'images': c.images,
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat()
        } for c in checkins], 200

class PlaceCheckins(Resource):
    def get(self, id):
        place = Place.query.get(id)
        if not place:
            return {'message': 'Place not found'}, 404
        
        # 获取该地点所有关联的flower_place_ids
        flower_places = FlowerPlace.query.filter_by(place_id=id).all()
        fp_ids = [fp.id for fp in flower_places]
        
        if not fp_ids:
            return [], 200
        
        checkins = Checkin.query.filter(Checkin.flower_place_id.in_(fp_ids)).order_by(Checkin.created_at.desc()).all()
        return [{
            'id': c.id,
            'user_id': c.user_id,
            'bloom_report': c.bloom_report.value,
            'content': c.content,
            'images': c.images,
            'likes_count': c.likes_count,
            'created_at': c.created_at.isoformat()
        } for c in checkins], 200

# 成就与称号相关API
class AchievementList(Resource):
    def get(self):
        achievements = Achievement.query.all()
        return [{
            'id': a.id,
            'description': a.description
        } for a in achievements], 200

class UserAchievements(Resource):
    @jwt_required()
    def get(self):
        # 从JWT令牌中获取当前用户ID
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        return [{
            'id': a.id,
            'description': a.description
        } for a in user.achievements], 200

class UserTitles(Resource):
    @jwt_required()
    def get(self):
        # 从JWT令牌中获取当前用户ID
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        return [{
            'id': t.id,
            'description': t.description
        } for t in user.titles], 200

# 路由将在app.py中注册
