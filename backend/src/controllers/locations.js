const pool = require('../config/database');

// 获取地点列表
const getLocations = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let query = 'SELECT * FROM locations';
    const params = [];
    
    if (status || keyword) {
      query += ' WHERE';
      if (status) {
        query += ' bloom_status = ?';
        params.push(status);
      }
      if (keyword) {
        if (status) query += ' AND';
        query += ' (name LIKE ? OR description LIKE ? OR flower_species LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      }
    }
    
    const [locations] = await pool.execute(query, params);
    
    res.json({
      code: 0,
      message: 'ok',
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取地点详情
const getLocationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取地点详情
    const [locations] = await pool.execute('SELECT * FROM locations WHERE id = ?', [id]);
    if (locations.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    const location = locations[0];
    
    // 获取最近10条已审核通过的打卡记录
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins WHERE location_id = ? AND audit_status = ? ORDER BY created_at DESC LIMIT 10',
      [id, 'approved']
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        ...location,
        checkins
      }
    });
  } catch (error) {
    console.error('Get location detail error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新花期状态（仅管理员）
const updateBloomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloom_status } = req.body;
    
    // 验证花期状态
    const validStatuses = ['dormant', 'budding', 'blooming', 'withering'];
    if (!validStatuses.includes(bloom_status)) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 更新花期状态
    const [result] = await pool.execute(
      'UPDATE locations SET bloom_status = ?, status_updated_at = NOW() WHERE id = ?',
      [bloom_status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Update bloom status error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getLocations,
  getLocationDetail,
  updateBloomStatus
};
