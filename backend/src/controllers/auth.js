const pool = require('../config/database');
const { generateToken } = require('../config/jwt');

// 微信登录
const wechatLogin = async (req, res) => {
  try {
    const { code } = req.body;
    // TODO: 实现微信登录逻辑，获取openid
    // 这里先模拟实现
    const openid = 'mock_openid_123';
    
    // 检查用户是否已存在
    const [users] = await pool.execute('SELECT id, role FROM users WHERE openid = ?', [openid]);
    let userId;
    
    if (users.length > 0) {
      // 用户已存在
      userId = users[0].id;
    } else {
      // 创建新用户
      const [result] = await pool.execute(
        'INSERT INTO users (openid, nickname, role) VALUES (?, ?, ?)',
        [openid, '新用户', 'user']
      );
      userId = result.insertId;
    }
    
    // 生成JWT令牌
    const token = generateToken({ id: userId, role: users[0]?.role || 'user' });
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        token,
        user: {
          id: userId,
          nickname: '新用户',
          role: users[0]?.role || 'user'
        }
      }
    });
  } catch (error) {
    console.error('Wechat login error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  wechatLogin
};
