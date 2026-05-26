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

    <!-- 外部搜索结果浮层（本地无结果时显示） -->
    <view v-if="externalResults.length || isSearchingExternal" class="ext-results">
      <view v-if="isSearchingExternal" class="ext-results__loading">
        <text class="ext-results__hint">正在搜索附近地点...</text>
      </view>
      <view v-else>
        <text class="ext-results__hint">附近地点（腾讯地图）</text>
        <view
          v-for="p in externalResults"
          :key="p.id"
          class="ext-results__item"
          hover-class="ext-results__item--hover"
          @click="onExternalTap(p)"
        >
          <text class="ext-results__title">{{ p.title }}</text>
          <text class="ext-results__addr">{{ p.address }}</text>
        </view>
      </view>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useLocationStore } from '@/stores/location'
import { createMapAdapter } from '@/services/platform/map'
import type { MapAdapter, Marker } from '@/services/platform/map'
import { searchPlaces, type TencentPlace } from '@/services/tencent-map-api'

const locationStore = useLocationStore()
const selectedSpecies = ref('')
const searchQuery = ref('')
const mapAdapter = ref<MapAdapter | null>(null)
const mapCenter = ref({ lat: 30.4714, lng: 114.3645 })
const externalResults = ref<TencentPlace[]>([])
const isSearchingExternal = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

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

const SPECIES_ICON: Record<string, string> = {
  '樱花': '/static/icon/marker-cherry.svg',
  '向日葵': '/static/icon/marker-sunflower.svg',
  '莲花': '/static/icon/marker-lotus.svg',
}
const getIconPath = (species?: string) =>
  (species && SPECIES_ICON[species]) || '/static/icon/marker-default.svg'

const mpMarkers = computed(() =>
  filteredLocations.value.map(l => ({
    id: l.id,
    latitude: Number(l.latitude),
    longitude: Number(l.longitude),
    title: l.name,
    iconPath: getIconPath(l.flower_species),
    width: 40,
    height: 48,
    anchor: { x: 0.5, y: 1 },
    callout: {
      content: l.name,
      color: '#3a5a40',
      fontSize: 12,
      borderRadius: 6,
      bgColor: '#faf8f5',
      padding: 5,
      display: 'BYCLICK',
    },
  })),
)

const renderMarkers = () => {
  if (mapAdapter.value) {
    const markers: Marker[] = filteredLocations.value.map(l => ({
      id: l.id,
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      title: l.name,
      species: l.flower_species,
    }))
    mapAdapter.value.setMarkers(markers)
  }
}

const onSearchInput = () => {
  const q = searchQuery.value.trim()
  if (!q) {
    selectedSpecies.value = ''
    externalResults.value = []
    if (searchTimer) clearTimeout(searchTimer)
  }
  renderMarkers()
  // 本地无结果时，防抖 600ms 后调腾讯地图搜索
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (!q || filteredLocations.value.length > 0) {
      externalResults.value = []
      return
    }
    isSearchingExternal.value = true
    externalResults.value = await searchPlaces(q).catch(() => [])
    isSearchingExternal.value = false
  }, 600)
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

const onExternalTap = (p: TencentPlace) => {
  externalResults.value = []
  searchQuery.value = ''
  uni.navigateTo({
    url: `/pages/navigation/navigation?name=${encodeURIComponent(p.title)}&lng=${p.lng}&lat=${p.lat}`,
  })
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

/* 外部搜索结果浮层 */
.ext-results {
  position: absolute;
  top: 120px; /* 搜索栏 + chips 高度 */
  left: $md-space-4;
  right: $md-space-4;
  z-index: 10;
  background: $md-surface;
  border-radius: $md-shape-md;
  border: 1px solid $md-outline-variant;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  max-height: 280px;
}
.ext-results__loading,
.ext-results__hint {
  display: block;
  padding: $md-space-2 $md-space-4;
  font-size: 11px;
  color: $md-on-surface-variant;
  background: $md-surface-container;
}
.ext-results__item {
  padding: $md-space-3 $md-space-4;
  border-top: 1px solid $md-outline-variant;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ext-results__item--hover {
  background: $md-surface-container;
}
.ext-results__title {
  font-size: 14px;
  font-weight: 600;
  color: $md-on-surface;
}
.ext-results__addr {
  font-size: 11px;
  color: $md-on-surface-variant;
}
</style>
