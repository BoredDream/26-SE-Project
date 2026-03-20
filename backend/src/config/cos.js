const COS = require('cos-nodejs-sdk-v5');

// 创建COS客户端
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID || '',
  SecretKey: process.env.COS_SECRET_KEY || ''
});

module.exports = {
  cos,
  bucket: process.env.COS_BUCKET || '',
  region: process.env.COS_REGION || 'ap-guangzhou'
};
