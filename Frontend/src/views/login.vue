<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo">
        <h1>狮山花园</h1>
        <p>探索花卉之美，发现自然魅力</p>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>{{ isRegister ? '注册中...' : '登录中...' }}</p>
      </div>

      <div v-else>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="login-content">
          <!-- 登录模式 -->
          <template v-if="!isRegister">
            <div class="form-group">
              <input
                v-model="username"
                type="text"
                placeholder="用户名"
                class="input-field"
                @keyup.enter="handleLogin"
              />
            </div>
            <div class="form-group">
              <input
                v-model="password"
                type="password"
                placeholder="密码"
                class="input-field"
                @keyup.enter="handleLogin"
              />
            </div>
            <button @click="handleLogin" class="login-btn" :disabled="isLoading || !username || !password">
              登录
            </button>
            <div class="switch-mode">
              <span>还没有账号？</span>
              <button @click="switchToRegister" class="link-btn">立即注册</button>
            </div>
          </template>

          <!-- 注册模式 -->
          <template v-else>
            <div class="form-group">
              <input
                v-model="registerUsername"
                type="text"
                placeholder="用户名"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <input
                v-model="registerPassword"
                type="password"
                placeholder="密码"
                class="input-field"
              />
            </div>
            <div class="form-group">
              <input
                v-model="registerNickname"
                type="text"
                placeholder="昵称"
                class="input-field"
              />
            </div>
            <button @click="handleRegister" class="login-btn" :disabled="isLoading || !registerUsername || !registerPassword || !registerNickname">
              注册
            </button>
            <div class="switch-mode">
              <span>已有账号？</span>
              <button @click="switchToLogin" class="link-btn">返回登录</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref<string | null>(null)
const isRegister = ref(false)

// 登录表单
const username = ref('')
const password = ref('')

// 注册表单
const registerUsername = ref('')
const registerPassword = ref('')
const registerNickname = ref('')

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

const switchToRegister = () => {
  isRegister.value = true
  error.value = null
}

const switchToLogin = () => {
  isRegister.value = false
  error.value = null
}

// 账号密码登录
const handleLogin = async () => {
  if (!username.value || !password.value) return
  isLoading.value = true
  error.value = null

  try {
    const response = await api.post<{
      token: string
      user: {
        id: number
        username: string
        nickname: string
        avatar_url: string
        role: string
        level: number
        exp: number
        total_checkins: number
      }
    }>('/v1/auth/login', {
      mode: 'password',
      username: username.value,
      password: password.value
    })

    const { token: newToken, user: userData } = response.data

    authStore.token = newToken
    authStore.user = {
      id: userData.id,
      openid: '',
      nickname: userData.nickname,
      avatar: userData.avatar_url,
      level: userData.level,
      exp: userData.exp,
      total_checkins: userData.total_checkins,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    api.setToken(newToken)

    router.push('/home')
  } catch (err: any) {
    error.value = err?.message || '用户名或密码错误'
  } finally {
    isLoading.value = false
  }
}

// 注册
const handleRegister = async () => {
  if (!registerUsername.value || !registerPassword.value || !registerNickname.value) return
  isLoading.value = true
  error.value = null

  try {
    const response = await api.post<{
      token: string
      user: {
        id: number
        username: string
        nickname: string
        avatar_url: string
        role: string
        level: number
        exp: number
        total_checkins: number
      }
    }>('/v1/auth/register', {
      username: registerUsername.value,
      password: registerPassword.value,
      nickname: registerNickname.value
    })

    const { token: newToken, user: userData } = response.data

    authStore.token = newToken
    authStore.user = {
      id: userData.id,
      openid: '',
      nickname: userData.nickname,
      avatar: userData.avatar_url,
      level: userData.level,
      exp: userData.exp,
      total_checkins: userData.total_checkins,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    api.setToken(newToken)

    router.push('/home')
  } catch (err: any) {
    error.value = err?.message || '注册失败'
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

.form-group {
  margin-bottom: 15px;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  background: #fafafa;
}

.input-field:focus {
  border-color: #4CAF50;
  background: white;
}

.input-field::placeholder {
  color: #aaa;
}

.login-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #388E3C, #2E7D32);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.switch-mode {
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
}

.link-btn {
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.link-btn:hover {
  color: #388E3C;
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
