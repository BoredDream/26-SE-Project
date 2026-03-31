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
    // 调试信息
    console.log('Update user request:', req.method, req.url);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    // 简单的实现，直接处理允许的字段
    const id = req.params.id;
    const user = req.user;
    
    // 验证参数
    if (!id || !user) {
      console.log('Missing required parameters:', { id, user });
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    const userId = parseInt(id);
    console.log('User ID:', userId);
    
    // 验证权限
    if (parseInt(user.id) !== userId && user.role !== 'admin') {
      console.log('Permission denied:', { currentUserId: user.id, requestedUserId: userId, role: user.role });
      return res.status(403).json({ code: 1003, message: '无权限' });
    }
    
    // 准备更新的字段
    const updateFields = [];
    const updateParams = [];
    
    // 处理nickname字段
    if (req.body && typeof req.body.nickname !== 'undefined') {
      console.log('Updating nickname:', req.body.nickname);
      updateFields.push('nickname = ?');
      updateParams.push(req.body.nickname);
    }
    
    // 处理avatar_url字段
    if (req.body && typeof req.body.avatar_url !== 'undefined') {
      console.log('Updating avatar_url:', req.body.avatar_url);
      updateFields.push('avatar_url = ?');
      updateParams.push(req.body.avatar_url);
    }
    
    // 如果没有要更新的字段
    if (updateFields.length === 0) {
      console.log('No fields to update, returning current user info');
      // 获取当前用户信息
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        return res.json({ code: 0, message: 'ok', data: users[0] });
      } else {
        return res.status(404).json({ code: 1004, message: '资源不存在' });
      }
    }
    
    // 构建更新语句
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateParams.push(userId);
    
    // 调试SQL查询
    console.log('SQL query:', sql);
    console.log('SQL params:', updateParams);
    console.log('SQL params types:', updateParams.map(p => typeof p));
    
    // 执行更新
    await pool.execute(sql, updateParams);
    
    // 获取更新后的用户信息
    const [updatedUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    // 返回更新后的用户信息
    if (updatedUsers.length > 0) {
      return res.json({ code: 0, message: 'ok', data: updatedUsers[0] });
    } else {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
  } catch (error) {
    console.error('Update user error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ code: 5000, message: '服务器内部错误' });
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

// 获取当前登录用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ code: 1005, message: '未登录' });
    }
    
    // 从数据库获取最新的用户信息
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ code: 1004, message: '用户不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: users[0]
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新当前用户信息
const updateCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ code: 1005, message: '未登录' });
    }
    
    // 准备更新的字段
    const updateFields = [];
    const updateParams = [];
    
    // 处理nickname字段
    if (typeof req.body.nickname !== 'undefined') {
      updateFields.push('nickname = ?');
      updateParams.push(req.body.nickname);
    }
    
    // 处理avatar_url字段
    if (typeof req.body.avatar_url !== 'undefined') {
      updateFields.push('avatar_url = ?');
      updateParams.push(req.body.avatar_url);
    }
    
    // 如果没有要更新的字段
    if (updateFields.length === 0) {
      // 获取当前用户信息
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [user.id]);
      if (users.length > 0) {
        return res.json({ code: 0, message: 'ok', data: users[0] });
      } else {
        return res.status(404).json({ code: 1004, message: '用户不存在' });
      }
    }
    
    // 构建更新语句
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    updateParams.push(user.id);
    
    // 执行更新
    await pool.execute(sql, updateParams);
    
    // 获取更新后的用户信息
    const [updatedUsers] = await pool.execute('SELECT * FROM users WHERE id = ?', [user.id]);
    
    // 返回更新后的用户信息
    if (updatedUsers.length > 0) {
      return res.json({ code: 0, message: 'ok', data: updatedUsers[0] });
    } else {
      return res.status(404).json({ code: 1004, message: '用户不存在' });
    }
  } catch (error) {
    console.error('Update current user error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser
};
