const pool = require('../config/database');

// 订阅地点
const subscribe = async (req, res) => {
  try {
    const { location_id } = req.body;
    const { id: user_id } = req.user;
    
    // 验证参数
    if (!location_id) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 检查地点是否存在
    const [locations] = await pool.execute('SELECT * FROM locations WHERE id = ?', [location_id]);
    if (locations.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // 订阅地点
    try {
      await pool.execute(
        'INSERT INTO subscriptions (user_id, location_id) VALUES (?, ?)',
        [user_id, location_id]
      );
    } catch (error) {
      // 唯一键冲突，说明已经订阅
      if (error.code === 'ER_DUP_ENTRY') {
        return res.json({ code: 0, message: 'ok' });
      }
      throw error;
    }
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 取消订阅
const unsubscribe = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { id: user_id } = req.user;
    
    // 取消订阅
    await pool.execute(
      'DELETE FROM subscriptions WHERE user_id = ? AND location_id = ?',
      [user_id, locationId]
    );
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 我的订阅列表
const getMySubscriptions = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    
    // 获取订阅列表
    const [subscriptions] = await pool.execute(
      'SELECT l.* FROM locations l JOIN subscriptions s ON l.id = s.location_id WHERE s.user_id = ?',
      [user_id]
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: subscriptions
    });
  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getMySubscriptions
};
