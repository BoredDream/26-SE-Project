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
from models import User, FlowerPlace, Checkin, Comment, BloomStatus

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
