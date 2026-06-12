import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationItem } from '@/services/api'
import { api } from '@/services/api'

export const useNotificationStore = defineStore('notification', () => {
  const items = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadNotifications = async () => {
    isLoading.value = true
    try {
      const res = await api.notifications.getList()
      items.value = res.data?.items ?? []
      unreadCount.value = res.data?.unread_count ?? 0
    } catch (err) {
      items.value = []
      unreadCount.value = 0
      error.value = err instanceof Error ? err.message : '加载通知失败'
    } finally {
      isLoading.value = false
    }
  }

  const markRead = async (id: number) => {
    const item = items.value.find(n => n.id === id)
    if (!item || item.is_read) return
    try {
      await api.notifications.markRead(id)
      item.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '标记已读失败'
    }
  }

  const markAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      items.value.forEach(n => (n.is_read = true))
      unreadCount.value = 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : '一键已读失败'
    }
  }

  return {
    items,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markRead,
    markAllRead,
  }
})
