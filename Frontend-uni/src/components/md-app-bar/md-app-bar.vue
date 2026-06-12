<template>
  <view class="md-app-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="md-app-bar__row">
      <view
        v-if="showBack"
        class="md-app-bar__icon-btn"
        hover-class="is-hover"
        @click="$emit('back')"
      >
        <text class="md-app-bar__back">←</text>
      </view>
      <text class="md-app-bar__title">{{ title }}</text>
      <view class="md-app-bar__actions">
        <slot name="actions" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title?: string; showBack?: boolean }>()
defineEmits<{ (e: 'back'): void }>()

const statusBarHeight = uni.getWindowInfo().statusBarHeight || 0
</script>

<style scoped lang="scss">
.md-app-bar {
  background: $md-surface;
}
.md-app-bar__row {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 $md-space-2;
}
.md-app-bar__icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $md-shape-full;
}
.is-hover { background: rgba(25, 29, 23, 0.08); }
.md-app-bar__back {
  font-size: 26px;
  line-height: 1;
  color: $md-on-surface;
}
.md-app-bar__title {
  flex: 1;
  padding: 0 $md-space-2;
  @include md-type('title-large');
  color: $md-on-surface;
  @include md-ellipsis(1);
}
.md-app-bar__actions {
  display: flex;
  align-items: center;
}
</style>
