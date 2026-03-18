const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis 连接错误:', err);
});

redis.on('connect', () => {
  console.log('Redis 连接成功');
});

module.exports = redis;