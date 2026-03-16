const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const { redis } = require('../config/redis');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb({ code: 1001, message: '只允许上传 JPEG、PNG、GIF 格式的图片' });
  }
};

// 配置 multer 上传
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
  fileFilter: fileFilter,
});

class UploadController {
  // 检查用户上传限制
  static async checkUploadLimit(userId) {
    try {
      // 每小时20张限制
      const limit = 20;
      const key = `upload:limit:${userId}`;
      const count = await redis.get(key);
      
      if (count && parseInt(count) >= limit) {
        return false;
      }
      
      // 设置过期时间为1小时
      await redis.set(key, count ? parseInt(count) + 1 : 1, 'EX', 3600);
      return true;
    } catch (error) {
      console.error('Check upload limit error:', error);
      // Redis 连接失败时，允许上传（降级策略）
      return true;
    }
  }

  // 图片上传
  static async uploadImage(req, res) {
    // 使用 multer 中间件处理单文件上传
    upload.single('image')(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            code: 1001,
            message: err.message || '图片上传失败',
          });
        }
        
        if (!req.file) {
          return res.status(400).json({
            code: 1001,
            message: '请选择要上传的图片',
          });
        }
        
        // 检查每小时20张的限制
        const userId = req.user?.id || 'anonymous';
        const canUpload = await this.checkUploadLimit(userId);
        if (!canUpload) {
          return res.status(403).json({
            code: 1003,
            message: '图片上传达到每小时20张的限制，请稍后再试',
          });
        }
        
        const image = req.file;
        const fileId = uuidv4();
        const ext = path.extname(image.originalname).toLowerCase();
        
        // 图片处理配置
        const imageConfig = {
          original: { quality: 90 },
          standard: { width: 1024, height: 1024, quality: 80 },
          thumb: { width: 300, height: 300, quality: 70 },
        };
        
        const imageUrls = {
          original: '',
          standard: '',
          thumb: '',
        };
        
        // 处理并保存图片到不同分辨率
        for (const [size, options] of Object.entries(imageConfig)) {
          const outputPath = path.join(uploadDir, `${fileId}_${size}${ext}`);
          
          // 使用 sharp 处理图片
          const sharpInstance = sharp(image.buffer)
            .resize(options.width, options.height, {
              fit: 'cover',
              withoutEnlargement: true,
            })
            .jpeg({ quality: options.quality })
            .png({ quality: options.quality });
          
          // 保存图片
          await sharpInstance.toFile(outputPath);
          
          // TODO: 上传到腾讯云 COS
          // 这里暂时使用本地路径
          imageUrls[size] = `/uploads/${path.basename(outputPath)}`;
        }
        
        // 返回图片 URL
        res.json({
          code: 0,
          message: '图片上传成功',
          data: {
            urls: imageUrls,
            fileId,
            originalName: image.originalname,
            mimeType: image.mimetype,
            size: image.size,
          },
        });
      } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
          code: 5000,
          message: '服务器内部错误',
        });
      }
    });
  }
  
  // 批量上传图片
  static async uploadImages(req, res) {
    // 使用 multer 中间件处理多文件上传
    upload.array('images', 9)(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            code: 1001,
            message: err.message || '图片上传失败',
          });
        }
        
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            code: 1001,
            message: '请选择要上传的图片',
          });
        }
        
        // 检查每小时20张的限制
        const userId = req.user?.id || 'anonymous';
        const key = `upload:limit:${userId}`;
        const currentCount = await redis.get(key);
        const newCount = (currentCount ? parseInt(currentCount) : 0) + req.files.length;
        
        if (newCount > 20) {
          return res.status(403).json({
            code: 1003,
            message: '图片上传达到每小时20张的限制，请稍后再试',
          });
        }
        
        // 更新计数
        await redis.set(key, newCount, 'EX', 3600);
        
        const results = [];
        
        for (const image of req.files) {
          const fileId = uuidv4();
          const ext = path.extname(image.originalname).toLowerCase();
          
          // 图片处理配置
          const imageConfig = {
            original: { quality: 90 },
            standard: { width: 1024, height: 1024, quality: 80 },
            thumb: { width: 300, height: 300, quality: 70 },
          };
          
          const imageUrls = {
            original: '',
            standard: '',
            thumb: '',
          };
          
          // 处理并保存图片到不同分辨率
          for (const [size, options] of Object.entries(imageConfig)) {
            const outputPath = path.join(uploadDir, `${fileId}_${size}${ext}`);
            
            // 使用 sharp 处理图片
            const sharpInstance = sharp(image.buffer)
              .resize(options.width, options.height, {
                fit: 'cover',
                withoutEnlargement: true,
              })
              .jpeg({ quality: options.quality })
              .png({ quality: options.quality });
            
            // 保存图片
            await sharpInstance.toFile(outputPath);
            
            // TODO: 上传到腾讯云 COS
            // 这里暂时使用本地路径
            imageUrls[size] = `/uploads/${path.basename(outputPath)}`;
          }
          
          results.push({
            urls: imageUrls,
            fileId,
            originalName: image.originalname,
            mimeType: image.mimetype,
            size: image.size,
          });
        }
        
        // 返回图片 URL 列表
        res.json({
          code: 0,
          message: '图片上传成功',
          data: results,
        });
      } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({
          code: 5000,
          message: '服务器内部错误',
        });
      }
    });
  }
}

module.exports = UploadController;