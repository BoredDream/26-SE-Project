<template>
  <div class="home-page">
    <div class="home-scroll" ref="scrollRef" @scroll="onScroll">
      <section class="hero-card">
        <div class="hero-meta">
          <p>花卉打卡与分享平台</p>
        </div>
        <div class="carousel">
          <div class="slide" :style="`background-image: url(${carouselPhotos[activePhoto]})`"></div>
          <div class="carousel-footer">
            <span>当前展示 {{ activePhoto + 1 }}/{{ carouselPhotos.length }}</span>
            <div class="slider-dots">
              <button
                v-for="(photo, index) in carouselPhotos"
                :key="index"
                :class="{ active: index === activePhoto }"
                @click="activePhoto = index"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="recommend-section">
        <div class="section-title">花卉推荐</div>
        <div class="recommend-grid">
          <article
            v-for="item in recommendationList"
            :key="item.id"
            class="recommend-card"
          >
            <div class="recommend-image">
              <img :src="item.cover_image" alt="花卉图片" />
            </div>
            <div class="recommend-content">
              <h3>{{ item.name }}</h3>
              <p>{{ item.flower_species }}</p>
              <div class="recommend-status">{{ formatStatus(item.bloom_status) }}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="post-section">
        <div class="post-header">
          <div>
            <h2>花园帖子</h2>
            <p>按时间或热度查看最新动态</p>
          </div>
          <div class="post-actions">
            <button
              :class="{ active: sortOption === 'time' }"
              @click="sortOption = 'time'"
            >按时间排序</button>
            <button
              :class="{ active: sortOption === 'hot' }"
              @click="sortOption = 'hot'"
            >按热度排序</button>
          </div>
        </div>

        <div class="post-list">
          <article
            v-for="post in visiblePosts"
            :key="post.id"
            class="post-card"
          >
            <div class="post-author" @click="openUser(post.user?.id)">
              <div class="author-avatar">{{ authorNameInitial(post.user?.nickname) }}</div>
              <div>
                <div class="author-name">{{ post.user?.nickname || '匿名用户' }}</div>
                <div class="author-meta">{{ formatTime(post.created_at) }}</div>
              </div>
            </div>
            <p class="post-content">{{ post.content }}</p>
            <div
              v-if="post.images?.length"
              :class="['post-image-grid', getImageGridClass(post.images.length)]"
            >
              <div
                v-for="(image, index) in post.images"
                :key="index"
                class="post-image-item"
              >
                <img :src="normalizeImageUrl(image)" alt="动态图片" />
              </div>
            </div>
            <div class="post-footer">
              <button class="tag-button" @click="openMap(post)" type="button">
                花种：{{ locationSpecies(post.location_id) }}
              </button>
              <div class="post-actions-row">
                <button
                  class="action-button like-btn"
                  :class="{ liked: post.liked }"
                  @click="likePost(post.id)"
                >
                  👍 {{ post.likes_count || 0 }}
                </button>
                <button
                  class="action-button dislike-btn"
                  :class="{ disliked: post.disliked }"
                  @click="dislikePost(post.id)"
                >
                  👎 {{ post.dislikes_count || 0 }}
                </button>
                <button class="action-button comment-btn" @click="openCommentModal(post)">
                  💬 {{ post.comments_count || 0 }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div class="load-more" v-if="canLoadMore">
          <button @click="loadMore">加载更多帖子</button>
        </div>
        <div class="empty-state" v-if="!visiblePosts.length">
          暂无帖子，请先发布你的第一条打卡。
        </div>
      </section>
    </div>

    <!-- 评论弹窗 -->
    <div class="comment-overlay" v-if="showCommentModal" @click.self="closeCommentModal">
      <div class="comment-modal">
        <div class="comment-modal-header">
          <h3>评论 ({{ commentTarget?.comments_count || 0 }})</h3>
          <button class="close-btn" @click="closeCommentModal">✕</button>
        </div>
        <div class="comment-list" ref="commentListRef">
          <div v-if="loadingComments" class="comment-loading">加载中...</div>
          <div v-else-if="comments.length === 0" class="comment-empty">暂无评论，快来抢沙发吧~</div>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">{{ comment.user?.nickname?.[0] || '匿' }}</div>
            <div class="comment-body">
              <div class="comment-user">{{ comment.user?.nickname || '匿名用户' }}</div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-time">{{ formatTime(comment.created_at) }}</div>
            </div>
            <button
              v-if="comment.user_id === currentUserId"
              class="comment-delete"
              @click="removeComment(comment.id)"
            >删除</button>
          </div>
        </div>
        <div class="comment-input-area">
          <input
            v-model="commentText"
            class="comment-input"
            placeholder="写下你的评论..."
            @keyup.enter="submitComment"
          />
          <button
            class="comment-submit"
            :disabled="!commentText.trim()"
            @click="submitComment"
          >发送</button>
        </div>
      </div>
    </div>

    <button class="back-to-top" v-if="showBackToTop" @click="scrollToTop">返回顶部</button>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import type { Location, Checkin, Comment } from '@/services/api'
import { normalizeImageUrl } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const locationStore = useLocationStore()
const checkinStore = useCheckinStore()
const scrollRef = ref<HTMLElement | null>(null)
const activePhoto = ref(0)
const carouselIntervalId = ref<number | null>(null)
const sortOption = ref<'time' | 'hot'>('time')
const visibleCount = ref(10)
const showBackToTop = ref(false)
const carouselPhotos = [
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
]

// 评论弹窗状态
const showCommentModal = ref(false)
const commentTarget = ref<Checkin | null>(null)
const commentText = ref('')
const commentListRef = ref<HTMLElement | null>(null)

const recommendationList = computed(() => {
  return locationStore.locations.slice(0, 3)
})

const sortedPosts = computed<Checkin[]>(() => {
  const list = [...checkinStore.checkins]
  if (sortOption.value === 'hot') {
    return list.sort((a, b) => (b.likes_count + (b.comments_count || 0)) - (a.likes_count + (a.comments_count || 0)))
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const visiblePosts = computed(() => sortedPosts.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleCount.value < sortedPosts.value.length)

const currentUserId = computed(() => authStore.user?.id || 0)
const comments = computed<Comment[]>(() => {
  if (!commentTarget.value) return []
  return checkinStore.commentsMap[commentTarget.value.id] || []
})
const loadingComments = computed(() => {
  if (!commentTarget.value) return false
  return checkinStore.loadingComments[commentTarget.value.id] || false
})

const formatStatus = (status: string) => {
  if (!status) {
    return '未知状态'
  }
  if (status.includes('预计')) {
    return status
  }
  return status
}

const locationSpecies = (locationId: number) => {
  const item = locationStore.locations.find(location => location.id === locationId)
  return item?.flower_species || '未知'
}

const onScroll = () => {
  const element = scrollRef.value
  if (!element) return
  showBackToTop.value = element.scrollTop > 360
  if (element.scrollTop + element.clientHeight >= element.scrollHeight - 120) {
    loadMore()
  }
}

const loadMore = () => {
  if (canLoadMore.value) {
    visibleCount.value += 10
  }
}

const scrollToTop = () => {
  scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const authorNameInitial = (name?: string) => {
  return name ? name[0] : '访'
}

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

const openMap = (post: Checkin) => {
  const flowerName = locationSpecies(post.location_id)
  router.push({ path: '/map', query: { flower: flowerName } })
}

const openUser = (id?: number) => {
  if (!id) return
  router.push({ name: 'UserDetail', params: { id } })
}

const likePost = async (id: number) => {
  await checkinStore.likeCheckin(id)
}

const dislikePost = (id: number) => {
  checkinStore.dislikeCheckin(id)
}

// 评论弹窗方法
const openCommentModal = async (post: Checkin) => {
  commentTarget.value = post
  showCommentModal.value = true
  await checkinStore.loadComments(post.id)
}

const closeCommentModal = () => {
  showCommentModal.value = false
  commentTarget.value = null
  commentText.value = ''
}

const submitComment = async () => {
  if (!commentText.value.trim() || !commentTarget.value) return
  try {
    await checkinStore.addComment(commentTarget.value.id, commentText.value.trim())
    commentText.value = ''
    // 滚动到底部
    setTimeout(() => {
      if (commentListRef.value) {
        commentListRef.value.scrollTop = commentListRef.value.scrollHeight
      }
    }, 100)
  } catch (err) {
    console.error('评论失败:', err)
  }
}

const removeComment = async (commentId: number) => {
  if (!commentTarget.value) return
  try {
    await checkinStore.deleteComment(commentTarget.value.id, commentId)
  } catch (err) {
    console.error('删除评论失败:', err)
  }
}

const getImageGridClass = (count: number) => {
  if (count === 1) return 'one-image'
  if (count === 2) return 'two-images'
  if (count === 3) return 'three-images'
  return 'many-images'
}

onMounted(async () => {
  await Promise.all([locationStore.loadLocations(), checkinStore.loadCheckins()])
  carouselIntervalId.value = window.setInterval(() => {
    activePhoto.value = (activePhoto.value + 1) % carouselPhotos.length
  }, 4500)
})

onUnmounted(() => {
  if (carouselIntervalId.value !== null) {
    window.clearInterval(carouselIntervalId.value)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f9f3;
}

.home-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.hero-card {
  background: linear-gradient(135deg, #edf7ec 0%, #dff2d8 100%);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 18px 40px rgba(79, 118, 70, 0.08);
}

.hero-meta h1 {
  margin: 0;
  color: #2f5a32;
  font-size: 2.1rem;
}

.hero-meta p {
  margin: 10px 0 0;
  color: #5a7f5a;
}

.carousel {
  margin-top: 22px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  min-height: 220px;
}

.slide {
  width: 100%;
  min-height: 220px;
  background-size: cover;
  background-position: center;
}

.carousel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  padding: 12px 16px;
}

.slider-dots {
  display: flex;
  gap: 8px;
}

.slider-dots button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(76, 175, 80, 0.3);
  cursor: pointer;
}

.slider-dots button.active {
  background: #4caf50;
}

.recommend-section,
.post-section {
  margin-bottom: 22px;
}

.section-title {
  font-size: 18px;
  color: #2b5130;
  margin-bottom: 16px;
}

.recommend-grid {
  display: grid;
  gap: 16px;
}

.recommend-card {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 16px;
  padding: 18px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 14px 36px rgba(84, 123, 76, 0.08);
}

.recommend-image {
  width: 100px;
  height: 100px;
  border-radius: 18px;
  overflow: hidden;
}

.recommend-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-content h3 {
  margin: 0 0 6px;
  font-size: 1.05rem;
  color: #2f5630;
}

.recommend-content p {
  margin: 0 0 10px;
  color: #5e715f;
}

.recommend-status {
  border-radius: 999px;
  background: #eef7ed;
  color: #3f7b44;
  font-size: 12px;
  padding: 8px 12px;
  display: inline-block;
}

.post-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.post-header h2 {
  margin: 0;
  color: #2b5130;
  font-size: 1.25rem;
}

.post-header p {
  margin: 4px 0 0;
  color: #637860;
  font-size: 0.95rem;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.post-actions button {
  border: 1px solid #c9dbc4;
  background: transparent;
  color: #4a6c47;
  padding: 10px 14px;
  border-radius: 16px;
  cursor: pointer;
}

.post-actions button.active,
.post-actions button:hover {
  background: #edf7ee;
  border-color: #8bc48b;
}

.post-list {
  display: grid;
  gap: 18px;
  margin-top: 16px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 18px 42px rgba(83, 114, 75, 0.08);
}

.post-author {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #d9efda;
  display: grid;
  place-items: center;
  color: #3f6a3e;
  font-weight: 700;
}

.author-name {
  font-weight: 700;
  color: #2b5130;
}

.author-meta {
  color: #6e806e;
  font-size: 12px;
}

.post-content {
  margin: 14px 0;
  color: #4a6146;
  line-height: 1.8;
}

.post-image-grid {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.post-image-grid.one-image {
  grid-template-columns: 1fr;
}

.post-image-grid.two-images {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.post-image-grid.three-images {
  grid-template-columns: 1.6fr 1fr;
  grid-template-rows: repeat(2, 100px);
}

.post-image-grid.three-images .post-image-item:first-child {
  grid-row: span 2;
}

.post-image-grid.many-images {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.post-image-item {
  overflow: hidden;
  border-radius: 16px;
  min-height: 100px;
}

.post-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.tag-button {
  border: none;
  background: #f1fbf2;
  color: #3b6c3a;
  border-radius: 16px;
  padding: 10px 14px;
  cursor: pointer;
}

.post-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.action-button {
  border: 1px solid #c7dab1;
  background: #ffffff;
  color: #4a6d43;
  border-radius: 16px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f0f8f0;
}

.like-btn.liked {
  background: #fff0f0;
  border-color: #ff9e9e;
  color: #e53935;
}

.dislike-btn.disliked {
  background: #f0f0ff;
  border-color: #9e9eff;
  color: #5c6bc0;
}

.comment-info {
  color: #6b7b61;
  font-size: 13px;
}

/* 评论弹窗样式 */
.comment-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1400;
}

.comment-modal {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.comment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eef3ee;
}

.comment-modal-header h3 {
  margin: 0;
  color: #2b5130;
  font-size: 16px;
}

.close-btn {
  border: none;
  background: #f0f5f0;
  color: #5a7a5a;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  min-height: 120px;
  max-height: 40vh;
}

.comment-loading,
.comment-empty {
  text-align: center;
  color: #8a9e8a;
  padding: 32px 0;
  font-size: 14px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f5f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #d9efda;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3f6a3e;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-user {
  font-weight: 600;
  color: #2b5130;
  font-size: 13px;
}

.comment-content {
  color: #4a6146;
  font-size: 14px;
  margin: 4px 0;
  line-height: 1.5;
  word-break: break-word;
}

.comment-time {
  color: #8a9e8a;
  font-size: 11px;
}

.comment-delete {
  border: none;
  background: transparent;
  color: #c0392b;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  flex-shrink: 0;
  align-self: flex-start;
}

.comment-delete:hover {
  background: #fff0f0;
}

.comment-input-area {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #eef3ee;
  background: #fafcfa;
}

.comment-input {
  flex: 1;
  border: 1px solid #d4e2d4;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  background: white;
  color: #2b5130;
}

.comment-input:focus {
  border-color: #81c784;
}

.comment-submit {
  border: none;
  background: #4caf50;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.comment-submit:disabled {
  background: #b8d8b8;
  cursor: not-allowed;
}

.load-more {
  text-align: center;
  margin-top: 16px;
}

.load-more button {
  border: none;
  background: #4caf50;
  color: white;
  border-radius: 18px;
  padding: 12px 22px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  color: #6d7f66;
  padding: 28px 16px;
}

.back-to-top {
  position: fixed;
  right: 18px;
  bottom: 86px;
  border: none;
  background: #4caf50;
  color: white;
  padding: 12px 16px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(76, 175, 80, 0.22);
}
</style>
