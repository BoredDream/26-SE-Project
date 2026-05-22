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

<style lang="scss">
page {
  background-color: $md-background;
  color: $md-on-background;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

view,
button,
input,
textarea {
  box-sizing: border-box;
}
</style>
