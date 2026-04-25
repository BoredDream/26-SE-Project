from extensions import db
from datetime import datetime
import enum

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
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
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
