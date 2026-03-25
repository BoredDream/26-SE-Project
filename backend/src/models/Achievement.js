const pool = require('../config/database');

class Achievement {
  // 获取所有成就
  static async getAll() {
    const [achievements] = await pool.execute('SELECT * FROM achievements ORDER BY id ASC');
    return achievements;
  }

  // 根据ID获取成就
  static async getById(id) {
    const [achievements] = await pool.execute('SELECT * FROM achievements WHERE id = ?', [id]);
    return achievements.length > 0 ? achievements[0] : null;
  }

  // 获取用户已解锁的成就
  static async getUnlockedByUserId(user_id) {
    const [achievements] = await pool.execute(`
      SELECT a.*, ua.unlocked_at
      FROM achievements a
      JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
    `, [user_id]);
    return achievements;
  }

  // 获取用户未解锁的成就
  static async getLockedByUserId(user_id) {
    const [achievements] = await pool.execute(`
      SELECT a.*
      FROM achievements a
      WHERE a.id NOT IN (
        SELECT ua.achievement_id
        FROM user_achievements ua
        WHERE ua.user_id = ?
      )
      ORDER BY a.id ASC
    `, [user_id]);
    return achievements;
  }

  // 解锁成就
  static async unlock(user_id, achievement_id) {
    const [result] = await pool.execute(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
      [user_id, achievement_id]
    );
    return result.insertId;
  }

  // 检查用户是否已解锁成就
  static async isUnlocked(user_id, achievement_id) {
    const [achievements] = await pool.execute(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [user_id, achievement_id]
    );
    return achievements.length > 0;
  }
}

module.exports = Achievement;