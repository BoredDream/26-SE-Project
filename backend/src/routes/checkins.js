const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkins');
const { authenticate, isAdmin } = require('../middlewares/auth');

console.log('checkins路由文件被加载');

// 发布打卡（需登录）
router.post('/', authenticate, checkinController.createCheckin);
console.log('注册路由: POST /');

// 获取当前用户的打卡列表
router.get('/me', authenticate, checkinController.getMyCheckins);
console.log('注册路由: GET /me');

// 获取某地点的打卡列表
router.get('/place/:placeId', authenticate, checkinController.getCheckinsByPlace);
console.log('注册路由: GET /place/:placeId');

// 获取某花卉的打卡列表
router.get('/flower/:flowerId', authenticate, checkinController.getCheckinsByFlower);
console.log('注册路由: GET /flower/:flowerId');

// 获取单个打卡详情
router.get('/:id', authenticate, checkinController.getCheckinById);
console.log('注册路由: GET /:id');

// 更新打卡内容
router.put('/:id', authenticate, checkinController.updateCheckin);
console.log('注册路由: PUT /:id');

// 删除打卡
router.delete('/:id', authenticate, checkinController.deleteCheckin);
console.log('注册路由: DELETE /:id');

// 点赞（需登录）
router.post('/:id/like', authenticate, checkinController.likeCheckin);
console.log('注册路由: POST /:id/like');

// 举报打卡（需登录）
router.post('/:id/report', authenticate, checkinController.reportCheckin);
console.log('注册路由: POST /:id/report');

// 获取打卡点赞用户列表
router.get('/:id/likes', authenticate, checkinController.getCheckinLikes);
console.log('注册路由: GET /:id/likes');

// 获取所有打卡数据（公开）
router.get('/', checkinController.getAllCheckins);
console.log('注册路由: GET /');

console.log('checkins路由文件加载完成');

module.exports = router;