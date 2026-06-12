"""Achievement 颁发逻辑：根据用户总打卡次数授予成就。"""
from extensions import db
from models import Checkin, Achievement, User


def count_checkins(user_id: int) -> int:
    """统计用户总打卡次数。"""
    return Checkin.query.filter_by(user_id=user_id).count()


def check_and_grant_achievements(user: User) -> list[Achievement]:
    """根据 user 当前总打卡数颁发所有可解锁的 Achievement。

    幂等：已拥有的不会重复添加；返回此次新增的 Achievement 列表（可能为空）。
    """
    total = count_checkins(user.id)
    eligible = Achievement.query.filter(Achievement.requirement <= total).all()
    owned_ids = {a.id for a in user.achievements}
    newly_granted = []
    for achievement in eligible:
        if achievement.id not in owned_ids:
            user.achievements.append(achievement)
            newly_granted.append(achievement)
    if newly_granted:
        db.session.commit()
    return newly_granted
