const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModel = require('../models/userModel');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 1002,
        message: '未登录或 Token 过期',
      });
    }
    
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 查找用户
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        code: 1002,
        message: '用户不存在',
      });
    }
    
    // 将用户信息存储到请求对象中
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 1002,
        message: 'Token 已过期',
      });
    }
    
    return res.status(401).json({
      code: 1002,
      message: 'Token 无效',
    });
  }
};

module.exports = authMiddleware;
