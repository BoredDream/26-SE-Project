<template>
  <view class="profile">
    <md-app-bar title="我的" />

    <view class="profile__body">
      <md-card class="profile__card">
        <view class="profile__head">
          <view class="profile__avatar">{{ avatarInitial }}</view>
          <view class="profile__ident">
            <text class="profile__name">{{ userName }}</text>
            <text class="profile__role">{{ userRole }}</text>
          </view>
        </view>
        <view class="profile__stats">
          <view class="stat">
            <text class="stat__num">{{ userExp }}</text>
            <text class="stat__label">经验</text>
          </view>
          <view class="stat">
            <text class="stat__num">{{ totalCheckins }}</text>
            <text class="stat__label">打卡数</text>
          </view>
          <view class="stat">
            <text class="stat__num">{{ achievementCount }}</text>
            <text class="stat__label">徽章</text>
          </view>
        </view>
      </md-card>

      <md-card class="profile__progress">
        <text class="profile__progress-title">成长进度</text>
        <view class="bar">
          <view class="bar__fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="profile__progress-meta">当前等级 {{ userLevel }} · {{ progressPercent }}%</text>
      </md-card>

      <view class="posts">
        <view class="posts__head">
          <text class="posts__title">我的帖子</text>
          <md-button variant="text" @click="goToCheckins">查看全部</md-button>
        </view>
        <view v-if="myPosts.length" class="posts__list">
          <md-card
            v-for="post in myPosts"
            :key="post.id"
            clickable
            @click="openPost(post)"
          >
            <text class="post__title">{{ post.location?.name || locationSpecies(post.location_id) }}</text>
            <text class="post__text">{{ post.content }}</text>
            <view class="post__meta">
              <text>{{ formatTime(post.created_at) }}</text>
              <text>点赞 {{ post.likes_count }} · 评论 {{ post.comments_count || 0 }}</text>
            </view>
          </md-card>
        </view>
        <view v-else class="empty">你还没有发布过帖子。</view>
      </view>
    </view>

    <bottom-action-bar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCheckinStore } from '@/stores/checkin'
import { useAchievementStore } from '@/stores/achievement'
import { useLocationStore } from '@/stores/location'

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

const locationSpecies = (id?: number) =>
  locationStore.locations.find(item => item.id === id)?.flower_species || '未知'

const formatTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const goToCheckins = () => {
  uni.reLaunch({ url: '/pages/home/home' })
}

const openPost = (post: any) => {
  if (post.user?.id) {
    uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${post.user.id}` })
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

<style scoped lang="scss">
.profile {
  min-height: 100vh;
  background: $md-background;
}
.profile__body {
  padding: $md-space-4;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: $md-space-4;
}
.profile__head {
  display: flex;
  align-items: center;
  gap: $md-space-4;
}
.profile__avatar {
  width: 64px;
  height: 64px;
  border-radius: $md-shape-full;
  background: $md-primary-container;
  color: $md-on-primary-container;
  display: flex;
  align-items: center;
  justify-content: center;
  @include md-type('headline-small');
}
.profile__name {
  display: block;
  @include md-type('title-large');
  color: $md-on-surface;
}
.profile__role {
  display: block;
  margin-top: 2px;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.profile__stats {
  display: flex;
  margin-top: $md-space-5;
}
.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat__num {
  @include md-type('title-large');
  color: $md-primary;
}
.stat__label {
  margin-top: 2px;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}

.profile__progress {
  /* 间距由父容器 gap 统一管理 */
}
.profile__progress-title {
  display: block;
  margin-bottom: $md-space-3;
  @include md-type('title-medium');
  color: $md-on-surface;
}
.bar {
  height: 8px;
  border-radius: $md-shape-full;
  background: $md-surface-variant;
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  border-radius: $md-shape-full;
  background: $md-primary;
  transition: width $md-duration-medium $md-easing-standard;
}
.profile__progress-meta {
  display: block;
  margin-top: $md-space-3;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}

.posts__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $md-space-2;
}
.posts__title {
  @include md-type('title-medium');
  color: $md-on-surface;
}
.posts__list {
  display: flex;
  flex-direction: column;
  gap: $md-space-3;
}
.post__title {
  display: block;
  margin-bottom: $md-space-1;
  @include md-type('title-small');
  color: $md-on-surface;
}
.post__text {
  display: block;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.post__meta {
  display: flex;
  justify-content: space-between;
  margin-top: $md-space-3;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.empty {
  text-align: center;
  padding: $md-space-8 0;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
</style>
