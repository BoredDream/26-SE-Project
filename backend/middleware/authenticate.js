const jwt = require('../config/jwt');
const { formatResponse } = require('../utils/helpers');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(formatResponse(1002, '未登录或 Token 无效'));
  }
  
  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json(formatResponse(1002, '未登录或 Token 过期'));
  }
  
  // 将用户信息存储到请求对象中
  req.user = {
    id: decoded.id,
    openid: decoded.openid,
    role: decoded.role
  };
  
  next();
}

module.exports = authenticate;