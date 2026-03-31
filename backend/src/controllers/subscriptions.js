const pool = require('../config/database');

// 订阅地点
const subscribe = async (req, res) => {
  try {
    const { flower_place_id } = req.body;
    const { id: user_id } = req.user;
    
    // 验证参数
    if (!flower_place_id) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 检查花卉地点是否存在
    const [flowerPlaces] = await pool.execute('SELECT * FROM flower_places WHERE id = ?', [flower_place_id]);
    if (flowerPlaces.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // 订阅地点
    try {
      await pool.execute(
        'INSERT INTO subscriptions (user_id, flower_place_id) VALUES (?, ?)',
        [user_id, flower_place_id]
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
      'DELETE FROM subscriptions WHERE user_id = ? AND flower_place_id = ?',
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
    const [results] = await pool.execute(`
      SELECT fp.*, f.*, p.*
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      JOIN subscriptions s ON fp.id = s.flower_place_id
      WHERE s.user_id = ?
    `, [user_id]);
    
    // 格式化结果
    const subscriptions = results.map(result => ({
      id: result.id,
      flower_id: result.flower_id,
      place_id: result.place_id,
      name: result.name,
      description: result.description,
      latitude: result.latitude,
      longitude: result.longitude,
      flower_species: result.species,
      bloom_status: result.bloom_status,
      historical_bloom_start: result.historical_bloom_start,
      historical_bloom_end: result.historical_bloom_end,
      precise_bloom_start: result.precise_bloom_start,
      precise_bloom_end: result.precise_bloom_end,
      cover_image: result.cover_image,
      checkin_count: result.checkin_count,
      status_updated_at: result.status_updated_at,
      created_at: result.created_at
    }));
    
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
