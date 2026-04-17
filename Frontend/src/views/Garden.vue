<template>
  <div class="page">
    <div class="content">
      <!-- 花园标题 -->
      <div class="header">
        <h1 class="title">花园花卉</h1>
        <p class="subtitle">探索狮山花园的美丽花卉</p>
      </div>

      <!-- 花卉分类标签 -->
      <div class="categories">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-tag"
          :class="{ active: activeCategory === category.id }"
          @click="setActiveCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- 花卉网格 -->
      <div class="flowers-grid">
        <div
          v-for="flower in filteredFlowers"
          :key="flower.id"
          class="flower-item"
          @click="openFlowerDetail(flower)"
        >
          <div class="flower-image">
            <div class="placeholder-icon">{{ getFlowerIcon(flower.flower_species) }}</div>
          </div>
          <div class="flower-name">{{ flower.name }}</div>
          <div class="flower-status" :class="{ checked: isChecked(flower.id) }">
            {{ isChecked(flower.id) ? '已打卡' : '未打卡' }}
          </div>
        </div>
      </div>

      <!-- 花卉详情弹窗 -->
      <div v-if="selectedFlower" class="modal-overlay" @click="closeFlowerDetail">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedFlower.name }}</h2>
            <button class="close-btn" @click="closeFlowerDetail">✕</button>
          </div>
          <div class="modal-body">
            <div class="flower-detail-image">
              <div class="placeholder-icon-large">{{ getFlowerIcon(selectedFlower.flower_species) }}</div>
            </div>
            <div class="flower-description">
              <p>{{ selectedFlower.description || '暂无描述' }}</p>
            </div>
            <div class="flower-info">
              <div class="info-item">
                <strong>花期：</strong>{{ getBloomPeriod(selectedFlower) }}
              </div>
              <div class="info-item">
                <strong>位置：</strong>{{ selectedFlower.name }}区域
              </div>
              <div class="info-item">
                <strong>类型：</strong>{{ selectedFlower.flower_species }}
              </div>
              <div class="info-item">
                <strong>打卡次数：</strong>{{ selectedFlower.checkin_count }}
              </div>
            </div>
            <div class="action-buttons">
              <button
                class="checkin-btn"
                :class="{ checked: isChecked(selectedFlower.id) }"
                @click="toggleCheckin(selectedFlower)"
              >
                {{ isChecked(selectedFlower.id) ? '已打卡' : '打卡' }}
              </button>
              <button class="share-btn" @click="shareFlower(selectedFlower)">
                分享
              </button>
            </div>
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
import { useLocationStore } from '@/stores/location';
import { useCheckinStore } from '@/stores/checkin';
import { useAuthStore } from '@/stores/auth';
import type { Location } from '@/services/api';

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();
const authStore = useAuthStore();

// 花卉分类
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'spring', name: '春季' },
  { id: 'summer', name: '夏季' },
  { id: 'autumn', name: '秋季' },
  { id: 'winter', name: '冬季' }
]);

const activeCategory = ref('all');
const selectedFlower = ref<Location | null>(null);

// 计算过滤后的花卉
const filteredFlowers = computed(() => {
  if (activeCategory.value === 'all') {
    return locationStore.locations;
  }

  // 根据开花季节过滤
  const seasonMap: { [key: string]: string[] } = {
    spring: ['03', '04', '05'],
    summer: ['06', '07', '08'],
    autumn: ['09', '10', '11'],
    winter: ['12', '01', '02']
  };

  const targetMonths = seasonMap[activeCategory.value] || [];
  return locationStore.locations.filter(location => {
    if (!location.historical_bloom_start) return false;
    const startMonth = location.historical_bloom_start.substring(0, 2);
    return targetMonths.includes(startMonth);
  });
});

// 检查花卉是否已打卡
const isChecked = (locationId: number) => {
  return checkinStore.checkins.some(checkin => checkin.flower_place_id === locationId);
};

// 获取花卉图标
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
const getBloomPeriod = (flower: Location) => {
  if (flower.historical_bloom_start && flower.historical_bloom_end) {
    return `${flower.historical_bloom_start} 至 ${flower.historical_bloom_end}`;
  }
  return '未知';
};

const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId;
};

const openFlowerDetail = (flower: Location) => {
  selectedFlower.value = flower;
};

const closeFlowerDetail = () => {
  selectedFlower.value = null;
};

const toggleCheckin = async (flower: Location) => {
  try {
    if (isChecked(flower.id)) {
      // 取消打卡（这里简化处理，实际可能需要API支持）
      console.log('取消打卡:', flower.name);
    } else {
      // 打卡
      await checkinStore.createCheckin({
        user_id: authStore.user?.id ?? 1,
        flower_place_id: flower.id,
        bloom_report: 'blooming',
        content: `在${flower.name}打卡！`,
        images: []
      });
      console.log('打卡成功:', flower.name);
    }
  } catch (error) {
    console.error('打卡失败:', error);
  }
};

const shareFlower = (flower: Location) => {
  const shareText = `发现美丽的${flower.name}！${flower.description}`;
  if (navigator.share) {
    navigator.share({
      title: `发现${flower.name}`,
      text: shareText,
      url: window.location.href
    });
  } else {
    alert(`分享：${shareText}`);
  }
};

// 页面加载时获取数据
onMounted(async () => {
  try {
    console.log('开始加载花园数据...')
    await Promise.all([
      locationStore.loadLocations(),
      checkinStore.loadCheckins(),
    ]);
    console.log('花园数据加载完成', {
      locations: locationStore.locations.length,
      checkins: checkinStore.checkins.length,
      locationError: locationStore.error,
      checkinError: checkinStore.error
    });
  } catch (error) {
    console.error('加载花园数据失败:', error);
    // 显示错误信息给用户
    alert('加载花园数据失败，请检查网络连接');
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: fadeIn 0.35s ease both;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 2.2rem;
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

.categories {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.category-tag {
  background: white;
  color: #666;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-tag.active {
  background: #4CAF50;
  color: white;
}

.flowers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.flower-item {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  animation: fadeInUp 0.35s ease both;
}

.flower-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.flower-image {
  height: 120px;
  background: linear-gradient(45deg, #4CAF50, #66BB6A);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
}

.flower-name {
  padding: 15px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.flower-status {
  padding: 0 15px 15px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 500;
}

.flower-status.checked {
  color: #4CAF50;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.flower-detail-image {
  text-align: center;
  margin-bottom: 20px;
}

.placeholder-icon-large {
  font-size: 5rem;
}

.flower-description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #555;
}

.flower-info {
  margin-bottom: 25px;
}

.info-item {
  margin-bottom: 10px;
  color: #666;
}

.tag {
  display: inline-block;
  background: #E8F5E8;
  color: #4CAF50;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  margin-right: 5px;
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.checkin-btn, .share-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkin-btn {
  background: #4CAF50;
  color: white;
}

.checkin-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.checkin-btn.checked {
  background: #66BB6A;
}

.share-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.share-btn:hover {
  background: #eee;
  transform: translateY(-2px);
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>