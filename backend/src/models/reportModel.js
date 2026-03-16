const { pool } = require('../config/db');

class ReportModel {
  // 创建举报记录
  static async create(data) {
    const { 
      user_id, 
      checkin_id, 
      reason, 
      description = ''
    } = data;
    
    const [result] = await pool.execute(
      `INSERT INTO reports (user_id, checkin_id, reason, description) 
       VALUES (?, ?, ?, ?)`,
      [user_id, checkin_id, reason, description]
    );
    
    return result.insertId;
  }

  // 获取待审核的举报列表
  static async getPending(params = {}) {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT r.*, u.nickname as reporter_name, u.avatar_url as reporter_avatar, 
              c.content as checkin_content, c.user_id as checkin_user_id 
       FROM reports r 
       LEFT JOIN users u ON r.user_id = u.id 
       LEFT JOIN checkins c ON r.checkin_id = c.id 
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // 获取总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM reports WHERE status = "pending"'
    );
    
    return {
      list: rows,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  // 处理举报
  static async handleReport(id, status, handle_note = '') {
    await pool.execute(
      `UPDATE reports SET status = ?, handle_note = ?, handled_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, handle_note, id]
    );
  }

  // 获取打卡记录的举报数量
  static async countByCheckinId(checkinId) {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM reports WHERE checkin_id = ?',
      [checkinId]
    );
    
    return result[0].count;
  }
}

module.exports = ReportModel;