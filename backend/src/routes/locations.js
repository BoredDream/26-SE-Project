const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 获取地点列表
router.get('/', locationController.getLocations);

// 获取地点详情
router.get('/:id', locationController.getLocationDetail);

// 更新花期状态（仅管理员）
router.patch('/:id/status', authenticate, isAdmin, locationController.updateBloomStatus);

module.exports = router;
