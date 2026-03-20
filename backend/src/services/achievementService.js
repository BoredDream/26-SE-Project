const pool = require('../config/database');

// 检查成就
const checkAchievements = async (checkinId) => {
  try {
    // 获取打卡记录
    const [checkins] = await pool.execute('SELECT * FROM checkins WHERE id = ?', [checkinId]);
    if (checkins.length === 0) return;
    
    const checkin = checkins[0];
    
    // 获取地点信息
    const [locations] = await pool.execute('SELECT * FROM locations WHERE id = ?', [checkin.location_id]);
    if (locations.length === 0) return;
    
    const location = locations[0];
    
    // 查询用户是否已有该花种成就
    const [achievements] = await pool.execute(
      'SELECT * FROM achievements WHERE user_id = ? AND flower_species = ?',
      [checkin.user_id, location.flower_species]
    );
    
    if (achievements.length === 0) {
      // 创建新成就
      await createAchievement(checkin, location);
    } else {
      // 检查是否可以升级成就
      await upgradeAchievement(checkin, location, achievements[0]);
    }
    
    // 检查探花使
    await checkPioneerHonor(checkin, location);
  } catch (error) {
    console.error('Check achievements error:', error);
  }
};

// 创建新成就
const createAchievement = async (checkin, location) => {
  await pool.execute(
    'INSERT INTO achievements (user_id, location_id, flower_species, grade, checkin_id) VALUES (?, ?, ?, ?, ?)',
    [checkin.user_id, checkin.location_id, location.flower_species, checkin.gps_verified ? 'gold' : 'silver', checkin.id]
  );
};

// 升级成就
const upgradeAchievement = async (checkin, location, achievement) => {
  // 只有银色成就且本次GPS验证通过才能升级为金色成就
  if (achievement.grade === 'silver' && checkin.gps_verified) {
    await pool.execute(
      'UPDATE achievements SET grade = ?, checkin_id = ? WHERE id = ?',
      ['gold', checkin.id, achievement.id]
    );
  }
};

// 检查探花使
const checkPioneerHonor = async (checkin, location) => {
  // 获取当前季节（如 2026-spring）
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  let season;
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';
  else season = 'winter';
  
  const bloomSeason = `${year}-${season}`;
  
  // 检查该地点本花期是否已有探花使
  const [honors] = await pool.execute(
    'SELECT * FROM pioneer_honors WHERE location_id = ? AND bloom_season = ?',
    [checkin.location_id, bloomSeason]
  );
  
  if (honors.length === 0) {
    // 成为探花使
    await pool.execute(
      'INSERT INTO pioneer_honors (user_id, location_id, bloom_season, checkin_id) VALUES (?, ?, ?, ?)',
      [checkin.user_id, checkin.location_id, bloomSeason, checkin.id]
    );
    
    // 触发称号检查
    await require('./titleService').checkPioneerTitle(checkin.user_id);
  }
};

module.exports = {
  checkAchievements
};
