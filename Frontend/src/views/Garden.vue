<template>
  <div class="garden-page">
    <div class="garden-scroll">
      <section class="progress-panel">
        <div class="progress-title">徽章收集进度</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">已解锁 {{ unlockedCount }} / {{ totalCount }} 个徽章</div>
      </section>

      <section class="badges-panel">
        <div class="badge-row" v-for="(row, rowIndex) in badgeRows" :key="row[0]?.id || rowIndex">
          <div
            v-for="badge in row"
            :key="badge.id"
            class="badge-card"
            :class="{ locked: !badge.unlocked }"
            @click="openBadgeDetail(badge)"
          >
            <div class="badge-lamp"></div>
            <div class="badge-body">
              <div class="badge-glass"></div>
              <div class="badge-flower" :class="badge.flowerClass"></div>
            </div>
            <div class="badge-name">{{ badge.name }}</div>
          </div>
        </div>
      </section>

      <div class="empty-note">点击徽章查看该花的打卡帖子</div>
    </div>

    <BottomNav />

    <div class="detail-modal" v-if="selectedLocation">
      <div class="modal-backdrop" @click="selectedLocation = null"></div>
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>{{ selectedLocation.name }}</h3>
            <p>花种：{{ selectedLocation.flower_species }}</p>
          </div>
          <button class="close-button" @click="selectedLocation = null">关闭</button>
        </div>
        <div class="modal-body">
          <div class="modal-status">{{ selectedLocation.bloom_status }}</div>
          <div class="modal-description">{{ selectedLocation.description }}</div>
          <div class="modal-posts">
            <div v-if="selectedLocationPosts.length" class="modal-post" v-for="post in selectedLocationPosts" :key="post.id">
              <div class="modal-post-meta">
                <span>{{ post.user?.nickname || '作者' }}</span>
                <span>{{ formatTime(post.created_at) }}</span>
              </div>
              <p>{{ post.content }}</p>
            </div>
            <div v-else class="no-posts">暂无打卡内容</div>
          </div>
        </div>
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
const selectedLocation = ref<any>(null)

const locations = computed(() => locationStore.locations)
const totalCount = computed(() => locations.value.length)
const unlockedCount = computed(() => locations.value.filter(location => checkinStore.checkins.some(post => post.location_id === location.id)).length)
const progressPercent = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((unlockedCount.value / totalCount.value) * 100)
})

const locationWithBadge = computed(() => {
  return locations.value.map(location => {
    const unlocked = checkinStore.checkins.some(post => post.location_id === location.id)
    return {
      ...location,
      unlocked,
      flowerClass: `flower-${(location.flower_species || 'none').replace(/[^a-zA-Z0-9]/g, '')}`
    }
  })
})

const badgeRows = computed(() => {
  const rows: any[][] = []
  for (let i = 0; i < locationWithBadge.value.length; i += 3) {
    rows.push(locationWithBadge.value.slice(i, i + 3))
  }
  return rows
})

const selectedLocationPosts = computed(() => {
  if (!selectedLocation.value) return []
  return checkinStore.checkins.filter(post => post.location_id === selectedLocation.value.id)
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
.garden-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef8ee 0%, #f7fbf7 100%);
  display: flex;
  flex-direction: column;
}

.garden-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.garden-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.garden-header h2 {
  margin: 0;
  font-size: 1.9rem;
  color: #2d5b31;
}

.garden-header p {
  margin: 8px 0 0;
  color: #5b7655;
}

.progress-panel {
  background: white;
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 18px 38px rgba(79, 117, 66, 0.08);
  margin-bottom: 20px;
}

.progress-title {
  font-size: 1rem;
  font-weight: 700;
  color: #3c6a38;
  margin-bottom: 10px;
}

.progress-bar {
  height: 12px;
  border-radius: 999px;
  background: #ebf6eb;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #79b87c 0%, #4c8d47 100%);
}

.progress-text {
  margin-top: 10px;
  color: #61755d;
  font-size: 0.95rem;
}

.badges-panel {
  display: grid;
  gap: 16px;
}

.badge-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.badge-card {
  background: #f8fff6;
  border-radius: 22px;
  border: 1px solid rgba(124, 182, 124, 0.34);
  padding: 16px 12px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.badge-card.locked {
  opacity: 0.44;
}

.badge-lamp {
  width: 36px;
  height: 10px;
  background: linear-gradient(90deg, #f4f2ae 0%, #f7f9c1 100%);
  border-radius: 999px;
  box-shadow: 0 0 18px rgba(223, 227, 165, 0.7);
}

.badge-body {
  width: 100%;
  height: 130px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.badge-glass {
  width: 90%;
  height: 70px;
  border-radius: 50% 50% 16px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.75);
  position: absolute;
  bottom: 18px;
}

.badge-flower {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #8fbc8f;
}

.badge-name {
  color: #385238;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

.empty-note {
  margin-top: 16px;
  color: #657864;
  font-size: 0.95rem;
  text-align: center;
}

.detail-modal {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

.modal-card {
  position: relative;
  width: min(560px, calc(100vw - 32px));
  background: white;
  border-radius: 24px;
  padding: 24px;
  z-index: 1;
  box-shadow: 0 28px 60px rgba(58, 84, 38, 0.16);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.modal-header h3 {
  margin: 0;
  color: #2b5e2c;
}

.close-button {
  border: none;
  background: #f1f8ef;
  color: #4a6e44;
  padding: 10px 14px;
  border-radius: 16px;
  cursor: pointer;
}

.modal-body {
  margin-top: 16px;
  color: #576b57;
}

.modal-status {
  font-weight: 700;
  color: #3d6a3f;
  margin-bottom: 12px;
}

.modal-description {
  margin-bottom: 18px;
  line-height: 1.7;
}

.modal-posts {
  display: grid;
  gap: 14px;
}

.modal-post {
  padding: 14px;
  background: #f6fbf6;
  border-radius: 18px;
}

.modal-post-meta {
  display: flex;
  justify-content: space-between;
  color: #5a6f5c;
  font-size: 12px;
  margin-bottom: 8px;
}

.no-posts {
  text-align: center;
  color: #7a8b7a;
  padding: 22px 0;
}
</style>
