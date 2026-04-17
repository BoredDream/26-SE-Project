<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <h1>注册新账号</h1>
        <p>创建账号后即可访问花园数据</p>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>注册中...</p>
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
          <label>
            昵称
            <input v-model="nickname" type="text" placeholder="请输入昵称" />
          </label>
          <button @click="handleRegister" class="login-btn" :disabled="isLoading">
            注册
          </button>
        </div>

        <div class="login-actions">
          <span>已有账号？<a @click.prevent="goLogin" href="/login">登录</a></span>
        </div>
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
const nickname = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    router.push('/home')
  }
})

const goLogin = () => {
  router.push('/login')
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
      router.push('/home')
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
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  color: #4CAF50;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.logo p {
  color: #666;
  margin: 10px 0 0 0;
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
  outline: none;
  transition: border-color 0.2s ease;
}

.login-fields input:focus {
  border-color: #4caf50;
}

.login-btn,
.demo-login-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(76, 175, 80, 0.2);
}

.login-actions {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.login-actions a {
  color: #4caf50;
  cursor: pointer;
  text-decoration: none;
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
