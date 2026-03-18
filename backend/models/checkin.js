const db = require('../config/database');

class Checkin {
  static async create(data) {
    const { user_id, location_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude } = data;
    
    const [result] = await db.query(
      'INSERT INTO checkins (user_id, location_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, location_id, bloom_report, content, JSON.stringify(images), gps_verified, user_latitude, user_longitude]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const [checkins] = await db.query('SELECT * FROM checkins WHERE id = ?', [id]);
    if (checkins[0]) {
      checkins[0].images = JSON.parse(checkins[0].images);
    }
    return checkins[0] || null;
  }

  static async findByLocationId(location_id, params = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    const [checkins] = await db.query(
      'SELECT * FROM checkins WHERE location_id = ? AND audit_status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [location_id, 'approved', pageSize, offset]
    );
    
    return checkins.map(checkin => {
      checkin.images = JSON.parse(checkin.images);
      return checkin;
    });
  }

  static async findByUserId(user_id) {
    const [checkins] = await db.query(
      'SELECT * FROM checkins WHERE user_id = ? AND audit_status = ? ORDER BY created_at DESC',
      [user_id, 'approved']
    );
    
    return checkins.map(checkin => {
      checkin.images = JSON.parse(checkin.images);
      return checkin;
    });
  }

  static async updateAuditStatus(id, status, reason = null) {
    await db.query(
      'UPDATE checkins SET audit_status = ?, audit_reason = ? WHERE id = ?',
      [status, reason, id]
    );
  }

  static async incrementLikesCount(id) {
    await db.query(
      'UPDATE checkins SET likes_count = likes_count + 1 WHERE id = ?',
      [id]
    );
  }

  static async decrementLikesCount(id) {
    await db.query(
      'UPDATE checkins SET likes_count = likes_count - 1 WHERE id = ? AND likes_count > 0',
      [id]
    );
  }

  static async getRecentBloomReports(location_id, since) {
    const [reports] = await db.query(
      'SELECT bloom_report, COUNT(*) AS cnt FROM checkins WHERE location_id=? AND bloom_report IS NOT NULL AND audit_status=? AND created_at>? GROUP BY bloom_report',
      [location_id, 'approved', since]
    );
    return reports;
  }

  static async getMonthlyCheckinCount(userId, year, month) {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM checkins WHERE user_id = ? AND audit_status = ? AND YEAR(created_at) = ? AND MONTH(created_at) = ?',
      [userId, 'approved', year, month]
    );
    return result[0].count;
  }

  static async getTopLikedCheckins(limit = 20) {
    const [checkins] = await db.query(
      'SELECT * FROM checkins WHERE audit_status = ? ORDER BY likes_count DESC LIMIT ?',
      ['approved', limit]
    );
    
    return checkins.map(checkin => {
      checkin.images = JSON.parse(checkin.images);
      return checkin;
    });
  }
}

module.exports = Checkin;