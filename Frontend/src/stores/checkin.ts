import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Checkin } from '@/services/api'
import { api } from '@/services/api'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadCheckins = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.checkins.getList()
      checkins.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载签到记录失败'
    } finally {
      isLoading.value = false
    }
  }

  const createCheckin = async (data: {
    user_id: number
    flower_place_id: number
    bloom_report: string
    content?: string
    images?: File[]
  }) => {
    try {
      const response = await api.checkins.create(data)
      checkins.value.unshift(response.data) // 添加到列表开头
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发布签到失败'
      throw err
    }
  }

  const likeCheckin = async (id: number) => {
    try {
      await api.checkins.like(id)
      const checkin = checkins.value.find(c => c.id === id)
      if (checkin) {
        checkin.likes_count += 1
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  const reportCheckin = async (id: number, reason: string) => {
    try {
      await api.checkins.report(id, reason)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '举报失败'
      throw err
    }
  }

  return {
    checkins,
    isLoading,
    error,
    loadCheckins,
    createCheckin,
    likeCheckin,
    reportCheckin,
  }
})