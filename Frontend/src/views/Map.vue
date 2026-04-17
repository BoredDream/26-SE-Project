<template>
  <div class="page">
    <main class="page-main">
      <section class="map-panel" :class="{ searching: searchMode }">
        <div
          id="map-container"
          class="map-box"
          :class="{ fullscreen: isFullscreen }"
          @click="toggleFullscreen"
        ></div>

        <section class="search-wrapper" :class="{ active: searchMode }">
          <div class="search-bar">
            <div class="search-input">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="搜索附近花卉或地点"
                @focus="enterSearchMode"
                @input="onSearchInput"
                @keydown.enter.prevent="runSearch"
              />
              <button v-if="searchMode && searchQuery" class="clear-btn" @click="resetSearch">清除</button>
            </div>
            <button v-if="searchMode" class="cancel-btn" @click="closeSearch">取消</button>
          </div>
        </section>
      </section>

      <section class="search-panel" v-if="searchMode">
        <div class="result-block">
          <div class="result-header">地点联想</div>
          <div v-if="placeSuggestions.length" class="result-list">
            <div
              v-for="item in placeSuggestions"
              :key="item.id"
              class="result-item"
              @click="selectPlace(item)"
            >
              <div class="result-title">{{ item.name }}</div>
              <div class="result-meta">{{ item.address }} · {{ item.type }}</div>
            </div>
          </div>
          <div v-else class="result-empty">
            输入地点名称可查看高德联想结果。
          </div>
        </div>

        <FlowerSuggest :query="searchQuery" @select="handleFlowerSelect" />
      </section>

      <section class="recommend-wrapper" v-if="!searchMode">

        <div v-if="detailOpen && selectedPlace" class="detail-page">
          <div class="detail-box">
            <div class="detail-title">地点位置已标记</div>
            <div class="detail-info">{{ selectedPlace.name }} 已在地图中定位，当前位置距离该地点 {{ selectedDistance || '未知' }}。</div>
            <button class="detail-close" @click="closeDetail">收起详情</button>
          </div>
        </div>

        <div class="detail-sheet" v-if="detailOpen && selectedPlace" :style="{ height: sheetHeight + 'px' }">
          <div class="sheet-handle" @pointerdown="startSheetDrag"></div>
          <div class="sheet-content">
            <div class="sheet-title">地点详细介绍</div>
            <p class="sheet-text">{{ selectedPlace.address || '该地点暂无详细地址信息。' }}</p>
            <div class="sheet-meta">
              <span>类别：{{ selectedPlace.type || '未知' }}</span>
              <span>距离：{{ selectedDistance || '未知' }}</span>
            </div>
            <div class="sheet-subtitle">该地点附近花卉</div>
            <div v-if="nearbyFlowersAtSelectedPlace.length" class="nearby-flower-list">
              <div v-for="item in nearbyFlowersAtSelectedPlace" :key="item.id" class="flower-item">
                <div class="flower-name">{{ item.name }}</div>
                <div class="flower-meta">{{ item.flower_species }} · {{ item.distanceText }}</div>
              </div>
            </div>
            <div v-else class="flower-empty">暂无附近花卉记录，建议缩小搜索范围或换一个地点。</div>
          </div>
        </div>

        <div class="summary-group" v-if="!detailOpen">
          <div class="selected-summary" v-if="selectedPlace">
            <div class="summary-title">位置已定位</div>
            <div class="summary-text">
              {{ selectedPlace.name }} 已显示，距离您 {{ selectedDistance || '未知' }}。
            </div>
          </div>

          <div class="selected-summary" v-else-if="selectedFlower">
            <div class="summary-title">花卉检索</div>
            <div class="summary-text">
              已为“{{ selectedFlower }}”匹配到 {{ flowerResults.length }} 个位置。
            </div>
          </div>
        </div>

        <div class="recommend-section">
          <div class="recommend-header">
            <h2>附近推荐</h2>
            <p>按距离排序，优先显示最近的花卉位置</p>
          </div>

          <div v-if="filteredNearby.length" class="recommend-list">
            <div
              v-for="item in filteredNearby"
              :key="item.id"
              class="recommend-item"
            >
              <div class="recommend-info">
                <div class="recommend-name">{{ item.name }}</div>
                <div class="recommend-meta">{{ item.flower_species }} · {{ item.distanceText }}</div>
              </div>
              <button class="navigate-btn" @click="gotoLocation(item)">查看</button>
            </div>
          </div>
          <div v-else class="recommend-empty">
            {{ searchQuery ? '未找到匹配结果，请调整关键词。' : '正在获取附近推荐，或当前位置不可用。' }}
          </div>
        </div>
      </section>
    </main>

    <BottomNav v-if="!searchMode" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BottomNav from '../components/BottomNav.vue';
