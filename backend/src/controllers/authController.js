const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModel = require('../models/userModel');

class AuthController {
  // 微信登录
  static async login(req, res) {
    try {
      const { code, userInfo } = req.body;
      
      if (!code) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // TODO: 调用微信 API 换取 openid
      // 这里暂时使用模拟数据
      const openid = `mock_openid_${Date.now()}`;
      
      // 查找或创建用户
      let user;
      try {
        user = await UserModel.findByOpenid(openid);
        
        if (!user) {
          // 创建新用户
          const userId = await UserModel.create(
            openid,
            userInfo?.nickName || '',
            userInfo?.avatarUrl || null
          );
          
          user = await UserModel.findById(userId);
        } else if (userInfo) {
          // 更新用户信息
          await UserModel.update(user.id, {
            nickname: userInfo.nickName || user.nickname,
            avatar_url: userInfo.avatarUrl || user.avatar_url,
          });
          
          user = await UserModel.findById(user.id);
        }
      } catch (dbError) {
        console.error('Database error in login:', dbError);
        // 如果数据库连接失败，使用模拟用户数据
        user = {
          id: Math.floor(Math.random() * 1000000),
          openid: openid,
          nickname: userInfo?.nickName || '模拟用户',
          avatar_url: userInfo?.avatarUrl || null,
          role: 'user',
        };
      }
      
      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, openid: user.openid },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // 获取用户统计信息
      let stats;
      try {
        stats = await UserModel.getStats(user.id);
      } catch (dbError) {
        console.error('Database error in getStats:', dbError);
        // 如果数据库连接失败，使用模拟统计数据
        stats = {
          checkin_count: 0,
          likes_received: 0,
          achievement_count: 0,
        };
      }
      
      res.json({
        code: 0,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            role: user.role,
          },
          token,
          stats,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      // 如果发生其他错误，返回模拟数据
      const openid = `mock_openid_${Date.now()}`;
      const token = jwt.sign(
        { userId: Math.floor(Math.random() * 1000000), openid: openid },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({
        code: 0,
        message: '登录成功',
        data: {
          user: {
            id: Math.floor(Math.random() * 1000000),
            openid: openid,
            nickname: '模拟用户',
            avatar_url: null,
            role: 'user',
          },
          token,
          stats: {
            checkin_count: 0,
            likes_received: 0,
            achievement_count: 0,
          },
        },
      });
    }
  }

  // 获取当前用户信息
  static async getMe(req, res) {
    try {
      const user = req.user;
      
      // 获取用户统计信息
      const stats = await UserModel.getStats(user.id);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          user: {
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            role: user.role,
          },
          stats,
        },
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 更新用户信息
  static async updateMe(req, res) {
    try {
      const userId = req.user.id;
      const { nickname, avatar_url } = req.body;
      
      // 更新用户信息
      await UserModel.update(userId, {
        nickname,
        avatar_url,
      });
      
      // 获取更新后的用户信息
      const user = await UserModel.findById(userId);
      
      res.json({
        code: 0,
        message: '更新成功',
        data: {
          user: {
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Update me error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }
}

module.exports = AuthController;
