const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');

// 订阅地点
router.post('/', authMiddleware, subscriptionController.subscribe);

// 取消订阅
router.delete('/:locationId', authMiddleware, subscriptionController.unsubscribe);

// 检查是否已订阅
router.get('/:locationId/check', authMiddleware, subscriptionController.checkSubscription);

// 获取用户的订阅列表
router.get('/user/me', authMiddleware, subscriptionController.getMySubscriptions);

module.exports = router;
