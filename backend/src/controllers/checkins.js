const pool = require('../config/database');
const { getDistance } = require('geolib');

// 发布打卡
const createCheckin = async (req, res) => {
  try {
    const { flower_place_id, bloom_report, content, images, user_latitude, user_longitude } = req.body;
    const { id: user_id } = req.user;
    
    // 验证参数
    if (!flower_place_id || !images) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 检查花卉地点是否存在
    const [flowerPlaces] = await pool.execute(`
      SELECT fp.*, p.latitude, p.longitude
      FROM flower_places fp
      JOIN places p ON fp.place_id = p.id
      WHERE fp.id = ?
    `, [flower_place_id]);
    
    if (flowerPlaces.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // GPS校验
    const gpsVerified = user_latitude && user_longitude ? 
      getDistance(
        { latitude: user_latitude, longitude: user_longitude },
        { latitude: flowerPlaces[0].latitude, longitude: flowerPlaces[0].longitude }
      ) <= 150 : false;
    
    // 创建打卡记录
    const [result] = await pool.execute(
      'INSERT INTO checkins (user_id, flower_place_id, bloom_report, content, images, gps_verified, user_latitude, user_longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, flower_place_id, bloom_report, content, JSON.stringify(images), gpsVerified, user_latitude, user_longitude]
    );
    
    // 更新地点打卡计数
    await pool.execute('UPDATE places SET checkin_count = checkin_count + 1 WHERE id = ?', [flowerPlaces[0].place_id]);
    
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

// 获取所有打卡数据（用于管理端）
const getAllCheckins = async (req, res) => {
  try {
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins ORDER BY created_at DESC'
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: checkins
    });
  } catch (error) {
    console.error('Get all checkins error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取单个打卡详情
const getCheckinById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ? AND c.is_visible = 1
    `, [id]);
    
    if (checkins.length === 0) {
      return res.status(404).json({ code: 1004, message: '打卡记录不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: checkins[0]
    });
  } catch (error) {
    console.error('Get checkin by id error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新打卡内容（用户自己的）
const updateCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images } = req.body;
    const { id: user_id } = req.user;
    
    // 检查打卡是否存在且属于当前用户
    const [existingCheckins] = await pool.execute(
      'SELECT id, user_id FROM checkins WHERE id = ?', [id]
    );
    
    if (existingCheckins.length === 0) {
      return res.status(404).json({ code: 1004, message: '打卡记录不存在' });
    }
    
    if (existingCheckins[0].user_id !== user_id) {
      return res.status(403).json({ code: 1003, message: '无权限修改此打卡记录' });
    }
    
    // 更新打卡内容
    await pool.execute(
      'UPDATE checkins SET content = ?, images = ? WHERE id = ?',
      [content, JSON.stringify(images), id]
    );
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Update checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 删除打卡（用户自己的/管理员）
const deleteCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: user_id, role } = req.user;
    
    // 检查打卡是否存在
    const [existingCheckins] = await pool.execute(
      'SELECT id, user_id FROM checkins WHERE id = ?', [id]
    );
    
    if (existingCheckins.length === 0) {
      return res.status(404).json({ code: 1004, message: '打卡记录不存在' });
    }
    
    // 验证权限：只能删除自己的打卡或管理员可以删除所有
    if (existingCheckins[0].user_id !== user_id && role !== 'admin') {
      return res.status(403).json({ code: 1003, message: '无权限删除此打卡记录' });
    }
    
    // 软删除：设置is_visible为0
    await pool.execute(
      'UPDATE checkins SET is_visible = 0 WHERE id = ?',
      [id]
    );
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Delete checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取当前用户的打卡列表
const getMyCheckins = async (req, res) => {
  try {
    console.log('getMyCheckins函数被调用');
    console.log('req.user:', req.user);
    
    const { id: user_id } = req.user;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    
    console.log('查询参数:', { user_id, page, pageSize, offset });
    
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins WHERE user_id = ? AND is_visible = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [user_id, parseInt(pageSize), parseInt(offset)]
    );
    
    console.log('查询结果:', checkins.length, '条记录');
    
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM checkins WHERE user_id = ? AND is_visible = 1',
      [user_id]
    );
    const total = countResult[0].total;
    
    console.log('总数:', total);
    
    if (checkins.length === 0) {
      console.log('返回空列表');
      return res.json({
        code: 0,
        message: 'ok',
        data: {
          list: [],
          total: 0,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: 0
        }
      });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: checkins,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get my checkins error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取某地点的打卡列表
const getCheckinsByPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.place_id = ? AND c.is_visible = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [placeId, parseInt(pageSize), parseInt(offset)]);
    
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM checkins c
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.place_id = ? AND c.is_visible = 1
    `, [placeId]);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: checkins,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get checkins by place error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取某花卉的打卡列表
const getCheckinsByFlower = async (req, res) => {
  try {
    const { flowerId } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const [checkins] = await pool.execute(`
      SELECT c.*, u.nickname, u.avatar_url
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.flower_id = ? AND c.is_visible = 1
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [flowerId, parseInt(pageSize), parseInt(offset)]);
    
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM checkins c
      JOIN flower_places fp ON c.flower_place_id = fp.id
      WHERE fp.flower_id = ? AND c.is_visible = 1
    `, [flowerId]);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: checkins,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get checkins by flower error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取打卡点赞用户列表
const getCheckinLikes = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 实现点赞用户列表功能
    // 注意：当前数据库表中没有记录具体的点赞用户，只有点赞数
    // 需要考虑是否需要添加likes表来记录点赞关系
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: [],
        total: 0
      }
    });
  } catch (error) {
    console.error('Get checkin likes error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  createCheckin,
  likeCheckin,
  reportCheckin,
  getAllCheckins,
  getCheckinById,
  updateCheckin,
  deleteCheckin,
  getMyCheckins,
  getCheckinsByPlace,
  getCheckinsByFlower,
  getCheckinLikes
};