import FlowerSuggest from '@/components/FlowerSuggest.vue';
import { useLocationStore } from '@/stores/location';

declare global {
  interface Window {
    _AMapSecurityConfig: any;
    AMapLoader: any;
  }
}

const locationStore = useLocationStore();
const router = useRouter();
const isFullscreen = ref(false);
const userLocation = ref<{ lng: number; lat: number } | null>(null);
const searchQuery = ref('');
const searchMode = ref(false);
const placeSuggestions = ref<any[]>([]);
const selectedPlace = ref<any | null>(null);
const selectedDistance = ref('');
const selectedFlower = ref('');
const detailOpen = ref(false);
const sheetHeight = ref(280);
const sheetDragStartY = ref<number | null>(null);
const sheetStartHeight = ref(280);
const placeSearch = ref<any | null>(null);
const searchTimer = ref<number | null>(null);

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  setTimeout(() => {
    if (window.mapInstance) {
      window.mapInstance.resize();
    }
  }, 300);
};

const enterSearchMode = () => {
  searchMode.value = true;
};

const closeSearch = () => {
  searchMode.value = false;
  placeSuggestions.value = [];
  if (searchTimer.value) {
    window.clearTimeout(searchTimer.value);
    searchTimer.value = null;
  }
};

const resetSearch = () => {
  searchQuery.value = '';
  placeSuggestions.value = [];
};

const runSearch = () => {
  const keyword = searchQuery.value.trim();
  if (keyword) {
    searchPlaces(keyword);
  }
};

const onSearchInput = () => {
  if (!searchMode.value) {
    return;
  }
  if (searchTimer.value) {
    window.clearTimeout(searchTimer.value);
  }
  searchTimer.value = window.setTimeout(() => {
    const keyword = searchQuery.value.trim();
    if (keyword) {
      searchPlaces(keyword);
    } else {
      placeSuggestions.value = [];
    }
  }, 260);
};

const searchPlaces = (keyword: string) => {
  if (!placeSearch.value) {
    return;
  }
  placeSearch.value.search(keyword, (status: string, result: any) => {
    if (status === 'complete' && result.poiList && result.poiList.pois) {
      placeSuggestions.value = result.poiList.pois.map((poi: any) => ({
        id: poi.id || poi.uid || poi.name,
        name: poi.name,
        address: poi.address || `${poi.district || ''}${poi.city || ''}`,
        type: poi.type || poi.typecode || '地点',
        location: poi.location,
        lng: poi.location ? poi.location.lng : null,
        lat: poi.location ? poi.location.lat : null
      }));
    } else {
      placeSuggestions.value = [];
    }
  });
};

const updateSelectedDistance = (lng: number, lat: number) => {
  const userLoc = userLocation.value;
  if (!userLoc) {
    selectedDistance.value = '';
    return;
  }

  const AMapWindow = window.AMap as any;
  if (AMapWindow?.Distance) {
    try {
      const distanceService = new AMapWindow.Distance();
      distanceService.getDistance(
        [[userLoc.lng, userLoc.lat], [lng, lat]],
        (status: string, result: any) => {
          if (status === 'complete' && result?.distance != null) {
            selectedDistance.value = formatDistance(result.distance);
          } else {
            selectedDistance.value = formatDistance(calculateDistance(userLoc.lat, userLoc.lng, lat, lng));
          }
        }
      );
    } catch (err) {
      selectedDistance.value = formatDistance(calculateDistance(userLoc.lat, userLoc.lng, lat, lng));
    }
  } else {
    selectedDistance.value = formatDistance(calculateDistance(userLoc.lat, userLoc.lng, lat, lng));
  }
};

const openDetail = () => {
  detailOpen.value = true;
  sheetHeight.value = 280;
};

const closeDetail = () => {
  detailOpen.value = false;
};

const startSheetDrag = (event: PointerEvent) => {
  sheetDragStartY.value = event.clientY;
  sheetStartHeight.value = sheetHeight.value;
  window.addEventListener('pointermove', onSheetDrag);
  window.addEventListener('pointerup', endSheetDrag);
};

const onSheetDrag = (event: PointerEvent) => {
  if (sheetDragStartY.value === null) return;
  const delta = sheetDragStartY.value - event.clientY;
  const nextHeight = sheetStartHeight.value + delta;
  sheetHeight.value = Math.min(Math.max(nextHeight, 220), 520);
};

