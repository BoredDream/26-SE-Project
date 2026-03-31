const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate, isAdmin } = require('../middlewares/auth');

// 获取当前登录用户信息
router.get('/me', authenticate, usersController.getCurrentUser);

// 更新当前用户信息
router.put('/me', authenticate, usersController.updateCurrentUser);

// 获取用户列表（仅管理员）
router.get('/', authenticate, isAdmin, usersController.getUsers);

// 获取单个用户
router.get('/:id', authenticate, usersController.getUserById);

// 创建用户
router.post('/', usersController.createUser);

// 更新用户
router.put('/:id', authenticate, usersController.updateUser);

// 删除用户（仅管理员）
router.delete('/:id', authenticate, isAdmin, usersController.deleteUser);

module.exports = router;
