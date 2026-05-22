<template>
  <div class="profile-page">
    <div class="profile-scroll">

      <!-- 顶部 Hero Banner -->
      <section class="profile-hero">
        <div class="avatar-circle">{{ avatarInitial }}</div>
        <div class="hero-name">{{ userName }}</div>
        <div class="hero-tag">Lv.{{ userLevel }} · {{ userRole }}</div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userExp }}</div>
            <div class="stat-label">经验</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ totalCheckins }}</div>
            <div class="stat-label">打卡</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ achievementCount }}</div>
            <div class="stat-label">徽章</div>
          </div>
        </div>
      </section>

      <!-- 成长进度 -->
      <section class="progress-panel">
        <div class="progress-header">
          <span class="level-badge">Lv.{{ userLevel }}</span>
          <span class="progress-title">成长进度</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-meta">
          <span>{{ progressPercent }}%</span>
          <span>还需 {{ nextExpNeeded }} 经验升至下一级</span>
        </div>
      </section>

      <!-- 我的帖子 -->
      <section class="post-section">
        <div class="post-title-row">
          <h3>我的帖子</h3>
          <button @click="goToCheckins">查看全部</button>
        </div>
        <div v-if="myPosts.length" class="post-list">
          <article v-for="post in myPosts" :key="post.id" class="post-card" @click="openPost(post)">
            <div class="post-tag">{{ post.location?.name || locationSpecies(post.location_id) }}</div>
            <div class="post-title">{{ post.content }}</div>
            <div class="post-meta-row">
              <span>{{ formatTime(post.created_at) }}</span>
              <span>👍 {{ post.likes_count }} &nbsp; 💬 {{ post.comments_count || 0 }}</span>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">你还没有发布过帖子。</div>
      </section>

      <!-- 退出登录 -->
      <button class="logout-btn" @click="logout">退出登录</button>

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
const nextExpNeeded = computed(() => {
  const exp = authStore.user?.exp || 0
  const nextExp = Math.max(100, exp * 1.5)
  return Math.round(nextExp - exp)
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

const logout = () => {
  authStore.logout()
  router.push('/login')
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
/* ── 色彩变量 ── */
.profile-page {
  --c-primary: #3a7d44;
  --c-primary-light: #6fbb6b;
  --c-surface: #ffffff;
  --c-bg: #eef8ed;
  --c-text: #2a4d2e;
  --c-text-sub: #5d7a5f;
  --c-text-muted: #8fa88f;
  --c-border: #e3f0e3;
}

/* ── 页面容器 ── */
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

.profile-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

/* ── 顶部 Hero ── */
.profile-hero {
  background: linear-gradient(160deg, var(--c-primary) 0%, var(--c-primary-light) 100%);
  border-radius: 0 0 32px 32px;
  padding: 52px 24px 28px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  border: 3px solid rgba(255, 255, 255, 0.6);
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 700;
  color: white;
  margin: 0 auto 14px;
}

.hero-name {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}

.hero-tag {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  padding: 14px 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item .stat-number {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.stat-item .stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 3px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* ── 进度面板 ── */
.progress-panel {
  background: var(--c-surface);
  border-radius: 22px;
  padding: 18px 20px;
  box-shadow: 0 4px 20px rgba(58, 125, 68, 0.08);
  margin: 0 16px 16px;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.level-badge {
  background: var(--c-primary);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.progress-title {
  font-weight: 700;
  color: var(--c-text);
  font-size: 0.95rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--c-border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary-light) 0%, var(--c-primary) 100%);
  border-radius: 999px;
  transition: width 0.6s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--c-text-sub);
  font-size: 0.85rem;
}

/* ── 帖子区域 ── */
.post-section {
  margin: 0 16px 16px;
}

.post-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-title-row h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
}

.post-title-row button {
  border: none;
  background: var(--c-border);
  color: var(--c-primary);
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.post-title-row button:active {
  background: #c8e6c9;
}

.post-list {
  display: grid;
  gap: 12px;
}

.post-card {
  background: var(--c-surface);
  border-radius: 18px;
  padding: 14px 16px 14px 20px;
  box-shadow: 0 4px 16px rgba(58, 125, 68, 0.07);
  border-left: 4px solid var(--c-primary-light);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.post-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(58, 125, 68, 0.1);
}

.post-tag {
  display: inline-block;
  background: #e8f5e9;
  color: var(--c-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 0.95rem;
  color: var(--c-text);
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta-row {
  display: flex;
  justify-content: space-between;
  color: var(--c-text-muted);
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  color: var(--c-text-muted);
  padding: 32px 0;
  font-size: 0.95rem;
}

/* ── 退出登录 ── */
.logout-btn {
  display: block;
  width: calc(100% - 32px);
  margin: 4px 16px 24px;
  padding: 14px;
  background: transparent;
  border: 1.5px solid var(--c-border);
  border-radius: 16px;
  color: var(--c-text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.logout-btn:active {
  border-color: #e57373;
  color: #e57373;
}
</style>
