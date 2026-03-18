// GPS 距离计算函数（Haversine 公式）
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 距离（米）
}

// GPS 校验函数（判断用户是否在地点附近）
const GPS_RADIUS = 150; // 允许的最大距离（米）
function isUserNearLocation(userLat, userLon, locationLat, locationLon) {
  if (!userLat || !userLon) return false;
  const distance = haversineDistance(userLat, userLon, locationLat, locationLon);
  return distance <= GPS_RADIUS;
}

// 响应格式化函数
function formatResponse(code, message, data = null) {
  return {
    code,
    message,
    data
  };
}

// 日期处理函数
function getCurrentDate() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// 获取当前月份的花期标识（如 2026-spring）
function getCurrentBloomSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // 简单的季节划分
  let season;
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';
  else season = 'winter';
  
  return `${year}-${season}`;
}

module.exports = {
  haversineDistance,
  isUserNearLocation,
  formatResponse,
  getCurrentDate,
  getCurrentBloomSeason,
  GPS_RADIUS
};