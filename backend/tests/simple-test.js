const axios = require('axios');

// API 基本配置
const API_BASE_URL = 'http://localhost:3000/v1';
let token = null;

// 简单的延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试结果统计
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// 简单的测试函数
async function testApi(name, testFn) {
  testResults.total++;
  console.log(`\n=== 测试: ${name} ===`);
  try {
    await testFn();
    console.log(`✅ ${name}: 测试通过`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${name}: 测试失败`);
    console.log(`   错误信息: ${error.message}`);
    if (error.response) {
      console.log(`   响应状态: ${error.response.status}`);
      console.log(`   响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    testResults.failed++;
  }
}

// 格式化输出测试结果
function printTestSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('API 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`总测试数: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(50));
}

// 主测试函数
async function runTests() {
  console.log('开始运行 API 简单测试...');
  console.log(`API 基础 URL: ${API_BASE_URL}`);
  console.log('='.repeat(50));

  try {
    // 1. 健康检查
    await testApi('健康检查', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.status !== 200 || response.data.code !== 0) {
        throw new Error('健康检查失败');
      }
      console.log('   服务器状态: 正常');
      console.log('   服务器时间:', response.data.data.timestamp);
    });

    // 2. 获取 JWT Token
    await testApi('获取认证 Token', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        code: 'test_code'
      });
      if (response.status !== 200 || response.data.code !== 0) {
        throw new Error('登录失败');
      }
      token = response.data.data.token;
      console.log('   Token 获取成功:', token.substring(0, 20) + '...');
    });

    // 如果获取到 Token，继续测试需要认证的接口
    if (token) {
      // 创建 Axios 实例，自动附加 Token
      const authAxios = axios.create({
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // 3. 获取用户信息
      await testApi('获取用户信息', async () => {
        const response = await authAxios.get(`${API_BASE_URL}/auth/me`);
        if (response.status !== 200 || response.data.code !== 0) {
          throw new Error('获取用户信息失败');
        }
        console.log('   用户 ID:', response.data.data.user.id);
        console.log('   用户名:', response.data.data.user.nickname);
        console.log('   用户角色:', response.data.data.user.role);
      });

      // 4. 获取地点列表
      await testApi('获取地点列表', async () => {
        const response = await axios.get(`${API_BASE_URL}/locations`);
        if (response.status !== 200 || response.data.code !== 0) {
          throw new Error('获取地点列表失败');
        }
        console.log('   地点总数:', response.data.data.total);
        console.log('   每页数量:', response.data.data.limit);
        console.log('   当前页码:', response.data.data.page);
        if (response.data.data.list.length > 0) {
          console.log('   第一个地点:', response.data.data.list[0].name);
        }
      });

      // 5. 获取附近地点
      await testApi('获取附近地点', async () => {
        const response = await axios.get(`${API_BASE_URL}/locations/nearby`, {
          params: {
            lat: 30.287459,
            lng: 120.153576,
            radius: 1000
          }
        });
        if (response.status !== 200 || response.data.code !== 0) {
          throw new Error('获取附近地点失败');
        }
        console.log('   附近地点数量:', response.data.data.list.length);
      });

      // 6. 获取打卡王榜
      await testApi('获取打卡王榜', async () => {
        const response = await axios.get(`${API_BASE_URL}/leaderboard/checkins`);
        if (response.status !== 200 || response.data.code !== 0) {
          throw new Error('获取打卡王榜失败');
        }
        console.log('   排行榜数据数量:', response.data.data.length);
        if (response.data.data.length > 0) {
          console.log('   第一名:', response.data.data[0].nickname, `(打卡 ${response.data.data[0].checkin_count} 次)`);
        }
      });

      // 7. 获取用户成就列表
      await testApi('获取用户成就列表', async () => {
        const response = await authAxios.get(`${API_BASE_URL}/achievements/user/me`);
        if (response.status !== 200 || response.data.code !== 0) {
          throw new Error('获取用户成就列表失败');
        }
        console.log('   用户成就数量:', response.data.data.length);
      });

    } else {
      console.log('\n⚠️  未获取到 Token，跳过需要认证的接口测试');
    }

  } catch (error) {
    console.log('\n❌ 测试过程中发生严重错误:', error.message);
  } finally {
    // 输出测试结果汇总
    printTestSummary();
  }
}

// 运行测试
runTests();
