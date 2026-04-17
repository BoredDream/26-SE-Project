import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/api'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const formatApiError = (err: unknown, fallback: string) => {
    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch')) {
        return '无法连接后端，请检查网络或后端服务是否可用。'
      }
      return err.message
    }
    return fallback
  }

  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.auth.login(username, password)
      const newToken = response.data.access_token
      const userData = response.data

      token.value = newToken || null
      user.value = userData
      if (newToken) {
        api.setToken(newToken)
      }

      return true
    } catch (err) {
      error.value = formatApiError(err, '登录失败')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, password: string, nickname: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.auth.register({ username, password, nickname })
      const newToken = response.data.access_token
      const userData = response.data

      token.value = newToken || null
      user.value = userData
      if (newToken) {
        api.setToken(newToken)
      }

      return true
    } catch (err) {
      error.value = formatApiError(err, '注册失败')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    api.clearToken()
  }

  const loadUser = async () => {
    if (!token.value) return

    try {
      const response = await api.user.getInfo()
      user.value = response.data
    } catch (err) {
      // Token可能已过期
      logout()
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  }
})