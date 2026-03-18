const Checkin = require('../models/checkin');
const db = require('../config/database');
const { formatResponse } = require('../utils/helpers');

class AdminController {
  // 获取待审核的打卡列表
  static async getPendingCheckins(req, res) {
    try {
      const [checkins] = await db.query('SELECT * FROM checkins WHERE audit_status = ? ORDER BY created_at ASC', ['pending']);
      
      // 解析图片 JSON
      const parsedCheckins = checkins.map(checkin => {
        checkin.images = JSON.parse(checkin.images);
        return checkin;
      });
      
      return res.json(formatResponse(0, '获取成功', parsedCheckins));
    } catch (error) {
      console.error('获取待审核打卡列表失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 审核打卡内容
  static async auditCheckin(req, res) {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    // 验证操作类型
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json(formatResponse(1001, '参数错误，操作类型无效'));
    }
    
    // 拒绝时必须提供理由
    if (action === 'reject' && !reason) {
      return res.status(400).json(formatResponse(1001, '参数错误，拒绝时必须提供理由'));
    }
    
    try {
      // 检查打卡是否存在
      const checkin = await Checkin.findById(id);
      if (!checkin) {
        return res.status(404).json(formatResponse(1004, '打卡不存在'));
      }
      
      // 更新审核状态
      const status = action === 'approve' ? 'approved' : 'rejected';
      await Checkin.updateAuditStatus(id, status, reason);
      
      // 如果审核通过，异步执行成就触发、花期投票等逻辑
      
      return res.json(formatResponse(0, `审核${action === 'approve' ? '通过' : '拒绝'}成功`));
    } catch (error) {
      console.error('审核打卡失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = AdminController;