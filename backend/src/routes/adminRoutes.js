const express = require('express');
const router = express.Router();
const CheckinController = require('../controllers/checkinController');
const LocationController = require('../controllers/locationController');
const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

// 待复核举报列表
router.get('/checkins/pending', authMiddleware, async (req, res) => {
  try {
    // TODO: 验证管理员权限
    const { page = 1, limit = 20 } = req.query;
    
    // 获取待审核的打卡记录
    const result = await require('../models/checkinModel').getPendingCheckins({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    
    res.json({
      code: 0,
      message: '获取成功',
      data: result,
    });
  } catch (error) {
    console.error('Get pending checkins error:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
    });
  }
});

// 审核打卡记录
router.patch('/checkins/:id/audit', authMiddleware, CheckinController.audit);

// 更新花期状态
router.patch('/locations/:id/status', authMiddleware, async (req, res) => {
  try {
    // TODO: 验证管理员权限
    const { id } = req.params;
    const { bloom_status } = req.body;
    
    if (!id || !bloom_status) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数',
      });
    }
    
    await LocationController.updateBloomStatus(parseInt(id), bloom_status);
    const updatedLocation = await require('../models/locationModel').findById(parseInt(id));
    
    res.json({
      code: 0,
      message: '更新成功',
      data: updatedLocation,
    });
  } catch (error) {
    console.error('Update location status error:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误',
    });
  }
});

// 待审核举报列表
router.get('/reports/pending', authMiddleware, ReportController.getPending);

// 处理举报
router.patch('/reports/:id/handle', authMiddleware, ReportController.handleReport);

module.exports = router;