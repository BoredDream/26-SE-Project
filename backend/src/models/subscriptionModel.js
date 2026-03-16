const { pool } = require('../config/db');

class SubscriptionModel {
  // 订阅地点
  static async subscribe(userId, locationId) {
    const [result] = await pool.execute(
      'INSERT IGNORE INTO subscriptions (user_id, location_id) VALUES (?, ?)',
      [userId, locationId]
    );
    return result.affectedRows > 0;
  }

  // 取消订阅
  static async unsubscribe(userId, locationId) {
    const [result] = await pool.execute(
      'DELETE FROM subscriptions WHERE user_id = ? AND location_id = ?',
      [userId, locationId]
    );
    return result.affectedRows > 0;
  }

  // 检查是否已订阅
  static async isSubscribed(userId, locationId) {
    const [rows] = await pool.execute(
      'SELECT * FROM subscriptions WHERE user_id = ? AND location_id = ?',
      [userId, locationId]
    );
    return rows.length > 0;
  }

  // 获取用户的订阅列表
  static async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT l.*, s.created_at as subscribed_at FROM locations l 
       LEFT JOIN subscriptions s ON l.id = s.location_id 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // 获取地点的订阅用户列表
  static async getByLocationId(locationId) {
    const [rows] = await pool.execute(
      `SELECT u.*, s.created_at as subscribed_at FROM users u 
       LEFT JOIN subscriptions s ON u.id = s.user_id 
       WHERE s.location_id = ?`,
      [locationId]
    );
    return rows;
  }
}

module.exports = SubscriptionModel;
