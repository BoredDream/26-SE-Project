const Achievement = require('../models/achievement');
const Title = require('../models/title');
const User = require('../models/user');
const Checkin = require('../models/checkin');
const { formatResponse } = require('../utils/helpers');

class AchievementController {
  // 获取我的花圃（成就列表）
  static async getMyAchievements(req, res) {
    const userId = req.user.id;
    
    try {
      // 获取所有成就
      const achievements = await Achievement.findByUserId(userId);
      
      // 为每个成就添加打卡次数
      const achievementsWithCount = await Promise.all(
        achievements.map(async (achievement) => {
          const count = await Achievement.getCheckinCountByUserAndSpecies(userId, achievement.flower_species);
          return {
            ...achievement,
            checkin_count: count
          };
        })
      );
      
      return res.json(formatResponse(0, '获取成功', achievementsWithCount));
    } catch (error) {
      console.error('获取我的花圃失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取我的称号
  static async getMyTitles(req, res) {
    const userId = req.user.id;
    
    try {
      const titles = await Title.findByUserId(userId);
      return res.json(formatResponse(0, '获取成功', titles));
    } catch (error) {
      console.error('获取我的称号失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 查看他人花圃
  static async getUserAchievements(req, res) {
    const { id } = req.params;
    
    try {
      // 检查用户是否存在
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json(formatResponse(1004, '用户不存在'));
      }
      
      // 获取用户的所有成就
      const achievements = await Achievement.findByUserId(id);
      
      // 为每个成就添加打卡次数
      const achievementsWithCount = await Promise.all(
        achievements.map(async (achievement) => {
          const count = await Achievement.getCheckinCountByUserAndSpecies(id, achievement.flower_species);
          return {
            ...achievement,
            checkin_count: count
          };
        })
      );
      
      return res.json(formatResponse(0, '获取成功', achievementsWithCount));
    } catch (error) {
      console.error('获取用户花圃失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = AchievementController;