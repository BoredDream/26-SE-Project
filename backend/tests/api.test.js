const request = require('supertest');
const app = require('../src/app');

let token = null;
let testLocationId = null;
let testCheckinId = null;

describe('校园花卉地图 API 测试', () => {
  // 测试环境设置
  beforeAll(async () => {
    console.log('开始 API 测试...');
  });

  // 测试环境清理
  afterAll(async () => {
    console.log('API 测试完成');
  });

  // 健康检查接口
  describe('健康检查接口', () => {
    it('GET /health 应该返回状态 200 和健康信息', async () => {
      const res = await request(app).get('/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('message', 'ok');
      expect(res.body).toHaveProperty('data');
    });
  });

  // 认证相关接口
  describe('认证相关接口', () => {
    it('POST /auth/login 应该返回 JWT Token', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({ code: 'test_code' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('token');
      
      token = res.body.data.token;
      console.log('获取到 Token:', token);
    });

    it('GET /auth/me 应该返回当前用户信息', async () => {
      const res = await request(app)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
    });

    it('PUT /auth/me 应该能够更新用户信息', async () => {
      const res = await request(app)
        .put('/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ nickname: '测试用户' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body.data.user.nickname).toBe('测试用户');
    });
  });

  // 地点相关接口
  describe('地点相关接口', () => {
    it('GET /locations 应该返回地点列表', async () => {
      const res = await request(app).get('/v1/locations');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      
      // 如果有地点数据，保存第一个地点的 ID
      if (res.body.data.list.length > 0) {
        testLocationId = res.body.data.list[0].id;
        console.log('获取到测试地点 ID:', testLocationId);
      }
    });

    if (testLocationId) {
      it('GET /locations/:id 应该返回指定地点详情', async () => {
        const res = await request(app).get(`/v1/locations/${testLocationId}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
        expect(res.body.data.id).toBe(testLocationId);
      });
    }

    it('GET /locations/nearby 应该返回附近地点', async () => {
      const res = await request(app)
        .get('/v1/locations/nearby')
        .query({ lat: 30.287459, lng: 120.153576, radius: 1000 });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('list');
    });
  });

  // 打卡相关接口
  describe('打卡相关接口', () => {
    // 创建打卡记录
    it('POST /checkins 应该能够创建打卡记录', async () => {
      if (!testLocationId) {
        console.log('跳过创建打卡测试，因为没有可用的地点');
        return;
      }
      
      const res = await request(app)
        .post('/v1/checkins')
        .set('Authorization', `Bearer ${token}`)
        .send({
          location_id: testLocationId,
          content: '测试打卡内容',
          images: ['https://example.com/image.jpg'],
          latitude: 30.287459,
          longitude: 120.153576,
          bloom_status: 'blooming'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      
      testCheckinId = res.body.data.id;
      console.log('获取到测试打卡 ID:', testCheckinId);
    });

    // 获取打卡记录列表
    it('GET /checkins 应该返回打卡记录列表', async () => {
      const res = await request(app).get('/v1/checkins');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('list');
    });

    // 获取用户打卡记录
    it('GET /checkins/user/me 应该返回当前用户的打卡记录', async () => {
      const res = await request(app)
        .get('/v1/checkins/user/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });
  });

  // 点赞相关接口
  describe('点赞相关接口', () => {
    if (testCheckinId) {
      it('POST /likes/:checkinId 应该能够点赞打卡记录', async () => {
        const res = await request(app)
          .post(`/v1/likes/${testCheckinId}`)
          .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
      });

      it('DELETE /likes/:checkinId 应该能够取消点赞', async () => {
        const res = await request(app)
          .delete(`/v1/likes/${testCheckinId}`)
          .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
      });
    }
  });

  // 订阅相关接口
  describe('订阅相关接口', () => {
    if (testLocationId) {
      it('POST /subscriptions 应该能够订阅地点', async () => {
        const res = await request(app)
          .post('/v1/subscriptions')
          .set('Authorization', `Bearer ${token}`)
          .send({ locationId: testLocationId });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
      });

      it('GET /subscriptions/user/me 应该返回用户订阅列表', async () => {
        const res = await request(app)
          .get('/v1/subscriptions/user/me')
          .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
      });

      it('DELETE /subscriptions/:locationId 应该能够取消订阅', async () => {
        const res = await request(app)
          .delete(`/v1/subscriptions/${testLocationId}`)
          .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('code', 0);
      });
    }
  });

  // 排行榜相关接口
  describe('排行榜相关接口', () => {
    it('GET /leaderboard/checkins 应该返回打卡王榜', async () => {
      const res = await request(app).get('/v1/leaderboard/checkins');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });

    it('GET /leaderboard/likes 应该返回点赞榜', async () => {
      const res = await request(app).get('/v1/leaderboard/likes');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });

    it('GET /leaderboard/heatmap 应该返回地图热力数据', async () => {
      const res = await request(app).get('/v1/leaderboard/heatmap');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });
  });

  // 成就相关接口
  describe('成就相关接口', () => {
    it('GET /achievements/user/me 应该返回用户成就列表', async () => {
      const res = await request(app)
        .get('/v1/achievements/user/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });

    it('GET /achievements/user/me/stats 应该返回用户成就统计', async () => {
      const res = await request(app)
        .get('/v1/achievements/user/me/stats')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('code', 0);
      expect(res.body).toHaveProperty('data');
    });
  });
});
