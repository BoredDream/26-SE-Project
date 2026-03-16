const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { testConnection: testDbConnection } = require('./config/db');
const { testConnection: testRedisConnection } = require('./config/redis');
const routes = require('./routes');
const CronJobs = require('./cron');

// 创建 Express 应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务，用于访问上传的图片
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 配置请求速率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // 健康检查和一些公开接口不限制
    return req.path === '/v1/health' || req.path.startsWith('/v1/leaderboard');
  },
});

// 上传接口限流
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 20, // 每个IP每小时最多20次上传请求
  standardHeaders: true,
  legacyHeaders: false,
});

// 应用限流
app.use(generalLimiter);
// 上传接口单独限流
app.use('/v1/upload', uploadLimiter);

// 注册路由
app.use('/v1', routes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 1004,
    message: 'API 不存在',
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    code: 5000,
    message: '服务器内部错误',
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    try {
      await testDbConnection();
    } catch (dbError) {
      console.error('⚠️  数据库连接失败，部分功能可能不可用:', dbError.message);
      console.warn('⚠️  请确保 MySQL 服务正在运行，并且配置正确');
    }
    
    // 测试 Redis 连接
    try {
      await testRedisConnection();
    } catch (redisError) {
      console.error('⚠️  Redis 连接失败，部分功能可能不可用:', redisError.message);
      console.warn('⚠️  请确保 Redis 服务正在运行，并且配置正确');
    }
    
    // 初始化定时任务
    try {
      CronJobs.init();
    } catch (cronError) {
      console.error('⚠️  定时任务初始化失败:', cronError.message);
    }
    
    // 启动服务器
    app.listen(config.port, () => {
      console.log(`🚀 服务器已启动，监听端口 ${config.port}`);
      console.log(`📡 API 地址: http://localhost:${config.port}/v1`);
      console.log(`💚 健康检查: http://localhost:${config.port}/v1/health`);
      console.log('📝 注意：部分服务（数据库或 Redis）连接失败，部分功能可能不可用');
    });
  } catch (error) {
    console.error('❌ 启动服务器失败:', error);
    // 不再退出进程，让服务器继续运行
    console.warn('⚠️  服务器将在部分功能不可用的情况下继续运行');
    app.listen(config.port, () => {
      console.log(`🚀 服务器已启动，监听端口 ${config.port}`);
      console.log(`📡 API 地址: http://localhost:${config.port}/v1`);
      console.log(`💚 健康检查: http://localhost:${config.port}/v1/health`);
      console.log('📝 注意：服务器启动时发生错误，部分功能可能不可用');
    });
  }
};

// 启动服务器
startServer();
