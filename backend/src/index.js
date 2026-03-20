const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 信任代理设置
app.set('trust proxy', true);

// 配置CORS
app.use(cors());

// 设置请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置静态文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 配置请求频率限制
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 100, // 每个IP最多100个请求
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
});
app.use(limiter);

// 引入路由
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const checkinRoutes = require('./routes/checkins');
const subscriptionRoutes = require('./routes/subscriptions');
const achievementRoutes = require('./routes/achievements');
const titleRoutes = require('./routes/titles');
const adminRoutes = require('./routes/admin');

// 注册路由
app.use('/v1/auth', authRoutes);
app.use('/v1/locations', locationRoutes);
app.use('/v1/checkins', checkinRoutes);
app.use('/v1/subscriptions', subscriptionRoutes);
app.use('/v1/achievements', achievementRoutes);
app.use('/v1/titles', titleRoutes);
app.use('/v1/admin', adminRoutes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'healthy' } });
});

// 统一错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 5000, message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
