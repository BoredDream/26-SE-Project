const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locations');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 获取地点列表
router.get('/', locationController.getLocations);

// 获取地点详情
router.get('/:id', locationController.getLocationDetail);

// 创建花卉地点（仅管理员）
router.post('/', authenticate, isAdmin, locationController.createLocation);

// 更新花卉地点（仅管理员）
router.put('/:id', authenticate, isAdmin, locationController.updateLocation);

// 删除花卉地点（仅管理员）
router.delete('/:id', authenticate, isAdmin, locationController.deleteLocation);

// 更新花期状态（仅管理员）
router.patch('/:id/status', authenticate, isAdmin, locationController.updateBloomStatus);

// 花期状态投票（需登录）
router.post('/:id/vote', authenticate, locationController.voteBloomStatus);

module.exports = router;
