const express = require('express');
const router = express.Router();
const flowersController = require('../controllers/flowers');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 获取花卉列表
router.get('/', authenticate, flowersController.getFlowers);

// 获取单个花卉详情
router.get('/:id', authenticate, flowersController.getFlowerById);

// 创建花卉信息（管理员）
router.post('/', authenticate, isAdmin, flowersController.createFlower);

// 更新花卉信息（管理员）
router.put('/:id', authenticate, isAdmin, flowersController.updateFlower);

// 删除花卉（管理员）
router.delete('/:id', authenticate, isAdmin, flowersController.deleteFlower);

module.exports = router;
