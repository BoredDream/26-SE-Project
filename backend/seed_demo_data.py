"""一次性运行的演示数据种子脚本。

往数据库里补充：
- 6 个虚拟用户（花园爱好者）
- 每个 FlowerPlace 补足到 6 条 checkins
- 每条 checkin 补到 2~7 条评论

幂等：检测已存在的种子用户/数据，存在的部分不重复创建。

用法：
    cd backend && source venv/bin/activate
    python seed_demo_data.py
"""
import os
import sys
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from extensions import db
from models import User, Place, Flower, FlowerPlace, Checkin, Comment, BloomStatus, Title

SEED_TITLES = [
    {'name': '初问春色', 'requirement': 0, 'description': '初次踏入花径，还未识得校园群芳'},
    {'name': '一径花踪', 'requirement': 1, 'description': '已识一种花卉，开始留心枝头的春信'},
    {'name': '三两芳信', 'requirement': 3, 'description': '收集到三种以上花讯，渐入佳境'},
    {'name': '半园识翠', 'requirement': 6, 'description': '园中近半花种已识，目力渐熟'},
    {'name': '满园春色', 'requirement': 9, 'description': '阅尽狮山九种花，俯仰皆春'},
]

# species → 图片路径（处理 species 名与图片文件名带"花"后缀的差异）
SPECIES_TO_IMAGE = {
    '樱花':     '/static/flowers/樱花.png',
    '蔷薇':     '/static/flowers/蔷薇花.png',
    '夹竹桃':   '/static/flowers/夹竹桃.png',
    '油菜花':   '/static/flowers/油菜花.png',
    '莲花':     '/static/flowers/桃花.png',  # static 目录暂无莲花图，沿用 mockData 的折中
    '梨花':     '/static/flowers/梨花.png',
    '玉兰':     '/static/flowers/玉兰花.png',
    '大金鸡菊': '/static/flowers/大金鸡菊.png',
    '格桑花':   '/static/flowers/格桑花.png',
}

# 与 Frontend-uni/src/services/mockData.ts 的 mockLocations 完全对齐（id、坐标已转为 GCJ-02）
# 前端打卡时直接拿 location.id 作为 place_id 传给后端，所以 id 必须对应得上
SEED_LOCATIONS = [
    {'id':  1, 'name': '樱花·樱花路',           'species': '樱花',     'lat': 30.471260, 'lng': 114.364961, 'description': '春日樱花路，粉樱列植夹道，是校园最经典的打卡花径。'},
    {'id':  2, 'name': '蔷薇·机电中心旁',       'species': '蔷薇',     'lat': 30.467089, 'lng': 114.363014, 'description': '机电工程训练中心外墙的攀援蔷薇，初夏正是花势最盛之时。'},
    {'id':  3, 'name': '蔷薇·三运球场南',       'species': '蔷薇',     'lat': 30.470983, 'lng': 114.365239, 'description': '三运篮球场南侧花丛，红粉相间，黄昏来访最佳。'},
    {'id':  4, 'name': '夹竹桃·水产学院旁',     'species': '夹竹桃',   'lat': 30.464034, 'lng': 114.363292, 'description': '水产学院教学实习基地旁列植夹竹桃，叶秀花繁。'},
    {'id':  5, 'name': '夹竹桃·水杉林西',       'species': '夹竹桃',   'lat': 30.465137, 'lng': 114.358285, 'description': '水杉林西侧约 100 米，夹竹桃与杉影相映成趣。'},
    {'id':  6, 'name': '油菜花·实验田',         'species': '油菜花',   'lat': 30.466532, 'lng': 114.361901, 'description': '水杉林周边的油菜花实验田，每到春末已结荚收尾。'},
    {'id':  7, 'name': '莲花·水杉林池塘',       'species': '莲花',     'lat': 30.466506, 'lng': 114.346879, 'description': '水杉林西侧约 300 米的小池塘，夏初莲叶田田，含苞待放。'},
    {'id':  8, 'name': '莲花·蕙芷园南池',       'species': '莲花',     'lat': 30.468723, 'lng': 114.343819, 'description': '蕙芷园南面池塘，盛夏荷风送香，是校内赏荷首选。'},
    {'id':  9, 'name': '梨花·三教A座前',        'species': '梨花',     'lat': 30.472085, 'lng': 114.359120, 'description': '三教 A 座教学楼前的梨树，早春雪白成阵。'},
    {'id': 10, 'name': '玉兰·图书馆前',         'species': '玉兰',     'lat': 30.471248, 'lng': 114.357451, 'description': '图书馆门前的白玉兰，每年开学第一周已完成花事。'},
    {'id': 11, 'name': '大金鸡菊·狮子山广场南', 'species': '大金鸡菊', 'lat': 30.472916, 'lng': 114.357730, 'description': '狮子山广场南面的金鸡菊带，初夏一片明亮金黄。'},
    {'id': 12, 'name': '格桑花·蕙芷园北',       'species': '格桑花',   'lat': 30.471226, 'lng': 114.344932, 'description': '蕙芷园北面的格桑花海，盛花期一直延续到深秋。'},
]

