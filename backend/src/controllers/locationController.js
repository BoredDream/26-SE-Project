const LocationModel = require('../models/locationModel');

class LocationController {
  // 获取地点列表
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '', bloom_status = null } = req.query;
      
      const result = await LocationModel.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        bloom_status,
      });
      
      res.json({
        code: 0,
        message: '获取成功',
        data: result,
      });
    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取地点详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      const location = await LocationModel.findById(parseInt(id));
      
      if (!location) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      res.json({
        code: 0,
        message: '获取成功',
        data: location,
      });
    } catch (error) {
      console.error('Get location by id error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取附近地点
  static async getNearby(req, res) {
    try {
      const { latitude, longitude, radius = 1000, limit = 20 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      const locations = await LocationModel.getNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        parseInt(limit)
      );
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: locations,
          total: locations.length,
        },
      });
    } catch (error) {
      console.error('Get nearby locations error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 创建地点（管理员）
  static async create(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { 
        name, 
        description, 
        latitude, 
        longitude, 
        flower_species, 
        flower_species_en, 
        bloom_status, 
        historical_bloom_start, 
        historical_bloom_end, 
        cover_image
      } = req.body;
      
      if (!name || !latitude || !longitude || !flower_species) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      const locationId = await LocationModel.create({
        name,
        description,
        latitude,
        longitude,
        flower_species,
        flower_species_en,
        bloom_status,
        historical_bloom_start,
        historical_bloom_end,
        cover_image,
      });
      
      const location = await LocationModel.findById(locationId);
      
      res.json({
        code: 0,
        message: '创建成功',
        data: location,
      });
    } catch (error) {
      console.error('Create location error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 更新地点（管理员）
  static async update(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { id } = req.params;
      const data = req.body;
      
      if (!id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查地点是否存在
      const existingLocation = await LocationModel.findById(parseInt(id));
      
      if (!existingLocation) {
        return res.status(404).json({
          code: 1004,
          message: '资源不存在',
        });
      }
      
      await LocationModel.update(parseInt(id), data);
      const updatedLocation = await LocationModel.findById(parseInt(id));
      
      res.json({
        code: 0,
        message: '更新成功',
        data: updatedLocation,
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 删除地点（管理员）
  static async delete(req, res) {
    try {
      // TODO: 验证管理员权限
      
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // TODO: 实现删除逻辑
      
      res.json({
        code: 0,
        message: '删除成功',
      });
    } catch (error) {
      console.error('Delete location error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 更新花期状态
  static async updateBloomStatus(locationId, bloom_status) {
    await LocationModel.updateBloomStatus(locationId, bloom_status);
  }
}

module.exports = LocationController;