const endSheetDrag = () => {
  sheetDragStartY.value = null;
  window.removeEventListener('pointermove', onSheetDrag);
  window.removeEventListener('pointerup', endSheetDrag);
};

const selectPlace = (poi: any) => {
  if (poi.lng !== null && poi.lat !== null) {
    const query: any = {
      lng: poi.lng.toString(),
      lat: poi.lat.toString(),
      name: poi.name
    };

    // 如果有当前位置，也传递过去
    if (userLocation.value) {
      query.userLng = userLocation.value.lng.toString();
      query.userLat = userLocation.value.lat.toString();
    }

    // 跳转到导航页面
    router.push({
      path: '/navigation',
      query
    });
  } else {
    alert('该地点位置信息不完整');
  }
};

const handleFlowerSelect = (flower: string) => {
  selectedFlower.value = flower;
  selectedPlace.value = null;
  closeSearch();
  const match = locationStore.locations.find(location =>
    location.flower_species?.includes(flower) || location.name?.includes(flower)
  );
  if (match && window.mapInstance) {
    const lng = toNumber(match.longitude);
    const lat = toNumber(match.latitude);
    window.mapInstance.setCenter([lng, lat]);
    window.mapInstance.setZoom(15);
  }
};

const flowerResults = computed(() => {
  if (!selectedFlower.value) {
    return [];
  }
  return locationStore.locations.filter(location =>
    location.flower_species?.includes(selectedFlower.value) || location.name?.includes(selectedFlower.value)
  );
});

