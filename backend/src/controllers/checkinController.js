const { getDistance } = require('geolib');
const CheckinModel = require('../models/checkinModel');
const LocationModel = require('../models/locationModel');
const AchievementModel = require('../models/achievementModel');
const TitleModel = require('../models/titleModel');
const config = require('../config/config');
const { pool } = require('../config/db');

class CheckinController {
  // 创建打卡记录
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { 
        location_id, 
        bloom_report, 
        content, 
        images, 
        user_latitude, 
        user_longitude
      } = req.body;
      
      if (!location_id || !images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查地点是否存在
      const location = await LocationModel.findById(parseInt(location_id));
      
      if (!location) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      // GPS 验证
      let gps_verified = 0;
      if (user_latitude && user_longitude) {
        const distance = getDistance(
          { latitude: user_latitude, longitude: user_longitude },
          { latitude: location.latitude, longitude: location.longitude }
        );
        
        if (distance <= config.business.gpsValidationRadius) {
          gps_verified = 1;
        }
      }
      
      // 创建打卡记录
      const checkinId = await CheckinModel.create({
        user_id: userId,
        location_id: parseInt(location_id),
        bloom_report,
        content,
        images,
        user_latitude,
        user_longitude,
        gps_verified,
      });
      
      // 增加地点打卡计数
      await LocationModel.incrementCheckinCount(parseInt(location_id));
      
      // 处理成就
      await this.handleAchievements(userId, location_id, location.flower_species, gps_verified);
      
      // 处理称号
      await this.handleTitles(userId);
      
      // 更新地点花期状态
      await this.updateBloomStatus(parseInt(location_id));
      
      const checkin = await CheckinModel.findById(checkinId);
      
      res.json({
        code: 0,
        message: '打卡成功',
        data: checkin,
      });
    } catch (error) {
      console.error('Create checkin error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取打卡详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      const checkin = await CheckinModel.findById(parseInt(id));
      
      if (!checkin) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      res.json({
        code: 0,
        message: '获取成功',
        data: checkin,
      });
    } catch (error) {
      console.error('Get checkin by id error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取地点的打卡记录
  static async getByLocationId(req, res) {
    try {
      const { locationId } = req.params;
      const { page = 1, limit = 10, status = 'approved' } = req.query;
      
      if (!locationId) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      const result = await CheckinModel.getByLocationId(parseInt(locationId), {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });
      
      res.json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      console.error('Get checkins by location id error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户的打卡记录
  static async getMyCheckins(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await CheckinModel.getByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      console.error('Get user checkins error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 审核打卡记录（管理员）
  static async audit(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { id } = req.params;
      const { status, reason } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      await CheckinModel.audit(parseInt(id), status, reason);
      
      const checkin = await CheckinModel.findById(parseInt(id));
      
      res.json({
        code: 0,
        message: '审核成功',
        data: checkin,
      });
    } catch (error) {
      console.error('Audit checkin error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 处理成就
  static async handleAchievements(userId, locationId, flowerSpecies, gpsVerified) {
    try {
      // 确定成就等级
      const grade = gpsVerified ? 'gold' : 'silver';
      
      // 创建或更新成就
      await AchievementModel.createOrUpdate({
        user_id: userId,
        flower_species: flowerSpecies,
        location_id: locationId,
        grade,
        unlock_time: new Date(),
      });
    } catch (error) {
      console.error('Handle achievements error:', error);
    }
  }

  // 获取日期对应的季节
  static getSeason(date) {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // 处理称号
  static async handleTitles(userId) {
    try {
      // 获取用户打卡次数
      const checkinCount = await CheckinModel.countByUserId(userId);
      
      // 1. 首次打卡 - 花卉初探者
      if (checkinCount === 1) {
        await TitleModel.grant({
          user_id: userId,
          title_key: 'first_checkin',
          earned_at: new Date(),
        });
      }
      
      // 2. 打卡10次 - 花卉观察员
      if (checkinCount === 10) {
        await TitleModel.grant({
          user_id: userId,
          title_key: 'checkin_10',
          earned_at: new Date(),
        });
      }
      
      // 3. 四季守望者 - 同一地点春夏秋冬各≥1次打卡
      const [locationSeasonCheckins] = await pool.execute(
        `SELECT DISTINCT location_id, MONTH(created_at) as month 
         FROM checkins 
         WHERE user_id = ? AND audit_status = 'approved'`,
        [userId]
      );
      
      // 按地点分组
      const locations = {};
      for (const checkin of locationSeasonCheckins) {
        const locationId = checkin.location_id;
        if (!locations[locationId]) {
          locations[locationId] = new Set();
        }
        const date = new Date();
        date.setMonth(checkin.month - 1);
        locations[locationId].add(this.getSeason(date));
      }
      
      // 检查是否有地点满足四季打卡条件
      for (const [locationId, seasons] of Object.entries(locations)) {
        if (seasons.size >= 4) {
          await TitleModel.grant({
            user_id: userId,
            title_key: 'season_watcher',
            earned_at: new Date(),
          });
          break; // 只需要授予一次
        }
      }
      
      // 其他称号逻辑在其他地方处理
    } catch (error) {
      console.error('Handle titles error:', error);
    }
  }

  // 更新地点花期状态
  static async updateBloomStatus(locationId) {
    try {
      // 获取最近24小时的打卡记录
      const recentCheckins = await CheckinModel.getRecentByLocationId(locationId, 24, 50);
      
      // 过滤出有效的花期报告
      const validReports = recentCheckins.filter(checkin => checkin.bloom_report);
      
      if (validReports.length < 3) {
        return;
      }
      
      // 统计花期状态
      const statusCounts = {
        budding: 0,
        blooming: 0,
        withering: 0,
      };
      
      validReports.forEach(checkin => {
        if (checkin.bloom_report) {
          statusCounts[checkin.bloom_report]++;
        }
      });
      
      // 计算总数和60%阈值
      const totalReports = validReports.length;
      const threshold = Math.ceil(totalReports * 0.6);
      
      // 找出符合60%阈值的状态
      let dominantStatus = null;
      
      for (const [status, count] of Object.entries(statusCounts)) {
        if (count >= threshold) {
          dominantStatus = status;
          break;
        }
      }
      
      // 如果有符合条件的状态，则更新花期状态
      if (dominantStatus) {
        await LocationModel.updateBloomStatus(locationId, dominantStatus);
      }
    } catch (error) {
      console.error('Update bloom status error:', error);
    }
  }
}

module.exports = CheckinController;
