import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')

  const loadUser = () => {
    // TODO: implement
  }

  return {
    user,
    token,
    loadUser,
  }
})
