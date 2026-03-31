const pool = require('../config/database');
const { generateToken } = require('../config/jwt');
const axios = require('axios');

// 微信配置
const WECHAT_CONFIG = {
  APPID: process.env.WX_APPID || 'your_wechat_appid',
  SECRET: process.env.WX_SECRET || 'your_wechat_secret',
  JSCODE2SESSION_URL: 'https://api.weixin.qq.com/sns/jscode2session'
};

// 微信登录
const wechatLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    // 验证参数
    if (!code) {
      return res.status(400).json({ code: 1001, message: '缺少code参数' });
    }
    
    // 调用微信API获取openid和session_key
    const wechatResponse = await axios.get(WECHAT_CONFIG.JSCODE2SESSION_URL, {
      params: {
        appid: WECHAT_CONFIG.APPID,
        secret: WECHAT_CONFIG.SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    // 微信API返回的数据
    const { openid, session_key, unionid } = wechatResponse.data;
    
    if (!openid) {
      return res.status(401).json({ code: 1003, message: '微信登录失败' });
    }
    
    // 检查用户是否已存在
    const [users] = await pool.execute('SELECT id, nickname, avatar_url, role FROM users WHERE openid = ?', [openid]);
    
    let user;
    if (users.length > 0) {
      // 用户已存在，直接返回用户信息和token
      user = users[0];
    } else {
      // 创建新用户
      const [result] = await pool.execute(
        'INSERT INTO users (openid, unionid, nickname, role) VALUES (?, ?, ?, ?)',
        [openid, unionid || null, '新用户', 'user']
      );
      
      // 获取新创建的用户信息
      const [newUsers] = await pool.execute('SELECT id, nickname, avatar_url, role FROM users WHERE id = ?', [result.insertId]);
      user = newUsers[0];
    }
    
    // 生成JWT令牌
    const token = generateToken({ id: user.id, role: user.role });
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Wechat login error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取微信网页登录二维码
const getWebLoginQRCode = async (req, res) => {
  try {
    // TODO: 实现微信网页登录二维码生成逻辑
    const qrCodeUrl = 'https://example.com/qrcode?state=mock_state';
    res.json({
      code: 0,
      message: 'ok',
      data: {
        qrCodeUrl,
        state: 'mock_state'
      }
    });
  } catch (error) {
    console.error('Get web login QR code error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 检查微信网页登录状态
const checkWebLoginStatus = async (req, res) => {
  try {
    const { state } = req.query;
    // TODO: 实现检查微信网页登录状态逻辑
    res.json({
      code: 0,
      message: 'ok',
      data: {
        status: 'pending', // pending, success, failed
        token: null
      }
    });
  } catch (error) {
    console.error('Check web login status error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 微信网页登录回调
const webLoginCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    // TODO: 实现微信网页登录回调处理逻辑
    res.json({
      code: 0,
      message: 'ok',
      data: {
        token: 'mock_web_token'
      }
    });
  } catch (error) {
    console.error('Web login callback error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 退出登录
const logout = async (req, res) => {
  try {
    // TODO: 实现退出登录逻辑（如清除Redis中的token等）
    res.json({
      code: 0,
      message: '退出登录成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 微信注册/更新用户信息
const wechatRegister = async (req, res) => {
  try {
    const { openid, unionid, nickname, avatar_url } = req.body;
    
    // 验证参数
    if (!openid) {
      return res.status(400).json({ code: 1001, message: '缺少openid参数' });
    }
    
    // 检查用户是否已存在
    const [users] = await pool.execute('SELECT id, role FROM users WHERE openid = ?', [openid]);
    
    let userId;
    let userRole = 'user';
    
    if (users.length > 0) {
      // 用户已存在，更新用户信息
      userId = users[0].id;
      userRole = users[0].role;
      
      // 更新用户信息
      await pool.execute(
        'UPDATE users SET unionid = ?, nickname = ?, avatar_url = ? WHERE id = ?',
        [unionid || null, nickname || '新用户', avatar_url || null, userId]
      );
    } else {
      // 创建新用户
      const [result] = await pool.execute(
        'INSERT INTO users (openid, unionid, nickname, avatar_url, role) VALUES (?, ?, ?, ?, ?)',
        [openid, unionid || null, nickname || '新用户', avatar_url || null, 'user']
      );
      userId = result.insertId;
    }
    
    // 获取最新的用户信息
    const [updatedUsers] = await pool.execute('SELECT id, nickname, avatar_url, role FROM users WHERE id = ?', [userId]);
    const user = updatedUsers[0];
    
    // 生成JWT令牌
    const token = generateToken({ id: userId, role: userRole });
    
    res.json({
      code: 0,
      message: users.length > 0 ? '用户信息更新成功' : '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Wechat register error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 微信用户信息更新
const updateWechatUserInfo = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { nickname, avatar_url } = req.body;
    
    // 验证参数
    if (!nickname) {
      return res.status(400).json({ code: 1001, message: '缺少nickname参数' });
    }
    
    // 更新用户信息
    await pool.execute(
      'UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?',
      [nickname, avatar_url || null, user_id]
    );
    
    // 获取更新后的用户信息
    const [users] = await pool.execute('SELECT id, nickname, avatar_url, role FROM users WHERE id = ?', [user_id]);
    const user = users[0];
    
    res.json({
      code: 0,
      message: '用户信息更新成功',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update wechat user info error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  wechatLogin,
  wechatRegister,
  getWebLoginQRCode,
  checkWebLoginStatus,
  webLoginCallback,
  logout,
  updateWechatUserInfo
};
