<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="title">注册新账号</text>
        <text class="subtitle">创建账号后即可访问花园数据</text>
      </view>

      <view v-if="isLoading" class="loading">
        <view class="spinner"></view>
        <text>注册中...</text>
      </view>

      <view v-else-if="error" class="error-message">
        <text>{{ error }}</text>
      </view>

      <view v-else class="login-content">
        <view class="login-fields">
          <label>
            <text>用户名</text>
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </label>
          <label>
            <text>密码</text>
            <input v-model="password" type="password" placeholder="请输入密码" />
          </label>
          <label>
            <text>昵称</text>
            <input v-model="nickname" type="text" placeholder="请输入昵称" />
          </label>
          <button @click="handleRegister" class="login-btn" :disabled="isLoading">
            注册
          </button>
        </view>

        <view class="login-actions">
          <text>已有账号？</text>
          <text class="link" @click="goLogin">登录</text>
        </view>
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

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #A5D6A7 100%);
}
.login-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  margin: 0 20px;
}
.logo {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  display: block;
  color: #4CAF50;
  font-size: 2rem;
  font-weight: 700;
}
.subtitle {
  display: block;
  color: #666;
  margin-top: 10px;
  font-size: 1rem;
}
.login-fields {
  display: grid;
  gap: 16px;
}
.login-fields label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  color: #444;
}
.login-fields input {
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid #dcdcdc;
  border-radius: 12px;
  font-size: 1rem;
}
.login-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  margin-top: 8px;
}
.login-actions {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}
.link {
  color: #4caf50;
  margin-left: 4px;
}
.loading {
  text-align: center;
  padding: 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ffcdd2;
}
</style>
