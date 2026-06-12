import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/services/api'
import { api } from '@/services/api'
import { getToken, setToken, clearToken } from '@/services/storage'
import { useCheckinStore } from '@/stores/checkin'

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

  const updateProfile = async (data: { nickname?: string; avatar_url?: string }) => {
    try {
      await api.users.updateProfile(data)
    } catch {
      // backend unreachable — apply locally so UI stays consistent
    }
    if (user.value) {
      if (data.nickname) user.value = { ...user.value, nickname: data.nickname }
      if (data.avatar_url !== undefined) user.value = { ...user.value, avatar_url: data.avatar_url }
    }
    // Optimistically sync the user's nickname/avatar onto any cached checkin author snapshots
    const checkinStore = useCheckinStore()
    const uid = user.value?.id
    if (uid != null) {
      checkinStore.checkins.forEach((c: any) => {
        if (c.user_id === uid && c.user) {
          if (data.nickname) c.user.nickname = data.nickname
          if (data.avatar_url !== undefined) c.user.avatar_url = data.avatar_url
        }
      })
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
    // 清理早期前端演示模式遗留的伪 token（'demo-' 前缀），它不是有效 JWT
    if (token.value.startsWith('demo-')) {
      logout()
      return
    }
    api.setToken(token.value)
    try {
      const response = await api.users.getCurrent()
      user.value = response.data
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 401) {
        logout()
      }
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
    updateProfile,
  }
})
