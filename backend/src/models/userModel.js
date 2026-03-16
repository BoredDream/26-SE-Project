const { pool } = require('../config/db');

class UserModel {
  // 根据 openid 查询用户
  static async findByOpenid(openid) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );
    return rows[0] || null;
  }

  // 根据 id 查询用户
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // 创建用户
  static async create(openid, nickname = '', avatar_url = null, role = 'user') {
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickname, avatar_url, role) VALUES (?, ?, ?, ?)',
      [openid, nickname, avatar_url, role]
    );
    return result.insertId;
  }

  // 更新用户信息
  static async update(id, data) {
    // 过滤掉 undefined 值，将其转换为 null
    const filteredData = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        filteredData[key] = data[key] === undefined ? null : data[key];
      }
    }
    
    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await pool.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  // 获取用户统计信息
  static async getStats(userId) {
    const [checkinStats] = await pool.execute(
      'SELECT COUNT(*) as checkin_count FROM checkins WHERE user_id = ? AND is_visible = 1',
      [userId]
    );
    
    const [likeStats] = await pool.execute(
      'SELECT COUNT(*) as likes_received FROM checkins WHERE user_id = ? AND is_visible = 1',
      [userId]
    );
    
    const [achievementStats] = await pool.execute(
      'SELECT COUNT(*) as achievement_count FROM achievements WHERE user_id = ?',
      [userId]
    );
    
    return {
      checkin_count: checkinStats[0].checkin_count,
      likes_received: likeStats[0].likes_received,
      achievement_count: achievementStats[0].achievement_count,
    };
  }
}

module.exports = UserModel;
