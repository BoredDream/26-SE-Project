<template>
  <Teleport to="body">
    <div v-if="visible" class="comment-sheet">
      <div class="sheet-backdrop" @click="emit('close')"></div>
      <div class="sheet-panel">
        <!-- 拖拽把手 -->
        <div class="sheet-handle"></div>

        <!-- 标题 -->
        <div class="sheet-header">
          <span class="sheet-title">评论</span>
          <span class="sheet-count">{{ allComments.length }} 条</span>
          <button class="sheet-close" @click="emit('close')">✕</button>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list" ref="listRef">
          <div v-if="!allComments.length" class="no-comments">暂无评论，来说点什么吧</div>

          <div v-for="comment in visibleComments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">{{ comment.user.nickname.slice(0, 1) }}</div>
            <div class="comment-body">
              <div class="comment-meta">
                <span class="comment-author">{{ comment.user.nickname }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>

          <!-- 加载更多 -->
          <button
            v-if="canLoadMore"
            class="load-more-btn"
            @click="loadMore"
          >
            加载更多 · 还有 {{ allComments.length - visibleCount }} 条
          </button>
          <div v-else-if="allComments.length > PAGE_SIZE" class="all-loaded">已显示全部评论</div>
        </div>

        <!-- 输入区 -->
        <div class="comment-input-row">
          <input
            v-model="inputText"
            class="comment-input"
            placeholder="说点什么..."
            maxlength="200"
            @keydown.enter.prevent="sendComment"
          />
          <button
            class="send-btn"
            :disabled="!inputText.trim()"
            @click="sendComment"
          >发送</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { mockComments, type Comment } from '@/services/mockData'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ postId: number; visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const PAGE_SIZE = 5
const authStore = useAuthStore()
const inputText = ref('')
const visibleCount = ref(PAGE_SIZE)
const localComments = ref<Comment[]>([])

const allComments = computed(() =>
  [...mockComments.filter(c => c.post_id === props.postId), ...localComments.value]
)
const visibleComments = computed(() => allComments.value.slice(0, visibleCount.value))
const canLoadMore = computed(() => visibleCount.value < allComments.value.length)

const loadMore = () => {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, allComments.value.length)
}

const sendComment = () => {
  const text = inputText.value.trim()
  if (!text) return
  const user = authStore.user
  localComments.value.push({
    id: Date.now(),
    post_id: props.postId,
    user: { id: user?.id || 0, nickname: user?.nickname || '我', avatar: '' },
    content: text,
    created_at: new Date().toISOString(),
  })
  inputText.value = ''
  visibleCount.value = allComments.value.length
}

const formatTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  if (h < 24) return `${h}小时前`
  return `${d}天前`
}

// 每次打开时重置到第一页
watch(() => props.visible, (val) => {
  if (val) {
    visibleCount.value = PAGE_SIZE
    localComments.value = []
    inputText.value = ''
  }
})
</script>

<style scoped>
.comment-sheet {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}

.sheet-panel {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 72vh;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #d9e8d9;
  margin: 12px auto 0;
  flex-shrink: 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  padding: 14px 20px 10px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f5f0;
}

.sheet-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2a4d2e;
  flex: 1;
}

.sheet-count {
  font-size: 0.85rem;
  color: #8fa88f;
  margin-right: 14px;
}

.sheet-close {
  border: none;
  background: #f0f5f0;
  color: #5d7a5f;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  display: grid;
  place-items: center;
}

/* 评论列表 */
.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.no-comments {
  text-align: center;
  color: #8fa88f;
  padding: 32px 0;
  font-size: 0.9rem;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5faf5;
}

.comment-item:last-of-type {
  border-bottom: none;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #d9efda;
  color: #3a7d44;
  font-weight: 700;
  font-size: 0.9rem;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3a7d44;
}

.comment-time {
  font-size: 0.78rem;
  color: #8fa88f;
}

.comment-content {
  margin: 0;
  font-size: 0.9rem;
  color: #3d5540;
  line-height: 1.6;
}

.load-more-btn {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #f0f8f0;
  border: none;
  border-radius: 12px;
  color: #3a7d44;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s;
}

.load-more-btn:active {
  background: #ddf0dd;
}

.all-loaded {
  text-align: center;
  color: #8fa88f;
  font-size: 0.8rem;
  padding: 10px 0;
}

/* 输入区 */
.comment-input-row {
  display: flex;
  gap: 10px;
  padding: 12px 16px 20px;
  border-top: 1px solid #f0f5f0;
  flex-shrink: 0;
  background: #fff;
}

.comment-input {
  flex: 1;
  border: 1.5px solid #e3f0e3;
  border-radius: 20px;
  padding: 10px 14px;
  font-size: 0.9rem;
  outline: none;
  color: #2a4d2e;
  background: #f8fcf8;
  transition: border-color 0.15s;
}

.comment-input:focus {
  border-color: #6fbb6b;
}

.send-btn {
  border: none;
  background: #3a7d44;
  color: white;
  border-radius: 20px;
  padding: 0 18px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn:not(:disabled):active {
  background: #2d6035;
}
</style>
