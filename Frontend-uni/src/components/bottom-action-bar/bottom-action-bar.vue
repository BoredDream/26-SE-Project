<template>
  <view class="bab">
    <view class="bab__row">
      <view
        v-for="(tab, i) in leftTabs"
        :key="tab.key"
        class="bab__tab"
        hover-class="bab__tab--hover"
        @click="goTab(tab)"
      >
        <image class="bab__icon" :src="current === tab.key ? tab.activeIcon : tab.icon" />
        <text class="bab__label" :class="{ 'bab__label--active': current === tab.key }">{{ tab.text }}</text>
      </view>

      <view class="bab__publish-wrap" @click="goPublish">
        <view class="bab__publish" hover-class="bab__publish--hover">
          <view class="bab__plus">
            <view class="bab__plus-h"></view>
            <view class="bab__plus-v"></view>
          </view>
        </view>
        <text class="bab__publish-label">发布</text>
      </view>

      <view
        v-for="tab in rightTabs"
        :key="tab.key"
        class="bab__tab"
        hover-class="bab__tab--hover"
        @click="goTab(tab)"
      >
        <image class="bab__icon" :src="current === tab.key ? tab.activeIcon : tab.icon" />
        <text class="bab__label" :class="{ 'bab__label--active': current === tab.key }">{{ tab.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface TabItem {
  key: 'home' | 'map' | 'garden' | 'profile'
  text: string
  url: string
  icon: string
  activeIcon: string
}

defineProps<{ current: 'home' | 'map' | 'garden' | 'profile' }>()

const leftTabs: TabItem[] = [
  {
    key: 'home',
    text: '主页',
    url: '/pages/home/home',
    icon: '/static/icon/home.png',
    activeIcon: '/static/icon/home-active.png',
  },
  {
    key: 'map',
    text: '地图',
    url: '/pages/map/map',
    icon: '/static/icon/map.png',
    activeIcon: '/static/icon/map-active.png',
  },
]

const rightTabs: TabItem[] = [
  {
    key: 'garden',
    text: '花园',
    url: '/pages/garden/garden',
    icon: '/static/icon/garden.png',
    activeIcon: '/static/icon/garden-active.png',
  },
  {
    key: 'profile',
    text: '我的',
    url: '/pages/profile/profile',
    icon: '/static/icon/profile.png',
    activeIcon: '/static/icon/profile-active.png',
  },
]

const goTab = (tab: TabItem) => {
  uni.reLaunch({ url: tab.url })
}

const goPublish = () => {
  uni.navigateTo({ url: '/pages/checkin/checkin' })
}
</script>

<style scoped lang="scss">
.bab {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: env(safe-area-inset-bottom);
}
.bab__row {
  display: flex;
  align-items: flex-end;
  height: 60px;
}
.bab__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2px;
}
.bab__tab--hover { opacity: 0.7; }
.bab__icon {
  width: 24px;
  height: 24px;
}
.bab__label {
  font-size: 11px;
  color: #43483f;
  line-height: 1;
}
.bab__label--active { color: #4caf50; }

/* 中间发布槽 */
.bab__publish-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
}
.bab__publish {
  position: absolute;
  top: -18px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.bab__publish--hover {
  opacity: 0.9;
  transform: scale(0.95);
}
.bab__plus {
  position: relative;
  width: 24px;
  height: 24px;
}
.bab__plus-h,
.bab__plus-v {
  position: absolute;
  background: #ffffff;
  border-radius: 2px;
}
.bab__plus-h {
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  transform: translateY(-50%);
}
.bab__plus-v {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  transform: translateX(-50%);
}
.bab__publish-label {
  font-size: 11px;
  color: #4caf50;
  margin-bottom: 6px;
  font-weight: 600;
}
</style>
