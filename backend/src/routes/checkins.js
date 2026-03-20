const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkins');

// 获取所有打卡数据（用于管理端）
router.get('/', checkinController.getAllCheckins);

// 发布打卡（需登录）
router.post('/', checkinController.createCheckin);

// 点赞（需登录）
router.post('/:id/like', checkinController.likeCheckin);

// 举报打卡（需登录）
router.post('/:id/report', checkinController.reportCheckin);

module.exports = router;
