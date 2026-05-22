<template>
  <view class="nav">
    <md-app-bar :title="`导航 · ${targetName}`" show-back @back="goBack" />

    <!-- #ifdef H5 -->
    <view id="nav-map-container" class="nav__map"></view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <map
      id="nav-map-mp"
      class="nav__map"
      :latitude="targetLat"
      :longitude="targetLng"
      :scale="15"
      :markers="navMarkers"
      :polyline="polyline"
    ></map>
    <!-- #endif -->

    <md-card class="nav__info">
      <view class="nav__row">
        <view class="nav__metric">
          <text class="nav__metric-label">距离</text>
          <text class="nav__metric-value">{{ routeDistance || '—' }}</text>
        </view>
        <view class="nav__divider"></view>
        <view class="nav__metric">
          <text class="nav__metric-label">预计时间</text>
          <text class="nav__metric-value">{{ routeTime || '—' }}</text>
        </view>
      </view>
    </md-card>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const targetName = ref('目标位置')
const targetLng = ref(0)
const targetLat = ref(0)
const userLocation = ref<{ lng: number; lat: number } | null>(null)
const routeDistance = ref('')
const routeTime = ref('')
const navMarkers = ref<any[]>([])
const polyline = ref<any[]>([])

let mapInstance: any = null
let driving: any = null

const goBack = () => {
  uni.navigateBack()
}

onLoad((query: any) => {
  targetName.value = query?.name || '目标位置'
  targetLng.value = parseFloat(query?.lng) || 0
  targetLat.value = parseFloat(query?.lat) || 0
  if (query?.userLng && query?.userLat) {
    userLocation.value = { lng: parseFloat(query.userLng), lat: parseFloat(query.userLat) }
  }
})

onMounted(async () => {
  if (!targetLng.value || !targetLat.value) {
    uni.showToast({ title: '位置信息不完整', icon: 'none' })
    goBack()
    return
  }
  // #ifdef MP-WEIXIN
  navMarkers.value = [
    { id: 1, latitude: targetLat.value, longitude: targetLng.value, title: targetName.value },
  ]
  polyline.value = [
    {
      points: [
        { latitude: userLocation.value?.lat || 30.4714, longitude: userLocation.value?.lng || 114.3645 },
        { latitude: targetLat.value, longitude: targetLng.value },
      ],
      color: '#4CAF50',
      width: 4,
    },
  ]
  routeDistance.value = '直线距离'
  routeTime.value = '请步行前往'
  // #endif

  // #ifdef H5
  try {
    await initMap()
    if (!userLocation.value) await getCurrentPosition()
    await planRoute()
  } catch (error) {
    console.error('导航初始化失败：', error)
    uni.showToast({ title: '导航初始化失败', icon: 'none' })
  }
  // #endif
})

const initMap = async () => {
  const AMapLoader = (await import('@amap/amap-jsapi-loader')).default
  const AMap = await AMapLoader.load({
    key: 'f3ebc39f2c1ffa41660503eff25b13d1',
    version: '2.0',
    plugins: ['AMap.Driving'],
  })
  mapInstance = new AMap.Map('nav-map-container', { zoom: 15, center: [targetLng.value, targetLat.value] })
  driving = new AMap.Driving({ map: mapInstance, panel: false })
}

const getCurrentPosition = async () => {
  return new Promise<void>((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = { lng: position.coords.longitude, lat: position.coords.latitude }
          resolve()
        },
        () => {
          userLocation.value = { lng: 114.3645, lat: 30.4714 }
          resolve()
        },
      )
    } else {
      userLocation.value = { lng: 114.3645, lat: 30.4714 }
      resolve()
    }
  })
}

const planRoute = async () => {
  if (!userLocation.value || !driving) return
  const startLngLat = [userLocation.value.lng, userLocation.value.lat]
  const endLngLat = [targetLng.value, targetLat.value]
  driving.search(startLngLat, endLngLat, (status: string, result: any) => {
    if (status === 'complete') {
      const route = result.routes[0]
      if (route) {
        routeDistance.value = formatDistance(route.distance)
        routeTime.value = formatTime(route.time)
      }
    } else {
      uni.showToast({ title: '路径规划失败', icon: 'none' })
    }
  })
}

const formatDistance = (distance: number) => {
  if (distance < 1000) return `${Math.round(distance)} 米`
  return `${(distance / 1000).toFixed(1)} 公里`
}

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`
  return `${minutes} 分钟`
}
</script>

<style scoped lang="scss">
.nav {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $md-background;
}
.nav__map {
  flex: 1;
  width: 100%;
  min-height: 360px;
}
.nav__info {
  margin: $md-space-4;
}
.nav__row {
  display: flex;
  align-items: center;
}
.nav__metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav__metric-label {
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
.nav__metric-value {
  margin-top: $md-space-1;
  @include md-type('title-medium');
  color: $md-on-surface;
}
.nav__divider {
  width: 1px;
  height: 32px;
  background: $md-outline-variant;
}
</style>
