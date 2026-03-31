const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticate } = require('../middlewares/auth');

// 微信登录
router.post('/login', authController.wechatLogin);

// 微信注册
router.post('/register', authController.wechatRegister);

// 微信网页扫码登录
router.get('/web/login', authController.getWebLoginQRCode);
router.get('/web/login/status', authController.checkWebLoginStatus);
router.get('/web/callback', authController.webLoginCallback);

// 退出登录
router.post('/logout', authenticate, authController.logout);

// 更新微信用户信息
router.post('/update', authenticate, authController.updateWechatUserInfo);

module.exports = router;
