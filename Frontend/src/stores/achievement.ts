import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Achievement, Title } from '@/services/api'
import { api } from '@/services/api'

export const useAchievementStore = defineStore('achievement', () => {
  const achievements = ref<Achievement[]>([])
  const titles = ref<Title[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadAchievements = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.achievements.list()
      achievements.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载成就失败'
    } finally {
      isLoading.value = false
    }
  }

  const loadTitles = async () => {
    try {
      const response = await api.titles.list()
      titles.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载头衔失败'
    }
  }

  return {
    achievements,
    titles,
    isLoading,
    error,
    loadAchievements,
    loadTitles,
  }
})