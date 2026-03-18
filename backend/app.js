const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

// 导入路由
const routes = require('./routes');

// 创建 Express 应用
const app = express();

// 配置 CORS
app.use(cors({
  origin: '*', // 生产环境中应该限制为特定域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 配置请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个 IP 最多 100 个请求
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 配置解析请求体的中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 挂载路由
app.use('/v1', routes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 处理 404
app.use((req, res) => {
  res.status(404).json({ code: 1004, message: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误处理:', err);
  
  // 处理 Multer 上传错误
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ code: 1001, message: '文件大小不能超过 10MB' });
    }
    return res.status(400).json({ code: 1001, message: '文件上传失败' });
  }
  
  // 处理文件类型错误
  if (err.message && err.message.includes('只允许上传')) {
    return res.status(400).json({ code: 1001, message: err.message });
  }
  
  // 处理其他错误
  res.status(500).json({ code: 5000, message: '服务器内部错误' });
});

// 获取端口号
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已启动，正在监听端口 ${PORT}`);
  console.log(`API 基础路径: http://localhost:${PORT}/v1`);
});

module.exports = app;