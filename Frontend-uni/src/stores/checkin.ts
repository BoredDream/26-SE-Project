import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Checkin, Comment } from '@/services/api'
import { api } from '@/services/api'
import { mockCheckins, mockUser } from '@/services/mockData'

export const useCheckinStore = defineStore('checkin', () => {
  const checkins = ref<Checkin[]>([])
  const commentsMap = ref<Record<number, Comment[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  const createCheckin = async (data: { location_id: number; content: string; images: string[]; bloom_report?: string; flower_species?: string }) => {
    const createdAt = new Date().toISOString()
    const payload: Checkin = {
      id: Date.now(),
      user_id: mockUser.id,
      location_id: data.location_id,
      content: data.content,
      images: data.images,
      likes_count: 0,
      comments_count: 0,
      liked: false,
      created_at: createdAt,
      updated_at: createdAt,
      user: mockUser,
    }
    try {
      const response = await api.checkins.create({
        location_id: data.location_id,
        content: data.content,
        images: data.images,
        bloom_report: data.bloom_report,
      })
      checkins.value.unshift(response.data)
      const res = response.data as any
      const newTitles: any[] = res.newly_granted_titles || []
      const newAchievements: any[] = res.newly_granted_achievements || []
      for (const t of newTitles) {
        uni.showToast({ title: `🎖️ 解锁称号：${t.name}`, icon: 'none', duration: 2500 })
        await new Promise(r => setTimeout(r, 500))
      }
      for (const a of newAchievements) {
        uni.showToast({ title: `🏅 解锁成就：${a.name || a.description}`, icon: 'none', duration: 2500 })
        await new Promise(r => setTimeout(r, 500))
      }
      return response.data
    } catch (err) {
      checkins.value.unshift(payload)
      error.value = err instanceof Error ? err.message : '发布签到失败'
      return payload
    }
  }

  const likeCheckin = async (id: number) => {
    const checkin = checkins.value.find(c => c.id === id)
    if (!checkin) return
    const wasLiked = !!checkin.liked
    checkin.liked = !wasLiked
    checkin.likes_count = Math.max(0, checkin.likes_count + (wasLiked ? -1 : 1))
    try {
      const res = await api.checkins.like(id)
      if (res.data) {
        checkin.likes_count = res.data.likes_count
        checkin.liked = res.data.liked
      }
    } catch (err) {
      // 保留乐观结果，离线/Mock 场景下点赞仍可见
      error.value = err instanceof Error ? err.message : '点赞失败'
    }
  }

  const loadComments = async (checkinId: number) => {
    try {
      const res = await api.checkins.getComments(checkinId)
      commentsMap.value[checkinId] = res.data || []
    } catch (err) {
      commentsMap.value[checkinId] = commentsMap.value[checkinId] || []
      error.value = err instanceof Error ? err.message : '加载评论失败'
    }
    const checkin = checkins.value.find(c => c.id === checkinId)
    if (checkin) checkin.comments_count = commentsMap.value[checkinId].length
    return commentsMap.value[checkinId]
  }

  const addComment = async (checkinId: number, content: string) => {
    const text = content.trim()
    if (!text) return
    let comment: Comment
    try {
      const res = await api.checkins.addComment(checkinId, text)
      comment = res.data
    } catch (err) {
      // 离线/Mock 兜底：本地生成评论
      error.value = err instanceof Error ? err.message : '评论失败'
      comment = {
        id: Date.now(),
        checkin_id: checkinId,
        user_id: mockUser.id,
        content: text,
        created_at: new Date().toISOString(),
        user: { id: mockUser.id, nickname: mockUser.nickname, avatar_url: mockUser.avatar_url },
      }
    }
    const list = commentsMap.value[checkinId] || (commentsMap.value[checkinId] = [])
    list.unshift(comment)
    const checkin = checkins.value.find(c => c.id === checkinId)
    if (checkin) checkin.comments_count = list.length
    return comment
  }

  const deleteComment = async (checkinId: number, commentId: number) => {
    try {
      await api.checkins.deleteComment(checkinId, commentId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除评论失败'
    }
    const list = commentsMap.value[checkinId]
    if (list) {
      commentsMap.value[checkinId] = list.filter(c => c.id !== commentId)
      const checkin = checkins.value.find(c => c.id === checkinId)
      if (checkin) checkin.comments_count = commentsMap.value[checkinId].length
    }
  }

  return {
    checkins,
    commentsMap,
    isLoading,
    error,
    loadCheckins,
    createCheckin,
    likeCheckin,
    loadComments,
    addComment,
    deleteComment,
  }
})
