const db = require('../config/database');

class Location {
  static async findAll(params = {}) {
    let query = 'SELECT * FROM locations';
    const conditions = [];
    const values = [];
    
    // 花期状态筛选
    if (params.status) {
      conditions.push('bloom_status = ?');
      values.push(params.status);
    }
    
    // 关键词搜索
    if (params.keyword) {
      conditions.push('(name LIKE ? OR flower_species LIKE ? OR description LIKE ?)');
      const keyword = `%${params.keyword}%`;
      values.push(keyword, keyword, keyword);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [locations] = await db.query(query, values);
    return locations;
  }

  static async findById(id) {
    const [locations] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
    return locations[0] || null;
  }

  static async create(data) {
    const { name, description, latitude, longitude, flower_species, flower_species_en, historical_bloom_start, historical_bloom_end, cover_image } = data;
    
    const [result] = await db.query(
      'INSERT INTO locations (name, description, latitude, longitude, flower_species, flower_species_en, historical_bloom_start, historical_bloom_end, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, latitude, longitude, flower_species, flower_species_en, historical_bloom_start, historical_bloom_end, cover_image]
    );
    
    return result.insertId;
  }

  static async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.query(
      `UPDATE locations SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  static async updateBloomStatus(id, status) {
    await db.query(
      'UPDATE locations SET bloom_status = ?, status_updated_at = NOW() WHERE id = ?',
      [status, id]
    );
  }

  static async incrementCheckinCount(id) {
    await db.query(
      'UPDATE locations SET checkin_count = checkin_count + 1 WHERE id = ?',
      [id]
    );
  }

  static async getHeatmapData() {
    const [locations] = await db.query('SELECT latitude, longitude, checkin_count FROM locations');
    return locations;
  }
}

module.exports = Location;