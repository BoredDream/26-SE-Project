import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/api'
import { api } from '@/services/api'
import { getToken, setToken, clearToken } from '@/services/storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getToken())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (code: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.auth.login('demo', code)
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      setToken(newToken)
      api.setToken(newToken)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
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
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      setToken(newToken)
      api.setToken(newToken)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    clearToken()
    api.clearToken()
  }

  const loadUser = async () => {
    if (!token.value) return
    try {
      api.setToken(token.value)
      const response = await api.users.getCurrent()
      user.value = response.data
    } catch (err) {
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
