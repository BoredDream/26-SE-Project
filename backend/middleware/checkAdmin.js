const { formatResponse } = require('../utils/helpers');

function checkAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json(formatResponse(1003, '无权限访问该接口'));
  }
}

module.exports = checkAdmin;