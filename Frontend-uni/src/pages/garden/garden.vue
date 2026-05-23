<template>
  <view class="garden">
    <md-app-bar title="我的花园" />

    <view class="garden__body">
      <md-card class="progress">
        <text class="progress__title">徽章收集进度</text>
        <view class="progress__track">
          <view class="progress__fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress__text">已解锁 {{ unlockedCount }} / {{ totalCount }} 个徽章</text>
      </md-card>

      <view class="badges">
        <md-card
          v-for="badge in badges"
          :key="badge.id"
          variant="filled"
          clickable
          class="badge"
          :class="{ 'badge--locked': !badge.unlocked }"
          @click="openBadgeDetail(badge)"
        >
          <view class="badge__emblem">
            <text class="badge__emblem-text">{{ badge.unlocked ? emblemChar(badge) : '?' }}</text>
          </view>
          <text class="badge__name">{{ badge.name }}</text>
          <text class="badge__species">{{ badge.flower_species }}</text>
        </md-card>
      </view>

      <text class="garden__hint">点击徽章查看该地点的打卡帖子</text>
    </view>

    <view class="dialog" v-if="selectedLocation">
      <view class="dialog__scrim" @click="closeDetail"></view>
      <view class="dialog__card">
        <text class="dialog__title">{{ selectedLocation.name }}</text>
        <text class="dialog__sub">花种 · {{ selectedLocation.flower_species }}</text>
        <md-chip class="dialog__status" :label="selectedLocation.bloom_status" />
        <text class="dialog__desc">{{ selectedLocation.description }}</text>

        <view class="dialog__posts">
          <template v-if="selectedLocationPosts.length">
            <view v-for="post in selectedLocationPosts" :key="post.id" class="dialog__post">
              <view class="dialog__post-meta">
                <text>{{ post.user?.nickname || '花园用户' }}</text>
                <text>{{ formatTime(post.created_at) }}</text>
              </view>
              <text class="dialog__post-content">{{ post.content }}</text>
            </view>
          </template>
          <view v-else class="dialog__empty">暂无打卡内容</view>
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
import type { Location } from '@/services/api'

type Badge = Location & { unlocked: boolean }

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const selectedLocation = ref<Badge | null>(null)

const locations = computed(() => locationStore.locations)
const totalCount = computed(() => locations.value.length)
const unlockedCount = computed(
  () =>
    locations.value.filter(l => checkinStore.checkins.some(p => p.location_id === l.id)).length,
)
const progressPercent = computed(() =>
  totalCount.value ? Math.round((unlockedCount.value / totalCount.value) * 100) : 0,
)

const badges = computed<Badge[]>(() =>
  locations.value.map(l => ({
    ...l,
    unlocked: checkinStore.checkins.some(p => p.location_id === l.id),
  })),
)

const selectedLocationPosts = computed(() => {
  if (!selectedLocation.value) return []
  return checkinStore.checkins.filter(p => p.location_id === selectedLocation.value!.id)
})

const emblemChar = (badge: Location) => (badge.flower_species ? badge.flower_species[0] : '花')

const openBadgeDetail = (badge: Badge) => {
  selectedLocation.value = badge
}

const closeDetail = () => {
  selectedLocation.value = null
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
  padding: $md-space-4;
  padding-bottom: 100px;
}

/* 进度卡 */
.progress {
  margin-bottom: $md-space-5;
}
.progress__title {
  display: block;
  @include md-type('title-medium');
  color: $md-on-surface;
  margin-bottom: $md-space-3;
}
.progress__track {
  height: 8px;
  border-radius: $md-shape-full;
  background: $md-surface-variant;
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  border-radius: $md-shape-full;
  background: $md-primary;
  transition: width $md-duration-medium $md-easing-standard;
}
.progress__text {
  display: block;
  margin-top: $md-space-3;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}

/* 徽章网格 */
.badges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $md-space-3;
}
.badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.badge--locked {
  opacity: 0.5;
}
.badge__emblem {
  width: 56px;
  height: 56px;
  border-radius: $md-shape-full;
  background: $md-primary-container;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $md-space-2;
}
.badge__emblem-text {
  @include md-type('title-medium');
  color: $md-on-primary-container;
}
.badge__name {
  @include md-type('label-large');
  color: $md-on-surface;
  text-align: center;
}
.badge__species {
  margin-top: 2px;
  @include md-type('body-small');
  color: $md-on-surface-variant;
  text-align: center;
}
.garden__hint {
  display: block;
  margin-top: $md-space-5;
  text-align: center;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}

/* 详情对话框 */
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
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
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
  padding: $md-space-6;
  @include md-elevation(3);
}
.dialog__title {
  display: block;
  @include md-type('headline-small');
  color: $md-on-surface;
}
.dialog__sub {
  display: block;
  margin-top: $md-space-1;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.dialog__status {
  margin-top: $md-space-3;
}
.dialog__desc {
  display: block;
  margin-top: $md-space-3;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.dialog__posts {
  display: flex;
  flex-direction: column;
  gap: $md-space-3;
  margin-top: $md-space-4;
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
  padding: $md-space-6 0;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.dialog__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: $md-space-4;
}
</style>
