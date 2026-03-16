const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middlewares/authMiddleware');

// 获取用户的成就列表
router.get('/user/me', authMiddleware, achievementController.getMyAchievements);

// 获取用户的成就统计
router.get('/user/me/stats', authMiddleware, achievementController.getAchievementStats);

// 获取用户在特定地点的成就
router.get('/user/me/location/:locationId', authMiddleware, achievementController.getAchievementByLocation);

// 查看他人花圃
router.get('/users/:id/achievements', achievementController.getOthersAchievements);

module.exports = router;
