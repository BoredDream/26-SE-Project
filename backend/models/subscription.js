const db = require('../config/database');

class Subscription {
  static async create(user_id, location_id) {
    try {
      const [result] = await db.query(
        'INSERT INTO subscriptions (user_id, location_id) VALUES (?, ?)',
        [user_id, location_id]
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

  static async findByUserAndLocation(user_id, location_id) {
    const [subscriptions] = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ? AND location_id = ?',
      [user_id, location_id]
    );
    return subscriptions[0] || null;
  }

  static async findByUserId(user_id) {
    const [subscriptions] = await db.query(
      'SELECT s.*, l.* FROM subscriptions s JOIN locations l ON s.location_id = l.id WHERE s.user_id = ?',
      [user_id]
    );
    return subscriptions;
  }

  static async delete(user_id, location_id) {
    await db.query(
      'DELETE FROM subscriptions WHERE user_id = ? AND location_id = ?',
      [user_id, location_id]
    );
  }

  static async getSubscribers(location_id) {
    const [users] = await db.query(
      'SELECT u.* FROM subscriptions s JOIN users u ON s.user_id = u.id WHERE s.location_id = ?',
      [location_id]
    );
    return users;
  }
}

module.exports = Subscription;