SEED_USERS = [
    {'username': 'sakura_obs',   'nickname': '樱花观察者'},
    {'username': 'meadow_walk',  'nickname': '草坪漫步'},
    {'username': 'spring_breez', 'nickname': '春风十里'},
    {'username': 'leaf_collect', 'nickname': '叶语'},
    {'username': 'petal_diary',  'nickname': '一瓣记录'},
    {'username': 'morning_dew',  'nickname': '晨露'},
]

SAMPLE_CONTENTS = [
    '今天的花开得正好，阳光透过花瓣的样子真美。',
    '路过这里，被一阵花香吸引，停下来拍了几张。',
    '比上周来的时候开得更盛了，再过几天可能就到峰值。',
    '随手记录一下，这片区域的颜色层次很丰富。',
    '风一吹花瓣就掉下来一片，捧在手心很轻。',
    '蜜蜂在花丛里嗡嗡飞，生机勃勃的样子。',
    '难得见到这么大片的，今年应该是花期好。',
    '配着夕阳看更有感觉，强烈推荐傍晚来。',
    '校园的角落原来藏着这样的小景，是个意外的惊喜。',
    '约朋友一起来散步，边走边聊，花香伴着笑声。',
]

SAMPLE_COMMENTS = [
    '太美了，明天我也去打卡！',
    '请问大概在什么位置呀？',
    '今年开得比去年早，气候原因？',
    '收藏了，周末就去看看。',
    '照片拍得真好，构图很棒。',
    '我上周也来过，没赶上盛花期。',
    '原来这里有这么多花种，哇！',
    '推荐什么时段去人最少？',
    '花期还能持续多久呀？',
    '请问需要门票吗？',
    '这里花种丰富吗，可以拍一整天。',
    '已经收藏路线了，谢谢分享！',
    '配色绝了，像是水彩画。',
    '看完就想出门散步了。',
    '正好这周末路过，可以顺道一去。',
    '清晨光线最温柔，可以试试。',
    '太适合慢节奏地走一走了。',
    '这朵真的拍出了花的灵气。',
]


