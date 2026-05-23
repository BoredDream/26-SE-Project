<template>
  <view class="home">
    <md-app-bar title="狮山花园" />

    <view class="home__body">
      <!-- 轮播 -->
      <md-card class="hero" :padding="false">
        <swiper
          class="hero__carousel"
          :indicator-dots="true"
          :autoplay="true"
          :interval="4500"
          :duration="500"
          indicator-color="rgba(255,255,255,0.45)"
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="(photo, i) in carouselPhotos" :key="i">
            <image class="hero__slide" :src="photo" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </md-card>

      <!-- 花卉推荐 -->
      <view class="section">
        <text class="section__title">花卉推荐</text>
        <view class="recommend">
          <md-card
            v-for="item in recommendationList"
            :key="item.id"
            variant="filled"
            clickable
            @click="openMap(item)"
          >
            <view class="recommend__row">
              <image class="recommend__img" :src="item.cover_image" mode="aspectFill" />
              <view class="recommend__info">
                <text class="recommend__name">{{ item.name }}</text>
                <text class="recommend__species">{{ item.flower_species }}</text>
                <md-chip class="recommend__status" :label="formatStatus(item.bloom_status)" />
              </view>
            </view>
          </md-card>
        </view>
      </view>

      <!-- 花园帖子 -->
      <view class="section">
        <view class="posts__head">
          <text class="section__title">花园帖子</text>
          <view class="posts__sort">
            <md-chip label="最新" :selected="sortOption === 'time'" @click="sortOption = 'time'" />
            <md-chip label="最热" :selected="sortOption === 'hot'" @click="sortOption = 'hot'" />
          </view>
        </view>

        <view class="posts">
          <md-card v-for="post in visiblePosts" :key="post.id" class="post">
            <view class="post__author" @click="openUser(post.user?.id)">
              <view class="post__avatar">{{ authorNameInitial(post.user?.nickname) }}</view>
              <view class="post__author-meta">
                <text class="post__author-name">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="post__time">{{ formatTime(post.created_at) }}</text>
              </view>
            </view>
            <text class="post__content">{{ post.content }}</text>
            <view v-if="post.images?.length" :class="['post__images', getImageGridClass(post.images.length)]">
              <view
                v-for="(img, idx) in post.images"
                :key="idx"
                class="post__image"
                hover-class="post__image--hover"
                @click.stop="previewImages(post.images, idx)"
              >
                <image :src="img" mode="aspectFill" />
                <view v-if="post.images.length > 9 && idx === 8" class="post__image-more">
                  <text>+{{ post.images.length - 9 }}</text>
                </view>
              </view>
            </view>
            <view class="post__footer">
              <md-chip :label="`花种 · ${locationSpecies(post.location_id)}`" @click="openMap(post)" />
              <view class="post__actions">
                <view
                  class="post__like"
                  :class="{ 'post__like--active': post.liked }"
                  hover-class="post__like--hover"
                  @click="likePost(post.id)"
                >
                  <text class="post__like-icon">{{ post.liked ? '♥' : '♡' }}</text>
                  <text class="post__like-count">{{ post.likes_count }}</text>
                </view>
                <view class="post__comment" hover-class="post__comment--hover" @click="openComments(post.id)">
                  <text>评论 {{ post.comments_count || 0 }}</text>
                </view>
              </view>
            </view>
          </md-card>
        </view>

        <view v-if="canLoadMore" class="posts__more">
          <md-button variant="tonal" @click="loadMore">加载更多</md-button>
        </view>
        <view v-if="!visiblePosts.length" class="empty">
          <text>暂无帖子，去发布你的第一条打卡吧。</text>
        </view>
      </view>
    </view>

    <view v-if="showBackToTop" class="to-top" hover-class="to-top--hover" @click="scrollToTop">
      <text class="to-top__icon">↑</text>
    </view>

    <comment-sheet
      :visible="commentSheetVisible"
      :checkin-id="activeCommentCheckinId"
      @close="commentSheetVisible = false"
    />

    <bottom-action-bar current="home" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import type { Location, Checkin } from '@/services/api'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const sortOption = ref<'time' | 'hot'>('time')
const visibleCount = ref(10)
const showBackToTop = ref(false)
const commentSheetVisible = ref(false)
const activeCommentCheckinId = ref(0)

const carouselPhotos = [
  '/static/carousel/1.jpg',
  '/static/carousel/2.jpg',
  '/static/carousel/3.jpg',
]

const recommendationList = computed(() => locationStore.locations.slice(0, 3))

