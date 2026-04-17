<template>
  <div id="app">
    <transition name="page-fade" mode="out-in">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </transition>
  </div>
</template>

<script setup lang="ts">
// App.vue 现在作为路由容器
</script>

<style>
#app {
  min-height: 100vh;
  background: #f7fbf6;
  color: #2c3e50;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
