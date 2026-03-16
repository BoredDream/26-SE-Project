const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');

// 图片上传
router.post('/image', authMiddleware, UploadController.uploadImage);

// 批量图片上传
router.post('/images', authMiddleware, UploadController.uploadImages);

module.exports = router;