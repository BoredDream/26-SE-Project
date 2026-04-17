<template>
  <div class="profile-page">
    <div class="profile-scroll">
      <section class="profile-card">
        <div class="avatar-box">{{ avatarInitial }}</div>
        <div class="profile-info">
          <h2>{{ userName }}</h2>
          <p>{{ userRole }}</p>
          <div class="profile-stats">
            <div>
              <div class="stat-number">{{ userExp }}</div>
              <div class="stat-label">经验</div>
            </div>
            <div>
              <div class="stat-number">{{ totalCheckins }}</div>
              <div class="stat-label">打卡数</div>
            </div>
            <div>
              <div class="stat-number">{{ achievementCount }}</div>
              <div class="stat-label">徽章</div>
            </div>
          </div>
        </div>
      </section>

      <section class="progress-panel">
        <div class="progress-title">成长进度</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-meta">当前等级 {{ userLevel }} · {{ progressPercent }}%</div>
      </section>

      <section class="post-section">
        <div class="post-title-row">
          <h3>我的帖子</h3>
          <button @click="goToCheckins">查看全部</button>
        </div>
        <div v-if="myPosts.length" class="post-list">
          <article v-for="post in myPosts" :key="post.id" class="post-card">
            <div class="post-main" @click="openPost(post)">
              <div class="post-title">{{ post.location?.name || locationSpecies(post.location_id) }}</div>
              <p class="post-text">{{ post.content }}</p>
            </div>
            <div class="post-meta-row">
              <span>{{ formatTime(post.created_at) }}</span>
              <span>点赞 {{ post.likes_count }} · 评论 {{ post.comments_count || 0 }}</span>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">你还没有发布过帖子。</div>
      </section>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { useAchievementStore } from '@/stores/achievement'
import { useLocationStore } from '@/stores/location'

const router = useRouter()
const authStore = useAuthStore()
const checkinStore = useCheckinStore()
const achievementStore = useAchievementStore()
const locationStore = useLocationStore()

const userName = computed(() => authStore.user?.nickname || '花园探索者')
const userRole = computed(() => '狮山花园会员')
const userExp = computed(() => authStore.user?.exp || 0)
const userLevel = computed(() => authStore.user?.level || 1)
const totalCheckins = computed(() => authStore.user?.total_checkins || checkinStore.checkins.length)
const achievementCount = computed(() => achievementStore.achievements.length)
const progressPercent = computed(() => {
  const nextExp = Math.max(100, (authStore.user?.exp || 0) * 1.5)
  return Math.min(100, Math.round(((authStore.user?.exp || 0) / nextExp) * 100))
})
const avatarInitial = computed(() => userName.value.slice(0, 1))

const myPosts = computed(() => {
  if (!authStore.user) return []
  return checkinStore.checkins.filter(post => post.user?.id === authStore.user?.id)
})

const locationSpecies = (id: number) => {
  return locationStore.locations.find(item => item.id === id)?.flower_species || '未知'
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

const goToCheckins = () => {
  router.push('/home')
}

const openPost = (post: any) => {
  if (post.user?.id) {
    router.push({ name: 'UserDetail', params: { id: post.user.id } })
  }
}

onMounted(async () => {
  await Promise.all([
    authStore.loadUser(),
    checkinStore.loadCheckins(),
    achievementStore.loadAchievements(),
    locationStore.loadLocations(),
  ])
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #eef8ed;
}

.profile-scroll {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.profile-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 22px;
  box-shadow: 0 18px 38px rgba(85, 118, 79, 0.08);
  margin-bottom: 18px;
}

.avatar-box {
  width: 78px;
  height: 78px;
  border-radius: 22px;
  background: linear-gradient(135deg, #d9f0d7, #f7fff5);
  display: grid;
  place-items: center;
  font-size: 30px;
  font-weight: 700;
  color: #3f6d44;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2f5630;
}

.profile-info p {
  margin: 8px 0 16px;
  color: #637960;
}

.profile-stats {
  display: flex;
  gap: 16px;
}

.profile-stats div {
  text-align: center;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3e6e40;
}

.stat-label {
  color: #6d7f6a;
  font-size: 0.85rem;
}

.progress-panel {
  background: white;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 14px 32px rgba(79, 117, 66, 0.08);
  margin-bottom: 18px;
}

.progress-title {
  font-weight: 700;
  color: #2f5630;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #edf7ed;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7cbc79 0%, #4c8d47 100%);
}

.progress-meta {
  margin-top: 10px;
  color: #5d7f63;
  font-size: 0.95rem;
}

.post-section {
  margin-bottom: 18px;
}

.post-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-title-row h3 {
  margin: 0;
  color: #2b5130;
}

.post-title-row button {
  border: none;
  background: #edf7ee;
  color: #3c6940;
  border-radius: 16px;
  padding: 10px 14px;
  cursor: pointer;
}

.post-list {
  display: grid;
  gap: 14px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 14px 32px rgba(77, 111, 73, 0.08);
  cursor: pointer;
}

.post-main {
  margin-bottom: 10px;
}

.post-title {
  margin: 0 0 8px;
  font-weight: 700;
  color: #2f5530;
}

.post-text {
  margin: 0;
  color: #556a57;
  line-height: 1.7;
}

.post-meta-row {
  display: flex;
  justify-content: space-between;
  color: #6e7f6b;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  color: #6c7c66;
  padding: 24px 0;
}
</style>
