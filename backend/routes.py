import os
from extensions import api, db, jwt
from flask_restful import Resource, reqparse
from models import User, Flower, Place, FlowerPlace, Checkin, Comment, Like, Achievement, Title, BloomStatus, Subscription, Notification
from flask import request, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
from services.title_service import check_and_grant_titles, get_current_title
from services.notification_service import notify_subscribers_on_bloom_change

# 通用响应包装
def success(data=None, message='ok', code=200):
    return {'code': code, 'message': message, 'data': data}, code

def error(message, code=400):
    return {'code': code, 'message': message, 'data': None}, code

def _serialize_title(t):
    return {
        'id': t.id,
        'name': t.name,
        'description': t.description,
        'requirement': t.requirement,
    }

def _user_brief(user):
    """帖子/评论里嵌套的 user 简版，附带当前称号。"""
    if user is None:
        return None
    current = get_current_title(user)
    return {
        'id': user.id,
        'nickname': user.nickname,
        'avatar_url': user.avatar_url,
        'current_title': _serialize_title(current) if current else None,
    }

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
        current = get_current_title(user)
        return success({
            'id': user.id,
            'nickname': user.nickname,
            'avatar_url': user.avatar_url,
            'role': user.role.value,
            'level': 1,
            'exp': 0,
            'total_checkins': len(user.checkins),
            'achievements': [a.description for a in user.achievements],
            'titles': [_serialize_title(t) for t in user.titles],
            'current_title': _serialize_title(current) if current else None,
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

    @jwt_required()
    def put(self, id):
        """更新花卉花期；若进入 blooming / budding，给所有订阅者发站内通知。"""
        flower = Flower.query.get(id)
        if not flower:
            return error('Flower not found', 404)
        parser = reqparse.RequestParser()
        parser.add_argument('bloom_status', required=True)
        args = parser.parse_args()
        try:
            new_status = BloomStatus(args['bloom_status'])
        except ValueError:
            return error('Invalid bloom_status', 400)
        old_status = flower.bloom_status
        flower.bloom_status = new_status
        db.session.commit()
        notified = notify_subscribers_on_bloom_change(flower, old_status, new_status)
        return success({
            'id': flower.id,
            'bloom_status': new_status.value,
            'notified_subscribers': notified,
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

        result = []
        for p in places:
            # 优先选 species 匹配 place.name 前缀的 flower（处理同一 place 被多次 upsert 导致的多关联）
            name_prefix = (p.name or '').split('·')[0]
            flower = next((f for f in p.flowers if f.species == name_prefix), None) \
                or (p.flowers[0] if p.flowers else None)
            fps = FlowerPlace.query.filter_by(place_id=p.id).all()
            checkin_count = sum(len(fp.checkins) for fp in fps)
            result.append({
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'latitude': float(p.latitude),
                'longitude': float(p.longitude),
                'flower_id': flower.id if flower else None,
                'flower_species': flower.species if flower else '',
                'bloom_status': flower.bloom_status.value if flower and flower.bloom_status else '',
                'historical_bloom_start': flower.historical_bloom_start if flower else None,
                'historical_bloom_end': flower.historical_bloom_end if flower else None,
                'cover_image': flower.cover_image if flower else '',
                'checkin_count': checkin_count,
            })
        return success(result)

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

def _comments_count(checkin_id):
    return Comment.query.filter_by(checkin_id=checkin_id).count()

def _liked_by(checkin_id, user_id):
    if not user_id:
        return False
    return Like.query.filter_by(checkin_id=checkin_id, user_id=int(user_id)).first() is not None

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

        newly_granted = check_and_grant_titles(User.query.get(user_id))

        return success({
            'id': checkin.id,
            'user_id': checkin.user_id,
            'flower_place_id': checkin.flower_place_id,
            'location_id': flower_place.place_id,
            'bloom_report': checkin.bloom_report.value,
            'content': checkin.content,
            'images': checkin.images,
            'likes_count': checkin.likes_count,
            'comments_count': 0,
            'liked': False,
            'created_at': checkin.created_at.isoformat(),
            'newly_granted_titles': [_serialize_title(t) for t in newly_granted],
        }, 'Checkin created successfully', 201)

    @jwt_required(optional=True)
    def get(self):
        current_user_id = get_jwt_identity()
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
            place = Place.query.get(fp.place_id) if fp else None
            author = User.query.get(c.user_id)
            result.append({
                'id': c.id,
                'user_id': c.user_id,
                'user': _user_brief(author),
                'flower_place_id': c.flower_place_id,
                'location_id': fp.place_id if fp else None,
                'place_name': place.name if place else None,
                'bloom_report': c.bloom_report.value,
                'content': c.content,
                'images': c.images,
                'likes_count': c.likes_count,
                'comments_count': _comments_count(c.id),
                'liked': _liked_by(c.id, current_user_id),
                'created_at': c.created_at.isoformat()
            })
        return success(result)

class CheckinDetail(Resource):
    @jwt_required(optional=True)
    def get(self, id):
        current_user_id = get_jwt_identity()
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        user = User.query.get(checkin.user_id)
        flower_place = FlowerPlace.query.get(checkin.flower_place_id)
        flower = Flower.query.get(flower_place.flower_id) if flower_place else None
        place = Place.query.get(flower_place.place_id) if flower_place else None
        return success({
            'id': checkin.id,
            'user': _user_brief(user),
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
            'comments_count': _comments_count(checkin.id),
            'liked': _liked_by(checkin.id, current_user_id),
            'created_at': checkin.created_at.isoformat()
        })

class CheckinLike(Resource):
    @jwt_required()
    def put(self, id):
        user_id = int(get_jwt_identity())
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        existing = Like.query.filter_by(checkin_id=id, user_id=user_id).first()
        if existing:
            db.session.delete(existing)
            checkin.likes_count = max(0, (checkin.likes_count or 0) - 1)
            liked = False
        else:
            db.session.add(Like(checkin_id=id, user_id=user_id))
            checkin.likes_count = (checkin.likes_count or 0) + 1
            liked = True
        db.session.commit()
        return success({'likes_count': checkin.likes_count, 'liked': liked})

class CheckinComments(Resource):
    def get(self, id):
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        comments = Comment.query.filter_by(checkin_id=id).order_by(Comment.created_at.desc()).all()
        result = []
        for c in comments:
            author = User.query.get(c.user_id)
            result.append({
                'id': c.id,
                'checkin_id': c.checkin_id,
                'user_id': c.user_id,
                'content': c.content,
                'created_at': c.created_at.isoformat(),
                'user': _user_brief(author),
            })
        return success(result)

    @jwt_required()
    def post(self, id):
        user_id = int(get_jwt_identity())
        checkin = Checkin.query.get(id)
        if not checkin:
            return error('Checkin not found', 404)
        parser = reqparse.RequestParser()
        parser.add_argument('content', required=True)
        args = parser.parse_args()
        content = (args['content'] or '').strip()
        if not content:
            return error('Comment content is required', 400)
        comment = Comment(checkin_id=id, user_id=user_id, content=content)
        db.session.add(comment)
        db.session.commit()
        author = User.query.get(user_id)
        return success({
            'id': comment.id,
            'checkin_id': comment.checkin_id,
            'user_id': comment.user_id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'user': _user_brief(author),
        }, 'Comment created successfully', 201)

class CommentDetail(Resource):
    @jwt_required()
    def delete(self, id, comment_id):
        user_id = int(get_jwt_identity())
        comment = Comment.query.filter_by(id=comment_id, checkin_id=id).first()
        if not comment:
            return error('Comment not found', 404)
        if comment.user_id != user_id:
            return error('Not allowed to delete this comment', 403)
        db.session.delete(comment)
        db.session.commit()
        return success(None, 'Comment deleted')

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
        return success([_serialize_title(t) for t in user.titles])

# 订阅与通知相关API
class FlowerSubscription(Resource):
    @jwt_required()
    def post(self, id):
        user_id = int(get_jwt_identity())
        flower = Flower.query.get(id)
        if not flower:
            return error('Flower not found', 404)
        existing = Subscription.query.filter_by(user_id=user_id, flower_id=id).first()
        if existing:
            return success({'subscribed': True}, 'Already subscribed')
        db.session.add(Subscription(user_id=user_id, flower_id=id))
        db.session.commit()
        return success({'subscribed': True}, 'Subscribed', 201)

    @jwt_required()
    def delete(self, id):
        user_id = int(get_jwt_identity())
        sub = Subscription.query.filter_by(user_id=user_id, flower_id=id).first()
        if not sub:
            return success({'subscribed': False}, 'Not subscribed')
        db.session.delete(sub)
        db.session.commit()
        return success({'subscribed': False}, 'Unsubscribed')

class UserSubscriptions(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        subs = Subscription.query.filter_by(user_id=user_id).all()
        result = []
        for s in subs:
            f = Flower.query.get(s.flower_id)
            if not f:
                continue
            result.append({
                'flower_id': f.id,
                'species': f.species,
                'cover_image': f.cover_image,
                'bloom_status': f.bloom_status.value if f.bloom_status else None,
                'subscribed_at': s.created_at.isoformat() if s.created_at else None,
            })
        return success(result)

class UserNotifications(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        unread_only = request.args.get('unread') == '1'
        query = Notification.query.filter_by(user_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        notes = query.order_by(Notification.created_at.desc()).all()
        unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return success({
            'unread_count': unread_count,
            'items': [{
                'id': n.id,
                'flower_id': n.flower_id,
                'type': n.type,
                'title': n.title,
                'body': n.body,
                'is_read': n.is_read,
                'created_at': n.created_at.isoformat() if n.created_at else None,
            } for n in notes],
        })

class NotificationRead(Resource):
    @jwt_required()
    def put(self, id):
        user_id = int(get_jwt_identity())
        note = Notification.query.filter_by(id=id, user_id=user_id).first()
        if not note:
            return error('Notification not found', 404)
        note.is_read = True
        db.session.commit()
        return success({'id': id, 'is_read': True})

class NotificationsReadAll(Resource):
    @jwt_required()
    def put(self):
        user_id = int(get_jwt_identity())
        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()
        return success({'all_read': True})

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
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(datetime.utcnow().timestamp())}{ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        file_url = url_for('uploads', filename=filename, _external=True)
        return success({'url': file_url}, 'Upload successful', 201)
