const { pool } = require('../config/db');

class CheckinModel {
  // 创建打卡记录
  static async create(data) {
    const { 
      user_id, 
      location_id, 
      bloom_report = null, 
      content = null, 
      images = null, 
      user_latitude = null, 
      user_longitude = null, 
      gps_verified = 0
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO checkins (
        user_id, location_id, bloom_report, content, images, 
        user_latitude, user_longitude, gps_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, location_id, bloom_report, content, JSON.stringify(images), 
        user_latitude, user_longitude, gps_verified
      ]
    );
    
    return result.insertId;
  }

  // 根据 id 查询打卡记录
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM checkins WHERE id = ?',
      [id]
    );
    
    if (rows[0]) {
      rows[0].images = JSON.parse(rows[0].images || '[]');
    }
    
    return rows[0] || null;
  }

  // 获取地点的打卡记录列表
  static async getByLocationId(locationId, params = {}) {
    const { page = 1, limit = 10, status = 'approved' } = params;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT c.*, u.nickname, u.avatar_url FROM checkins c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.location_id = ? AND c.is_visible = 1 AND c.audit_status = ? 
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [locationId, status, limit, offset]
    );
    
    // 解析 JSON 字段
    rows.forEach(row => {
      row.images = JSON.parse(row.images || '[]');
    });
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE location_id = ? AND is_visible = 1 AND audit_status = ?',
      [locationId, status]
    );
    
    return {
      list: rows,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  // 获取用户的打卡记录
  static async getByUserId(userId, params = {}) {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT c.*, l.name as location_name, l.flower_species FROM checkins c 
       LEFT JOIN locations l ON c.location_id = l.id 
       WHERE c.user_id = ? AND c.is_visible = 1 
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // 解析 JSON 字段
    rows.forEach(row => {
      row.images = JSON.parse(row.images || '[]');
    });
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE user_id = ? AND is_visible = 1',
      [userId]
    );
    
    return {
      list: rows,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  // 审核打卡记录
  static async audit(id, status, reason = null) {
    await pool.execute(
      'UPDATE checkins SET audit_status = ?, audit_reason = ? WHERE id = ?',
      [status, reason, id]
    );
  }

  // 点赞打卡记录
  static async like(checkinId) {
    await pool.execute(
      'UPDATE checkins SET likes_count = likes_count + 1 WHERE id = ?',
      [checkinId]
    );
  }

  // 取消点赞
  static async unlike(checkinId) {
    await pool.execute(
      'UPDATE checkins SET likes_count = likes_count - 1 WHERE id = ? AND likes_count > 0',
      [checkinId]
    );
  }

  // 获取地点最近的打卡记录，用于更新花期状态
  static async getRecentByLocationId(locationId, hours = 24, limit = 10) {
    const [rows] = await pool.execute(
      `SELECT * FROM checkins 
       WHERE location_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR) 
       AND bloom_report IS NOT NULL AND is_visible = 1 AND audit_status = 'approved' 
       ORDER BY created_at DESC LIMIT ?`,
      [locationId, hours, limit]
    );
    
    return rows;
  }

  // 统计用户打卡次数
  static async countByUserId(userId) {
    const [result] = await pool.execute(
      "SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND is_visible = 1 AND audit_status = 'approved'",
      [userId]
    );
    
    return result[0].count;
  }

  // 获取待审核的打卡记录
  static async getPendingCheckins(params = {}) {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT c.*, u.nickname, u.avatar_url FROM checkins c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.audit_status = 'pending' 
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // 解析 JSON 字段
    rows.forEach(row => {
      row.images = JSON.parse(row.images || '[]');
    });
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE audit_status = "pending"'
    );
    
    return {
      list: rows,
      total: countResult[0].total,
      page,
      limit,
    };
  }
}

module.exports = CheckinModel;
