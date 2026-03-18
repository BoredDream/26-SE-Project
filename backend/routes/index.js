const express = require('express');
const router = express.Router();

// 导入中间件
const authenticate = require('../middleware/authenticate');
const checkAdmin = require('../middleware/checkAdmin');

// 导入控制器
const UserController = require('../controllers/userController');
const LocationController = require('../controllers/locationController');
const CheckinController = require('../controllers/checkinController');
const SubscriptionController = require('../controllers/subscriptionController');
const UploadController = require('../controllers/uploadController');
const AchievementController = require('../controllers/achievementController');
const LeaderboardController = require('../controllers/leaderboardController');
const AdminController = require('../controllers/adminController');

// 用户模块
router.post('/auth/login', UserController.login);
router.patch('/users/me', authenticate, UserController.updateProfile);
router.get('/users/me', authenticate, UserController.getProfile);

// 地点模块
router.get('/locations', LocationController.getLocations);
router.get('/locations/:id', LocationController.getLocationDetail);
router.patch('/locations/:id/status', authenticate, checkAdmin, LocationController.updateBloomStatus);
router.post('/locations', authenticate, checkAdmin, LocationController.createLocation);

// 打卡模块
router.post('/checkins', authenticate, CheckinController.createCheckin);
router.get('/locations/:id/checkins', CheckinController.getLocationCheckins);
router.post('/checkins/:id/like', authenticate, CheckinController.likeCheckin);
router.post('/checkins/:id/report', authenticate, CheckinController.reportCheckin);
router.get('/users/me/checkins', authenticate, CheckinController.getMyCheckins);

// 订阅模块
router.post('/subscriptions', authenticate, SubscriptionController.subscribeLocation);
router.delete('/subscriptions/:locationId', authenticate, SubscriptionController.unsubscribeLocation);
router.get('/subscriptions', authenticate, SubscriptionController.getMySubscriptions);

// 上传模块
router.post('/upload/image', authenticate, UploadController.uploadImage);

// 成就花圃模块
router.get('/users/me/achievements', authenticate, AchievementController.getMyAchievements);
router.get('/users/me/titles', authenticate, AchievementController.getMyTitles);
router.get('/users/:id/achievements', AchievementController.getUserAchievements);

// 排行榜模块
router.get('/leaderboard/checkins', LeaderboardController.getCheckinLeaderboard);
router.get('/leaderboard/likes', LeaderboardController.getLikesLeaderboard);
router.get('/leaderboard/heatmap', LeaderboardController.getHeatmapData);

// 内容审核模块（管理员）
router.get('/admin/checkins/pending', authenticate, checkAdmin, AdminController.getPendingCheckins);
router.patch('/admin/checkins/:id/audit', authenticate, checkAdmin, AdminController.auditCheckin);

module.exports = router;