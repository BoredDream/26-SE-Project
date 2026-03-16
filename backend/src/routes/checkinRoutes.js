const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const authMiddleware = require('../middlewares/authMiddleware');

// 创建打卡记录
router.post('/', authMiddleware, checkinController.create);

// 获取打卡详情
router.get('/:id', checkinController.getById);

// 获取地点的打卡记录
router.get('/location/:locationId', checkinController.getByLocationId);

// 获取用户的打卡记录
router.get('/user/me', authMiddleware, checkinController.getMyCheckins);

// 审核打卡记录（管理员）
router.put('/:id/audit', authMiddleware, checkinController.audit);

module.exports = router;
