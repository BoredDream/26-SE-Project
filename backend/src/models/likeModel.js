const { pool } = require('../config/db');

class LikeModel {
  // 点赞打卡记录
  static async like(userId, checkinId) {
    const [result] = await pool.execute(
      'INSERT IGNORE INTO likes (user_id, checkin_id) VALUES (?, ?)',
      [userId, checkinId]
    );
    return result.affectedRows > 0;
  }

  // 取消点赞
  static async unlike(userId, checkinId) {
    const [result] = await pool.execute(
      'DELETE FROM likes WHERE user_id = ? AND checkin_id = ?',
      [userId, checkinId]
    );
    return result.affectedRows > 0;
  }

  // 检查是否已点赞
  static async isLiked(userId, checkinId) {
    const [rows] = await pool.execute(
      'SELECT * FROM likes WHERE user_id = ? AND checkin_id = ?',
      [userId, checkinId]
    );
    return rows.length > 0;
  }

  // 获取打卡记录的点赞用户列表
  static async getByCheckinId(checkinId) {
    const [rows] = await pool.execute(
      `SELECT u.* FROM users u 
       LEFT JOIN likes l ON u.id = l.user_id 
       WHERE l.checkin_id = ? 
       ORDER BY l.created_at DESC`,
      [checkinId]
    );
    return rows;
  }

  // 获取用户的点赞记录
  static async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT c.*, l.created_at as liked_at FROM checkins c 
       LEFT JOIN likes l ON c.id = l.checkin_id 
       WHERE l.user_id = ? 
       ORDER BY l.created_at DESC`,
      [userId]
    );
    
    // 解析 JSON 字段
    rows.forEach(row => {
      row.images = JSON.parse(row.images || '[]');
    });
    
    return rows;
  }
}

module.exports = LikeModel;
