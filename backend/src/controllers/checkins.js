const pool = require('../config/database');
const { getDistance } = require('geolib');

// 发布打卡
const createCheckin = async (req, res) => {
  try {
    const { location_id, bloom_report, content, images, user_latitude, user_longitude } = req.body;
    const { id: user_id } = req.user;
    
    // 验证参数
    if (!location_id || !images) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 检查地点是否存在
    const [locations] = await pool.execute('SELECT * FROM locations WHERE id = ?', [location_id]);
    if (locations.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // GPS校验
    const gpsVerified = user_latitude && user_longitude ? 
      getDistance(
        { latitude: user_latitude, longitude: user_longitude },
        { latitude: locations[0].latitude, longitude: locations[0].longitude }
      ) <= 150 : false;
    
    // 创建打卡记录
    const [result] = await pool.execute(
      'INSERT INTO checkins (user_id, location_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, location_id, bloom_report, content, JSON.stringify(images), gpsVerified, user_latitude, user_longitude]
    );
    
    // 更新地点打卡计数
    await pool.execute('UPDATE locations SET checkin_count = checkin_count + 1 WHERE id = ?', [location_id]);
    
    // TODO: 异步触发AI审核、GPS校验、花期投票、成就检查
    
    res.json({
      code: 0,
      message: 'ok',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 点赞打卡
const likeCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 更新点赞计数
    const [result] = await pool.execute(
      'UPDATE checkins SET likes_count = likes_count + 1 WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Like checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 举报打卡
const reportCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // TODO: 实现举报逻辑，记录举报信息
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Report checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  createCheckin,
  likeCheckin,
  reportCheckin
};
