const SubscriptionModel = require('../models/subscriptionModel');
const LocationModel = require('../models/locationModel');

class SubscriptionController {
  // 订阅地点
  static async subscribe(req, res) {
    try {
      const userId = req.user.id;
      const { location_id } = req.body;
      
      if (!location_id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查地点是否存在
      const location = await LocationModel.findById(parseInt(location_id));
      
      if (!location) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      // 订阅地点
      const success = await SubscriptionModel.subscribe(userId, parseInt(location_id));
      
      res.json({
        code: 0,
        message: success ? '订阅成功' : '已经订阅过该地点',
        data: {
          subscribed: true,
        },
      });
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 取消订阅
  static async unsubscribe(req, res) {
    try {
      const userId = req.user.id;
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 取消订阅
      const success = await SubscriptionModel.unsubscribe(userId, parseInt(locationId));
      
      res.json({
        code: 0,
        message: success ? '取消订阅成功' : '未订阅该地点',
        data: {
          subscribed: false,
        },
      });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 检查是否已订阅
  static async checkSubscription(req, res) {
    try {
      const userId = req.user.id;
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查是否已订阅
      const isSubscribed = await SubscriptionModel.isSubscribed(userId, parseInt(locationId));
      
      res.json({
        code: 0,
        message: '查询成功',
        data: {
          subscribed: isSubscribed,
        },
      });
    } catch (error) {
      console.error('Check subscription error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户的订阅列表
  static async getMySubscriptions(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取订阅列表
      const subscriptions = await SubscriptionModel.getByUserId(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: subscriptions,
          total: subscriptions.length,
        },
      });
    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }
}

module.exports = SubscriptionController;
