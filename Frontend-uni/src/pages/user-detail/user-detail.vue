<template>
  <view class="user-detail">
    <md-app-bar :title="`${userName} 的主页`" show-back @back="goBack" />

    <view class="user-detail__body">
      <md-card class="profile-card">
        <view class="profile-card__head">
          <view class="profile-card__avatar">{{ avatarText }}</view>
          <view class="profile-card__ident">
            <view class="profile-card__name-row">
              <text class="profile-card__name">{{ userName }}</text>
              <md-chip :label="`Lv.${userLevel}`" selected />
            </view>
            <text class="profile-card__summary">
              已完成 {{ totalCheckins }} 次打卡，解锁 {{ unlockedBadges }} 个徽章
            </text>
          </view>
        </view>
        <view class="bar">
          <view class="bar__fill" :style="{ width: progressWidth + '%' }"></view>
        </view>
        <text class="profile-card__meta">当前经验 {{ userExp }} / {{ nextLevelExp }}</text>
      </md-card>

      <view class="posts">
        <text class="posts__title">近期帖子</text>
        <view v-if="userPosts.length" class="posts__list">
          <md-card v-for="post in userPosts" :key="post.id" class="post">
            <view class="post__head">
              <view>
                <text class="post__author">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="post__time">{{ formatTime(post.created_at) }}</text>
              </view>
              <md-button variant="text" @click="viewCheckin(post.id)">查看</md-button>
            </view>
            <text class="post__text">{{ post.content }}</text>
            <view v-if="post.images?.length" class="post__images">
              <view
                v-for="(image, idx) in post.images"
                :key="idx"
                class="post__image"
                :style="getImageStyle(post.images.length, idx)"
              >
                <image :src="image" mode="aspectFill" />
              </view>
            </view>
            <view class="post__info">
              <text>花种 · {{ locationSpecies(post.location_id) }}</text>
              <text>点赞 {{ post.likes_count }}</text>
              <text>评论 {{ post.comments_count || 0 }}</text>
            </view>
          </md-card>
        </view>
        <md-card v-else variant="filled" class="empty">该用户尚未发布帖子。</md-card>
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

const userPosts = computed(() =>
  checkinStore.checkins.filter(post => post.user?.id === userId.value),
)
const nextLevelExp = computed(() => Math.round(Math.max(100, userExp.value * 1.5)))
const progressWidth = computed(() =>
  Math.min(100, (userExp.value / (nextLevelExp.value || 100)) * 100),
)
const avatarText = computed(() => userName.value.slice(0, 1))

const goBack = () => uni.navigateBack()

const formatTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const locationSpecies = (locationId?: number) =>
  locationStore.locations.find(item => item.id === locationId)?.flower_species || '未知'

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
  await Promise.all([
    checkinStore.loadCheckins(),
    locationStore.loadLocations(),
    achievementStore.loadAchievements(),
  ])
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

<style scoped lang="scss">
.user-detail {
  min-height: 100vh;
  background: $md-background;
}
.user-detail__body {
  padding: $md-space-4;
}

.profile-card {
  margin-bottom: $md-space-4;
}
.profile-card__head {
  display: flex;
  align-items: center;
  gap: $md-space-4;
  margin-bottom: $md-space-4;
}
.profile-card__avatar {
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
.profile-card__name-row {
  display: flex;
  align-items: center;
  gap: $md-space-2;
}
.profile-card__name {
  @include md-type('title-large');
  color: $md-on-surface;
}
.profile-card__summary {
  display: block;
  margin-top: $md-space-2;
  @include md-type('body-small');
  color: $md-on-surface-variant;
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
.profile-card__meta {
  display: block;
  margin-top: $md-space-2;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}

.posts__title {
  display: block;
  margin-bottom: $md-space-3;
  @include md-type('title-medium');
  color: $md-on-surface;
}
.posts__list {
  display: flex;
  flex-direction: column;
  gap: $md-space-3;
}
.post__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $md-space-3;
}
.post__author {
  display: block;
  @include md-type('title-small');
  color: $md-on-surface;
}
.post__time {
  display: block;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.post__text {
  display: block;
  margin-bottom: $md-space-3;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.post__images {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $md-space-2;
  margin-bottom: $md-space-3;
}
.post__image {
  border-radius: $md-shape-md;
  overflow: hidden;
  min-height: 100px;
}
.post__image image {
  width: 100%;
  height: 100%;
}
.post__info {
  display: flex;
  justify-content: space-between;
  gap: $md-space-3;
  flex-wrap: wrap;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.empty {
  text-align: center;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
</style>
