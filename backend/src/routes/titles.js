const express = require('express');
const router = express.Router();
const titleController = require('../controllers/titles');
const { authenticate } = require('../middlewares/auth');

// 获取所有称号类型（公开）
router.get('/', titleController.getAllTitles);

// 我的称号（需登录）
router.get('/me', authenticate, titleController.getMyTitles);

module.exports = router;
