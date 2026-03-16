const express = require('express');
const router = express.Router();
const titleController = require('../controllers/titleController');
const authMiddleware = require('../middlewares/authMiddleware');

// 获取用户的称号列表
router.get('/user/me', authMiddleware, titleController.getMyTitles);

// 检查用户是否拥有特定称号
router.get('/user/me/check/:titleKey', authMiddleware, titleController.checkTitle);

// 设置用户当前佩戴的称号
router.put('/user/me/active/:titleKey', authMiddleware, titleController.setActiveTitle);

// 获取用户当前佩戴的称号
router.get('/user/me/active', authMiddleware, titleController.getActiveTitle);

module.exports = router;
