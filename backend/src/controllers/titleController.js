const TitleModel = require('../models/titleModel');

class TitleController {
  // 获取用户的称号列表
  static async getMyTitles(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取称号列表
      const titles = await TitleModel.getByUserId(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: {
          list: titles,
          total: titles.length,
        },
      });
    } catch (error) {
      console.error('Get titles error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 检查用户是否拥有特定称号
  static async checkTitle(req, res) {
    try {
      const userId = req.user.id;
      const { titleKey } = req.params;
      
      if (!titleKey) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查是否拥有称号
      const hasTitle = await TitleModel.hasTitle(userId, titleKey);
      
      res.json({
        code: 0,
        message: '查询成功',
        data: {
          has_title: hasTitle,
        },
      });
    } catch (error) {
      console.error('Check title error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 设置用户当前佩戴的称号
  static async setActiveTitle(req, res) {
    try {
      const userId = req.user.id;
      const { titleKey } = req.params;
      
      if (!titleKey) {
        return res.status(400).json({
          code: 1001,
          message: '缺少必要参数',
        });
      }
      
      // 检查用户是否拥有该称号
      const hasTitle = await TitleModel.hasTitle(userId, titleKey);
      
      if (!hasTitle) {
        return res.status(400).json({
          code: 1001,
          message: '用户未拥有该称号',
        });
      }
      
      // 设置活跃称号
      await TitleModel.setActiveTitle(userId, titleKey);
      
      res.json({
        code: 0,
        message: '设置成功',
        data: {
          active_title: titleKey,
        },
      });
    } catch (error) {
      console.error('Set active title error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }

  // 获取用户当前佩戴的称号
  static async getActiveTitle(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取活跃称号
      const activeTitle = await TitleModel.getActiveTitle(userId);
      
      res.json({
        code: 0,
        message: '获取成功',
        data: activeTitle,
      });
    } catch (error) {
      console.error('Get active title error:', error);
      res.status(500).json({
        code: 5000,
        message: '服务器内部错误',
      });
    }
  }
}

module.exports = TitleController;
