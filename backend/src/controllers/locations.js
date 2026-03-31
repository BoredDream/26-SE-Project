const pool = require('../config/database');

// 获取地点列表
const getLocations = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let query = `
      SELECT fp.*, f.*, p.*
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
    `;
    const params = [];
    
    if (status || keyword) {
      query += ' WHERE';
      if (status) {
        query += ' f.bloom_status = ?';
        params.push(status);
      }
      if (keyword) {
        if (status) query += ' AND';
        query += ' (p.name LIKE ? OR p.description LIKE ? OR f.species LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      }
    }
    
    const [results] = await pool.execute(query, params);
    
    // 格式化结果
    const locations = results.map(result => ({
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
    
    // 获取花卉地点详情
    const [results] = await pool.execute(`
      SELECT fp.*, f.*, p.*
      FROM flower_places fp
      JOIN flowers f ON fp.flower_id = f.id
      JOIN places p ON fp.place_id = p.id
      WHERE fp.id = ?
    `, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    const result = results[0];
    
    // 格式化地点信息
    const location = {
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
    };
    
    // 获取最近10条已审核通过的打卡记录
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins WHERE flower_place_id = ? AND audit_status = ? ORDER BY created_at DESC LIMIT 10',
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
    
    // 先获取花卉地点信息，找到对应的花卉ID
    const [flowerPlaces] = await pool.execute(
      'SELECT flower_id FROM flower_places WHERE id = ?',
      [id]
    );
    
    if (flowerPlaces.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    const flowerId = flowerPlaces[0].flower_id;
    
    // 更新花期状态
    const [result] = await pool.execute(
      'UPDATE flowers SET bloom_status = ?, status_updated_at = NOW() WHERE id = ?',
      [bloom_status, flowerId]
    );
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Update bloom status error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 花期状态投票（需登录）
const voteBloomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloom_status } = req.body;
    const userId = req.user.id;
    
    // 验证花期状态
    const validStatuses = ['budding', 'blooming', 'withering'];
    if (!validStatuses.includes(bloom_status)) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 先获取花卉地点信息
    const [flowerPlaces] = await pool.execute(
      'SELECT flower_id FROM flower_places WHERE id = ?',
      [id]
    );
    
    if (flowerPlaces.length === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    

    
    // 创建一个特殊的打卡记录作为投票
    const [result] = await pool.execute(
      `INSERT INTO checkins (
        user_id, flower_place_id, bloom_report,
        content, gps_verified, audit_status, is_visible
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, id, bloom_status, '花期投票', 0, 'approved', 0]
    );
    
    // 调用投票服务，尝试自动更新花期状态
    const voteService = require('../services/voteService');
    await voteService.updateBloomStatusByVote(id);
    
    res.json({
      code: 0,
      message: '投票成功'
    });
  } catch (error) {
    console.error('Vote bloom status error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 创建花卉地点（仅管理员）
const createLocation = async (req, res) => {
  try {
    const { 
      flower_species, scientific_name, family, genus,
      name, description, latitude, longitude,
      historical_bloom_start, historical_bloom_end
    } = req.body;
    
    // 验证必填字段
    if (!flower_species || !name || !latitude || !longitude) {
      return res.status(400).json({ code: 1001, message: '参数错误，缺少必填字段' });
    }
    
    // 开启事务
    await pool.beginTransaction();
    
    try {
      // 先创建花卉记录
      const [flowerResult] = await pool.execute(
        `INSERT INTO flowers (species, scientific_name, family, genus, 
          historical_bloom_start, historical_bloom_end, bloom_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [flower_species, scientific_name, family, genus, 
         historical_bloom_start, historical_bloom_end, 'dormant']
      );
      
      const flowerId = flowerResult.insertId;
      
      // 创建地点记录
      const [placeResult] = await pool.execute(
        `INSERT INTO places (name, description, latitude, longitude) 
         VALUES (?, ?, ?, ?)`,
        [name, description, latitude, longitude]
      );
      
      const placeId = placeResult.insertId;
      
      // 创建花卉地点关联
      const [flowerPlaceResult] = await pool.execute(
        `INSERT INTO flower_places (flower_id, place_id, is_main) 
         VALUES (?, ?, ?)`,
        [flowerId, placeId, 1]
      );
      
      const locationId = flowerPlaceResult.insertId;
      
      // 提交事务
      await pool.commit();
      
      res.json({
        code: 0,
        message: '创建成功',
        data: { id: locationId }
      });
      
    } catch (error) {
      // 回滚事务
      await pool.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新花卉地点（仅管理员）
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      flower_species, scientific_name, family, genus,
      name, description, latitude, longitude,
      historical_bloom_start, historical_bloom_end
    } = req.body;
    
    // 验证必填字段
    if (!id) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 开启事务
    await pool.beginTransaction();
    
    try {
      // 先获取花卉地点信息，找到对应的花卉ID和地点ID
      const [flowerPlaces] = await pool.execute(
        'SELECT flower_id, place_id FROM flower_places WHERE id = ?',
        [id]
      );
      
      if (flowerPlaces.length === 0) {
        await pool.rollback();
        return res.status(404).json({ code: 1004, message: '资源不存在' });
      }
      
      const flowerId = flowerPlaces[0].flower_id;
      const placeId = flowerPlaces[0].place_id;
      
      // 更新花卉信息
      await pool.execute(
        `UPDATE flowers SET 
          species=?, scientific_name=?, family=?, genus=?, 
          historical_bloom_start=?, historical_bloom_end=? 
         WHERE id=?`,
        [flower_species, scientific_name, family, genus, 
         historical_bloom_start, historical_bloom_end, flowerId]
      );
      
      // 更新地点信息
      await pool.execute(
        `UPDATE places SET 
          name=?, description=?, latitude=?, longitude=? 
         WHERE id=?`,
        [name, description, latitude, longitude, placeId]
      );
      
      // 提交事务
      await pool.commit();
      
      res.json({
        code: 0,
        message: '更新成功'
      });
      
    } catch (error) {
      // 回滚事务
      await pool.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 删除花卉地点（仅管理员）
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 验证必填字段
    if (!id) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 开启事务
    await pool.beginTransaction();
    
    try {
      // 先获取花卉地点信息，找到对应的花卉ID和地点ID
      const [flowerPlaces] = await pool.execute(
        'SELECT flower_id, place_id FROM flower_places WHERE id = ?',
        [id]
      );
      
      if (flowerPlaces.length === 0) {
        await pool.rollback();
        return res.status(404).json({ code: 1004, message: '资源不存在' });
      }
      
      const flowerId = flowerPlaces[0].flower_id;
      const placeId = flowerPlaces[0].place_id;
      
      // 删除花卉地点关联
      await pool.execute(
        'DELETE FROM flower_places WHERE id = ?',
        [id]
      );
      
      // 删除花卉记录
      await pool.execute(
        'DELETE FROM flowers WHERE id = ?',
        [flowerId]
      );
      
      // 删除地点记录
      await pool.execute(
        'DELETE FROM places WHERE id = ?',
        [placeId]
      );
      
      // 提交事务
      await pool.commit();
      
      res.json({
        code: 0,
        message: '删除成功'
      });
      
    } catch (error) {
      // 回滚事务
      await pool.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getLocations,
  getLocationDetail,
  createLocation,
  updateLocation,
  deleteLocation,
  updateBloomStatus,
  voteBloomStatus
};
