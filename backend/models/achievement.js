const db = require('../config/database');

class Achievement {
  static async findByUserAndSpecies(user_id, flower_species) {
    const [achievements] = await db.query(
      'SELECT * FROM achievements WHERE user_id = ? AND flower_species = ?',
      [user_id, flower_species]
    );
    return achievements[0] || null;
  }

  static async findByUserId(user_id) {
    const [achievements] = await db.query(
      'SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    return achievements;
  }

  static async create(user_id, location_id, flower_species, grade, checkin_id) {
    try {
      const [result] = await db.query(
        'INSERT INTO achievements (user_id, location_id, flower_species, grade, checkin_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, location_id, flower_species, grade, checkin_id]
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

  static async updateGrade(id, grade) {
    await db.query(
      'UPDATE achievements SET grade = ? WHERE id = ?',
      [grade, id]
    );
  }

  static async getCheckinCountByUserAndSpecies(user_id, flower_species) {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND location_id IN (SELECT id FROM locations WHERE flower_species = ?) AND audit_status = ?',
      [user_id, flower_species, 'approved']
    );
    return result[0].count;
  }
}

module.exports = Achievement;