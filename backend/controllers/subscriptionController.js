const Subscription = require('../models/subscription');
const { formatResponse } = require('../utils/helpers');

class SubscriptionController {
  // 订阅地点
  static async subscribeLocation(req, res) {
    const { location_id } = req.body;
    const userId = req.user.id;
    
    if (!location_id) {
      return res.status(400).json(formatResponse(1001, '参数错误，缺少地点 ID'));
    }
    
    try {
      // 创建订阅（幂等操作，已订阅则忽略）
      await Subscription.create(userId, location_id);
      
      return res.json(formatResponse(0, '订阅成功'));
    } catch (error) {
      console.error('订阅地点失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 取消订阅
  static async unsubscribeLocation(req, res) {
    const { locationId } = req.params;
    const userId = req.user.id;
    
    try {
      // 删除订阅（幂等操作，未订阅则忽略）
      await Subscription.delete(userId, locationId);
      
      return res.json(formatResponse(0, '取消订阅成功'));
    } catch (error) {
      console.error('取消订阅失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取我的订阅列表
  static async getMySubscriptions(req, res) {
    const userId = req.user.id;
    
    try {
      const subscriptions = await Subscription.findByUserId(userId);
      return res.json(formatResponse(0, '获取成功', subscriptions));
    } catch (error) {
      console.error('获取订阅列表失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = SubscriptionController;