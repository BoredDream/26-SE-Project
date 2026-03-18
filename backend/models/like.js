const db = require('../config/database');

class Like {
  static async create(user_id, checkin_id) {
    try {
      const [result] = await db.query(
        'INSERT INTO likes (user_id, checkin_id) VALUES (?, ?)',
        [user_id, checkin_id]
      );
      return result.insertId;
    } catch (error) {
      // 忽略唯一键冲突错误（幂等操作）
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }

  static async findByUserAndCheckin(user_id, checkin_id) {
    const [likes] = await db.query(
      'SELECT * FROM likes WHERE user_id = ? AND checkin_id = ?',
      [user_id, checkin_id]
    );
    return likes[0] || null;
  }

  static async delete(user_id, checkin_id) {
    await db.query(
      'DELETE FROM likes WHERE user_id = ? AND checkin_id = ?',
      [user_id, checkin_id]
    );
  }

  static async getLikesCount(checkin_id) {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM likes WHERE checkin_id = ?',
      [checkin_id]
    );
    return result[0].count;
  }

  static async getCheckinLikes(checkin_id) {
    const [likes] = await db.query(
      'SELECT * FROM likes WHERE checkin_id = ?',
      [checkin_id]
    );
    return likes;
  }
}

module.exports = Like;