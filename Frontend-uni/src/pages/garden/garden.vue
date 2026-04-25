<template>
  <view class="garden-page">
    <view class="garden-scroll">
      <view class="progress-panel">
        <text class="progress-title">徽章收集进度</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">已解锁 {{ unlockedCount }} / {{ totalCount }} 个徽章</text>
      </view>

      <view class="badges-panel">
        <view class="badge-row" v-for="(row, rowIndex) in badgeRows" :key="row[0]?.id || rowIndex">
          <view v-for="badge in row" :key="badge.id" class="badge-card" :class="{ locked: !badge.unlocked }" @click="openBadgeDetail(badge)">
            <view class="badge-lamp"></view>
            <view class="badge-body">
              <view class="badge-glass"></view>
              <view class="badge-flower" :class="badge.flowerClass"></view>
            </view>
            <text class="badge-name">{{ badge.name }}</text>
          </view>
        </view>
      </view>

      <text class="empty-note">点击徽章查看该花的打卡帖子</text>
    </view>

    <view class="detail-modal" v-if="selectedLocation">
      <view class="modal-backdrop" @click="selectedLocation = null"></view>
      <view class="modal-card">
        <view class="modal-header">
          <view>
            <text class="modal-title">{{ selectedLocation.name }}</text>
            <text class="modal-sub">花种：{{ selectedLocation.flower_species }}</text>
          </view>
          <button class="close-button" @click="selectedLocation = null">关闭</button>
        </view>
        <view class="modal-body">
          <text class="modal-status">{{ selectedLocation.bloom_status }}</text>
          <text class="modal-description">{{ selectedLocation.description }}</text>
          <view class="modal-posts">
            <view v-if="selectedLocationPosts.length" v-for="post in selectedLocationPosts" :key="post.id" class="modal-post">
              <view class="modal-post-meta">
                <text>{{ post.user?.nickname || '作者' }}</text>
                <text>{{ formatTime(post.created_at) }}</text>
              </view>
              <text>{{ post.content }}</text>
            </view>
            <view v-else class="no-posts">暂无打卡内容</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const selectedLocation = ref<any>(null)

const locations = computed(() => locationStore.locations)
const totalCount = computed(() => locations.value.length)
const unlockedCount = computed(() => locations.value.filter(l => checkinStore.checkins.some(p => p.location_id === l.id)).length)
const progressPercent = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((unlockedCount.value / totalCount.value) * 100)
})

const locationWithBadge = computed(() => locations.value.map(l => {
  const unlocked = checkinStore.checkins.some(p => p.location_id === l.id)
  return { ...l, unlocked, flowerClass: `flower-${(l.flower_species || 'none').replace(/[^a-zA-Z0-9]/g, '')}` }
}))

const badgeRows = computed(() => {
  const rows: any[][] = []
  for (let i = 0; i < locationWithBadge.value.length; i += 3) {
    rows.push(locationWithBadge.value.slice(i, i + 3))
  }
  return rows
})

const selectedLocationPosts = computed(() => {
  if (!selectedLocation.value) return []
  return checkinStore.checkins.filter(p => p.location_id === selectedLocation.value.id)
})

const openBadgeDetail = (location: any) => {
  selectedLocation.value = location
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
.garden-page { min-height: 100vh; background: linear-gradient(180deg, #eef8ee 0%, #f7fbf7 100%); display: flex; flex-direction: column; }
.garden-scroll { flex: 1; padding: 20px; }
.progress-panel { background: white; border-radius: 22px; padding: 20px; box-shadow: 0 18px 38px rgba(79,117,66,0.08); margin-bottom: 20px; }
.progress-title { display: block; font-size: 1rem; font-weight: 700; color: #3c6a38; margin-bottom: 10px; }
.progress-bar { height: 12px; border-radius: 999px; background: #ebf6eb; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #79b87c 0%, #4c8d47 100%); }
.progress-text { display: block; margin-top: 10px; color: #61755d; font-size: 0.95rem; }
.badges-panel { display: grid; gap: 16px; }
.badge-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.badge-card { background: #f8fff6; border-radius: 22px; border: 1px solid rgba(124,182,124,0.34); padding: 16px 12px 18px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.badge-card.locked { opacity: 0.44; }
.badge-lamp { width: 36px; height: 10px; background: linear-gradient(90deg, #f4f2ae 0%, #f7f9c1 100%); border-radius: 999px; }
.badge-body { width: 100%; height: 130px; position: relative; display: flex; align-items: flex-end; justify-content: center; }
.badge-glass { width: 90%; height: 70px; border-radius: 50% 50% 16px 16px; background: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.75); position: absolute; bottom: 18px; }
.badge-flower { width: 46px; height: 46px; border-radius: 12px; background: #8fbc8f; }
.badge-name { color: #385238; font-size: 0.95rem; font-weight: 600; text-align: center; }
.empty-note { display: block; margin-top: 16px; color: #657864; font-size: 0.95rem; text-align: center; }
.detail-modal { position: fixed; inset: 0; z-index: 1400; display: flex; align-items: center; justify-content: center; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.28); }
.modal-card { position: relative; width: min(560px, calc(100vw - 32px)); background: white; border-radius: 24px; padding: 24px; z-index: 1; }
.modal-title { display: block; font-size: 1.1rem; font-weight: 700; color: #2b5e2c; }
.modal-sub { display: block; color: #5d715b; font-size: 0.9rem; margin-top: 4px; }
.close-button { border: none; background: #f1f8ef; color: #4a6e44; padding: 10px 14px; border-radius: 16px; }
.modal-body { margin-top: 16px; color: #576b57; }
.modal-status { display: block; font-weight: 700; color: #3d6a3f; margin-bottom: 12px; }
.modal-description { display: block; margin-bottom: 18px; line-height: 1.7; }
.modal-posts { display: grid; gap: 14px; }
.modal-post { padding: 14px; background: #f6fbf6; border-radius: 18px; }
.modal-post-meta { display: flex; justify-content: space-between; color: #5a6f5c; font-size: 12px; margin-bottom: 8px; }
.no-posts { text-align: center; color: #7a8b7a; padding: 22px 0; }
</style>
