<template>
  <view class="garden">
    <md-app-bar title="我的花园" />

    <view class="garden__body">
      <!-- Hero banner（花园主题渐变） -->
      <view class="hero">
        <view class="hero__pattern"></view>
        <view class="hero__leaf hero__leaf--1">🌿</view>
        <view class="hero__leaf hero__leaf--2">🌸</view>
        <view class="hero__leaf hero__leaf--3">🍃</view>
        <view class="hero__content">
          <text class="hero__title">我的花园</text>
          <text class="hero__sub">收集校园花卉，记录与自然的每一次相遇</text>
          <view class="hero__stats">
            <view class="hero__progress">
              <view class="hero__progress-fill" :style="{ width: progressPercent + '%' }"></view>
            </view>
            <text class="hero__progress-text">{{ unlockedCount }} / {{ totalCount }} 种</text>
          </view>
        </view>
      </view>

      <!-- 花卉收集网格 -->
      <view class="flowers">
        <view
          v-for="flower in flowerCollection"
          :key="flower.name"
          class="flower-card"
          :class="flower.unlocked ? 'flower-card--unlocked' : 'flower-card--locked'"
          hover-class="flower-card--hover"
          @click="openFlower(flower)"
        >
          <view class="flower-card__img-wrap">
            <image class="flower-card__img" :src="flower.image" mode="aspectFill" />
            <view v-if="!flower.unlocked" class="flower-card__lock">
              <text class="flower-card__lock-icon">🔒</text>
            </view>
            <view v-else class="flower-card__badge">✓</view>
          </view>
          <view class="flower-card__body">
            <text class="flower-card__name">{{ flower.name }}</text>
            <text class="flower-card__status">
              {{ flower.unlocked ? `已打卡 ${flower.checkinCount} 次` : '前往地图打卡解锁' }}
            </text>
          </view>
        </view>
      </view>

      <text class="garden__hint">花开知春来 · 用打卡留住每一次绽放</text>
    </view>

    <!-- 详情弹窗 -->
    <view class="dialog" v-if="selectedFlower">
      <view class="dialog__scrim" @click="closeDetail"></view>
      <view class="dialog__card">
        <view class="dialog__header">
          <image class="dialog__thumb" :src="selectedFlower.image" mode="aspectFill" />
          <view class="dialog__meta">
            <text class="dialog__title">{{ selectedFlower.name }}</text>
            <text class="dialog__sub">
              {{ selectedFlower.unlocked ? `已打卡 ${selectedFlower.checkinCount} 次` : '尚未解锁' }}
            </text>
          </view>
        </view>

        <view class="dialog__posts">
          <template v-if="selectedFlower.checkins.length">
            <view v-for="post in selectedFlower.checkins" :key="post.id" class="dialog__post">
              <view class="dialog__post-meta">
                <text>{{ post.user?.nickname || '花园用户' }}</text>
                <text>{{ formatTime(post.created_at) }}</text>
              </view>
              <text class="dialog__post-content">{{ post.content }}</text>
            </view>
          </template>
          <view v-else class="dialog__empty">
            {{ selectedFlower.unlocked ? '暂无打卡内容' : '🔒 完成打卡后可查看相关帖子' }}
          </view>
        </view>

        <view class="dialog__actions">
          <md-button variant="text" @click="closeDetail">关闭</md-button>
        </view>
      </view>
    </view>

    <bottom-action-bar current="garden" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import type { Checkin } from '@/services/api'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()

// FlowerDemo 提供的 12 种花卉，顺序按春季 → 夏季观赏排
const FLOWER_LIST = [
  '樱花', '梨花', '梅花', '桃花', '玉兰花', '油菜花',
  '格桑花', '大金鸡菊', '蔷薇花', '紫藤花', '杜鹃花', '夹竹桃',
]

interface FlowerEntry {
  name: string
  image: string
  unlocked: boolean
  checkinCount: number
  checkins: Checkin[]
}

const flowerCollection = computed<FlowerEntry[]>(() => {
  return FLOWER_LIST.map(name => {
    const relatedCheckins = checkinStore.checkins.filter(c => {
      const loc = locationStore.locations.find(l => l.id === c.location_id)
      return loc?.flower_species === name
    })
    return {
      name,
      image: `/static/flowers/${name}.png`,
      unlocked: relatedCheckins.length > 0,
      checkinCount: relatedCheckins.length,
      checkins: relatedCheckins,
    }
  })
})

const totalCount = computed(() => FLOWER_LIST.length)
const unlockedCount = computed(() => flowerCollection.value.filter(f => f.unlocked).length)
const progressPercent = computed(() =>
  Math.round((unlockedCount.value / totalCount.value) * 100),
)

