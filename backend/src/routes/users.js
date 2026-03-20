const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// 获取用户列表
router.get('/', usersController.getUsers);

// 获取单个用户
router.get('/:id', usersController.getUserById);

// 创建用户
router.post('/', usersController.createUser);

// 更新用户
router.put('/:id', usersController.updateUser);

// 删除用户
router.delete('/:id', usersController.deleteUser);

module.exports = router;
