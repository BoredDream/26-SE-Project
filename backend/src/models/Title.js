const pool = require('../config/database');

class Title {
  // 获取所有头衔
  static async getAll() {
    const [titles] = await pool.execute('SELECT * FROM titles ORDER BY required_points ASC');
    return titles;
  }

  // 根据ID获取头衔
  static async getById(id) {
    const [titles] = await pool.execute('SELECT * FROM titles WHERE id = ?', [id]);
    return titles.length > 0 ? titles[0] : null;
  }

  // 获取用户已获得的头衔
  static async getObtainedByUserId(user_id) {
    const [titles] = await pool.execute(`
      SELECT t.*, ut.obtained_at, ut.is_current
      FROM titles t
      JOIN user_titles ut ON t.id = ut.title_id
      WHERE ut.user_id = ?
      ORDER BY ut.obtained_at DESC
    `, [user_id]);
    return titles;
  }

  // 获取用户当前使用的头衔
  static async getCurrentByUserId(user_id) {
    const [titles] = await pool.execute(`
      SELECT t.*, ut.obtained_at
      FROM titles t
      JOIN user_titles ut ON t.id = ut.title_id
      WHERE ut.user_id = ? AND ut.is_current = true
    `, [user_id]);
    return titles.length > 0 ? titles[0] : null;
  }

  // 授予用户头衔
  static async grant(user_id, title_id) {
    const [result] = await pool.execute(
      'INSERT INTO user_titles (user_id, title_id) VALUES (?, ?)',
      [user_id, title_id]
    );
    return result.insertId;
  }

  // 设置用户当前使用的头衔
  static async setCurrent(user_id, title_id) {
    // 首先将所有头衔设置为非当前
    await pool.execute(
      'UPDATE user_titles SET is_current = false WHERE user_id = ?',
      [user_id]
    );
    
    // 然后将指定头衔设置为当前
    const [result] = await pool.execute(
      'UPDATE user_titles SET is_current = true WHERE user_id = ? AND title_id = ?',
      [user_id, title_id]
    );
    
    return result.affectedRows > 0;
  }

  // 检查用户是否已获得头衔
  static async hasObtained(user_id, title_id) {
    const [titles] = await pool.execute(
      'SELECT * FROM user_titles WHERE user_id = ? AND title_id = ?',
      [user_id, title_id]
    );
    return titles.length > 0;
  }
}

module.exports = Title;