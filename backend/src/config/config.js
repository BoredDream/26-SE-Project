const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

module.exports = {
  // 服务配置
  port: process.env.PORT || 3000,
  
  // 数据库配置
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  // Redis 配置
  redis: {
    url: process.env.REDIS_URL,
  },
  
  // 微信配置
  wx: {
    appId: process.env.WX_APPID,
    secret: process.env.WX_SECRET,
  },
  
  // 腾讯云 COS 配置
  cos: {
    secretId: process.env.COS_SECRET_ID,
    secretKey: process.env.COS_SECRET_KEY,
    bucket: process.env.COS_BUCKET,
    region: process.env.COS_REGION,
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'campus_flower_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // 业务配置
  business: {
    gpsValidationRadius: parseInt(process.env.GPS_VALIDATION_RADIUS) || 150,
    checkinCooldownHours: parseInt(process.env.CHECKIN_COOLDOWN_HOURS) || 24,
  },
};
