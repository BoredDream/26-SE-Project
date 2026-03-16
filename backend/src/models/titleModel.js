const { pool } = require('../config/db');

class TitleModel {
  // 授予称号
  static async grant(data) {
    const { 
      user_id, 
      title_key, 
      earned_at = new Date()
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO titles (user_id, title_key, earned_at) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       earned_at = VALUES(earned_at)`,
      [user_id, title_key, earned_at]
    );
    
    return result.insertId;
  }

  // 获取用户的称号列表
  static async getByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM titles WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );
    return rows;
  }

  // 检查用户是否拥有特定称号
  static async hasTitle(userId, titleKey) {
    const [rows] = await pool.execute(
      'SELECT * FROM titles WHERE user_id = ? AND title_key = ?',
      [userId, titleKey]
    );
    return rows.length > 0;
  }

  // 设置用户当前佩戴的称号
  static async setActiveTitle(userId, titleKey) {
    // 先将所有称号设置为非活跃
    await pool.execute(
      'UPDATE user_titles SET is_active = 0 WHERE user_id = ?',
      [userId]
    );
    
    // 然后将指定称号设置为活跃
    const [result] = await pool.execute(
      `INSERT INTO user_titles (user_id, title_key, is_active) 
       VALUES (?, ?, 1) 
       ON DUPLICATE KEY UPDATE 
       is_active = 1`,
      [userId, titleKey]
    );
    
    return result.affectedRows > 0;
  }

  // 获取用户当前佩戴的称号
  static async getActiveTitle(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_titles WHERE user_id = ? AND is_active = 1',
      [userId]
    );
    return rows[0] || null;
  }
}

module.exports = TitleModel;
