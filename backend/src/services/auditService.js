const pool = require('../config/database');

// 审核打卡记录
const auditCheckin = async (checkinId, images, content) => {
  try {
    // TODO: 实现AI内容审核逻辑
    // 这里先模拟实现，默认审核通过
    await setAuditStatus(checkinId, 'approved', null);
    await triggerPostCheckinLogic(checkinId);
  } catch (error) {
    console.error('Audit checkin error:', error);
    // 审核服务异常时默认通过，避免误伤
    await setAuditStatus(checkinId, 'approved', null);
  }
};

// 设置审核状态
const setAuditStatus = async (checkinId, status, reason) => {
  await pool.execute(
    'UPDATE checkins SET audit_status = ?, is_visible = ? WHERE id = ?',
    [status, status === 'approved', checkinId]
  );
};

// 触发打卡后的后续逻辑
const triggerPostCheckinLogic = async (checkinId) => {
  // 获取打卡记录
  const [checkins] = await pool.execute('SELECT * FROM checkins WHERE id = ?', [checkinId]);
  if (checkins.length === 0) return;
  
  const checkin = checkins[0];
  
  // 触发花期投票
  await require('./voteService').updateBloomStatusByVote(checkin.location_id);
  
  // 触发成就检查
  await require('./achievementService').checkAchievements(checkin.id);
  
  // 触发称号检查
  await require('./titleService').checkTitles(checkin.user_id);
};

module.exports = {
  auditCheckin
};
