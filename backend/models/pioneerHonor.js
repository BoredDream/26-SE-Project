const db = require('../config/database');

class PioneerHonor {
  static async findByLocationAndSeason(location_id, bloom_season) {
    const [honors] = await db.query(
      'SELECT * FROM pioneer_honors WHERE location_id = ? AND bloom_season = ?',
      [location_id, bloom_season]
    );
    return honors[0] || null;
  }

  static async findByUserId(user_id) {
    const [honors] = await db.query(
      'SELECT p.*, l.* FROM pioneer_honors p JOIN locations l ON p.location_id = l.id WHERE p.user_id = ?',
      [user_id]
    );
    return honors;
  }

  static async create(user_id, location_id, bloom_season, checkin_id) {
    try {
      const [result] = await db.query(
        'INSERT INTO pioneer_honors (user_id, location_id, bloom_season, checkin_id) VALUES (?, ?, ?, ?)',
        [user_id, location_id, bloom_season, checkin_id]
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

module.exports = PioneerHonor;