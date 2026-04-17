<template>
  <div class="map-page">
    <main class="map-container">
      <div class="filter-panel">
        <div class="search-row">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="输入花名搜索"
            @input="onSearchInput"
          />
        </div>
        <div class="flower-list">
          <button
            v-for="species in filteredSpecies"
            :key="species"
            :class="{ active: selectedSpecies === species }"
            @click="selectSpecies(species)"
          >
            {{ species }}
          </button>
        </div>
      </div>

      <div id="map-panel" class="map-panel"></div>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import { useLocationStore } from '@/stores/location'
import AMapLoader from '@amap/amap-jsapi-loader'

const router = useRouter()
const route = useRoute()
const locationStore = useLocationStore()
const selectedSpecies = ref('')
const searchQuery = ref('')
const mapInstance = ref<any>(null)
const AMapClass = ref<any>(null)
const markers: any[] = []
const userLocation = ref<{ lng: number; lat: number }>({ lng: 114.3645, lat: 30.4714 })

const filteredSpecies = computed(() => {
  const names = Array.from(new Set(locationStore.locations.map(item => item.flower_species))).filter(Boolean)
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

const selectedSpeciesFromQuery = computed(() => route.query.flower as string || '')

const loadMap = async () => {
  const AMap = await AMapLoader.load({
    key: 'f3ebc39f2c1ffa41660503eff25b13d1',
    version: '2.0',
    plugins: ['AMap.Geolocation']
  })

  AMapClass.value = AMap
  mapInstance.value = new AMap.Map('map-panel', {
    zoom: 15,
    center: [userLocation.value.lng, userLocation.value.lat],
  })

  new AMap.Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    convert: true,
  }).getCurrentPosition((status: string, result: any) => {
    if (status === 'complete') {
      userLocation.value = {
        lng: result.position.lng,
        lat: result.position.lat,
      }
      mapInstance.value.setCenter([result.position.lng, result.position.lat])
    }
  })

  renderMarkers()
}

const renderMarkers = () => {
  if (!mapInstance.value) return
  markers.forEach(marker => marker.setMap(null))
  markers.length = 0

  filteredLocations.value.forEach(location => {
    const marker = new AMapClass.value.Marker({
      position: [Number(location.longitude), Number(location.latitude)],
      title: location.name,
      map: mapInstance.value,
    })
    marker.on('click', () => {
      router.push({
        name: 'Navigation',
        query: {
          name: location.name,
          lng: String(location.longitude),
          lat: String(location.latitude),
          userLng: String(userLocation.value.lng),
          userLat: String(userLocation.value.lat),
        }
      })
    })
    markers.push(marker)
  })

  if (filteredLocations.value.length) {
    mapInstance.value.setFitView()
  }
}

const onSearchInput = () => {
  if (!searchQuery.value.trim()) {
    selectedSpecies.value = ''
  }
  renderMarkers()
}

const selectSpecies = (species: string) => {
  selectedSpecies.value = species
  renderMarkers()
}

const centerMarker = (location: any) => {
  if (!mapInstance.value) return
  const lng = Number(location.longitude)
  const lat = Number(location.latitude)
  mapInstance.value.setCenter([lng, lat])
  mapInstance.value.setZoom(17)
}

onMounted(async () => {
  await locationStore.loadLocations()
  if (selectedSpeciesFromQuery.value) {
    selectedSpecies.value = selectedSpeciesFromQuery.value
  }
  await loadMap()
})
</script>

<style scoped>
.map-page {
  min-height: 100vh;
  background: #eef7ec;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

.map-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.filter-panel {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 14px 16px 12px;
}

.search-row {
  margin-bottom: 12px;
}

.search-row input {
  width: 100%;
  border: 1px solid #d4e5cf;
  border-radius: 16px;
  padding: 12px 14px;
  background: #f7fcf6;
  color: #3f5e3f;
}

.flower-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flower-list button {
  border: 1px solid #c7dfb4;
  background: #f7fdf4;
  color: #4f7b50;
  border-radius: 18px;
  padding: 10px 14px;
  font-size: 0.9rem;
  cursor: pointer;
}

.flower-list button.active {
  background: #d7f2ce;
  border-color: #8cc36c;
  color: #356b34;
}

.map-panel {
  flex: 1;
  min-height: 0;
}


.sheet-name {
  margin-top: 6px;
  font-size: 1rem;
  color: #2d5530;
  font-weight: 700;
}

.sheet-meta {
  color: #5d715b;
  font-size: 0.9rem;
}

.flower-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.flower-list button {
  border: 1px solid #cfe2cf;
  background: #f7fbf7;
  border-radius: 18px;
  color: #3e6b44;
  padding: 10px 14px;
  cursor: pointer;
}

.flower-list button.active {
  background: #e1f1da;
  border-color: #93c27a;
}

.location-list {
  display: grid;
  gap: 14px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f7fdf7;
  border: 1px solid #e1eedc;
  cursor: pointer;
}

.location-name {
  font-weight: 600;
  color: #2d5530;
}

.location-species {
  color: #5d715b;
}

.empty-state {
  text-align: center;
  color: #75886c;
  padding: 22px 0;
}
</style>
