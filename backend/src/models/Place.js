const pool = require('../config/database');

class Place {
  // 创建地点
  static async create(name, latitude, longitude, address = null) {
    const [result] = await pool.execute(
      'INSERT INTO places (name, latitude, longitude, address) VALUES (?, ?, ?, ?)',
      [name, latitude, longitude, address]
    );
    return result.insertId;
  }

  // 根据ID获取地点
  static async getById(id) {
    const [places] = await pool.execute('SELECT * FROM places WHERE id = ?', [id]);
    return places.length > 0 ? places[0] : null;
  }

  // 获取所有地点
  static async getAll() {
    const [places] = await pool.execute('SELECT * FROM places ORDER BY name ASC');
    return places;
  }

  // 更新地点信息
  static async update(id, updates) {
    const fields = [];
    const params = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    
    if (updates.latitude !== undefined) {
      fields.push('latitude = ?');
      params.push(updates.latitude);
    }
    
    if (updates.longitude !== undefined) {
      fields.push('longitude = ?');
      params.push(updates.longitude);
    }
    
    if (updates.address !== undefined) {
      fields.push('address = ?');
      params.push(updates.address);
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE places SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.affectedRows > 0;
  }

  // 更新打卡次数
  static async incrementCheckinCount(id) {
    const [result] = await pool.execute(
      'UPDATE places SET checkin_count = checkin_count + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 删除地点
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM places WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Place;