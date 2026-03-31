const pool = require('../config/database');

class User {
  // 创建用户
  static async create(openid, nickname, avatar_url = null, role = 'user') {
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickname, avatar_url, role) VALUES (?, ?, ?, ?)',
      [openid, nickname, avatar_url, role]
    );
    return result.insertId;
  }

  // 根据ID获取用户
  static async getById(id) {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return users.length > 0 ? users[0] : null;
  }

  // 根据openid获取用户
  static async getByOpenid(openid) {
    const [users] = await pool.execute('SELECT * FROM users WHERE openid = ?', [openid]);
    return users.length > 0 ? users[0] : null;
  }

  // 获取所有用户
  static async getAll(search = '') {
    let query = 'SELECT * FROM users';
    let params = [];
    
    if (search) {
      query += ' WHERE nickname LIKE ? OR openid LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await pool.execute(query, params);
    return users;
  }

  // 更新用户信息
  static async update(id, updates) {
    const fields = [];
    const params = [];
    
    if (updates.nickname !== undefined) {
      fields.push('nickname = ?');
      params.push(updates.nickname);
    }
    
    if (updates.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      params.push(updates.avatar_url);
    }
    
    if (updates.role !== undefined) {
      fields.push('role = ?');
      params.push(updates.role);
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.affectedRows > 0;
  }

  // 删除用户
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;