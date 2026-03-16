const { pool } = require('../config/db');

class AchievementModel {
  // 创建或更新成就
  static async createOrUpdate(data) {
    const { 
      user_id, 
      flower_species, 
      location_id, 
      grade = 'silver', 
      unlock_time = new Date()
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO achievements (user_id, flower_species, location_id, grade, unlock_time) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       grade = VALUES(grade), 
       unlock_time = VALUES(unlock_time)`,
      [user_id, flower_species, location_id, grade, unlock_time]
    );
    
    return result.insertId;
  }

  // 获取用户的成就列表
  static async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT a.*, l.name as location_name FROM achievements a 
       LEFT JOIN locations l ON a.location_id = l.id 
       WHERE a.user_id = ? 
       ORDER BY a.unlock_time DESC`,
      [userId]
    );
    return rows;
  }

  // 获取用户在特定地点的成就
  static async getByUserIdAndLocationId(userId, locationId) {
    const [rows] = await pool.execute(
      'SELECT * FROM achievements WHERE user_id = ? AND location_id = ?',
      [userId, locationId]
    );
    return rows[0] || null;
  }

  // 获取用户的成就统计
  static async getStats(userId) {
    const [result] = await pool.execute(
      `SELECT 
        COUNT(*) as total, 
        SUM(CASE WHEN grade = 'gold' THEN 1 ELSE 0 END) as gold_count, 
        SUM(CASE WHEN grade = 'silver' THEN 1 ELSE 0 END) as silver_count 
       FROM achievements 
       WHERE user_id = ?`,
      [userId]
    );
    return result[0];
  }
}

module.exports = AchievementModel;
