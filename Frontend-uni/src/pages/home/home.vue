<template>
  <view class="home-page">
    <view class="home-scroll">
      <view class="hero-card">
        <view class="hero-meta">
          <text>花卉打卡与分享平台</text>
        </view>
        <swiper class="carousel" :indicator-dots="true" :autoplay="true" :interval="4500" :duration="500">
          <swiper-item v-for="(photo, index) in carouselPhotos" :key="index">
            <image class="slide" :src="photo" mode="aspectFill" />
          </swiper-item>
        </swiper>
      </view>

      <view class="recommend-section">
        <text class="section-title">花卉推荐</text>
        <view class="recommend-grid">
          <view v-for="item in recommendationList" :key="item.id" class="recommend-card" @click="openMap(item)">
            <view class="recommend-image">
              <image :src="item.cover_image" mode="aspectFill" />
            </view>
            <view class="recommend-content">
              <text class="recommend-name">{{ item.name }}</text>
              <text class="recommend-species">{{ item.flower_species }}</text>
              <view class="recommend-status">{{ formatStatus(item.bloom_status) }}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="post-section">
        <view class="post-header">
          <view>
            <text class="post-header-title">花园帖子</text>
            <text class="post-header-sub">按时间或热度查看最新动态</text>
          </view>
          <view class="post-actions">
            <button :class="{ active: sortOption === 'time' }" @click="sortOption = 'time'">按时间排序</button>
            <button :class="{ active: sortOption === 'hot' }" @click="sortOption = 'hot'">按热度排序</button>
          </view>
        </view>

        <view class="post-list">
          <view v-for="post in visiblePosts" :key="post.id" class="post-card">
            <view class="post-author" @click="openUser(post.user?.id)">
              <view class="author-avatar">{{ authorNameInitial(post.user?.nickname) }}</view>
              <view>
                <text class="author-name">{{ post.user?.nickname || '匿名用户' }}</text>
                <text class="author-meta">{{ formatTime(post.created_at) }}</text>
              </view>
            </view>
            <text class="post-content">{{ post.content }}</text>
            <view v-if="post.images?.length" :class="['post-image-grid', getImageGridClass(post.images.length)]">
              <view v-for="(image, idx) in post.images" :key="idx" class="post-image-item">
                <image :src="image" mode="aspectFill" />
              </view>
            </view>
            <view class="post-footer">
              <button class="tag-button" @click="openMap(post)" type="button">
                花种：{{ locationSpecies(post.location_id) }}
              </button>
              <view class="post-actions-row">
                <button class="action-button" @click="likePost(post.id)">点赞</button>
                <button class="action-button" @click="dislikePost(post.id)">点踩</button>
                <text class="comment-info">评论 {{ post.comments_count || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="load-more" v-if="canLoadMore">
          <button @click="loadMore">加载更多帖子</button>
        </view>
        <view class="empty-state" v-if="!visiblePosts.length">
          <text>暂无帖子，请先发布你的第一条打卡。</text>
        </view>
      </view>
    </view>

    <button class="back-to-top" v-if="showBackToTop" @click="scrollToTop">返回顶部</button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import type { Location, Checkin } from '@/services/api'

const authStore = useAuthStore()
const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const activePhoto = ref(0)
const carouselIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
const sortOption = ref<'time' | 'hot'>('time')
const visibleCount = ref(10)
const showBackToTop = ref(false)

const carouselPhotos = [
  '/static/carousel/1.jpg',
  '/static/carousel/2.jpg',
  '/static/carousel/3.jpg',
]

const recommendationList = computed(() => locationStore.locations.slice(0, 3))

const sortedPosts = computed<Checkin[]>(() => {
  const list = [...checkinStore.checkins]
  if (sortOption.value === 'hot') {
    return list.sort((a, b) => (b.likes_count + (b.comments_count || 0)) - (a.likes_count + (a.comments_count || 0)))
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const visiblePosts = computed(() => sortedPosts.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleCount.value < sortedPosts.value.length)

const formatStatus = (status?: string) => {
  if (!status) return '未知状态'
  if (status.includes('预计')) return status
  return status
}

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

const authorNameInitial = (name?: string) => name ? name[0] : '访'

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

const openMap = (item: Location | Checkin) => {
  const flowerName = 'flower_species' in item ? item.flower_species : locationSpecies(item.location_id)
  uni.navigateTo({ url: `/pages/map/map?flower=${encodeURIComponent(flowerName)}` })
}

const openUser = (id?: number) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${id}` })
}

const likePost = async (id: number) => {
  await checkinStore.likeCheckin(id)
}

const dislikePost = (id: number) => {
  checkinStore.dislikeCheckin(id)
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
  carouselIntervalId.value = setInterval(() => {
    activePhoto.value = (activePhoto.value + 1) % carouselPhotos.length
  }, 4500)
})

onUnmounted(() => {
  if (carouselIntervalId.value !== null) {
    clearInterval(carouselIntervalId.value)
  }
})
</script>

<style scoped>
.home-page { min-height: 100vh; display: flex; flex-direction: column; background: #f3f9f3; }
.home-scroll { flex: 1; padding: 20px; }
.hero-card { background: linear-gradient(135deg, #edf7ec 0%, #dff2d8 100%); border-radius: 24px; padding: 24px; margin-bottom: 20px; }
.hero-meta text { color: #5a7f5a; font-size: 14px; }
.carousel { margin-top: 22px; border-radius: 20px; overflow: hidden; height: 220px; }
.slide { width: 100%; height: 100%; }
.recommend-section, .post-section { margin-bottom: 22px; }
.section-title { font-size: 18px; color: #2b5130; margin-bottom: 16px; }
.recommend-grid { display: grid; gap: 16px; }
.recommend-card { display: grid; grid-template-columns: 100px 1fr; gap: 16px; padding: 18px; background: white; border-radius: 18px; }
.recommend-image { width: 100px; height: 100px; border-radius: 18px; overflow: hidden; }
.recommend-image image { width: 100%; height: 100%; }
.recommend-name { display: block; font-size: 1.05rem; color: #2f5630; font-weight: 600; }
.recommend-species { display: block; color: #5e715f; margin: 6px 0 10px; }
.recommend-status { border-radius: 999px; background: #eef7ed; color: #3f7b44; font-size: 12px; padding: 8px 12px; display: inline-block; }
.post-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }
.post-header-title { display: block; color: #2b5130; font-size: 1.25rem; font-weight: 700; }
.post-header-sub { display: block; color: #637860; font-size: 0.95rem; margin-top: 4px; }
.post-actions { display: flex; gap: 10px; }
.post-actions button { border: 1px solid #c9dbc4; background: transparent; color: #4a6c47; padding: 10px 14px; border-radius: 16px; font-size: 12px; }
.post-actions button.active { background: #edf7ee; border-color: #8bc48b; }
.post-list { display: grid; gap: 18px; }
.post-card { background: white; border-radius: 20px; padding: 18px; }
.post-author { display: flex; gap: 12px; align-items: center; }
.author-avatar { width: 42px; height: 42px; border-radius: 50%; background: #d9efda; display: flex; align-items: center; justify-content: center; color: #3f6a3e; font-weight: 700; }
.author-name { display: block; font-weight: 700; color: #2b5130; }
.author-meta { display: block; color: #6e806e; font-size: 12px; }
.post-content { margin: 14px 0; color: #4a6146; line-height: 1.8; }
.post-image-grid { display: grid; gap: 8px; margin-bottom: 12px; }
.post-image-grid.one-image { grid-template-columns: 1fr; }
.post-image-grid.two-images { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.post-image-grid.three-images { grid-template-columns: 1.6fr 1fr; grid-template-rows: repeat(2, 100px); }
.post-image-grid.three-images .post-image-item:first-child { grid-row: span 2; }
.post-image-grid.many-images { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.post-image-item { overflow: hidden; border-radius: 16px; min-height: 100px; }
.post-image-item image { width: 100%; height: 100%; }
.post-footer { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
.tag-button { border: none; background: #f1fbf2; color: #3b6c3a; border-radius: 16px; padding: 10px 14px; font-size: 12px; }
.post-actions-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.action-button { border: 1px solid #c7dab1; background: #ffffff; color: #4a6d43; border-radius: 16px; padding: 10px 14px; font-size: 12px; }
.comment-info { color: #6b7b61; font-size: 13px; }
.load-more { text-align: center; margin-top: 16px; }
.load-more button { border: none; background: #4caf50; color: white; border-radius: 18px; padding: 12px 22px; }
.empty-state { text-align: center; color: #6d7f66; padding: 28px 16px; }
.back-to-top { position: fixed; right: 18px; bottom: 86px; border: none; background: #4caf50; color: white; padding: 12px 16px; border-radius: 999px; z-index: 100; }
</style>
