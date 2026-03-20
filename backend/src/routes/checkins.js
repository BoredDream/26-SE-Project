const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkins');
const { authenticate } = require('../middlewares/auth');

// 发布打卡（需登录）
router.post('/', authenticate, checkinController.createCheckin);

// 点赞（需登录）
router.post('/:id/like', authenticate, checkinController.likeCheckin);

// 举报打卡（需登录）
router.post('/:id/report', authenticate, checkinController.reportCheckin);

module.exports = router;
