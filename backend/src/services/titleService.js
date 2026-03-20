const pool = require('../config/database');

// 检查称号
const checkTitles = async (userId) => {
  try {
    // 获取用户打卡总数
    const [checkinCounts] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE user_id = ? AND audit_status = ?',
      [userId, 'approved']
    );
    const totalCheckins = checkinCounts[0].total;
    
    // 检查并授予称号
    await checkFirstCheckinTitle(userId, totalCheckins);
    await checkCheckin10Title(userId, totalCheckins);
    await checkLikes50Title(userId);
  } catch (error) {
    console.error('Check titles error:', error);
  }
};

// 检查并授予首次打卡称号
const checkFirstCheckinTitle = async (userId, totalCheckins) => {
  if (totalCheckins === 1) {
    await grantTitle(userId, 'first_checkin', '🌱 花卉初探者');
  }
};

// 检查并授予打卡10次称号
const checkCheckin10Title = async (userId, totalCheckins) => {
  if (totalCheckins === 10) {
    await grantTitle(userId, 'checkin_10', '🌸 花卉观察员');
  }
};

// 检查并授予单条打卡获赞≥50称号
const checkLikes50Title = async (userId) => {
  const [checkins] = await pool.execute(
    'SELECT * FROM checkins WHERE user_id = ? AND likes_count >= 50 AND audit_status = ?',
    [userId, 'approved']
  );
  
  if (checkins.length > 0) {
    await grantTitle(userId, 'likes_50', '📸 最美摄影师');
  }
};

// 检查并授予探花使称号
const checkPioneerTitle = async (userId) => {
  const [honors] = await pool.execute(
    'SELECT * FROM pioneer_honors WHERE user_id = ?',
    [userId]
  );
  
  if (honors.length > 0) {
    await grantTitle(userId, 'pioneer', '🔍 探花使');
  }
};

// 授予称号
const grantTitle = async (userId, titleKey, titleName) => {
  try {
    await pool.execute(
      'INSERT INTO titles (user_id, title_key, title_name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE title_key = title_key',
      [userId, titleKey, titleName]
    );
  } catch (error) {
    // 唯一键冲突，说明已经授予过该称号，忽略错误
    if (error.code !== 'ER_DUP_ENTRY') {
      console.error('Grant title error:', error);
    }
  }
};

module.exports = {
  checkTitles,
  checkPioneerTitle
};