const sortedPosts = computed<Checkin[]>(() => {
  const list = [...checkinStore.checkins]
  if (sortOption.value === 'hot') {
    return list.sort(
      (a, b) =>
        (b.likes_count + (b.comments_count || 0)) - (a.likes_count + (a.comments_count || 0)),
    )
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const visiblePosts = computed(() => sortedPosts.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleCount.value < sortedPosts.value.length)

const formatStatus = (status?: string) => status || '未知状态'

const locationSpecies = (locationId?: number) => {
  const item = locationStore.locations.find(l => l.id === locationId)
  return item?.flower_species || '未知'
}

const loadMore = () => {
  if (canLoadMore.value) visibleCount.value += 10
}

const scrollToTop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

const authorNameInitial = (name?: string) => (name ? name[0] : '访')

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const openMap = (item: Location | Checkin) => {
  const flowerName = 'flower_species' in item ? item.flower_species : locationSpecies(item.location_id)
  // tabbar 页面只能用 switchTab，但它不支持 query 参数，借助 storage 中转过滤条件
  if (flowerName) uni.setStorageSync('pending_map_filter', flowerName)
  uni.reLaunch({ url: '/pages/map/map' })
}

const openUser = (id?: number) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${id}` })
}

const likePost = async (id: number) => {
  try {
    await checkinStore.likeCheckin(id)
  } catch (err) {
    console.error('点赞失败', err)
  }
}

const openComments = (id: number) => {
  activeCommentCheckinId.value = id
  commentSheetVisible.value = true
}

const previewImages = (urls: string[], index: number) => {
  if (!urls?.length) return
  uni.previewImage({
    urls,
    current: urls[index],
  })
}

const goCheckin = () => {
  uni.navigateTo({ url: '/pages/checkin/checkin' })
}

const getImageGridClass = (count: number) => {
  if (count === 1) return 'one-image'
  if (count === 2) return 'two-images'
  if (count === 3) return 'three-images'
  return 'many-images'
}

onPageScroll((e) => {
  showBackToTop.value = e.scrollTop > 360
})

onReachBottom(() => {
  loadMore()
})

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
})
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: $md-background;
}
.home__body {
  padding: $md-space-4;
  padding-bottom: 100px;
}

/* 轮播 */
.hero {
  margin-bottom: $md-space-6;
}
.hero__carousel {
  height: 200px;
}
.hero__slide {
  width: 100%;
  height: 100%;
}

/* 区块 */
.section {
  margin-bottom: $md-space-6;
}
.section__title {
  display: block;
  @include md-type('title-medium');
  color: $md-on-surface;
  margin-bottom: $md-space-3;
}

/* 花卉推荐 */
.recommend {
  display: flex;
  flex-direction: column;
  gap: $md-space-3;
}
.recommend__row {
  display: flex;
  align-items: center;
  gap: $md-space-4;
}
.recommend__img {
  width: 96px;
  height: 96px;
  border-radius: $md-shape-md;
  flex-shrink: 0;
}
.recommend__info {
  flex: 1;
  min-width: 0;
}
.recommend__name {
  display: block;
  @include md-type('title-small');
  color: $md-on-surface;
}
.recommend__species {
  display: block;
  @include md-type('body-small');
  color: $md-on-surface-variant;
  margin: $md-space-1 0 $md-space-2;
}

/* 帖子 */
.posts__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $md-space-3;
}
.posts__sort {
  display: flex;
  gap: $md-space-2;
}
.posts {
  display: flex;
  flex-direction: column;
  gap: $md-space-4;
}
.post__author {
  display: flex;
  align-items: center;
  gap: $md-space-3;
}
.post__avatar {
  width: 40px;
  height: 40px;
  border-radius: $md-shape-full;
  background: $md-primary-container;
  color: $md-on-primary-container;
  display: flex;
  align-items: center;
  justify-content: center;
  @include md-type('title-small');
}
.post__author-name {
  display: block;
  @include md-type('title-small');
  color: $md-on-surface;
}
.post__time {
  display: block;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.post__content {
  display: block;
  margin: $md-space-3 0;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.post__images {
  display: grid;
  gap: $md-space-2;
  margin-bottom: $md-space-3;
}
.post__images.one-image {
  grid-template-columns: 1fr;
}
.post__images.one-image .post__image {
  aspect-ratio: 4 / 3;
}
.post__images.two-images {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.post__images.two-images .post__image {
  aspect-ratio: 1 / 1;
}
.post__images.three-images {
  grid-template-columns: 1.6fr 1fr;
  grid-template-rows: repeat(2, 96px);
}
.post__images.three-images .post__image:first-child {
  grid-row: span 2;
}
.post__images.many-images {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.post__images.many-images .post__image {
  aspect-ratio: 1 / 1;
}
.post__image {
  position: relative;
  overflow: hidden;
  border-radius: $md-shape-md;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.post__image--hover {
  opacity: 0.85;
  transform: scale(0.98);
}
.post__image image {
  width: 100%;
  height: 100%;
}
.post__image-more {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}
.post__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $md-space-3;
  flex-wrap: wrap;
}
.post__actions {
  display: flex;
  align-items: center;
  gap: $md-space-4;
}
.post__like {
  display: flex;
  align-items: center;
  gap: $md-space-1;
  padding: $md-space-1 $md-space-2;
  border-radius: $md-shape-full;
}
.post__like--hover {
  background: rgba(76, 175, 80, 0.12);
}
.post__like-icon {
  font-size: 16px;
  color: $md-on-surface-variant;
}
.post__like--active .post__like-icon {
  color: $md-primary;
}
.post__like-count {
  @include md-type('label-medium');
  color: $md-on-surface-variant;
}
.post__comment {
  padding: $md-space-1 $md-space-2;
  border-radius: $md-shape-full;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.post__comment--hover {
  background: rgba(76, 175, 80, 0.12);
}

/* 其它 */
.posts__more {
  display: flex;
  justify-content: center;
  margin-top: $md-space-4;
}
.empty {
  text-align: center;
  padding: $md-space-8 $md-space-4;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.to-top {
  position: fixed;
  right: $md-space-4;
  bottom: 110px;
  z-index: 50;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.to-top--hover {
  opacity: 0.85;
  transform: scale(0.94);
}
.to-top__icon {
  font-size: 22px;
  font-weight: 600;
  color: #4caf50;
  line-height: 1;
}
</style>
