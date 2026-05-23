<template>
  <view class="map-page">
    <md-app-bar title="花卉地图" />

    <view class="map-filter">
      <view class="search">
        <input
          class="search__input"
          type="text"
          v-model="searchQuery"
          placeholder="搜索花名"
          placeholder-class="search__ph"
          @input="onSearchInput"
        />
      </view>
      <scroll-view class="chips" scroll-x>
        <view class="chips__row">
          <md-chip label="全部" :selected="!selectedSpecies" @click="selectSpecies('')" />
          <md-chip
            v-for="species in filteredSpecies"
            :key="species"
            :label="species"
            :selected="selectedSpecies === species"
            @click="selectSpecies(species)"
          />
        </view>
      </scroll-view>
    </view>

    <!-- #ifdef H5 -->
    <view id="map-panel" class="map-panel"></view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <map
      id="map-mp"
      class="map-panel"
      :latitude="mapCenter.lat"
      :longitude="mapCenter.lng"
      :scale="15"
      :markers="mpMarkers"
      @markertap="onMarkerTap"
    ></map>
    <!-- #endif -->

    <bottom-action-bar current="map" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useLocationStore } from '@/stores/location'
import { createMapAdapter } from '@/services/platform/map'
import type { MapAdapter, Marker } from '@/services/platform/map'

const locationStore = useLocationStore()
const selectedSpecies = ref('')
const searchQuery = ref('')
const mapAdapter = ref<MapAdapter | null>(null)
const mapCenter = ref({ lat: 30.4714, lng: 114.3645 })

const filteredSpecies = computed(() => {
  const names = Array.from(
    new Set(locationStore.locations.map(item => item.flower_species)),
  ).filter(Boolean) as string[]
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
    list = list.filter(
      item =>
        (item.name || '').toLowerCase().includes(keyword) ||
        (item.flower_species || '').toLowerCase().includes(keyword),
    )
  }
  return list
})

const mpMarkers = computed(() =>
  filteredLocations.value.map(l => ({
    id: l.id,
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    title: l.name,
    width: 32,
    height: 32,
  })),
)

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
    uni.navigateTo({
      url: `/pages/navigation/navigation?name=${encodeURIComponent(loc.name)}&lng=${loc.longitude}&lat=${loc.latitude}`,
    })
  }
}

onLoad((query: any) => {
  if (query?.flower) {
    selectedSpecies.value = query.flower
  }
})

// tabbar 页面从其他页 switchTab 进入时，通过 storage 接收过滤参数
onShow(() => {
  const pending = uni.getStorageSync('pending_map_filter')
  if (pending) {
    selectedSpecies.value = pending
    uni.removeStorageSync('pending_map_filter')
    renderMarkers()
  }
})

onMounted(async () => {
  await locationStore.loadLocations()
  // #ifdef H5
  mapAdapter.value = createMapAdapter()
  await mapAdapter.value.init('map-panel', {
    center: [mapCenter.value.lng, mapCenter.value.lat],
    zoom: 15,
  })
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

<style scoped lang="scss">
.map-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $md-background;
}
.map-filter {
  background: $md-surface;
  padding: $md-space-3 $md-space-4;
  @include md-elevation(1);
  z-index: 2;
}
.search {
  display: flex;
  align-items: center;
  background: $md-surface-container;
  border-radius: $md-shape-full;
  padding: 0 $md-space-4;
  margin-bottom: $md-space-3;
}
.search__input {
  flex: 1;
  height: 42px;
  @include md-type('body-medium');
  color: $md-on-surface;
  background: transparent;
}
.search__ph {
  color: $md-on-surface-variant;
}
.chips {
  white-space: nowrap;
}
.chips__row {
  display: inline-flex;
  gap: $md-space-2;
  padding-bottom: $md-space-1;
}
.map-panel {
  flex: 1;
  min-height: 420px;
  width: 100%;
}
</style>
