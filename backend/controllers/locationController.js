const Location = require('../models/location');
const Checkin = require('../models/checkin');
const { formatResponse } = require('../utils/helpers');

class LocationController {
  // 获取地点列表
  static async getLocations(req, res) {
    const { status, keyword } = req.query;
    
    try {
      const locations = await Location.findAll({ status, keyword });
      return res.json(formatResponse(0, '获取成功', locations));
    } catch (error) {
      console.error('获取地点列表失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取地点详情
  static async getLocationDetail(req, res) {
    const { id } = req.params;
    
    try {
      const location = await Location.findById(id);
      
      if (!location) {
        return res.status(404).json(formatResponse(1004, '地点不存在'));
      }
      
      // 获取最近10条已审核通过的打卡记录
      const checkins = await Checkin.findByLocationId(id, { pageSize: 10 });
      
      return res.json(formatResponse(0, '获取成功', {
        location,
        recentCheckins: checkins
      }));
    } catch (error) {
      console.error('获取地点详情失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 更新花期状态（仅管理员）
  static async updateBloomStatus(req, res) {
    const { id } = req.params;
    const { bloom_status } = req.body;
    
    // 验证花期状态值
    const validStatuses = ['dormant', 'budding', 'blooming', 'withering'];
    if (!validStatuses.includes(bloom_status)) {
      return res.status(400).json(formatResponse(1001, '参数错误，花期状态值无效'));
    }
    
    try {
      // 检查地点是否存在
      const location = await Location.findById(id);
      if (!location) {
        return res.status(404).json(formatResponse(1004, '地点不存在'));
      }
      
      // 更新花期状态
      await Location.updateBloomStatus(id, bloom_status);
      
      return res.json(formatResponse(0, '更新成功'));
    } catch (error) {
      console.error('更新花期状态失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 创建地点（仅管理员）
  static async createLocation(req, res) {
    const { name, description, latitude, longitude, flower_species, flower_species_en, historical_bloom_start, historical_bloom_end, cover_image } = req.body;
    
    // 验证必填字段
    if (!name || !latitude || !longitude || !flower_species) {
      return res.status(400).json(formatResponse(1001, '参数错误，缺少必填字段'));
    }
    
    try {
      const locationId = await Location.create({
        name,
        description,
        latitude,
        longitude,
        flower_species,
        flower_species_en,
        historical_bloom_start,
        historical_bloom_end,
        cover_image
      });
      
      return res.json(formatResponse(0, '创建成功', { id: locationId }));
    } catch (error) {
      console.error('创建地点失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
  
  // 获取地图热力数据
  static async getHeatmapData(req, res) {
    try {
      const heatmapData = await Location.getHeatmapData();
      return res.json(formatResponse(0, '获取成功', heatmapData));
    } catch (error) {
      console.error('获取热力数据失败:', error);
      return res.status(500).json(formatResponse(5000, '服务器内部错误'));
    }
  }
}

module.exports = LocationController;