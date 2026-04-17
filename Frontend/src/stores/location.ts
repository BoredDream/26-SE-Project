import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Location } from '@/services/api'
import { api } from '@/services/api'

export const useLocationStore = defineStore('location', () => {
  const locations = ref<Location[]>([])
  const currentLocation = ref<Location | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadLocations = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.map.flowers()
      locations.value = response.data.map(item => ({
        id: item.flower_place_id,
        flower_place_id: item.flower_place_id,
        flower_id: item.flower_id,
        place_id: item.place_id,
        name: item.place_name,
        flower_species: item.flower_name,
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        bloom_status: item.bloom_status,
        description: `花卉 ${item.flower_name}，地点 ${item.place_name}`,
        historical_bloom_start: null,
        historical_bloom_end: null,
        cover_image: '',
        checkin_count: 0,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载位置失败'
    } finally {
      isLoading.value = false
    }
  }

  const getLocationById = async (id: number) => {
    const existing = locations.value.find(location => location.id === id)
    if (existing) {
      return existing
    }

    try {
      const response = await api.map.flowers()
      const item = response.data.find(location => location.flower_place_id === id)
      if (!item) {
        throw new Error('未找到该地点')
      }

      return {
        id: item.flower_place_id,
        flower_place_id: item.flower_place_id,
        flower_id: item.flower_id,
        place_id: item.place_id,
        name: item.place_name,
        flower_species: item.flower_name,
        latitude: String(item.latitude),
        longitude: String(item.longitude),
        bloom_status: item.bloom_status,
        description: `花卉 ${item.flower_name}，地点 ${item.place_name}`,
        historical_bloom_start: null,
        historical_bloom_end: null,
        cover_image: '',
        checkin_count: 0,
      }
    } catch (err) {
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