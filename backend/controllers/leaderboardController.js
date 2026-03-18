const db = require('../config/database');
const Checkin = require('../models/checkin');
const Location = require('../models/location');
const { formatResponse } = require('../utils/helpers');

class LeaderboardController {
  // 获取打卡王榜
  static async getCheckinLeaderboard(req, res) {
    const { month } = req.query;
    
    try {
      let query;
      let params;
      
      if (month) {
        // 按指定月份查询
        const year = month.split('-')[0];
        const monthNum = month.split('-')[1];
        query = `
          SELECT u.id, u.nickname, u.avatar_url, COUNT(c.id) as checkin_count
          FROM users u
          JOIN checkins c ON u.id = c.user_id
          WHERE YEAR(c.created_at) = ? AND MONTH(c.created_at) = ? AND c.audit_status = 'approved'
          GROUP BY u.id
          ORDER BY checkin_count DESC
          LIMIT 20
        `;
        params = [year, monthNum];
      } else {
        // 按当前月份查询
        query = `
          SELECT u.id, u.nickname, u.avatar_url, COUNT(c.id) as checkin_count
          FROM users u
          JOIN checkins c ON u.id = c.user_id
          WHERE YEAR(c.created_at) = YEAR(NOW()) AND MONTH(c.created_at) = MONTH(NOW()) AND c.audit_status = 'approved'
          GROUP BY u.id
          ORDER BY checkin_count DESC
          LIMIT 20
        `;
        params = [];
      }
      
      const [leaders] = await db.query(query, params);
      
      return res.json(formatResponse(0, '获取成功', leaders));
      
    } catch (error) {
      console.error('获取打卡王榜失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取点赞榜
  static async getLikesLeaderboard(req, res) {
    try {
      // 获取获赞最多的打卡内容（前20条）
      const checkins = await Checkin.getTopLikedCheckins(20);
      
      // 为每条打卡记录添加用户信息
      const leaderboard = await Promise.all(
        checkins.map(async (checkin) => {
          const [users] = await db.query('SELECT id, nickname, avatar_url FROM users WHERE id = ?', [checkin.user_id]);
          return {
            ...checkin,
            user: users[0]
          };
        })
      );
      
      return res.json(formatResponse(0, '获取成功', leaderboard));
      
    } catch (error) {
      console.error('获取点赞榜失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取地图热力数据
  static async getHeatmapData(req, res) {
    try {
      const locations = await Location.getHeatmapData();
      
      // 转换为前端需要的热力图格式
      const heatmapData = locations.map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
        intensity: Math.min(location.checkin_count / 100, 1) // 归一化到 0-1 范围
      }));
      
      return res.json(formatResponse(0, '获取成功', heatmapData));
      
    } catch (error) {
      console.error('获取热力数据失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = LeaderboardController;