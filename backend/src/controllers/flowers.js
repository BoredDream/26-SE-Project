const pool = require('../config/database');

// 获取花卉列表（支持搜索、筛选、分页）
const getFlowers = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = 'SELECT * FROM flowers';
    let countQuery = 'SELECT COUNT(*) as total FROM flowers';
    let params = [];
    let countParams = [];
    
    if (search) {
      query += ' WHERE name LIKE ? OR scientific_name LIKE ? OR description LIKE ?';
      countQuery += ' WHERE name LIKE ? OR scientific_name LIKE ? OR description LIKE ?';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    const [flowers] = await pool.execute(query, params);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        list: flowers,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get flowers error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取单个花卉详情
const getFlowerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [flowers] = await pool.execute('SELECT * FROM flowers WHERE id = ?', [id]);
    
    if (flowers.length === 0) {
      return res.status(404).json({ code: 1004, message: '花卉不存在' });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: flowers[0]
    });
  } catch (error) {
    console.error('Get flower by id error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 创建花卉信息（管理员）
const createFlower = async (req, res) => {
  try {
    const { name, scientific_name, family, genus, description, flower_season, image_url } = req.body;
    
    // 验证必要字段
    if (!name || !scientific_name) {
      return res.status(400).json({ code: 1001, message: '参数错误：名称和学名是必填项' });
    }
    
    // 创建花卉
    const [result] = await pool.execute(
      'INSERT INTO flowers (name, scientific_name, family, genus, description, flower_season, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, scientific_name, family, genus, description, flower_season, image_url]
    );
    
    // 获取创建的花卉信息
    const [flowers] = await pool.execute('SELECT * FROM flowers WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      code: 0,
      message: 'ok',
      data: flowers[0]
    });
  } catch (error) {
    console.error('Create flower error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 更新花卉信息（管理员）
const updateFlower = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, scientific_name, family, genus, description, flower_season, image_url } = req.body;
    
    // 检查花卉是否存在
    const [existingFlowers] = await pool.execute('SELECT id FROM flowers WHERE id = ?', [id]);
    if (existingFlowers.length === 0) {
      return res.status(404).json({ code: 1004, message: '花卉不存在' });
    }
    
    // 更新花卉
    await pool.execute(
      'UPDATE flowers SET name = ?, scientific_name = ?, family = ?, genus = ?, description = ?, flower_season = ?, image_url = ? WHERE id = ?',
      [name, scientific_name, family, genus, description, flower_season, image_url, id]
    );
    
    // 获取更新后的花卉信息
    const [updatedFlowers] = await pool.execute('SELECT * FROM flowers WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: 'ok',
      data: updatedFlowers[0]
    });
  } catch (error) {
    console.error('Update flower error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 删除花卉（管理员）
const deleteFlower = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查花卉是否存在
    const [existingFlowers] = await pool.execute('SELECT id FROM flowers WHERE id = ?', [id]);
    if (existingFlowers.length === 0) {
      return res.status(404).json({ code: 1004, message: '花卉不存在' });
    }
    
    // 删除花卉
    await pool.execute('DELETE FROM flowers WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Delete flower error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getFlowers,
  getFlowerById,
  createFlower,
  updateFlower,
  deleteFlower
};
