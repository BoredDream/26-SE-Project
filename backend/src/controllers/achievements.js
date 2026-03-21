const pool = require('../config/database');

// 获取所有成就类型
const getAllAchievements = async (req, res) => {
  try {
    // 获取所有成就记录
    const [achievements] = await pool.execute(
      'SELECT DISTINCT flower_species, grade FROM achievements ORDER BY flower_species, grade'
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: achievements
    });
  } catch (error) {
    console.error('Get all achievements error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 获取我的花圃
const getMyAchievements = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    
    // 获取用户成就
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: achievements
    });
  } catch (error) {
    console.error('Get my achievements error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 查看他人花圃
const getUserAchievements = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取用户成就
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: achievements
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getAllAchievements,
  getMyAchievements,
  getUserAchievements
};
