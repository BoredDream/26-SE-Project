<template>
  <div class="garden-page">
    <div class="garden-scroll">

      <!-- 顶部 Banner -->
      <section class="garden-hero">
        <div class="hero-title">我的花园</div>
        <div class="hero-sub">收集花卉，记录与自然的相遇</div>
        <div class="hero-progress-row">
          <div class="hero-progress-bar">
            <div class="hero-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="hero-progress-label">{{ unlockedCount }}/{{ totalCount }}</span>
        </div>
      </section>

      <!-- 成就花卉网格 -->
      <section class="flowers-grid">
        <div
          v-for="flower in flowerList"
          :key="flower.name"
          class="flower-card"
          :class="{ unlocked: flower.unlocked, locked: !flower.unlocked }"
          @click="openDetail(flower)"
        >
          <div class="flower-img-wrap">
            <img :src="flower.image" :alt="flower.name" class="flower-img" />
            <div v-if="!flower.unlocked" class="lock-overlay">
              <div class="lock-icon">🔒</div>
            </div>
            <div v-else class="unlock-badge">✓</div>
          </div>
          <div class="flower-info">
            <div class="flower-name">{{ flower.name }}</div>
            <div class="flower-status" :class="{ 'status-unlocked': flower.unlocked }">
              {{ flower.unlocked ? `已打卡 ${flower.checkinCount} 次` : '前往地图打卡解锁' }}
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-tip">点击花卉卡片查看相关打卡帖子</div>

    </div>

    <BottomNav />

    <!-- 详情弹窗 -->
    <div class="detail-modal" v-if="selectedFlower">
      <div class="modal-backdrop" @click="selectedFlower = null"></div>
      <div class="modal-card">
        <div class="modal-flower-header">
          <img :src="selectedFlower.image" :alt="selectedFlower.name" class="modal-flower-img" />
          <div class="modal-flower-meta">
            <h3>{{ selectedFlower.name }}</h3>
            <p>{{ selectedFlower.location?.description || '狮山花园特色花卉' }}</p>
            <div class="modal-bloom-tag">{{ selectedFlower.location?.bloom_status || '未知花期' }}</div>
          </div>
        </div>
        <div class="modal-posts">
          <div v-if="selectedFlowerPosts.length">
            <div class="modal-post" v-for="post in selectedFlowerPosts" :key="post.id">
              <div class="modal-post-meta">
                <span class="modal-post-author">{{ post.user?.nickname || '匿名用户' }}</span>
                <span>{{ formatTime(post.created_at) }}</span>
              </div>
              <p class="modal-post-content">{{ post.content }}</p>
            </div>
          </div>
          <div v-else class="no-posts">
            {{ selectedFlower.unlocked ? '暂无打卡内容' : '🔒 完成打卡后可查看相关帖子' }}
          </div>
        </div>
        <button class="modal-close-btn" @click="selectedFlower = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BottomNav from '../components/BottomNav.vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const selectedFlower = ref<any>(null)

const FLOWER_NAMES = ['樱花', '格桑花', '梨花', '大金鸡菊', '油菜花', '玉兰花']

const flowerList = computed(() => {
  return FLOWER_NAMES.map(name => {
    const location = locationStore.locations.find(l => l.flower_species === name)
    const locationCheckins = location
      ? checkinStore.checkins.filter(p => p.location_id === location.id)
      : []
    const unlocked = locationCheckins.length > 0
    return {
      name,
      image: `/flowers/${name}.png`,
      unlocked,
      checkinCount: locationCheckins.length,
      location,
      checkins: locationCheckins,
    }
  })
})

const totalCount = computed(() => FLOWER_NAMES.length)
const unlockedCount = computed(() => flowerList.value.filter(f => f.unlocked).length)
const progressPercent = computed(() =>
  Math.round((unlockedCount.value / totalCount.value) * 100)
)

const selectedFlowerPosts = computed(() => selectedFlower.value?.checkins || [])

const openDetail = (flower: any) => {
  selectedFlower.value = flower
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
})
</script>

<style scoped>
/* ── 变量 ── */
.garden-page {
  --c-primary: #3a7d44;
  --c-primary-light: #6fbb6b;
  --c-bg: #eef8ed;
  --c-surface: #ffffff;
  --c-text: #2a4d2e;
  --c-text-sub: #5d7a5f;
  --c-text-muted: #8fa88f;
  --c-border: #e3f0e3;
}

/* ── 页面 ── */
.garden-page {
  min-height: 100vh;
  background: var(--c-bg);
  display: flex;
  flex-direction: column;
}

.garden-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

/* ── Hero ── */
.garden-hero {
  background: linear-gradient(160deg, var(--c-primary) 0%, var(--c-primary-light) 100%);
  border-radius: 0 0 32px 32px;
  padding: 48px 24px 28px;
  color: white;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.hero-sub {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 18px;
}

.hero-progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  overflow: hidden;
}

.hero-progress-fill {
  height: 100%;
  background: white;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.hero-progress-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

/* ── 花卉网格 ── */
.flowers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 0 16px;
}

.flower-card {
  background: var(--c-surface);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(58, 125, 68, 0.08);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.flower-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(58, 125, 68, 0.1);
}

.flower-card.locked {
  opacity: 0.72;
}

/* ── 图片区域 ── */
.flower-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.flower-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.flower-card.locked .flower-img {
  filter: grayscale(0.8) brightness(0.7);
}

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.18);
}

.lock-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.unlock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: var(--c-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(58, 125, 68, 0.4);
}

/* ── 信息区域 ── */
.flower-info {
  padding: 12px 14px;
}

.flower-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 4px;
}

.flower-status {
  font-size: 0.78rem;
  color: var(--c-text-muted);
}

.flower-status.status-unlocked {
  color: var(--c-primary);
}

/* ── 底部提示 ── */
.bottom-tip {
  text-align: center;
  color: var(--c-text-muted);
  font-size: 0.85rem;
  padding: 20px 16px 8px;
}

/* ── 弹窗 ── */
.detail-modal {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: var(--c-surface);
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 36px;
  z-index: 1;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-flower-header {
  display: flex;
  gap: 14px;
  margin-bottom: 18px;
}

.modal-flower-img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 16px;
  flex-shrink: 0;
}

.modal-flower-meta {
  flex: 1;
}

.modal-flower-meta h3 {
  margin: 0 0 6px;
  font-size: 1.2rem;
  color: var(--c-text);
}

.modal-flower-meta p {
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: var(--c-text-sub);
  line-height: 1.5;
}

.modal-bloom-tag {
  display: inline-block;
  background: #e8f5e9;
  color: var(--c-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.modal-posts {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-post {
  background: #f6fbf6;
  border-radius: 14px;
  padding: 12px 14px;
}

.modal-post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--c-text-muted);
  margin-bottom: 6px;
}

.modal-post-author {
  color: var(--c-primary);
  font-weight: 600;
}

.modal-post-content {
  margin: 0;
  font-size: 0.9rem;
  color: var(--c-text-sub);
  line-height: 1.6;
}

.no-posts {
  text-align: center;
  color: var(--c-text-muted);
  padding: 24px 0;
  font-size: 0.9rem;
}

.modal-close-btn {
  width: 100%;
  padding: 14px;
  background: var(--c-border);
  color: var(--c-text-sub);
  border: none;
  border-radius: 16px;
  font-size: 0.95rem;
  cursor: pointer;
}
</style>
