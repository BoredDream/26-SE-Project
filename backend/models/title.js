const db = require('../config/database');

class Title {
  static async findByUserAndKey(user_id, title_key) {
    const [titles] = await db.query(
      'SELECT * FROM titles WHERE user_id = ? AND title_key = ?',
      [user_id, title_key]
    );
    return titles[0] || null;
  }

  static async findByUserId(user_id) {
    const [titles] = await db.query(
      'SELECT * FROM titles WHERE user_id = ? ORDER BY awarded_at DESC',
      [user_id]
    );
    return titles;
  }

  static async create(user_id, title_key, title_name) {
    try {
      const [result] = await db.query(
        'INSERT INTO titles (user_id, title_key, title_name) VALUES (?, ?, ?)',
        [user_id, title_key, title_name]
      );
      return result.insertId;
    } catch (error) {
      // 忽略唯一键冲突错误
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }
}

module.exports = Title;