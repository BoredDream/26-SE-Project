<template>
  <div class="home">
    <div class="content">
      <!-- 狮山花园标题 -->
      <div class="header">
        <h1 class="title">狮山花园</h1>
        <p class="subtitle">探索花卉之美，发现自然魅力</p>
      </div>

      <!-- 今日概览卡片 -->
      <div class="overview-cards">
        <div class="card">
          <div class="card-icon">今日</div>
          <div class="card-content">
            <h3>{{ todayCheckins }}</h3>
            <p>今日打卡</p>
          </div>
        </div>
        <div class="card">
          <div class="card-icon">种类</div>
          <div class="card-content">
            <h3>{{ totalFlowers }}</h3>
            <p>花卉种类</p>
          </div>
        </div>
        <div class="card">
          <div class="card-icon">等级</div>
          <div class="card-content">
            <h3>{{ userLevel }}</h3>
            <p>花园等级</p>
          </div>
        </div>
      </div>

      <!-- 今日推荐 -->
      <div class="section">
        <h2 class="section-title">今日推荐</h2>
        <div v-if="featuredFlower" class="flower-card">
          <div class="flower-image">
            <div class="placeholder-icon">{{ getFlowerIcon(featuredFlower.flower_species) }}</div>
          </div>
          <div class="flower-info">
            <h3>{{ featuredFlower.name }}</h3>
            <p>{{ featuredFlower.description || '暂无描述' }}</p>
            <div class="flower-tags">
              <span class="tag">{{ getBloomPeriod(featuredFlower) }}</span>
              <span class="tag">位置：{{ featuredFlower.flower_species }}</span>
            </div>
          </div>
        </div>
        <div v-else class="loading">加载中...</div>
      </div>

      <!-- 花园活动 -->
      <div class="section">
        <h2 class="section-title">花园活动</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">花</div>
            <div class="activity-content">
              <h4>春季花卉展</h4>
              <p>欣赏各类春季花卉的盛开</p>
              <small>2026年3月25日 - 4月10日</small>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">拍</div>
            <div class="activity-content">
              <h4>花卉摄影大赛</h4>
              <p>记录花园中最美的瞬间</p>
              <small>进行中 - 截止4月30日</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BottomNav from '../components/BottomNav.vue';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import { useCheckinStore } from '@/stores/checkin';
import type { Location } from '@/services/api';

const authStore = useAuthStore();
const locationStore = useLocationStore();
const checkinStore = useCheckinStore();

// 计算属性
const todayCheckins = computed(() => checkinStore.checkins.length);
const totalFlowers = computed(() => locationStore.locations.length);
const userLevel = computed(() => authStore.user?.level || 1);

// 精选花卉
const featuredFlower = ref<Location | null>(null);

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 并行加载数据
    await Promise.all([
      locationStore.loadLocations(),
      checkinStore.loadCheckins(),
    ]);

    // 设置精选花卉（第一个位置）
    if (locationStore.locations.length > 0) {
      featuredFlower.value = locationStore.locations[0] || null;
    } else {
      featuredFlower.value = null;
    }
  } catch (error) {
    console.error('加载首页数据失败:', error);
  }
});

// 根据花卉类型获取图标
const getFlowerIcon = (flowerSpecies: string) => {
  const iconMap: { [key: string]: string } = {
    '樱花': '樱',
    '菊花': '菊',
    '荷花': '荷',
    '玫瑰': '玫',
    '郁金香': '郁',
    '向日葵': '向',
    '百合': '百',
    '兰花': '兰',
    '牡丹': '牡',
    'test': '花'
  };
  return iconMap[flowerSpecies] || '花';
};

// 获取花卉花期
const getBloomPeriod = (flower: any) => {
  if (flower.historical_bloom_start && flower.historical_bloom_end) {
    return `${flower.historical_bloom_start} 至 ${flower.historical_bloom_end}`;
  }
  return '未知';
};
</script>

<style scoped>
.home {
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

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  color: #4CAF50;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.subtitle {
  color: #666;
  margin: 10px 0 0 0;
  font-size: 1rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  animation: fadeInUp 0.4s ease both;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.card-content h3 {
  font-size: 1.8rem;
  color: #4CAF50;
  margin: 0;
  font-weight: 700;
}

.card-content p {
  color: #666;
  margin: 5px 0 0 0;
  font-size: 0.9rem;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.flower-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
}

.flower-image {
  width: 120px;
  height: 120px;
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.flower-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flower-info {
  flex: 1;
  padding: 20px;
}

.flower-info h3 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.flower-info p {
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.flower-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #E8F5E8;
  color: #4CAF50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  animation: fadeInUp 0.4s ease both;
}

.activity-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.activity-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.activity-content h4 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.activity-content p {
  color: #666;
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.activity-content small {
  color: #999;
  font-size: 0.8rem;
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