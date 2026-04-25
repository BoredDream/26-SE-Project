<template>
  <view class="map-page">
    <view class="map-container">
      <view class="filter-panel">
        <view class="search-row">
          <input type="text" v-model="searchQuery" placeholder="输入花名搜索" @input="onSearchInput" />
        </view>
        <scroll-view class="flower-list" scroll-x>
          <view class="flower-chip-wrap">
            <button v-for="species in filteredSpecies" :key="species" :class="{ active: selectedSpecies === species }" @click="selectSpecies(species)">
              {{ species }}
            </button>
          </view>
        </scroll-view>
      </view>

      <!-- #ifdef H5 -->
      <view id="map-panel" class="map-panel"></view>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <map id="map-mp" class="map-panel" :latitude="mapCenter.lat" :longitude="mapCenter.lng" :scale="15" :markers="mpMarkers" @markertap="onMarkerTap"></map>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useLocationStore } from '@/stores/location'
import { createMapAdapter } from '@/services/platform/map'
import type { MapAdapter, Marker } from '@/services/platform/map'

const locationStore = useLocationStore()
const selectedSpecies = ref('')
const searchQuery = ref('')
const mapAdapter = ref<MapAdapter | null>(null)
const mapCenter = ref({ lat: 30.4714, lng: 114.3645 })

const filteredSpecies = computed(() => {
  const names = Array.from(new Set(locationStore.locations.map(item => item.flower_species))).filter(Boolean) as string[]
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return names
  return names.filter(name => name.toLowerCase().includes(keyword))
})

const filteredLocations = computed(() => {
  let list = [...locationStore.locations]
  if (selectedSpecies.value) {
    list = list.filter(item => item.flower_species === selectedSpecies.value)
  }
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => item.name.toLowerCase().includes(keyword) || item.flower_species.toLowerCase().includes(keyword))
  }
  return list
})

const mpMarkers = computed(() => {
  return filteredLocations.value.map(l => ({
    id: l.id,
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    title: l.name,
  }))
})

const renderMarkers = () => {
  if (mapAdapter.value) {
    const markers: Marker[] = filteredLocations.value.map(l => ({
      id: l.id,
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      title: l.name,
    }))
    mapAdapter.value.setMarkers(markers)
  }
}

const onSearchInput = () => {
  if (!searchQuery.value.trim()) selectedSpecies.value = ''
  renderMarkers()
}

const selectSpecies = (species: string) => {
  selectedSpecies.value = species
  renderMarkers()
}

const onMarkerTap = (e: any) => {
  const loc = locationStore.locations.find(l => l.id === e.detail.markerId)
  if (loc) {
    uni.navigateTo({ url: `/pages/navigation/navigation?name=${encodeURIComponent(loc.name)}&lng=${loc.longitude}&lat=${loc.latitude}` })
  }
}

onLoad((query: any) => {
  if (query?.flower) {
    selectedSpecies.value = query.flower
  }
})

onMounted(async () => {
  await locationStore.loadLocations()
  // #ifdef H5
  mapAdapter.value = createMapAdapter()
  await mapAdapter.value.init('map-panel', { center: [mapCenter.value.lng, mapCenter.value.lat], zoom: 15 })
  renderMarkers()
  // #endif
})

onUnmounted(() => {
  if (mapAdapter.value) {
    mapAdapter.value.destroy()
    mapAdapter.value = null
  }
})
</script>

<style scoped>
.map-page { min-height: 100vh; background: #eef7ec; display: flex; flex-direction: column; padding-bottom: 70px; }
.map-container { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.filter-panel { background: rgba(255, 255, 255, 0.92); border-bottom: 1px solid rgba(0, 0, 0, 0.08); padding: 14px 16px 12px; }
.search-row { margin-bottom: 12px; }
.search-row input { width: 100%; border: 1px solid #d4e5cf; border-radius: 16px; padding: 12px 14px; background: #f7fcf6; color: #3f5e3f; }
.flower-list { white-space: nowrap; }
.flower-chip-wrap { display: inline-flex; gap: 10px; }
.flower-chip-wrap button { border: 1px solid #c7dfb4; background: #f7fdf4; color: #4f7b50; border-radius: 18px; padding: 10px 14px; font-size: 0.9rem; }
.flower-chip-wrap button.active { background: #d7f2ce; border-color: #8cc36c; color: #356b34; }
.map-panel { flex: 1; min-height: 0; }
</style>
