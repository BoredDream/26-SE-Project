import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Checkin, Comment } from '@/services/api'
import { api } from '@/services/api'
import { mockCheckins, mockUser } from '@/services/mockData'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  // 评论缓存：key 为 checkinId，value 为评论列表
  const commentsMap = ref<Record<number, Comment[]>>({})
  const loadingComments = ref<Record<number, boolean>>({})

  const loadCheckins = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.checkins.getList()
      checkins.value = response.data?.length ? response.data : mockCheckins
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
    // 乐观更新：先切换点赞状态
    if (checkin) {
      checkin.likes_count += 1
    }
    try {
      const res = await api.checkins.like(id)
      // 成功后使用后端返回的实际数据
      if (checkin && res.data) {
        checkin.likes_count = res.data.likes_count
        checkin.dislikes_count = res.data.dislikes_count
      }
    } catch (err) {
      // 失败后回滚
      if (checkin) {
        checkin.likes_count -= 1
      }
      error.value = err instanceof Error ? err.message : '点赞失败'
      throw err
    }
  }

  const dislikeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    // 乐观更新：先切换点踩状态
    if (checkin) {
      checkin.dislikes_count = (checkin.dislikes_count || 0) + 1
    }
    try {
      const res = await api.checkins.dislike(id)
      // 成功后使用后端返回的实际数据
      if (checkin && res.data) {
        checkin.likes_count = res.data.likes_count
        checkin.dislikes_count = res.data.dislikes_count
      }
    } catch (err) {
      // 失败后回滚
      if (checkin) {
        checkin.dislikes_count = Math.max(0, (checkin.dislikes_count || 1) - 1)
      }
      error.value = err instanceof Error ? err.message : '点踩失败'
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

  // 评论相关方法
  const loadComments = async (checkinId: number) => {
    loadingComments.value[checkinId] = true
    try {
      const response = await api.checkins.getComments(checkinId)
      commentsMap.value[checkinId] = response.data || []
    } catch (err) {
      commentsMap.value[checkinId] = []
      error.value = err instanceof Error ? err.message : '加载评论失败'
    } finally {
      loadingComments.value[checkinId] = false
    }
  }

  const addComment = async (checkinId: number, content: string) => {
    try {
      const response = await api.checkins.addComment(checkinId, content)
      if (!commentsMap.value[checkinId]) {
        commentsMap.value[checkinId] = []
      }
      commentsMap.value[checkinId].push(response.data)
      // 更新 checkin 的评论数
      const checkin = checkins.value.find(c => c.id === checkinId)
      if (checkin) {
        checkin.comments_count = (checkin.comments_count || 0) + 1
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加评论失败'
      throw err
    }
  }

  const deleteComment = async (checkinId: number, commentId: number) => {
    try {
      await api.checkins.deleteComment(checkinId, commentId)
      if (commentsMap.value[checkinId]) {
        commentsMap.value[checkinId] = commentsMap.value[checkinId].filter(c => c.id !== commentId)
      }
      // 更新 checkin 的评论数
      const checkin = checkins.value.find(c => c.id === checkinId)
      if (checkin) {
        checkin.comments_count = Math.max(0, (checkin.comments_count || 1) - 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除评论失败'
      throw err
    }
  }

  return {
    checkins,
    isLoading,
    error,
    commentsMap,
    loadingComments,
    loadCheckins,
    createCheckin,
    likeCheckin,
    dislikeCheckin,
    reportCheckin,
    loadComments,
    addComment,
    deleteComment,
  }
})
