<template>
  <view class="auth">
    <view class="auth__brand">
      <view class="auth__logo"><text>狮</text></view>
      <text class="auth__title">狮山花园</text>
      <text class="auth__subtitle">探索花卉之美，发现自然魅力</text>
    </view>

    <md-card class="auth__card">
      <view v-if="error" class="auth__error">
        <text>{{ error }}</text>
      </view>
      <md-button block :disabled="isLoading" @click="handleDemoLogin">
        {{ isLoading ? '登录中...' : '演示模式进入' }}
      </md-button>
      <view class="auth__gap" />
      <md-button block variant="outlined" :disabled="isLoading" @click="goRegister">
        注册新账号
      </md-button>
    </md-card>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

onShow(async () => {
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
    return
  }
  await authStore.loadUser()
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
  }
})

const handleDemoLogin = async () => {
  isLoading.value = true
  error.value = null
  try {
    const success = await authStore.login('')
    if (success) {
      uni.reLaunch({ url: '/pages/home/home' })
    } else {
      error.value = authStore.error || '登录失败'
    }
  } catch (err) {
    error.value = '演示模式启动失败'
  } finally {
    isLoading.value = false
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style scoped lang="scss">
.auth {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $md-space-6;
  background: $md-background;
}
.auth__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $md-space-8;
}
.auth__logo {
  width: 72px;
  height: 72px;
  border-radius: $md-shape-xl;
  background: $md-primary-container;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $md-space-4;
}
.auth__logo text {
  @include md-type('headline-small');
  color: $md-on-primary-container;
}
.auth__title {
  @include md-type('display-small');
  color: $md-primary;
}
.auth__subtitle {
  margin-top: $md-space-2;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.auth__card {
  width: 100%;
  max-width: 420px;
}
.auth__gap {
  height: $md-space-3;
}
.auth__error {
  background: $md-error-container;
  color: $md-on-error-container;
  border-radius: $md-shape-sm;
  padding: $md-space-3 $md-space-4;
  margin-bottom: $md-space-4;
  @include md-type('body-medium');
}
</style>
