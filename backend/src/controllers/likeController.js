const LikeModel = require('../models/likeModel');
const CheckinModel = require('../models/checkinModel');
const TitleModel = require('../models/titleModel');

class LikeController {
  // 点赞打卡记录
  static async like(req, res) {
    try {
      const userId = req.user.id;
      const { checkinId } = req.params;
      
      if (!checkinId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查打卡记录是否存在
      const checkin = await CheckinModel.findById(parseInt(checkinId));
      
      if (!checkin) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      // 点赞
      const success = await LikeModel.like(userId, parseInt(checkinId));
      
      if (success) {
        // 更新点赞计数
        await CheckinModel.like(parseInt(checkinId));
        
        // 检查是否解锁称号
        await this.checkLikeTitle(parseInt(checkinId));
      }
      
      res.json({
        code: 0,
        message: success ? '点赞成功' : '已经点赞过该打卡记录',
        data: {
          liked: true,
        },
      });
    } catch (error) {
      console.error('Like error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 取消点赞
  static async unlike(req, res) {
    try {
      const userId = req.user.id;
      const { checkinId } = req.params;
      
      if (!checkinId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 取消点赞
      const success = await LikeModel.unlike(userId, parseInt(checkinId));
      
      if (success) {
        // 更新点赞计数
        await CheckinModel.unlike(parseInt(checkinId));
      }
      
      res.json({
        code: 0,
        message: success ? '取消点赞成功' : '未点赞该打卡记录',
        data: {
          liked: false,
        },
      });
    } catch (error) {
      console.error('Unlike error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 检查是否已点赞
  static async checkLike(req, res) {
    try {
      const userId = req.user.id;
      const { checkinId } = req.params;
      
      if (!checkinId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查是否已点赞
      const isLiked = await LikeModel.isLiked(userId, parseInt(checkinId));
      
      res.json({
        code: 0,
        message: '查询成功',
        data: {
          liked: isLiked,
        },
      });
    } catch (error) {
      console.error('Check like error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取打卡记录的点赞列表
  static async getLikesByCheckinId(req, res) {
    try {
      const { checkinId } = req.params;
      
      if (!checkinId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 获取点赞列表
      const likes = await LikeModel.getByCheckinId(parseInt(checkinId));
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: likes,
          total: likes.length,
        },
      });
    } catch (error) {
      console.error('Get likes by checkin id error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户的点赞记录
  static async getMyLikes(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取点赞记录
      const likes = await LikeModel.getByUserId(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: likes,
          total: likes.length,
        },
      });
    } catch (error) {
      console.error('Get user likes error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 检查点赞相关称号
  static async checkLikeTitle(checkinId) {
    try {
      // 获取打卡记录
      const checkin = await CheckinModel.findById(checkinId);
      
      if (checkin && checkin.likes_count >= 50) {
        // 授予最美摄影师称号
        await TitleModel.grant({
          user_id: checkin.user_id,
          title_key: 'likes_50',
          earned_at: new Date(),
        });
      }
    } catch (error) {
      console.error('Check like title error:', error);
    }
  }
}

module.exports = LikeController;
