const express = require('express');
const router = express.Router();

// 导入子路由
const authRoutes = require('./authRoutes');
const locationRoutes = require('./locationRoutes');
const checkinRoutes = require('./checkinRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const likeRoutes = require('./likeRoutes');
const achievementRoutes = require('./achievementRoutes');
const titleRoutes = require('./titleRoutes');
const uploadRoutes = require('./uploadRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Flower API is running',
    timestamp: new Date().toISOString(),
  });
});

// 注册子路由
router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/checkins', checkinRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/likes', likeRoutes);
router.use('/achievements', achievementRoutes);
router.use('/titles', titleRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;
