<template>
  <div class="bottom-nav">
    <div class="nav-item" @click="navigateTo('home')" :class="{ active: currentRoute === 'home' }">
      <img src="/src/icon/主页.svg" alt="主页" class="nav-icon" />
      <span>主页</span>
    </div>
    <div class="nav-item" @click="navigateTo('map')" :class="{ active: currentRoute === 'map' }">
      <img src="/src/icon/地图.svg" alt="地图" class="nav-icon" />
      <span>地图</span>
    </div>

    <!-- 中间发布按钮 -->
    <div class="add-wrap">
      <button class="add-btn" @click="handleAdd" aria-label="发布打卡">
        <span class="add-icon">＋</span>
      </button>
    </div>

    <div class="nav-item" @click="navigateTo('garden')" :class="{ active: currentRoute === 'garden' }">
      <img src="/src/icon/花园.svg" alt="花园" class="nav-icon" />
      <span>花园</span>
    </div>
    <div class="nav-item" @click="navigateTo('profile')" :class="{ active: currentRoute === 'profile' }">
      <img src="/src/icon/我的.svg" alt="我的" class="nav-icon" />
      <span>我的</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => route.name?.toString().toLowerCase())

const navigateTo = (page: string) => {
  router.push(`/${page}`)
}

const handleAdd = () => {
  router.push('/checkin')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  background: rgba(255, 255, 255, 0.97);
  z-index: 1300;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.06);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 60px;
  color: #6d7f66;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-item span {
  margin-top: 3px;
}

.nav-item.active {
  color: #338a3f;
}

.nav-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 2px;
  filter: grayscale(100%) brightness(0.68);
  transition: filter 0.2s ease;
}

.nav-item.active .nav-icon {
  filter: none;
}

/* 中间按钮容器 */
.add-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 发布按钮：比左右图标稍大，轻微上浮 */
.add-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(145deg, #5cba60, #3a7d44);
  border: none;
  box-shadow: 0 4px 18px rgba(58, 125, 68, 0.38);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -10px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.add-btn:active {
  transform: translateY(-1px) scale(0.95);
  box-shadow: 0 2px 10px rgba(58, 125, 68, 0.3);
}

.add-icon {
  color: white;
  font-size: 1.6rem;
  line-height: 1;
  font-weight: 300;
  pointer-events: none;
  margin-top: -1px;
}
</style>
