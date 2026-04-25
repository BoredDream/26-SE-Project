<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">
        <text class="title">狮山花园</text>
        <text class="subtitle">探索花卉之美，发现自然魅力</text>
      </view>

      <view v-if="isLoading" class="loading">
        <view class="spinner"></view>
        <text>登录中...</text>
      </view>

      <view v-else-if="error" class="error-message">
        <text>{{ error }}</text>
      </view>

      <view v-else class="login-content">
        <button @click="handleDemoLogin" class="demo-login-btn" :disabled="isLoading">
          演示模式
        </button>
        <button @click="goRegister" class="register-link-btn">
          去注册
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

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
  max-width: 400px;
  margin: 0 20px;
}
.logo {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  display: block;
  color: #4CAF50;
  font-size: 2.5rem;
  font-weight: 700;
}
.subtitle {
  display: block;
  color: #666;
  margin-top: 10px;
  font-size: 1rem;
}
.loading {
  text-align: center;
  padding: 20px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
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
.login-content {
  text-align: center;
}
.demo-login-btn {
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  margin-bottom: 12px;
}
.register-link-btn {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #4CAF50;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #4CAF50;
}
</style>
