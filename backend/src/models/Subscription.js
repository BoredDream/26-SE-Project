const pool = require('../config/database');

class Subscription {
  // 创建订阅
  static async create(user_id, flower_place_id) {
    const [result] = await pool.execute(
      'INSERT INTO subscriptions (user_id, flower_place_id) VALUES (?, ?)',
      [user_id, flower_place_id]
    );
    return result.insertId;
  }

  // 获取用户的所有订阅
  static async getByUserId(user_id) {
    const [subscriptions] = await pool.execute(`
      SELECT s.*, f.name as flower_name, p.name as place_name, p.latitude, p.longitude, fp.bloom_status
      FROM subscriptions s
      JOIN flower_places fp ON s.flower_place_id = fp.id
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [user_id]);
    return subscriptions;
  }

  // 检查用户是否已订阅
  static async isSubscribed(user_id, flower_place_id) {
    const [subscriptions] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? AND flower_place_id = ?',
      [user_id, flower_place_id]
    );
    return subscriptions.length > 0;
  }

  // 删除订阅
  static async delete(user_id, flower_place_id) {
    const [result] = await pool.execute(
      'DELETE FROM subscriptions WHERE user_id = ? AND flower_place_id = ?',
      [user_id, flower_place_id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Subscription;