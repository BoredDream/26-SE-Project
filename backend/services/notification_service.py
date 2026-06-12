"""花期变更 → 给订阅者发送站内通知。"""
from extensions import db
from models import Notification, Subscription, BloomStatus

# bloom_status 由非该状态变为下列状态时，触发对应类型通知
NOTIFY_ON = {
    BloomStatus.BLOOMING: ('bloom_start', '盛开提醒', '你订阅的「{species}」已进入盛开期，正是去看的好时候。'),
    BloomStatus.BUDDING:  ('bud_start',   '含苞预告', '你订阅的「{species}」开始含苞，预计很快就要绽放。'),
}


def notify_subscribers_on_bloom_change(flower, old_status, new_status):
    """当 flower.bloom_status 由 old_status 变为 new_status 时，给订阅者发通知。

    只有"进入"目标状态时才推（避免在已盛开的状态间来回切换重复推）。
    返回新建的通知数量。
    """
    if new_status == old_status or new_status not in NOTIFY_ON:
        return 0
    type_code, title, body_tpl = NOTIFY_ON[new_status]
    body = body_tpl.format(species=flower.species)
    subs = Subscription.query.filter_by(flower_id=flower.id).all()
    for sub in subs:
        db.session.add(Notification(
            user_id=sub.user_id,
            flower_id=flower.id,
            type=type_code,
            title=title,
            body=body,
        ))
    if subs:
        db.session.commit()
    return len(subs)
