<template>
  <view class="comment-sheet" :class="{ 'comment-sheet--visible': visible }">
    <view class="comment-sheet__mask" @click="$emit('close')" @touchmove.stop.prevent />
    <view class="comment-sheet__panel" @click.stop>
      <view class="comment-sheet__head" @touchmove.stop.prevent>
        <text class="comment-sheet__title">评论 {{ comments.length }}</text>
        <view class="comment-sheet__close" hover-class="is-hover" @click="$emit('close')">
          <text>✕</text>
        </view>
      </view>

      <scroll-view scroll-y class="comment-sheet__list" :style="{ height: listHeight + 'px' }">
        <view v-if="!comments.length" class="comment-sheet__empty">
          <text>还没有评论，来抢沙发吧。</text>
        </view>
        <view v-for="c in comments" :key="c.id" class="comment-item">
          <view class="comment-item__avatar">{{ initial(c.user?.nickname) }}</view>
          <view class="comment-item__body">
            <text class="comment-item__name">{{ c.user?.nickname || '匿名用户' }}</text>
            <text class="comment-item__text">{{ c.content }}</text>
            <text class="comment-item__time">{{ formatTime(c.created_at) }}</text>
          </view>
          <view
            v-if="currentUserId && c.user_id === currentUserId"
            class="comment-item__delete"
            hover-class="is-hover"
            @click="onDelete(c.id)"
          >
            <text>删除</text>
          </view>
        </view>
      </scroll-view>

      <view class="comment-sheet__input-bar" @touchmove.stop.prevent>
        <input
          class="comment-sheet__input"
          :value="draft"
          placeholder="写下你的评论..."
          placeholder-class="comment-sheet__placeholder"
          confirm-type="send"
          :maxlength="200"
          @input="onInput"
          @confirm="send"
        />
        <view
          class="comment-sheet__send"
          :class="{ 'is-disabled': !draft.trim() || sending }"
          hover-class="is-hover"
          @click="send"
        >
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCheckinStore } from '@/stores/checkin'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ visible: boolean; checkinId: number }>()
defineEmits<{ (e: 'close'): void }>()

const checkinStore = useCheckinStore()
const authStore = useAuthStore()

const draft = ref('')
const sending = ref(false)

// 小程序端 scroll-view 必须有显式高度才能滚动；按窗口高度算一次固定像素高度
const sys = uni.getSystemInfoSync()
const listHeight = Math.max(
  160,
  Math.round(sys.windowHeight * 0.72 - 56 - 66 - (sys.safeAreaInsets?.bottom ?? 0)),
)

const comments = computed(() => checkinStore.commentsMap[props.checkinId] || [])
const currentUserId = computed(() => authStore.user?.id)

watch(
  () => props.visible,
  (v) => {
    if (v && props.checkinId) {
      draft.value = ''
      checkinStore.loadComments(props.checkinId)
    }
  },
)

const onInput = (e: any) => {
  draft.value = e.detail.value
}

const send = async () => {
  const text = draft.value.trim()
  if (!text || sending.value) return
  sending.value = true
  try {
    await checkinStore.addComment(props.checkinId, text)
    draft.value = ''
  } finally {
    sending.value = false
  }
}

const onDelete = (commentId: number) => {
  uni.showModal({
    title: '删除评论',
    content: '确定删除这条评论吗？',
    success: (r) => {
      if (r.confirm) checkinStore.deleteComment(props.checkinId, commentId)
    },
  })
}

const initial = (name?: string) => (name ? name[0] : '访')

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}
</script>

<style scoped lang="scss">
.comment-sheet {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  pointer-events: none;
}
.comment-sheet--visible {
  pointer-events: auto;
}
.comment-sheet__mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity $md-duration-medium $md-easing-standard;
}
.comment-sheet--visible .comment-sheet__mask {
  opacity: 1;
}
.comment-sheet__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $md-surface;
  border-radius: $md-shape-lg $md-shape-lg 0 0;
  transform: translateY(100%);
  transition: transform $md-duration-medium $md-easing-standard;
}
.comment-sheet--visible .comment-sheet__panel {
  transform: translateY(0);
}
.comment-sheet__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $md-space-4;
  border-bottom: 1px solid $md-outline-variant;
}
.comment-sheet__title {
  @include md-type('title-medium');
  color: $md-on-surface;
}
.comment-sheet__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $md-shape-full;
  color: $md-on-surface-variant;
}
.comment-sheet__list {
  padding: $md-space-2 $md-space-4;
  box-sizing: border-box;
}
.comment-sheet__empty {
  text-align: center;
  padding: $md-space-8 0;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.comment-item {
  display: flex;
  gap: $md-space-3;
  padding: $md-space-3 0;
  width: 100%;
  box-sizing: border-box;
}
.comment-item__avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: $md-shape-full;
  background: $md-primary-container;
  color: $md-on-primary-container;
  display: flex;
  align-items: center;
  justify-content: center;
  @include md-type('label-large');
}
.comment-item__body {
  flex: 1;
  min-width: 0;
}
.comment-item__name {
  display: block;
  @include md-type('label-large');
  color: $md-primary;
  font-family: "Georgia", "Songti SC", serif;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.comment-item__text {
  display: block;
  margin: $md-space-1 0;
  @include md-type('body-medium');
  color: #4A4C44;
  font-family: "PingFang SC", "Helvetica Neue", sans-serif;
  line-height: 1.5;
}
.comment-item__time {
  display: block;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.comment-item__delete {
  align-self: flex-start;
  flex-shrink: 0;
  padding: $md-space-1 $md-space-2;
  @include md-type('body-small');
  color: $md-error;
}
.comment-sheet__input-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: $md-space-3;
  padding: $md-space-3 $md-space-4;
  padding-bottom: calc(#{$md-space-3} + constant(safe-area-inset-bottom));
  padding-bottom: calc(#{$md-space-3} + env(safe-area-inset-bottom));
  border-top: 1px solid $md-outline-variant;
}
.comment-sheet__input {
  flex: 1;
  height: 40px;
  padding: 0 $md-space-4;
  background: $md-surface-container;
  border-radius: $md-shape-full;
  @include md-type('body-medium');
  color: $md-on-surface;
}
.comment-sheet__placeholder {
  color: $md-on-surface-variant;
}
.comment-sheet__send {
  flex-shrink: 0;
  padding: 0 $md-space-5;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $md-shape-full;
  background: $md-primary;
  color: $md-on-primary;
  @include md-type('label-large');
}
.comment-sheet__send.is-disabled {
  opacity: 0.5;
}
.is-hover {
  opacity: 0.7;
}
</style>
