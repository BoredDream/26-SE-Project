<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <h1>狮山花园</h1>
        <p>探索花卉之美，发现自然魅力</p>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>登录中...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else class="login-content">
        <div class="login-fields">
          <label>
            用户名
            <input v-model="username" type="text" placeholder="请输入用户名" />
          </label>
          <label>
            密码
            <input v-model="password" type="password" placeholder="请输入密码" />
          </label>
          <button @click="handleLogin" class="login-btn" :disabled="isLoading">
            登录
          </button>
        </div>
        <div class="login-actions">
          <span>没有账号？<a @click.prevent="goRegister" href="/register">注册</a></span>
        </div>
        <div class="divider">或</div>
        <button @click="handleDemoLogin" class="demo-login-btn" :disabled="isLoading">
          演示模式
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// 检查是否已登录
onMounted(async () => {
  if (authStore.isAuthenticated) {
    router.push('/home')
    return
  }

  await authStore.loadUser()
  if (authStore.isAuthenticated) {
    router.push('/home')
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const success = await authStore.login(username.value, password.value)
    if (success) {
      router.push('/home')
    } else {
      error.value = authStore.error || '登录失败，请检查账号密码'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    isLoading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}

const handleDemoLogin = async () => {
  isLoading.value = true
  error.value = null

  try {
    const demoToken = 'demo_token_' + Date.now()
    authStore.token = demoToken
    authStore.user = {
      id: 1,
      username: 'demo',
      nickname: '花园探索者',
      avatar_url: null,
      role: 'user',
    }
    authStore.isAuthenticated
    router.push('/home')
  } catch (err) {
    error.value = '演示模式启动失败'
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
  position: relative;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.35s ease both;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  color: #4CAF50;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.logo p {
  color: #666;
  margin: 10px 0 0 0;
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
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
}

.demo-login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #E68900, #EF6C00);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.3);
}

.demo-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.demo-icon {
  font-size: 1.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form {
    width: 90%;
    padding: 2rem;
  }

  .logo h1 {
    font-size: 2rem;
  }
}
</style>