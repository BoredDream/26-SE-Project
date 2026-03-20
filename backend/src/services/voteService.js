const pool = require('../config/database');
const redis = require('../config/redis');

// 基于用户报告自动更新花期状态
const updateBloomStatusByVote = async (locationId) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 查询24小时内的花期报告
    const [reports] = await pool.execute(
      `SELECT bloom_report, COUNT(*) AS cnt FROM checkins
       WHERE location_id=? AND bloom_report IS NOT NULL
       AND audit_status='approved' AND created_at>?
       GROUP BY bloom_report`,
      [locationId, since]
    );
    
    const total = reports.reduce((s, r) => s + r.cnt, 0);
    
    for (const r of reports) {
      // 条件：至少3条报告 且 占比≥60%
      if (r.cnt >= 3 && r.cnt / total >= 0.6) {
        // 更新花期状态
        await pool.execute(
          'UPDATE locations SET bloom_status=?, status_updated_at=NOW() WHERE id=?',
          [r.bloom_report, locationId]
        );
        
        // 若变为盛开，通知订阅者
        if (r.bloom_report === 'blooming') {
          await notifySubscribers(locationId);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Update bloom status by vote error:', error);
  }
};

// 通知订阅者
const notifySubscribers = async (locationId) => {
  try {
    // 获取地点信息
    const [locations] = await pool.execute('SELECT * FROM locations WHERE id = ?', [locationId]);
    if (locations.length === 0) return;
    
    const location = locations[0];
    const year = new Date().getFullYear();
    const redisKey = `notify:${locationId}:${year}`;
    
    // 检查是否已经推送过
    const hasPushed = await redis.get(redisKey);
    if (hasPushed) return;
    
    // 获取订阅者列表
    const [subscribers] = await pool.execute(
      'SELECT u.* FROM users u JOIN subscriptions s ON u.id = s.user_id WHERE s.location_id = ?',
      [locationId]
    );
    
    // TODO: 实现微信订阅消息推送
    console.log(`通知 ${subscribers.length} 个订阅者，地点 ${location.name} 已盛开`);
    
    // 标记为已推送
    await redis.set(redisKey, '1', 'EX', 365 * 24 * 60 * 60); // 有效期1年
  } catch (error) {
    console.error('Notify subscribers error:', error);
  }
};

module.exports = {
  updateBloomStatusByVote
};
