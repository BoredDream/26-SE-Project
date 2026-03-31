const pool = require('../config/database');

// 获取统计数据
const getStats = async (req, res) => {
  try {
    // 获取用户总数
    const [users] = await pool.execute('SELECT COUNT(*) as total FROM users');
    
    // 获取地点总数
    const [locations] = await pool.execute('SELECT COUNT(*) as total FROM flower_places');
    
    // 获取打卡总数
    const [checkins] = await pool.execute('SELECT COUNT(*) as total FROM checkins');
    
    // 获取待审核打卡数
    const [pendingCheckins] = await pool.execute('SELECT COUNT(*) as total FROM checkins WHERE audit_status = ?', ['pending']);
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        users: users[0].total,
        locations: locations[0].total,
        checkins: checkins[0].total,
        pendingCheckins: pendingCheckins[0].total
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 待复核举报列表
const getPendingCheckins = async (req, res) => {
  try {
    // 获取待审核的打卡记录
    const [checkins] = await pool.execute(
      'SELECT * FROM checkins WHERE audit_status = ? ORDER BY created_at DESC',
      ['pending']
    );
    
    res.json({
      code: 0,
      message: 'ok',
      data: checkins
    });
  } catch (error) {
    console.error('Get pending checkins error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

// 审核操作
const auditCheckin = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    // 验证参数
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ code: 1001, message: '参数错误' });
    }
    
    // 更新审核状态
    const auditStatus = action === 'approve' ? 'approved' : 'rejected';
    const [result] = await pool.execute(
      'UPDATE checkins SET audit_status = ? WHERE id = ?',
      [auditStatus, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 1004, message: '资源不存在' });
    }
    
    // TODO: 异步触发后续逻辑，如花期投票、成就检查等
    
    res.json({
      code: 0,
      message: 'ok'
    });
  } catch (error) {
    console.error('Audit checkin error:', error);
    res.status(500).json({ code: 5000, message: '服务器内部错误' });
  }
};

module.exports = {
  getStats,
  getPendingCheckins,
  auditCheckin
};
