const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievements');
const { authenticate } = require('../middlewares/auth');

// 获取所有成就类型（公开）
router.get('/', achievementController.getAllAchievements);

// 我的花圃（需登录）
router.get('/me', authenticate, achievementController.getMyAchievements);

// 查看他人花圃（公开）
router.get('/user/:id', achievementController.getUserAchievements);

module.exports = router;
