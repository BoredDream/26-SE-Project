import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Checkin } from '@/services/api'
import { api } from '@/services/api'
import { mockCheckins, mockUser } from '@/services/mockData'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadCheckins = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.checkins.getList()
      checkins.value = response.data.length ? response.data : mockCheckins
    } catch (err) {
      checkins.value = mockCheckins
      error.value = err instanceof Error ? err.message : '加载签到记录失败'
    } finally {
      isLoading.value = false
    }
  }

  const createCheckin = async (data: { location_id: number; content: string; images: string[]; flower_species?: string }) => {
    const createdAt = new Date().toISOString()
    const payload: Checkin = {
      id: Date.now(),
      user_id: mockUser.id,
      location_id: data.location_id,
      content: data.content,
      images: data.images,
      likes_count: 0,
      dislikes_count: 0,
      comments_count: 0,
      created_at: createdAt,
      updated_at: createdAt,
      user: mockUser,
    }

    try {
      const response = await api.checkins.create({
        location_id: data.location_id,
        content: data.content,
        images: data.images,
      })
      checkins.value.unshift(response.data)
      return response.data
    } catch (err) {
      checkins.value.unshift(payload)
      error.value = err instanceof Error ? err.message : '发布签到失败'
      return payload
    }
  }

  const likeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    if (checkin) {
      checkin.likes_count += 1
    }

    try {
      await api.checkins.like(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  const dislikeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    if (checkin) {
      checkin.dislikes_count = (checkin.dislikes_count || 0) + 1
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
    dislikeCheckin,
    reportCheckin,
  }
})