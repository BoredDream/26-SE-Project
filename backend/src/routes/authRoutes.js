const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// 微信登录
router.post('/login', authController.login);

// 获取当前用户信息
router.get('/me', authMiddleware, authController.getMe);

// 更新用户信息
router.put('/me', authMiddleware, authController.updateMe);

module.exports = router;
