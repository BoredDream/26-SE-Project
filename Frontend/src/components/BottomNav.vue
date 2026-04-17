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
    <div class="add-btn" @click="handleAdd"></div>
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
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.96);
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

.add-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #4caf50;
  box-shadow: 0 8px 22px rgba(76, 175, 80, 0.22);
  position: relative;
  top: -15px;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.add-btn::before,
.add-btn::after {
  content: '';
  position: absolute;
  background-color: #4caf50;
}

.add-btn::before {
  width: 30px;
  height: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-btn::after {
  width: 4px;
  height: 30px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-btn:hover {
  transform: translateY(-3px);
  background-color: #f4fff4;
}
</style>