const selectedFlower = ref<FlowerEntry | null>(null)
const openFlower = (flower: FlowerEntry) => {
  selectedFlower.value = flower
}
const closeDetail = () => {
  selectedFlower.value = null
}

const formatTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
})
</script>

<style scoped lang="scss">
.garden {
  min-height: 100vh;
  background: $md-background;
}
.garden__body {
  padding: 0 0 100px;
  display: flex;
  flex-direction: column;
  gap: $md-space-4;
}

/* ── Hero banner ── */
.hero {
  position: relative;
  padding: $md-space-6 $md-space-4 $md-space-5;
  background: linear-gradient(135deg, #3a7d44 0%, #6fbb6b 100%);
  color: #ffffff;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
}
.hero__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 15% 25%, #ffffff 2%, transparent 3%),
    radial-gradient(circle at 80% 60%, #ffffff 2%, transparent 3%),
    radial-gradient(circle at 45% 85%, #ffffff 1.5%, transparent 2.5%);
  background-size: 140px 140px;
}
.hero__leaf {
  position: absolute;
  font-size: 32px;
  opacity: 0.6;
}
.hero__leaf--1 { top: 16px; right: 20px; transform: rotate(15deg); }
.hero__leaf--2 { bottom: 24px; right: 64px; font-size: 24px; transform: rotate(-10deg); }
.hero__leaf--3 { top: 60px; right: 70px; font-size: 22px; transform: rotate(-25deg); opacity: 0.4; }
.hero__content {
  position: relative;
  z-index: 1;
}
.hero__title {
  display: block;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
}
.hero__sub {
  display: block;
  font-size: 13px;
  opacity: 0.92;
  margin-bottom: $md-space-4;
}
.hero__stats {
  display: flex;
  align-items: center;
  gap: $md-space-3;
}
.hero__progress {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.28);
  border-radius: $md-shape-full;
  overflow: hidden;
}
.hero__progress-fill {
  height: 100%;
  background: #ffffff;
  border-radius: $md-shape-full;
  transition: width 0.6s ease;
}
.hero__progress-text {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* ── 花卉网格 ── */
.flowers {
  padding: 0 $md-space-4;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $md-space-3;
}
.flower-card {
  background: $md-surface;
  border-radius: $md-shape-lg;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(58, 125, 68, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.flower-card--hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(58, 125, 68, 0.15);
}
.flower-card__img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: $md-surface-container;
  overflow: hidden;
}
.flower-card__img {
  width: 100%;
  height: 100%;
  transition: filter 0.25s ease;
}
.flower-card--locked .flower-card__img {
  filter: grayscale(1) brightness(0.62);
}
.flower-card__lock {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.45));
  display: flex;
  align-items: center;
  justify-content: center;
}
.flower-card__lock-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}
.flower-card__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #4caf50;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
}
.flower-card__body {
  padding: $md-space-3 $md-space-4;
}
.flower-card__name {
  display: block;
  @include md-type('title-small');
  color: $md-on-surface;
  margin-bottom: 2px;
}
.flower-card__status {
  display: block;
  font-size: 11px;
  color: $md-on-surface-variant;
}
.flower-card--unlocked .flower-card__status {
  color: #4caf50;
  font-weight: 600;
}
.garden__hint {
  display: block;
  text-align: center;
  margin: $md-space-2 $md-space-4 0;
  font-size: 12px;
  color: $md-on-surface-variant;
}

/* ── 详情弹窗 ── */
.dialog {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $md-space-4;
}
.dialog__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
}
.dialog__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  background: $md-surface;
  border-radius: $md-shape-xl;
  padding: $md-space-5;
  @include md-elevation(3);
}
.dialog__header {
  display: flex;
  gap: $md-space-3;
  margin-bottom: $md-space-4;
}
.dialog__thumb {
  width: 80px;
  height: 80px;
  border-radius: $md-shape-md;
  flex-shrink: 0;
  background: $md-surface-container;
}
.dialog__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.dialog__title {
  display: block;
  @include md-type('title-large');
  color: $md-on-surface;
}
.dialog__sub {
  display: block;
  margin-top: 4px;
  @include md-type('body-small');
  color: #4caf50;
  font-weight: 600;
}
.dialog__posts {
  display: flex;
  flex-direction: column;
  gap: $md-space-3;
  margin-bottom: $md-space-4;
}
.dialog__post {
  background: $md-surface-container;
  border-radius: $md-shape-md;
  padding: $md-space-3 $md-space-4;
}
.dialog__post-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: $md-space-2;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.dialog__post-content {
  @include md-type('body-medium');
  color: $md-on-surface;
}
.dialog__empty {
  text-align: center;
  padding: $md-space-5 0;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.dialog__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
