const pool = require('../config/database');

// 获取用户列表
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM users';
    let params = [];
    
    if (search) {
      query += ' WHERE nickname LIKE ? OR openid LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await pool.execute(query, params);
    
    res.json({
      code: 0,
      message: 'ok',
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取单个用户
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: users[0]
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 创建用户
const createUser = async (req, res) => {
  try {
    const { openid, nickname, avatar_url, role } = req.body;
    
    // 验证必要字段
    if (!openid || !nickname) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 检查openid是否已存在
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE openid = ?', [openid]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ code: 1002, message: '该用户已存在' });
    }
    
    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (openid, nickname, avatar_url, role) VALUES (?, ?, ?, ?)',
      [openid, nickname, avatar_url || null, role || 'user']
    );
    
    // 获取创建的用户信息
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      code: 0,
      message: 'ok',
      data: users[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新用户
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { openid, nickname, avatar_url, role } = req.body;
    
    // 检查用户是否存在
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // 更新用户信息
    const [result] = await pool.execute(
      'UPDATE users SET openid = ?, nickname = ?, avatar_url = ?, role = ? WHERE id = ?',
      [openid, nickname, avatar_url || null, role || 'user', id]
    );
    
    // 获取更新后的用户信息
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: 'ok',
      data: users[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 删除用户
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // 删除用户
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
