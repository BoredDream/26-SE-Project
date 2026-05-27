"""Title 颁发逻辑：根据用户已打卡的不同花种数授予称号。"""
from extensions import db
from models import Checkin, Flower, FlowerPlace, Title, User


def count_unique_species(user_id: int) -> int:
    """统计用户已打卡过的不同 Flower（花种）数量。"""
    return (
        db.session.query(Flower.id)
        .join(FlowerPlace, Flower.id == FlowerPlace.flower_id)
        .join(Checkin, Checkin.flower_place_id == FlowerPlace.id)
        .filter(Checkin.user_id == user_id)
        .distinct()
        .count()
    )


def check_and_grant_titles(user: User) -> list[Title]:
    """根据 user 当前的不同花种数颁发所有可解锁的 Title。

    幂等：已拥有的不会重复添加；返回此次新增的 Title 列表（可能为空）。
    """
    unique_species = count_unique_species(user.id)
    eligible = Title.query.filter(Title.requirement <= unique_species).all()
    owned_ids = {t.id for t in user.titles}
    newly_granted = []
    for title in eligible:
        if title.id not in owned_ids:
            user.titles.append(title)
            newly_granted.append(title)
    if newly_granted:
        db.session.commit()
    return newly_granted


def get_current_title(user: User) -> Title | None:
    """返回 user 已拥有的最高 requirement 的 Title。未拥有任何称号时返回 None。"""
    if not user.titles:
        return None
    return max(user.titles, key=lambda t: t.requirement)
