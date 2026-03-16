const Redis = require('ioredis');
const config = require('./config');

// 创建 Redis 客户端
const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3, // 限制重试次数
  enableReadyCheck: false,
  retryStrategy: (times) => {
    // 指数退避重试策略
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

// 处理 Redis 连接错误
redis.on('error', (error) => {
  console.error('⚠️  Redis 连接错误:', error.message);
});

// 测试 Redis 连接
async function testConnection() {
  try {
    await redis.ping();
    console.log('✅ Redis 连接成功');
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message);
    throw error;
  }
}

module.exports = {
  redis,
  testConnection,
};
