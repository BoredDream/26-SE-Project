const pool = require('../config/database');
const redis = require('../config/redis');

// 基于用户报告自动更新花期状态
const updateBloomStatusByVote = async (locationId) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 查询24小时内的花期报告
    const [reports] = await pool.execute(
      `SELECT bloom_report, COUNT(*) AS cnt FROM checkins
       WHERE flower_place_id=? AND bloom_report IS NOT NULL
       AND audit_status='approved' AND created_at>?
       GROUP BY bloom_report`,
      [locationId, since]
    );
    
    const total = reports.reduce((s, r) => s + r.cnt, 0);
    
    for (const r of reports) {
      // 条件：至少3条报告 且 占比≥60%
      if (r.cnt >= 3 && r.cnt / total >= 0.6) {
        // 获取花卉ID
        const [flowerPlaces] = await pool.execute(
          'SELECT flower_id FROM flower_places WHERE id = ?',
          [locationId]
        );
        
        if (flowerPlaces.length === 0) break;
        
        const flowerId = flowerPlaces[0].flower_id;
        
        // 更新花期状态
        await pool.execute(
          'UPDATE flowers SET bloom_status=?, status_updated_at=NOW() WHERE id=?',
          [r.bloom_report, flowerId]
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
    // 获取花卉地点信息
    const [results] = await pool.execute(`
      SELECT fp.*, f.*, p.*
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.id = ?
    `, [locationId]);
    
    if (results.length === 0) return;
    
    const result = results[0];
    const year = new Date().getFullYear();
    const redisKey = `notify:${locationId}:${year}`;
    
    // 检查是否已经推送过
    const hasPushed = await redis.get(redisKey);
    if (hasPushed) return;
    
    // 获取订阅者列表
    const [subscribers] = await pool.execute(
      'SELECT u.* FROM users u JOIN subscriptions s ON u.id = s.user_id WHERE s.flower_place_id = ?',
      [locationId]
    );
    
    // TODO: 实现微信订阅消息推送
    console.log(`通知 ${subscribers.length} 个订阅者，地点 ${result.name} 已盛开`);
    
    // 标记为已推送
    await redis.set(redisKey, '1', 'EX', 365 * 24 * 60 * 60); // 有效期1年
  } catch (error) {
    console.error('Notify subscribers error:', error);
  }
};

module.exports = {
  updateBloomStatusByVote
};
