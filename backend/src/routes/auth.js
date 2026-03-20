const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// 微信登录
router.post('/login', authController.wechatLogin);

module.exports = router;
