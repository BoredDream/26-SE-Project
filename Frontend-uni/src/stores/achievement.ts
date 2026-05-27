import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, Title } from '@/services/api'
import { api } from '@/services/api'
import { mockAchievements } from '@/services/mockData'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref<Achievement[]>([])
  const titles = ref<Title[]>([])
  const titlesLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadAchievements = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.achievements.getList()
      achievements.value = response.data?.length ? response.data : mockAchievements
    } catch (err) {
      achievements.value = mockAchievements
      error.value = err instanceof Error ? err.message : '加载成就失败'
    } finally {
      isLoading.value = false
    }
  }

  // titles = 当前用户「已获得」的称号列表（后端 GET /v1/users/me/titles）
  // 失败时留空，由 UI 层决定降级策略（如基于本地打卡数推算）
  const loadTitles = async () => {
    try {
      const response = await api.titles.getList()
      titles.value = response.data ?? []
    } catch (err) {
      titles.value = []
      error.value = err instanceof Error ? err.message : '加载头衔失败'
    } finally {
      titlesLoaded.value = true
    }
  }

  return {
    achievements,
    titles,
    titlesLoaded,
    isLoading,
    error,
    loadAchievements,
    loadTitles,
  }
})
