const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 打卡王榜
router.get('/checkins', async (req, res) => {
  try {
    const { page = 1, limit = 20, period = 'month' } = req.query;
    const offset = (page - 1) * limit;
    
    // 根据时间周期获取不同的时间范围
    let timeCondition = '';
    if (period === 'week') {
      timeCondition = 'AND c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      timeCondition = 'AND c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }
    
    // 查询打卡排行榜
    const [rows] = await pool.execute(
      `SELECT u.id, u.nickname, u.avatar_url, COUNT(c.id) as checkin_count 
       FROM users u 
       LEFT JOIN checkins c ON u.id = c.user_id 
       WHERE c.is_visible = 1 AND c.audit_status = 'approved' ${timeCondition} 
       GROUP BY u.id 
       ORDER BY checkin_count DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(DISTINCT u.id) as total 
       FROM users u 
       LEFT JOIN checkins c ON u.id = c.user_id 
       WHERE c.is_visible = 1 AND c.audit_status = 'approved' ${timeCondition}`
    );
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get checkin leaderboard error:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
    });
  }
});

// 点赞榜
router.get('/likes', async (req, res) => {
  try {
    const { page = 1, limit = 20, period = 'month' } = req.query;
    const offset = (page - 1) * limit;
    
    // 根据时间周期获取不同的时间范围
    let timeCondition = '';
    if (period === 'week') {
      timeCondition = 'AND c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      timeCondition = 'AND c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }
    
    // 查询点赞排行榜
    const [rows] = await pool.execute(
      `SELECT u.id, u.nickname, u.avatar_url, SUM(c.likes_count) as total_likes 
       FROM users u 
       LEFT JOIN checkins c ON u.id = c.user_id 
       WHERE c.is_visible = 1 AND c.audit_status = 'approved' ${timeCondition} 
       GROUP BY u.id 
       ORDER BY total_likes DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(DISTINCT u.id) as total 
       FROM users u 
       LEFT JOIN checkins c ON u.id = c.user_id 
       WHERE c.is_visible = 1 AND c.audit_status = 'approved' ${timeCondition}`
    );
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get likes leaderboard error:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
    });
  }
});

// 地图热力数据
router.get('/heatmap', async (req, res) => {
  try {
    // 获取热力图数据
    const [rows] = await pool.execute(
      `SELECT l.latitude, l.longitude, l.checkin_count, l.name, l.flower_species 
       FROM locations l 
       WHERE l.checkin_count > 0 
       ORDER BY l.checkin_count DESC`
    );
    
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: rows,
      },
    });
  } catch (error) {
    console.error('Get heatmap data error:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
    });
  }
});

module.exports = router;