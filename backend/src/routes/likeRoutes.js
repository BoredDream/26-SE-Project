const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middlewares/authMiddleware');

// 点赞打卡记录
router.post('/:checkinId', authMiddleware, likeController.like);

// 取消点赞
router.delete('/:checkinId', authMiddleware, likeController.unlike);

// 检查是否已点赞
router.get('/:checkinId/check', authMiddleware, likeController.checkLike);

// 获取打卡记录的点赞列表
router.get('/:checkinId/list', likeController.getLikesByCheckinId);

// 获取用户的点赞记录
router.get('/user/me', authMiddleware, likeController.getMyLikes);

module.exports = router;
