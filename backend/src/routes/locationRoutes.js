const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middlewares/authMiddleware');

// 获取地点列表
router.get('/', locationController.getAll);

// 获取地点详情
router.get('/:id', locationController.getById);

// 获取附近地点
router.get('/nearby', locationController.getNearby);

// 创建地点（管理员）
router.post('/', authMiddleware, locationController.create);

// 更新地点（管理员）
router.put('/:id', authMiddleware, locationController.update);

// 删除地点（管理员）
router.delete('/:id', authMiddleware, locationController.delete);

// 更新花期状态（管理员）
router.patch('/:id/status', authMiddleware, async (req, res) => {
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
    
    await locationController.updateBloomStatus(parseInt(id), bloom_status);
    const updatedLocation = await require('../models/locationModel').findById(parseInt(id));
    
    res.json({
      code: 0,
      message: '花期状态更新成功',
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

module.exports = router;
