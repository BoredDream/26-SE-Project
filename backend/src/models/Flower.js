const pool = require('../config/database');

class Flower {
  // 创建花卉
  static async create(name, scientific_name = null, description = null, blooming_season = null, image_url = null) {
    const [result] = await pool.execute(
      'INSERT INTO flowers (name, scientific_name, description, blooming_season, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, scientific_name, description, blooming_season, image_url]
    );
    return result.insertId;
  }

  // 根据ID获取花卉
  static async getById(id) {
    const [flowers] = await pool.execute('SELECT * FROM flowers WHERE id = ?', [id]);
    return flowers.length > 0 ? flowers[0] : null;
  }

  // 获取所有花卉
  static async getAll() {
    const [flowers] = await pool.execute('SELECT * FROM flowers ORDER BY name ASC');
    return flowers;
  }

  // 根据名称搜索花卉
  static async search(name) {
    const [flowers] = await pool.execute(
      'SELECT * FROM flowers WHERE name LIKE ? OR scientific_name LIKE ? ORDER BY name ASC',
      [`%${name}%`, `%${name}%`]
    );
    return flowers;
  }

  // 更新花卉信息
  static async update(id, updates) {
    const fields = [];
    const params = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    
    if (updates.scientific_name !== undefined) {
      fields.push('scientific_name = ?');
      params.push(updates.scientific_name);
    }
    
    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }
    
    if (updates.blooming_season !== undefined) {
      fields.push('blooming_season = ?');
      params.push(updates.blooming_season);
    }
    
    if (updates.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(updates.image_url);
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE flowers SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.affectedRows > 0;
  }

  // 删除花卉
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM flowers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Flower;