const ReportModel = require('../models/reportModel');
const CheckinModel = require('../models/checkinModel');

class ReportController {
  // 创建举报记录
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { checkin_id, reason, description } = req.body;
      
      if (!checkin_id || !reason) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查打卡记录是否存在
      const checkin = await CheckinModel.findById(parseInt(checkin_id));
      
      if (!checkin) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      // 创建举报记录
      await ReportModel.create({
        user_id: userId,
        checkin_id: parseInt(checkin_id),
        reason,
        description,
      });
      
      res.json({
        code: 0,
        message: '举报成功，我们会尽快处理',
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取待审核的举报列表
  static async getPending(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { page = 1, limit = 20 } = req.query;
      
      const result = await ReportModel.getPending({
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      console.error('Get pending reports error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 处理举报
  static async handleReport(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { id } = req.params;
      const { status, handle_note } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      await ReportModel.handleReport(parseInt(id), status, handle_note);
      
      res.json({
        code: 0,
        message: '处理成功',
      });
    } catch (error) {
      console.error('Handle report error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }
}

module.exports = ReportController;