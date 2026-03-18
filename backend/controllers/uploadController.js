const multer = require('multer');
const sharp = require('sharp');
const COS = require('cos-nodejs-sdk-v5');
const { formatResponse } = require('../utils/helpers');
require('dotenv').config();

// 配置腾讯云 COS
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
});

const COS_BUCKET = process.env.COS_BUCKET;
const COS_REGION = process.env.COS_REGION;

// 使用内存存储上传的文件
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为 10MB
  },
  fileFilter: (req, file, cb) => {
    // 限制文件类型
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传 JPG、PNG 或 WebP 格式的图片'));
    }
  }
});

class UploadController {
  // 处理图片上传
  static uploadImage = [
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json(formatResponse(1001, '未上传文件'));
        }
        
        const file = req.file;
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        
        // 生成三级分辨率
        const [originalBuffer, standardBuffer, thumbBuffer] = await Promise.all([
          // 原图（转换为 webp 格式）
          sharp(file.buffer).webp({ quality: 92 }).toBuffer(),
          // 标准图（1080x1080，jpg 格式）
          sharp(file.buffer).resize({ width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
          // 缩略图（400x400，jpg 格式）
          sharp(file.buffer).resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 75 }).toBuffer()
        ]);
        
        // 上传到腾讯云 COS
        const [oriUrl, stdUrl, thumbUrl] = await Promise.all([
          uploadToCOS(`original/${filename}.webp`, originalBuffer),
          uploadToCOS(`standard/${filename}.jpg`, standardBuffer),
          uploadToCOS(`thumb/${filename}.jpg`, thumbBuffer)
        ]);
        
        return res.json(formatResponse(0, '图片上传成功', {
          original: oriUrl,
          standard: stdUrl,
          thumb: thumbUrl
        }));
        
      } catch (error) {
        console.error('上传图片失败:', error);
        return res.status(500).json(formatResponse(5000, '服务器内部错误'));
      }
    }
  ];
}

// 上传到腾讯云 COS 的函数
async function uploadToCOS(key, buffer) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: key,
      Body: buffer,
      ContentType: key.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
      ACL: 'public-read' // 设置为公开可读
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // 生成访问 URL
        const url = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${key}`;
        resolve(url);
      }
    });
  });
}

module.exports = UploadController;