def main():
    with app.app_context():
        random.seed(20260523)

        # 0. 种子称号（幂等：按 name 唯一性判断）
        new_titles = 0
        for t in SEED_TITLES:
            if Title.query.filter_by(name=t['name']).first():
                continue
            db.session.add(Title(**t))
            new_titles += 1
        db.session.commit()
        print(f'[titles]   新增 {new_titles} 个称号（库内共 {Title.query.count()} 个）')

        # 0.5 种子花卉点位（让后端 Place/Flower/FlowerPlace 与前端 mockLocations 对齐）
        # upsert 策略：按 id upsert Place；按 species upsert Flower；按 (flower_id, place_id) upsert FlowerPlace
        new_places, new_flowers, new_fps = 0, 0, 0
        for loc in SEED_LOCATIONS:
            # Flower upsert（按 species，同步 cover_image）
            species = loc['species']
            cover = SPECIES_TO_IMAGE.get(species, f'/static/flowers/{species}.png')
            flower = Flower.query.filter_by(species=species).first()
            if not flower:
                flower = Flower(species=species, cover_image=cover)
                db.session.add(flower)
                new_flowers += 1
            elif flower.cover_image != cover:
                flower.cover_image = cover  # 更新已存在的 Flower
            db.session.flush()
            # Place upsert（按 id）
            place = Place.query.get(loc['id'])
            if place:
                place.name = loc['name']
                place.description = loc['description']
                place.latitude = loc['lat']
                place.longitude = loc['lng']
            else:
                place = Place(
                    id=loc['id'],
                    name=loc['name'],
                    description=loc['description'],
                    latitude=loc['lat'],
                    longitude=loc['lng'],
                )
                db.session.add(place)
                new_places += 1
            db.session.flush()
            # FlowerPlace upsert
            fp = FlowerPlace.query.filter_by(flower_id=flower.id, place_id=place.id).first()
            if not fp:
                db.session.add(FlowerPlace(flower_id=flower.id, place_id=place.id))
                new_fps += 1
        db.session.commit()
        print(f'[places]   新增 {new_places} 个 Place / {new_flowers} 个 Flower / {new_fps} 条 FlowerPlace 关联')

        # 1. 种子用户
        users = []
        for u in SEED_USERS:
            existing = User.query.filter_by(username=u['username']).first()
            if existing:
                users.append(existing)
                continue
            new_user = User(
                openid=f"seed_{u['username']}",
                username=u['username'],
                nickname=u['nickname'],
                avatar_url='',
            )
            new_user.set_password('demo')
            db.session.add(new_user)
            users.append(new_user)
        db.session.commit()
        print(f'[users]    确保 {len(users)} 个种子用户存在')

        # 2. 为每个 FlowerPlace 补足 checkins
        flower_places = FlowerPlace.query.all()
        if not flower_places:
            print('[checkins] 数据库无 FlowerPlace，跳过 checkin/comment 生成')
            return

        new_checkins = 0
        for fp in flower_places:
            existing_count = Checkin.query.filter_by(flower_place_id=fp.id).count()
            need = max(0, 6 - existing_count)
            for _ in range(need):
                days_ago = random.uniform(0.1, 14)
                author = random.choice(users)
                checkin = Checkin(
                    user_id=author.id,
                    flower_place_id=fp.id,
                    bloom_report=random.choice(list(BloomStatus)),
                    content=random.choice(SAMPLE_CONTENTS),
                    images=[],
                    likes_count=random.randint(0, 30),
                    created_at=datetime.utcnow() - timedelta(days=days_ago),
                )
                db.session.add(checkin)
                new_checkins += 1
        db.session.commit()
        print(f'[checkins] 新增 {new_checkins} 条 checkin')

        # 3. 给每条 Checkin 补充评论到 2~7 条
        all_checkins = Checkin.query.all()
        new_comments = 0
        for c in all_checkins:
            existing = Comment.query.filter_by(checkin_id=c.id).count()
            target = random.randint(2, 7)
            need = max(0, target - existing)
            for _ in range(need):
                commenter = random.choice(users)
                comment = Comment(
                    checkin_id=c.id,
                    user_id=commenter.id,
                    content=random.choice(SAMPLE_COMMENTS),
                    created_at=c.created_at + timedelta(minutes=random.randint(10, 600)),
                )
                db.session.add(comment)
                new_comments += 1
        db.session.commit()
        print(f'[comments] 新增 {new_comments} 条评论')

        print('✅ 演示数据生成完成')


if __name__ == '__main__':
    main()
