import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Location } from '@/services/api'
import { api } from '@/services/api'
import { mockLocations } from '@/services/mockData'

export const useLocationStore = defineStore('location', () => {
  const locations = ref<Location[]>([])
  const currentLocation = ref<Location | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const MIN_LOCATIONS = 5
  const loadLocations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.locations.getList()
      locations.value = response.data?.length >= MIN_LOCATIONS ? response.data : mockLocations
    } catch (err) {
      locations.value = mockLocations
      error.value = err instanceof Error ? err.message : '加载位置失败'
    } finally {
      isLoading.value = false
    }
  }

  const getLocationById = async (id: number) => {
    try {
      const response = await api.locations.getById(id)
      return response.data
    } catch (err) {
      const fallback = mockLocations.find(item => item.id === id)
      if (fallback) return fallback
      error.value = err instanceof Error ? err.message : '获取位置详情失败'
      throw err
    }
  }

  return {
    locations,
    currentLocation,
    isLoading,
    error,
    loadLocations,
    getLocationById,
  }
})
