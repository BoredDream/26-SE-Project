const Checkin = require('../models/checkin');
const Location = require('../models/location');
const Like = require('../models/like');
const { formatResponse, isUserNearLocation, getCurrentBloomSeason } = require('../utils/helpers');

class CheckinController {
  // 发布打卡
  static async createCheckin(req, res) {
    const { location_id, bloom_report, content, images, user_latitude, user_longitude } = req.body;
    const userId = req.user.id;
    
    // 验证必填字段
    if (!location_id || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json(formatResponse(1001, '参数错误，缺少必填字段'));
    }
    
    // 验证花期状态值
    if (bloom_report) {
      const validStatuses = ['budding', 'blooming', 'withering'];
      if (!validStatuses.includes(bloom_report)) {
        return res.status(400).json(formatResponse(1001, '参数错误，花期状态值无效'));
      }
    }
    
    try {
      // 检查地点是否存在
      const location = await Location.findById(location_id);
      if (!location) {
        return res.status(404).json(formatResponse(1004, '地点不存在'));
      }
      
      // GPS 校验
      const gpsVerified = isUserNearLocation(user_latitude, user_longitude, location.latitude, location.longitude);
      
      // 创建打卡记录
      const checkinId = await Checkin.create({
        user_id: userId,
        location_id,
        bloom_report,
        content,
        images,
        gps_verified: gpsVerified ? 1 : 0,
        user_latitude,
        user_longitude
      });
      
      // 更新地点的打卡计数
      await Location.incrementCheckinCount(location_id);
      
      // 异步执行审核、成就触发等逻辑（这里简化处理，实际项目中应该使用队列）
      
      return res.json(formatResponse(0, '打卡发布成功，正在审核中'));
      
    } catch (error) {
      console.error('发布打卡失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取地点打卡列表
  static async getLocationCheckins(req, res) {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    
    try {
      const checkins = await Checkin.findByLocationId(id, { page, pageSize });
      return res.json(formatResponse(0, '获取成功', checkins));
    } catch (error) {
      console.error('获取打卡列表失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 点赞
  static async likeCheckin(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
      // 检查打卡是否存在
      const checkin = await Checkin.findById(id);
      if (!checkin) {
        return res.status(404).json(formatResponse(1004, '打卡不存在'));
      }
      
      // 检查是否已点赞
      const existingLike = await Like.findByUserAndCheckin(userId, id);
      
      if (existingLike) {
        // 已点赞，直接返回成功（幂等操作）
        return res.json(formatResponse(0, '点赞成功'));
      }
      
      // 创建点赞记录
      await Like.create(userId, id);
      
      // 更新打卡的点赞计数
      await Checkin.incrementLikesCount(id);
      
      return res.json(formatResponse(0, '点赞成功'));
      
    } catch (error) {
      console.error('点赞失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 取消点赞
  static async unlikeCheckin(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
      // 检查是否已点赞
      const existingLike = await Like.findByUserAndCheckin(userId, id);
      
      if (!existingLike) {
        // 未点赞，直接返回成功（幂等操作）
        return res.json(formatResponse(0, '取消点赞成功'));
      }
      
      // 删除点赞记录
      await Like.delete(userId, id);
      
      // 更新打卡的点赞计数
      await Checkin.decrementLikesCount(id);
      
      return res.json(formatResponse(0, '取消点赞成功'));
      
    } catch (error) {
      console.error('取消点赞失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 举报打卡
  static async reportCheckin(req, res) {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    if (!reason) {
      return res.status(400).json(formatResponse(1001, '参数错误，缺少举报理由'));
    }
    
    try {
      // 检查打卡是否存在
      const checkin = await Checkin.findById(id);
      if (!checkin) {
        return res.status(404).json(formatResponse(1004, '打卡不存在'));
      }
      
      // 这里简化处理，实际项目中应该创建举报记录并触发人工复核
      console.log(`用户 ${userId} 举报了打卡 ${id}，理由：${reason}`);
      
      return res.json(formatResponse(0, '举报成功，我们会尽快处理'));
      
    } catch (error) {
      console.error('举报打卡失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取我的打卡记录
  static async getMyCheckins(req, res) {
    const userId = req.user.id;
    
    try {
      const checkins = await Checkin.findByUserId(userId);
      return res.json(formatResponse(0, '获取成功', checkins));
    } catch (error) {
      console.error('获取我的打卡记录失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = CheckinController;