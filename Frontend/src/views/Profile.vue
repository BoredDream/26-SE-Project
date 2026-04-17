<template>
  <div class="page">
    <div class="content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <div class="avatar-placeholder">U</div>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ userInfo?.nickname || '花园探索者' }}</h2>
          <p class="user-level">花园探索者 Lv.{{ userInfo?.level || 1 }}</p>
          <div class="user-stats">
            <div class="stat">
              <span class="stat-number">{{ userInfo?.total_checkins || 0 }}</span>
              <span class="stat-label">总打卡</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ checkinStore.checkins.length }}</span>
              <span class="stat-label">发现花卉</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ achievementStore.achievements.length }}</span>
              <span class="stat-label">成就</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 经验进度条 -->
      <div class="progress-section">
        <div class="progress-label">
          <span>经验值</span>
          <span>{{ userInfo?.exp || 0 }}/{{ Math.floor((userInfo?.exp || 0) * 1.5) }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- 菜单选项 -->
      <div class="menu-section">
        <div class="menu-item" @click="showCheckinHistory">
          <div class="menu-icon">记</div>
          <div class="menu-content">
            <h3>打卡记录</h3>
            <p>查看您的花卉打卡历史</p>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="menu-item" @click="showAchievements">
          <div class="menu-icon">成</div>
          <div class="menu-content">
            <h3>成就系统</h3>
            <p>解锁更多花园成就</p>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="menu-item" @click="showFavorites">
          <div class="menu-icon">藏</div>
          <div class="menu-content">
            <h3>收藏花卉</h3>
            <p>您最喜欢的花卉收藏</p>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="menu-item" @click="showSettings">
          <div class="menu-icon">设</div>
          <div class="menu-content">
            <h3>设置</h3>
            <p>应用设置和偏好</p>
          </div>
          <div class="menu-arrow">›</div>
        </div>
      </div>

      <!-- 最近打卡 -->
      <div class="recent-section">
        <h3 class="section-title">最近打卡</h3>
        <div class="recent-list">
          <div
            v-for="checkin in recentCheckins"
            :key="checkin.id"
            class="recent-item"
          >
            <div class="checkin-icon">{{ checkin.flowerIcon }}</div>
            <div class="checkin-info">
              <h4>{{ checkin.flowerName }}</h4>
              <p>{{ checkin.time }}</p>
            </div>
            <div class="checkin-exp">+{{ checkin.exp }} EXP</div>
          </div>
          <div v-if="recentCheckins.length === 0" class="no-data">
            暂无打卡记录
          </div>
        </div>
      </div>

      <!-- 成就展示 -->
      <div class="achievements-section">
        <h3 class="section-title">最新成就</h3>
        <div class="achievements-grid">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="achievement-item"
            :class="{ unlocked: achievement.unlocked }"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-desc">{{ achievement.description }}</div>
          </div>
          <div v-if="recentAchievements.length === 0" class="no-data">
            暂无成就
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BottomNav from '../components/BottomNav.vue';
import { useAuthStore } from '@/stores/auth';
import { useCheckinStore } from '@/stores/checkin';
import { useAchievementStore } from '@/stores/achievement';
import { useLocationStore } from '@/stores/location';

const authStore = useAuthStore();
const checkinStore = useCheckinStore();
const achievementStore = useAchievementStore();
const locationStore = useLocationStore();

// 计算属性
const userInfo = computed(() => authStore.user);
const progressPercent = computed(() => {
  if (!userInfo.value) return 0;
  const currentExp = userInfo.value.exp ?? 0;
  // 假设下一级需要当前经验的1.5倍
  const nextLevelExp = Math.max(currentExp * 1.5, 1);
  return (currentExp / nextLevelExp) * 100;
});

// 最近打卡记录
const recentCheckins = computed(() => {
  return checkinStore.checkins.slice(0, 4).map(checkin => {
    const location = locationStore.locations.find(loc => loc.id === checkin.flower_place_id);
    return {
      id: checkin.id,
      flowerName: location?.name || '未知花卉',
      flowerIcon: location ? getFlowerIcon(location.flower_species) : '花',
      time: formatTime(checkin.created_at),
      exp: 10 // 假设每次打卡获得10经验
    };
  });
});

// 最新成就
const recentAchievements = computed(() => {
  return achievementStore.achievements.slice(0, 4).map(achievement => ({
    ...achievement,
    unlocked: Math.random() > 0.5 // 模拟解锁状态
  }));
});

// 获取花卉图标
const getFlowerIcon = (flowerType: string) => {
  const iconMap: { [key: string]: string } = {
    'rose': 'R',
    'tulip': 'T',
    'sunflower': 'S',
    'cherry': 'C',
    'lily': 'L',
    'daisy': 'D',
    'orchid': 'O',
    'peony': 'P',
    'chrysanthemum': 'H',
    'lotus': 'N'
  };
  return iconMap[flowerType.toLowerCase()] || '花';
};

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    return `${days}天前`;
  }
};

// 菜单功能
const showCheckinHistory = () => {
  console.log('显示打卡历史');
  // 这里可以导航到打卡历史页面
};

const showAchievements = () => {
  console.log('显示成就系统');
  // 这里可以导航到成就页面
};

const showFavorites = () => {
  console.log('显示收藏花卉');
  // 这里可以导航到收藏页面
};

const showSettings = () => {
  console.log('显示设置');
  // 这里可以导航到设置页面
};

// 页面加载时获取数据
onMounted(async () => {
  try {
    await Promise.all([
      checkinStore.loadCheckins(),
      achievementStore.loadAchievements(),
      locationStore.loadLocations(),
    ]);
  } catch (error) {
    console.error('加载个人资料数据失败:', error);
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.user-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.35s ease both;
}

.user-avatar {
  margin-right: 20px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-level {
  margin: 0 0 15px 0;
  color: #4CAF50;
  font-weight: 500;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4CAF50;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.progress-section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #66BB6A);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.menu-section {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f9f9f9;
  transform: translateX(2px);
}

.menu-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.menu-content {
  flex: 1;
}

.menu-content h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1rem;
}

.menu-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.menu-arrow {
  color: #ccc;
  font-size: 1.2rem;
}

.section-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.recent-section, .achievements-section {
  margin-bottom: 25px;
}

.recent-list {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.recent-item:last-child {
  border-bottom: none;
}

.checkin-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.checkin-info {
  flex: 1;
}

.checkin-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1rem;
}

.checkin-info p {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
}

.checkin-exp {
  color: #4CAF50;
  font-weight: 600;
  font-size: 0.9rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.achievement-item {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  animation: fadeInUp 0.35s ease both;
}

.achievement-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.achievement-item.unlocked {
  border: 2px solid #4CAF50;
}

.achievement-item:not(.unlocked) {
  opacity: 0.6;
}

.achievement-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.achievement-name {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
}

.achievement-desc {
  color: #666;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>