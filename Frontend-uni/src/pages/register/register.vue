<template>
  <view class="auth-page">
    <md-app-bar title="注册" show-back @back="goLogin" />

    <view class="auth-page__body">
      <view class="auth__brand">
        <text class="auth__title">创建账号</text>
        <text class="auth__subtitle">注册后即可记录你的花园打卡</text>
      </view>

      <md-card>
        <view v-if="error" class="auth__error">
          <text>{{ error }}</text>
        </view>
        <view class="auth__fields">
          <md-text-field v-model="username" label="用户名" placeholder="请输入用户名" />
          <md-text-field v-model="password" label="密码" type="password" placeholder="请输入密码" />
          <md-text-field v-model="nickname" label="昵称" placeholder="请输入昵称" />
        </view>
        <md-button block :disabled="isLoading" @click="handleRegister">
          {{ isLoading ? '注册中...' : '注册' }}
        </md-button>
      </md-card>

      <view class="auth__foot">
        <text>已有账号？</text>
        <text class="auth__link" @click="goLogin">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const nickname = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

onShow(() => {
  if (authStore.isAuthenticated) {
    uni.reLaunch({ url: '/pages/home/home' })
  }
})

const goLogin = () => {
  uni.navigateBack()
}

const handleRegister = async () => {
  if (!username.value || !password.value || !nickname.value) {
    error.value = '请输入用户名、密码和昵称'
    return
  }
  isLoading.value = true
  error.value = null
  try {
    const success = await authStore.register(username.value, password.value, nickname.value)
    if (success) {
      uni.reLaunch({ url: '/pages/home/home' })
    } else {
      error.value = authStore.error || '注册失败，请重试'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  background: $md-background;
}
.auth-page__body {
  padding: $md-space-6 $md-space-4;
}
.auth__brand {
  text-align: center;
  margin-bottom: $md-space-6;
}
.auth__title {
  display: block;
  @include md-type('headline-small');
  color: $md-on-surface;
}
.auth__subtitle {
  display: block;
  margin-top: $md-space-2;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.auth__error {
  background: $md-error-container;
  color: $md-on-error-container;
  border-radius: $md-shape-sm;
  padding: $md-space-3 $md-space-4;
  margin-bottom: $md-space-4;
  @include md-type('body-medium');
}
.auth__fields {
  display: flex;
  flex-direction: column;
  gap: $md-space-4;
  margin-bottom: $md-space-5;
}
.auth__foot {
  text-align: center;
  margin-top: $md-space-5;
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
.auth__link {
  color: $md-primary;
  margin-left: $md-space-1;
}
</style>
