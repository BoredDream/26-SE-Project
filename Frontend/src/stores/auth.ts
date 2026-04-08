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

  const login = async (code: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.auth.login(code)
      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData
      api.setToken(newToken)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
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
      const response = await api.users.getCurrent()
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
    logout,
    loadUser,
  }
})