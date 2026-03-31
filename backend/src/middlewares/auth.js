const { verifyToken } = require('../config/jwt');

// 身份验证中间件
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取Authorization字段
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 1002, message: '未登录或Token过期' });
    }

    // 解析Token
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 1002, message: '未登录或Token过期' });
    }

    // 将用户信息存储到请求对象中
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ code: 1002, message: '未登录或Token过期' });
  }
};

// 管理员权限中间件
const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ code: 1003, message: '无权限' });
    }
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(403).json({ code: 1003, message: '无权限' });
  }
};

module.exports = {
  authenticate,
  isAdmin
};
