const db = require('../config/database');

class User {
  static async findByOpenid(openid) {
    const [users] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
    return users[0] || null;
  }

  static async findById(id) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }

  static async create(openid, nickname = '', avatar_url = null) {
    const [result] = await db.query(
      'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
      [openid, nickname, avatar_url]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  static async getCheckinCount(userId) {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND audit_status = ?',
      [userId, 'approved']
    );
    return result[0].count;
  }
}

module.exports = User;