const nearbyFlowersAtSelectedPlace = computed(() => {
  if (!selectedPlace.value || !locationStore.locations.length) {
    return [];
  }

  const placeLng = selectedPlace.value.lng || (selectedPlace.value.location ? selectedPlace.value.location.lng : null);
  const placeLat = selectedPlace.value.lat || (selectedPlace.value.location ? selectedPlace.value.location.lat : null);

  if (!placeLng || !placeLat) {
    return [];
  }

  return locationStore.locations
    .map(location => {
      const lat = toNumber(location.latitude);
      const lng = toNumber(location.longitude);
      const distance = calculateDistance(placeLat, placeLng, lat, lng);
      return {
        ...location,
        distance,
        distanceText: formatDistance(distance)
      };
    })
    .filter(item => !Number.isNaN(item.distance) && item.distance > 0 && item.distance <= 2000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
});

const toNumber = (value: string | number) => {
  return typeof value === 'string' ? parseFloat(value) : value;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const R = 6371000; // 地球半径，单位米
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)} 米`;
  }
  return `${(distance / 1000).toFixed(1)} 公里`;
};

const nearbyFlowers = computed(() => {
  if (!userLocation.value || !locationStore.locations.length) {
    return [];
  }

  return locationStore.locations
    .map(location => {
      const lat = toNumber(location.latitude);
      const lng = toNumber(location.longitude);
      const distance = calculateDistance(userLocation.value!.lat, userLocation.value!.lng, lat, lng);
      return {
        ...location,
        distance,
        distanceText: formatDistance(distance)
      };
    })
    .filter(item => !Number.isNaN(item.distance))
    .sort((a, b) => a.distance - b.distance);
});

const filteredNearby = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  if (!keyword) {
    return nearbyFlowers.value.slice(0, 4);
  }
  return nearbyFlowers.value
    .filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.flower_species.toLowerCase().includes(keyword)
    )
    .slice(0, 4);
});

const gotoLocation = (item: any) => {
  if (!window.mapInstance) return;
  window.mapInstance.setCenter([toNumber(item.longitude), toNumber(item.latitude)]);
  window.mapInstance.setZoom(16);
};

onMounted(async () => {
  try {
    await locationStore.loadLocations();
    // 设置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: "88db9ece8a521ba1ffa86dddd4ada35e", // 请替换为您的实际安全密钥
    };

    const AMap = await window.AMapLoader.load({
      key: "f3ebc39f2c1ffa41660503eff25b13d1", // 请替换为您的实际高德地图API Key
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.Geolocation", "AMap.Marker", "AMap.PlaceSearch", "AMap.Distance"], // 添加比例尺、定位、标记、地点搜索、距离插件
      AMapUI: {
        version: "1.1",
        plugins: ["overlay/SimpleMarker"],
      },
      Loca: {
        version: "2.0",
      },
    });

    const map = new AMap.Map("map-container", {
      zoom: 15,
      center: [114.3645, 30.4714], // 华中农业大学坐标
    });

    // 保存地图实例到全局
    window.mapInstance = map;

    // 将后端地点数据渲染为地图标记
    const locationMarkers = locationStore.locations
      .map(location => {
        const lng = toNumber(location.longitude)
        const lat = toNumber(location.latitude)
        if (Number.isNaN(lng) || Number.isNaN(lat)) {
          return null
        }

        return new AMap.Marker({
          position: [lng, lat],
          title: location.name,
        })
      })
      .filter((marker): marker is any => marker !== null)

    if (locationMarkers.length) {
      map.add(locationMarkers)
      map.setFitView(locationMarkers)
    }

    placeSearch.value = new AMap.PlaceSearch({
      pageSize: 6,
      pageIndex: 1,
      city: '全国',
    });

    map.addControl(new AMap.Scale());

    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      buttonPosition: 'RB',
      buttonOffset: new AMap.Pixel(10, 20),
      zoomToAccuracy: true,
    });

    map.addControl(geolocation);

    geolocation.getCurrentPosition((status: string, result: any) => {
      if (status === 'complete') {
        console.log('定位成功：', result);
        userLocation.value = {
          lng: result.position.lng,
          lat: result.position.lat,
        };

        // 添加当前位置标记
        const marker = new AMap.Marker({
          position: [result.position.lng, result.position.lat],
          title: '当前位置'
        });
        map.add(marker);
        map.setCenter([result.position.lng, result.position.lat]);
      } else {
        console.error('定位失败：', result);
        alert('定位失败，请检查GPS权限');
      }
    });

  } catch (error) {
    console.error('地图加载失败：', error);
    alert('地图加载失败，请检查网络连接或API配置');
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(76, 175, 80, 0.16), transparent 24%),
              linear-gradient(180deg, #eef7f2 0%, #f9fbfb 100%);
  padding-bottom: 74px;
}

.page-header {
  padding: 18px 20px 12px;
  background: linear-gradient(180deg, #f7fff6 0%, #edf6ee 100%);
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.search-input {
  flex: 1;
  position: relative;
  min-width: 0;
  max-width: 100%;
  transition: max-width 0.22s ease;
}

.search-wrapper:not(.active) .search-input {
  max-width: 100%;
}


.map-search-area.active .search-note {
  display: none;
}

.search-input input {
  width: 89%;
  height: 55px;
  padding: 0 16px;
  border-radius: 24px;
  border: 1px solid rgba(122, 173, 98, 0.28);
  background: #ffffff;
  color: #2e4230;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.search-input input:focus {
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 0 0 0 6px rgba(143, 205, 129, 0.14);
}

.clear-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #6f826f;
  font-size: 0.88rem;
  cursor: pointer;
}

.cancel-btn {
  border: none;
  padding: 0 16px;
  height: 48px;
  border-radius: 24px;
  background: #f1f7ed;
  color: #4a6a42;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.search-note {
  margin-top: 12px;
  color: #6d7c66;
  font-size: 0.9rem;
  line-height: 1.6;
}

.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 70px; /* 预留底部导航高度，避免遮挡 */
}

.result-block {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(155, 189, 131, 0.22);
  padding: 18px;
  box-shadow: 0 16px 30px rgba(104, 155, 89, 0.08);
}

.result-header {
  font-size: 1rem;
  font-weight: 700;
  color: #3b5c3b;
  margin-bottom: 14px;
}

.result-list {
  display: grid;
  gap: 12px;
}

.result-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f6fff4;
  border: 1px solid rgba(138, 177, 106, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.result-item:hover {
  transform: translateY(-1px);
  background: #ecf9e9;
}

.result-title {
  font-weight: 600;
  color: #2f502f;
  margin-bottom: 6px;
}

.result-meta {
  color: #6a7c69;
  font-size: 0.92rem;
}

.result-empty {
  color: #7a8b72;
  font-size: 0.95rem;
  padding: 14px 0;
}

.map-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  overflow: hidden;
  max-height: calc(100vh - 60px);
  transition: height 0.24s ease;
}

.map-panel.searching {
  height: 0;
  max-height: 0;
  min-height: 0;
  overflow: hidden;
}

.map-box {
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  border-radius: 24px;
  transition: all 0.24s ease;
}

.map-panel.searching .map-box {
  height: 0;
  opacity: 0;
  pointer-events: none;
  border-radius: 16px;
  box-shadow: none;
}
.search-wrapper {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 12px);
  z-index: 30;
  position: relative;
  margin: 12px auto;
  z-index: 30;
  transition: transform 0.25s ease, top 0.25s ease;
}

.search-wrapper .search-bar {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}


.search-panel {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 60px;
  z-index: 29;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  overflow-y: auto;
}


.search-wrapper .search-bar {
  max-width: 920px;
  margin: 0 auto;
}

.search-wrapper.active {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100vw - 55px);
  max-width: 550px;
  padding: 8px 10px;
  background: rgba(247, 255, 246, 0.98);
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(110, 106, 125, 0.16);
  z-index: 1000;
  height: 56px;
}

.search-wrapper.active .search-bar {
  height: 44px;
}

.search-wrapper.active .search-input input {
  height: 44px;
  line-height: 44px;
}

.search-wrapper.active .search-bar {
  max-width: 100%;
  margin: 0;
}

.search-wrapper.active .search-bar {
  align-items: center;
}

.search-wrapper.active .search-bar .cancel-btn {
  opacity: 1;
  transform: translateX(0);
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.search-panel {
  position: fixed;
  top: 86px;
  left: 0;
  right: 0;
  bottom: 60px;
  z-index: 25;
  background: rgba(247, 252, 246, 0.95);
  border-radius: 24px 24px 0 0;
  padding: 12px 16px 16px;
  overflow-y: auto;
  box-shadow: 0 18px 35px rgba(80, 110, 70, 0.14);
}

.search-panel .result-block,
.search-panel .recommend-section {
  margin-top: 2px;
}

.recommend-wrapper {
  margin: 2px 12px 16px;
}

.recommend-wrapper .recommend-section {
  margin-top: 12px;
}

.map-box {
  width: 100%;
  min-height: calc(100vh - 260px);
  max-height: calc(100vh - 180px);
  height: calc(100vh - 220px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(110, 106, 125, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.map-box.fullscreen {
  position: fixed;
  inset: 0 0 70px;
  height: auto;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.detail-page {
  margin-top: 18px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  border: 1px solid rgba(147, 191, 110, 0.22);
  box-shadow: 0 16px 30px rgba(99, 154, 88, 0.08);
}

.detail-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-title {
  font-size: 1rem;
  font-weight: 700;
  color: #30522f;
}

.detail-info {
  color: #566d55;
  line-height: 1.7;
}

.detail-close {
  align-self: flex-start;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #f4f9f0;
  color: #4a6a43;
  cursor: pointer;
}

.detail-sheet {
  position: relative;
  width: 100%;
  margin-top: 18px;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  box-shadow: 0 -16px 32px rgba(95, 141, 84, 0.18);
}

.sheet-handle {
  width: 48px;
  height: 6px;
  border-radius: 999px;
  background: rgba(112, 154, 96, 0.35);
  margin: 12px auto;
  cursor: grab;
}

.sheet-content {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sheet-title {
  font-size: 1rem;
  font-weight: 700;
  color: #335534;
}

.sheet-text {
  color: #5d725d;
  line-height: 1.75;
}

.sheet-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: #6c7d6c;
  font-size: 0.95rem;
}

.sheet-subtitle {
  font-weight: 700;
  color: #3a583a;
}

.nearby-flower-list {
  display: grid;
  gap: 10px;
}

.flower-item {
  padding: 12px 14px;
  border-radius: 18px;
  background: #f6fbf5;
  border: 1px solid rgba(147, 185, 108, 0.18);
}

.flower-name {
  font-weight: 600;
  color: #2f5231;
}

.flower-meta {
  color: #69776a;
  font-size: 0.9rem;
  margin-top: 4px;
}

.flower-empty {
  color: #7a8b72;
  font-size: 0.95rem;
}

.selected-summary {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(143, 198, 111, 0.2);
}

.summary-title {
  font-weight: 700;
  color: #3c5b3c;
  margin-bottom: 8px;
}

.summary-text {
  color: #5f725f;
  line-height: 1.75;
}

.recommend-section {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 24px;
  border: 1px solid rgba(200, 206, 184, 0.24);
  padding: 18px;
  box-shadow: 0 16px 34px rgba(96, 92, 104, 0.06);
}

.recommend-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #2f4c2f;
}

.recommend-header p {
  margin: 8px 0 0;
  color: #6b7b69;
  font-size: 0.94rem;
}

.recommend-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.recommend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 20px;
  background: #f6faf4;
  border: 1px solid rgba(172, 189, 147, 0.24);
}

.recommend-item:hover {
  background: #eef7ec;
}

.recommend-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recommend-name {
  font-weight: 600;
  color: #2e4a2e;
}

.recommend-meta {
  color: #6c7d6b;
  font-size: 0.9rem;
}

.navigate-btn {
  border: none;
  background: #4caf50;
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.25s ease;
}

.navigate-btn:hover {
  background: #429247;
}

.recommend-empty {
  color: #7a8b72;
  font-size: 0.95rem;
  padding: 16px 0;
}

</style>