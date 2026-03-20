const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptions');
const { authenticate } = require('../middlewares/auth');

// 订阅地点（需登录）
router.post('/', authenticate, subscriptionController.subscribe);

// 取消订阅
router.delete('/:locationId', authenticate, subscriptionController.unsubscribe);

// 我的订阅列表（需登录）
router.get('/', authenticate, subscriptionController.getMySubscriptions);

module.exports = router;
