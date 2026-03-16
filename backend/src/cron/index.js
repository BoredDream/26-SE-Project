const cron = require('node-cron');
const { pool } = require('../config/db');
const TitleModel = require('../models/titleModel');

class CronJobs {
  // 初始化所有定时任务
  static init() {
    console.log('📅 初始化定时任务...');
    
    // 1. 评选月度打卡王（每月1日 00:05）
    cron.schedule('5 0 1 * *', this.selectMonthlyCheckinKing);
    
    // 2. 花期预测提醒（每日 08:00）
    cron.schedule('0 8 * * *', this.sendBloomPredictions);
    
    // 3. 清理审核积压（每日 02:00）
    cron.schedule('0 2 * * *', this.cleanPendingCheckins);
    
    // 4. 更新热力数据（每小时）
    cron.schedule('0 * * * *', this.updateHeatmapData);
    
    // 5. 清理过期通知标记（每年1月1日）
    cron.schedule('0 0 1 1 *', this.cleanExpiredNotificationMarks);
    
    console.log('✅ 所有定时任务已初始化');
  }

  // 1. 评选月度打卡王
  static async selectMonthlyCheckinKing() {
    try {
      console.log('🏆 开始评选月度打卡王...');
      
      // 获取上个月的年份和月份
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const startDate = new Date(lastYear, lastMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      // 查询上个月打卡次数最多的用户
      const [result] = await pool.execute(
        `SELECT user_id, COUNT(*) as checkin_count 
         FROM checkins 
         WHERE created_at >= ? AND created_at < ? AND is_visible = 1 AND audit_status = 'approved' 
         GROUP BY user_id 
         ORDER BY checkin_count DESC 
         LIMIT 1`,
        [startDate, endDate]
      );
      
      if (result.length > 0) {
        const { user_id } = result[0];
        
        // 授予打卡王称号
        await TitleModel.grant({
          user_id,
          title_key: 'king_monthly',
          earned_at: new Date(),
        });
        
        console.log(`🎉 月度打卡王评选完成，用户 ${user_id} 获得称号`);
      } else {
        console.log('📭 上个月没有符合条件的打卡记录');
      }
    } catch (error) {
      console.error('❌ 评选月度打卡王失败:', error.message);
      // 不抛出错误，避免影响其他定时任务
    }
  }

  // 2. 花期预测提醒
  static async sendBloomPredictions() {
    try {
      console.log('🌸 开始发送花期预测提醒...');
      
      // 获取当前日期（MM-DD格式）
      const now = new Date();
      const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // 查询7天后可能开花的地点
      // TODO: 实现花期预测逻辑
      // TODO: 发送订阅消息
      
      console.log('✅ 花期预测提醒发送完成');
    } catch (error) {
      console.error('❌ 发送花期预测提醒失败:', error.message);
      // 不抛出错误，避免影响其他定时任务
    }
  }

  // 3. 清理审核积压
  static async cleanPendingCheckins() {
    try {
      console.log('🧹 开始清理审核积压...');
      
      // 自动审核超过24小时的待审核打卡记录
      const [result] = await pool.execute(
        `UPDATE checkins 
         SET audit_status = 'approved', is_visible = 1 
         WHERE audit_status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );
      
      console.log(`✅ 清理审核积压完成，自动通过 ${result.affectedRows} 条记录`);
    } catch (error) {
      console.error('❌ 清理审核积压失败:', error.message);
      // 不抛出错误，避免影响其他定时任务
    }
  }

  // 4. 更新热力数据
  static async updateHeatmapData() {
    try {
      console.log('🔥 开始更新热力数据...');
      
      // 更新每个地点的打卡计数
      await pool.execute(
        `UPDATE locations l 
         SET checkin_count = (SELECT COUNT(*) FROM checkins c WHERE c.location_id = l.id AND c.is_visible = 1)`
      );
      
      console.log('✅ 热力数据更新完成');
    } catch (error) {
      console.error('❌ 更新热力数据失败:', error.message);
      // 不抛出错误，避免影响其他定时任务
    }
  }

  // 5. 清理过期通知标记
  static async cleanExpiredNotificationMarks() {
    try {
      console.log('🗑️ 开始清理过期通知标记...');
      
      // TODO: 清理 Redis 中上一年的推送防重 key
      // 例如: redis.del(`notify:*:${lastYear}`)
      
      console.log('✅ 过期通知标记清理完成');
    } catch (error) {
      console.error('❌ 清理过期通知标记失败:', error.message);
      // 不抛出错误，避免影响其他定时任务
    }
  }
}

module.exports = CronJobs;
