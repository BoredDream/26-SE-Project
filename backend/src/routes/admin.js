const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 待复核举报列表
router.get('/checkins/pending', authenticate, isAdmin, adminController.getPendingCheckins);

// 审核操作
router.patch('/checkins/:id/audit', authenticate, isAdmin, adminController.auditCheckin);

module.exports = router;
