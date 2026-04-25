<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { checkAuth } from '@/utils/auth-guard'

onLaunch(() => {
  const authStore = useAuthStore()
  authStore.loadUser()
  checkAuth()
})
</script>

<style>
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
</style>
