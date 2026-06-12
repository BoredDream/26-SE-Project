import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription } from '@/services/api'
import { api } from '@/services/api'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscriptions = ref<Subscription[]>([])
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const subscribedFlowerIds = computed(() => new Set(subscriptions.value.map(s => s.flower_id)))
  const isSubscribed = (flowerId: number) => subscribedFlowerIds.value.has(flowerId)

  const loadSubscriptions = async () => {
    try {
      const res = await api.subscriptions.getList()
      subscriptions.value = res.data ?? []
    } catch (err) {
      subscriptions.value = []
      error.value = err instanceof Error ? err.message : '加载订阅失败'
    } finally {
      loaded.value = true
    }
  }

  const subscribe = async (flowerId: number, species: string, coverImage = '') => {
    try {
      await api.subscriptions.subscribe(flowerId)
      if (!subscribedFlowerIds.value.has(flowerId)) {
        subscriptions.value.push({
          flower_id: flowerId,
          species,
          cover_image: coverImage,
          bloom_status: null,
          subscribed_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '订阅失败'
      throw err
    }
  }

  const unsubscribe = async (flowerId: number) => {
    try {
      await api.subscriptions.unsubscribe(flowerId)
      subscriptions.value = subscriptions.value.filter(s => s.flower_id !== flowerId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消订阅失败'
      throw err
    }
  }

  const toggle = async (flowerId: number, species: string, coverImage = '') => {
    if (isSubscribed(flowerId)) {
      await unsubscribe(flowerId)
    } else {
      await subscribe(flowerId, species, coverImage)
    }
  }

  return {
    subscriptions,
    loaded,
    error,
    isSubscribed,
    subscribedFlowerIds,
    loadSubscriptions,
    subscribe,
    unsubscribe,
    toggle,
  }
})
