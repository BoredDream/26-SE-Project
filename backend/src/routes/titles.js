const express = require('express');
const router = express.Router();
const titleController = require('../controllers/titles');
const { authenticate } = require('../middlewares/auth');

// 我的称号（需登录）
router.get('/me', authenticate, titleController.getMyTitles);

module.exports = router;
