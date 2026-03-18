const axios = require('axios');
const User = require('../models/user');
const jwt = require('../config/jwt');
const { formatResponse } = require('../utils/helpers');
require('dotenv').config();

const WX_APPID = process.env.WX_APPID;
const WX_SECRET = process.env.WX_SECRET;

class UserController {
  // 微信登录
  static async login(req, res) {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json(formatResponse(1001, '参数错误，缺少 code'));
    }
    
    try {
      let openid;
      
      // 测试环境：使用特定code进行测试登录
      if (code === 'test') {
        openid = 'test_openid';
      } else {
        // 生产环境：调用微信API获取 openid
        const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
          params: {
            appid: WX_APPID,
            secret: WX_SECRET,
            js_code: code,
            grant_type: 'authorization_code'
          }
        });
        
        openid = response.data.openid;
        
        if (!openid) {
          return res.status(400).json(formatResponse(1001, '微信登录失败'));
        }
      }
      
      // 查询或创建用户
      let user = await User.findByOpenid(openid);
      
      if (!user) {
        // 创建新用户
        const userId = await User.create(openid);
        user = await User.findById(userId);
      }
      
      // 生成 JWT 令牌
      const token = jwt.generateToken(user);
      
      // 返回响应
      return res.json(formatResponse(0, '登录成功', {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          role: user.role
        }
      }));
      
    } catch (error) {
      console.error('登录失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 更新用户信息
  static async updateProfile(req, res) {
    const { nickname, avatar_url } = req.body;
    const userId = req.user.id;
    
    try {
      await User.update(userId, { nickname, avatar_url });
      return res.json(formatResponse(0, '更新成功'));
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取用户信息
  static async getProfile(req, res) {
    const userId = req.user.id;
    
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json(formatResponse(1004, '用户不存在'));
      }
      
      const userInfo = {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at
      };
      
      return res.json(formatResponse(0, '获取成功', userInfo));
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = UserController;