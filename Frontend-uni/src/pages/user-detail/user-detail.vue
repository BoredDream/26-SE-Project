<template>
  <view class="user-detail-page">
    <view class="detail-header">
      <button class="back-button" @click="goBack">返回</button>
      <text class="header-title">{{ userName }} 的主页</text>
    </view>

    <view class="detail-body">
      <view class="profile-card">
        <view class="avatar-box">{{ avatarText }}</view>
        <view class="info-box">
          <view class="name-row">
            <text class="name-text">{{ userName }}</text>
            <text class="badge-label">等级 {{ userLevel }}</text>
          </view>
          <text class="user-summary">已完成 {{ totalCheckins }} 次打卡，解锁 {{ unlockedBadges }} 个徽章。</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressWidth + '%' }"></view>
          </view>
          <text class="progress-meta">当前经验 {{ userExp }} / {{ nextLevelExp }}</text>
        </view>
      </view>

      <view class="posts-section">
        <text class="section-title">近期帖子</text>
        <view v-if="userPosts.length" class="post-list">
          <view v-for="post in userPosts" :key="post.id" class="post-card">
            <view class="post-header">
              <view>
                <text class="post-author">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="post-meta">{{ formatTime(post.created_at) }}</text>
              </view>
              <button class="view-button" @click="viewCheckin(post.id)">查看</button>
            </view>
            <text class="post-text">{{ post.content }}</text>
            <view v-if="post.images?.length" class="post-images">
              <view v-for="(image, idx) in post.images" :key="idx" class="post-image" :style="getImageStyle(post.images.length, idx)">
                <image :src="image" mode="aspectFill" />
              </view>
            </view>
            <view class="post-info-row">
              <text>花种：{{ locationSpecies(post.location_id) }}</text>
              <text>点赞 {{ post.likes_count }} / 点踩 {{ post.dislikes_count || 0 }}</text>
              <text>评论 {{ post.comments_count || 0 }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">该用户尚未发布帖子。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCheckinStore } from '@/stores/checkin'
import { useLocationStore } from '@/stores/location'
import { useAchievementStore } from '@/stores/achievement'
import { useAuthStore } from '@/stores/auth'

const checkinStore = useCheckinStore()
const locationStore = useLocationStore()
const achievementStore = useAchievementStore()
const authStore = useAuthStore()

const userId = ref(1)
const userName = ref('花园探索者')
const userLevel = ref(1)
const userExp = ref(0)
const totalCheckins = ref(0)
const unlockedBadges = ref(0)

const filteredPosts = computed(() => checkinStore.checkins.filter(post => post.user?.id === userId.value))
const userPosts = computed(() => filteredPosts.value)
const progressWidth = computed(() => {
  const nextLevel = nextLevelExp.value || 100
  return Math.min(100, (userExp.value / nextLevel) * 100)
})
const nextLevelExp = computed(() => Math.max(100, userExp.value * 1.5))
const avatarText = computed(() => userName.value.slice(0, 1))

const goBack = () => uni.navigateBack()

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const locationSpecies = (locationId?: number) => locationStore.locations.find(item => item.id === locationId)?.flower_species || '未知'

const getImageStyle = (count: number, index: number) => {
  if (count === 1) return { gridColumn: 'span 2', height: '220px' }
  if (count === 2) return { height: '140px' }
  if (count === 3) return index === 0 ? { gridRow: 'span 2', height: '100%' } : { height: '100px' }
  return { height: '112px' }
}

const viewCheckin = (id: number) => {
  const item = checkinStore.checkins.find(post => post.id === id)
  if (!item) return
  uni.switchTab({ url: '/pages/home/home' })
}

onLoad((options: any) => {
  userId.value = Number(options?.id || authStore.user?.id || 1)
})

onMounted(async () => {
  await Promise.all([checkinStore.loadCheckins(), locationStore.loadLocations(), achievementStore.loadAchievements()])
  const author = checkinStore.checkins.find(post => post.user?.id === userId.value)?.user
  if (author) {
    userName.value = author.nickname
    userLevel.value = author.level
    totalCheckins.value = author.total_checkins
  } else if (authStore.user?.id === userId.value) {
    userName.value = authStore.user.nickname
    userLevel.value = authStore.user.level
    userExp.value = authStore.user.exp
    totalCheckins.value = authStore.user.total_checkins
  }
  unlockedBadges.value = achievementStore.achievements.filter((_, i) => i < 6).length
})
</script>

<style scoped>
.user-detail-page { min-height: 100vh; background: linear-gradient(180deg, #eef7ee 0%, #fcfcfc 100%); }
.detail-header { display: flex; align-items: center; gap: 8px; padding: 18px 20px 14px; background: white; border-bottom: 1px solid rgba(0,0,0,0.08); }
.back-button { border: none; background: none; color: #4caf50; font-size: 14px; }
.header-title { font-size: 18px; font-weight: 700; color: #274329; }
.detail-body { padding: 20px; }
.profile-card { display: flex; gap: 16px; background: white; border-radius: 20px; padding: 20px; box-shadow: 0 18px 40px rgba(88,123,76,0.08); margin-bottom: 18px; }
.avatar-box { width: 84px; height: 84px; border-radius: 22px; background: linear-gradient(135deg, #d4f0d0, #f5fff1); display: flex; align-items: center; justify-content: center; font-size: 34px; color: #4a6a3d; font-weight: 700; }
.name-text { font-size: 20px; color: #243b28; font-weight: 700; }
.name-row { display: flex; gap: 10px; align-items: center; }
.badge-label { border: 1px solid #c9e7c7; color: #4c7a49; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
.user-summary { display: block; margin: 12px 0 0; color: #5d7455; font-size: 14px; }
.progress-bar { height: 10px; border-radius: 999px; background: #ebf5ea; margin-top: 16px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #76ba74 0%, #4ca65b 100%); }
.progress-meta { display: block; margin-top: 8px; color: #6d7f62; font-size: 13px; }
.posts-section { margin-top: 10px; }
.section-title { display: block; margin-bottom: 16px; font-size: 16px; font-weight: 700; color: #2c5130; }
.post-list { display: grid; gap: 16px; }
.post-card { background: white; border-radius: 20px; box-shadow: 0 14px 30px rgba(66,103,65,0.08); padding: 18px; }
.post-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
.post-author { font-weight: 700; color: #2f5030; }
.post-meta { display: block; color: #7e8d76; font-size: 12px; }
.view-button { border: none; background: #f4fff6; color: #3c6b3a; padding: 8px 12px; border-radius: 14px; font-size: 12px; }
.post-text { display: block; margin: 0 0 14px; color: #4a5f43; line-height: 1.7; }
.post-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px; }
.post-image { border-radius: 16px; overflow: hidden; position: relative; min-height: 100px; }
.post-image image { width: 100%; height: 100%; }
.post-info-row { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: #6d7c63; font-size: 13px; }
.empty-state { background: white; border-radius: 18px; padding: 30px; text-align: center; color: #7a8a72; }
</style>
