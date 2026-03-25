const pool = require('../config/database');

class FlowerPlace {
  // 创建花卉地点关联
  static async create(flower_id, place_id, bloom_status = 'not_blooming') {
    const [result] = await pool.execute(
      'INSERT INTO flower_places (flower_id, place_id, bloom_status) VALUES (?, ?, ?)',
      [flower_id, place_id, bloom_status]
    );
    return result.insertId;
  }

  // 根据ID获取花卉地点关联
  static async getById(id) {
    const [flowerPlaces] = await pool.execute(`
      SELECT fp.*, f.name as flower_name, p.name as place_name, p.latitude, p.longitude
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.id = ?
    `, [id]);
    return flowerPlaces.length > 0 ? flowerPlaces[0] : null;
  }

  // 获取所有花卉地点关联
  static async getAll() {
    const [flowerPlaces] = await pool.execute(`
      SELECT fp.*, f.name as flower_name, p.name as place_name, p.latitude, p.longitude
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      ORDER BY fp.created_at DESC
    `);
    return flowerPlaces;
  }

  // 根据花卉ID获取关联地点
  static async getByFlowerId(flower_id) {
    const [flowerPlaces] = await pool.execute(`
      SELECT fp.*, f.name as flower_name, p.name as place_name, p.latitude, p.longitude
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.flower_id = ?
      ORDER BY fp.created_at DESC
    `, [flower_id]);
    return flowerPlaces;
  }

  // 根据地点ID获取关联花卉
  static async getByPlaceId(place_id) {
    const [flowerPlaces] = await pool.execute(`
      SELECT fp.*, f.name as flower_name, p.name as place_name, p.latitude, p.longitude
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.place_id = ?
      ORDER BY fp.created_at DESC
    `, [place_id]);
    return flowerPlaces;
  }

  // 更新花卉地点关联信息
  static async update(id, updates) {
    const fields = [];
    const params = [];
    
    if (updates.bloom_status !== undefined) {
      fields.push('bloom_status = ?');
      params.push(updates.bloom_status);
      fields.push('last_bloom_report = CURRENT_TIMESTAMP');
    }
    
    if (fields.length === 0) {
      return false;
    }
    
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE flower_places SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    
    return result.affectedRows > 0;
  }

  // 删除花卉地点关联
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM flower_places WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // 根据花卉ID和地点ID获取关联
  static async getByFlowerAndPlace(flower_id, place_id) {
    const [flowerPlaces] = await pool.execute(
      'SELECT * FROM flower_places WHERE flower_id = ? AND place_id = ?',
      [flower_id, place_id]
    );
    return flowerPlaces.length > 0 ? flowerPlaces[0] : null;
  }
}

module.exports = FlowerPlace;