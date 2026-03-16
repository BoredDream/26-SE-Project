const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

// 举报打卡记录
router.post('/checkins/:id/report', authMiddleware, ReportController.create);

module.exports = router;