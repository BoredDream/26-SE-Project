const pool = require('../config/database');

// 获取所有称号类型
const getAllTitles = async (req, res) => {
  try {
    // 获取所有称号类型
    const [titles] = await pool.execute(
      'SELECT DISTINCT title_key, title_name FROM titles ORDER BY title_name'
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: titles
    });
  } catch (error) {
    console.error('Get all titles error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取我的称号
const getMyTitles = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    
    // 获取用户称号
    const [titles] = await pool.execute(
      'SELECT * FROM titles WHERE user_id = ? ORDER BY awarded_at DESC',
      [user_id]
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: titles
    });
  } catch (error) {
    console.error('Get my titles error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getAllTitles,
  getMyTitles
};
