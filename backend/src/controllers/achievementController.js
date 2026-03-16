const AchievementModel = require('../models/achievementModel');

class AchievementController {
  // 获取用户的成就列表
  static async getMyAchievements(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取成就列表
      const achievements = await AchievementModel.getByUserId(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: achievements,
          total: achievements.length,
        },
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户的成就统计
  static async getAchievementStats(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取成就统计
      const stats = await AchievementModel.getStats(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: stats,
      });
    } catch (error) {
      console.error('Get achievement stats error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户在特定地点的成就
  static async getAchievementByLocation(req, res) {
    try {
      const userId = req.user.id;
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 获取地点成就
      const achievement = await AchievementModel.getByUserIdAndLocationId(
        userId, 
        parseInt(locationId)
      );
      
      res.json({
        code: 0,
        message: '获取成功',
        data: achievement,
      });
    } catch (error) {
      console.error('Get achievement by location error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 查看他人花圃
  static async getOthersAchievements(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 获取用户成就列表
      const achievements = await AchievementModel.getByUserId(parseInt(id));
      
      // 获取用户统计信息
      const stats = await AchievementModel.getStats(parseInt(id));
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: achievements,
          total: achievements.length,
          stats,
        },
      });
    } catch (error) {
      console.error('Get others achievements error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }
}

module.exports = AchievementController;
