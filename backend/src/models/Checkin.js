const pool = require('../config/database');

class Checkin {
  // 创建打卡
  static async create(user_id, flower_place_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude) {
    const [result] = await pool.execute(
      'INSERT INTO checkins (user_id, flower_place_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, flower_place_id, bloom_report, content, JSON.stringify(images), gps_verified, user_latitude, user_longitude]
    );
    return result.insertId;
  }

  // 根据ID获取打卡详情
  static async getById(id) {
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url, fp.bloom_status, f.name as flower_name, p.name as place_name
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN flower_places fp ON c.flower_place_id = fp.id
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE c.id = ? AND c.is_visible = 1
    `, [id]);
    return checkins.length > 0 ? checkins[0] : null;
  }

  // 获取所有打卡（管理端）
  static async getAll() {
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins ORDER BY created_at DESC'
    );
    return checkins;
  }

  // 获取当前用户的打卡列表
  static async getByUserId(user_id, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [checkins] = await pool.execute(`
      SELECT c.*, fp.bloom_status, f.name as flower_name, p.name as place_name
      FROM checkins c
      JOIN flower_places fp ON c.flower_place_id = fp.id
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE c.user_id = ? AND c.is_visible = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [user_id, pageSize, offset]);
    
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE user_id = ? AND is_visible = 1',
      [user_id]
    );
    
    return {
      list: checkins,
      total: countResult[0].total
    };
  }

  // 获取某地点的打卡列表
  static async getByPlaceId(place_id, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url, f.name as flower_name
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN flower_places fp ON c.flower_place_id = fp.id
      JOIN flowers f ON fp.flower_id = f.id
      WHERE fp.place_id = ? AND c.is_visible = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [place_id, pageSize, offset]);
    
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM checkins c
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.place_id = ? AND c.is_visible = 1
    `, [place_id]);
    
    return {
      list: checkins,
      total: countResult[0].total
    };
  }

  // 获取某花卉的打卡列表
  static async getByFlowerId(flower_id, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url, p.name as place_name
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN flower_places fp ON c.flower_place_id = fp.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.flower_id = ? AND c.is_visible = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [flower_id, pageSize, offset]);
    
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM checkins c
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.flower_id = ? AND c.is_visible = 1
    `, [flower_id]);
    
    return {
      list: checkins,
      total: countResult[0].total
    };
  }

  // 更新打卡内容
  static async update(id, content, images) {
    const [result] = await pool.execute(
      'UPDATE checkins SET content = ?, images = ? WHERE id = ?',
      [content, JSON.stringify(images), id]
    );
    return result.affectedRows > 0;
  }

  // 删除打卡（软删除）
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE checkins SET is_visible = 0 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 点赞打卡
  static async like(id) {
    const [result] = await pool.execute(
      'UPDATE checkins SET likes_count = likes_count + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 检查用户是否点赞过
  static async hasLiked(checkin_id, user_id) {
    const [likes] = await pool.execute(
      'SELECT * FROM checkin_likes WHERE checkin_id = ? AND user_id = ?',
      [checkin_id, user_id]
    );
    return likes.length > 0;
  }

  // 添加点赞记录
  static async addLike(checkin_id, user_id) {
    const [result] = await pool.execute(
      'INSERT INTO checkin_likes (checkin_id, user_id) VALUES (?, ?)',
      [checkin_id, user_id]
    );
    return result.insertId;
  }

  // 举报打卡
  static async report(checkin_id, user_id, reason) {
    const [result] = await pool.execute(
      'INSERT INTO checkin_reports (checkin_id, user_id, reason) VALUES (?, ?, ?)',
      [checkin_id, user_id, reason]
    );
    return result.insertId;
  }
}

module.exports = Checkin;