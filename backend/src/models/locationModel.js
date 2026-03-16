const { pool } = require('../config/db');

class LocationModel {
  // 获取所有地点列表
  static async getAll(params = {}) {
    // 严格验证和转换参数类型
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    const search = params.search || '';
    const bloom_status = params.bloom_status || null;
    
    // 确保分页参数有效
    const validPage = Math.max(1, isNaN(page) ? 1 : page);
    const validLimit = Math.max(1, Math.min(100, isNaN(limit) ? 20 : limit)); // 限制最大每页数量为 100
    const offset = (validPage - 1) * validLimit;
    
    let query = 'SELECT * FROM locations WHERE 1=1';
    const values = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR flower_species LIKE ?)';
      values.push(`%${search}%`, `%${search}%`);
    }
    
    if (bloom_status) {
      query += ' AND bloom_status = ?';
      values.push(bloom_status);
    }
    
    // 将分页参数直接拼接到 SQL 中，避免参数类型问题
    query += ` ORDER BY created_at DESC LIMIT ${validLimit} OFFSET ${offset}`;
    
    // 调试信息
    console.log('LocationModel.getAll params:', params);
    console.log('LocationModel.getAll parsed values:', { page, limit, search, bloom_status });
    console.log('LocationModel.getAll valid values:', { validPage, validLimit, offset });
    console.log('LocationModel.getAll SQL query:', query);
    console.log('LocationModel.getAll SQL values:', values);
    
    const [rows] = await pool.execute(query, values);
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM locations WHERE 1=1' + 
      (search ? ' AND (name LIKE ? OR flower_species LIKE ?)' : '') + 
      (bloom_status ? ' AND bloom_status = ?' : ''),
      search ? [`%${search}%`, `%${search}%`, ...(bloom_status ? [bloom_status] : [])] : (bloom_status ? [bloom_status] : [])
    );
    
    return {
      list: rows,
      total: countResult[0].total,
      page: validPage,
      limit: validLimit,
    };
  }

  // 根据 id 查询地点
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM locations WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // 创建地点
  static async create(data) {
    const { 
      name, 
      description = null, 
      latitude, 
      longitude, 
      flower_species, 
      flower_species_en = null, 
      bloom_status = 'dormant', 
      historical_bloom_start = null, 
      historical_bloom_end = null, 
      cover_image = null
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO locations (
        name, description, latitude, longitude, flower_species, flower_species_en, 
        bloom_status, historical_bloom_start, historical_bloom_end, cover_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, latitude, longitude, flower_species, flower_species_en, 
        bloom_status, historical_bloom_start, historical_bloom_end, cover_image
      ]
    );
    
    return result.insertId;
  }

  // 更新地点信息
  static async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await pool.execute(
      `UPDATE locations SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  // 更新花期状态
  static async updateBloomStatus(id, bloom_status) {
    await pool.execute(
      'UPDATE locations SET bloom_status = ?, status_updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [bloom_status, id]
    );
  }

  // 增加打卡计数
  static async incrementCheckinCount(id) {
    await pool.execute(
      'UPDATE locations SET checkin_count = checkin_count + 1 WHERE id = ?',
      [id]
    );
  }

  // 根据坐标获取附近地点
  static async getNearby(latitude, longitude, radius = 1000, limit = 20) {
    const [rows] = await pool.execute(
      `SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance 
      FROM locations 
      WHERE 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) < ? 
      ORDER BY distance ASC 
      LIMIT ?`,
      [latitude, longitude, latitude, latitude, longitude, latitude, radius / 1000, limit]
    );
    
    return rows;
  }
}

module.exports = LocationModel;
