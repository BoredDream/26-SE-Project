<template>
  <div class="navigation-page">
    <div class="nav-header">
      <button class="back-btn" @click="goBack">返回</button>
      <h2>导航到 {{ targetName }}</h2>
    </div>

    <div id="nav-map-container" class="nav-map-box"></div>

    <div class="nav-info">
      <div class="route-summary">
        <div class="summary-item">
          <span class="label">距离：</span>
          <span class="value">{{ routeDistance }}</span>
        </div>
        <div class="summary-item">
          <span class="label">预计时间：</span>
          <span class="value">{{ routeTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const targetName = ref('');
const targetLng = ref(0);
const targetLat = ref(0);
const userLocation = ref<{ lng: number; lat: number } | null>(null);
const routeDistance = ref('');
const routeTime = ref('');
let mapInstance: any = null;
let driving: any = null;

const goBack = () => {
  router.back();
};

onMounted(async () => {
  // 获取路由参数
  const query = route.query;
  targetName.value = query.name as string || '目标位置';
  targetLng.value = parseFloat(query.lng as string) || 0;
  targetLat.value = parseFloat(query.lat as string) || 0;

  // 获取用户位置（从Map页面传递过来）
  const userLng = query.userLng as string;
  const userLat = query.userLat as string;
  if (userLng && userLat) {
    userLocation.value = {
      lng: parseFloat(userLng),
      lat: parseFloat(userLat)
    };
  }

  if (!targetLng.value || !targetLat.value) {
    alert('位置信息不完整');
    goBack();
    return;
  }

  try {
    // 初始化地图
    await initMap();
    // 如果没有用户位置，获取当前位置
    if (!userLocation.value) {
      await getCurrentPosition();
    }
    // 规划路径
    await planRoute();
  } catch (error) {
    console.error('导航初始化失败：', error);
    alert('导航初始化失败，请重试');
  }
});

const initMap = async () => {
  const AMap = await (window as any).AMapLoader.load({
    key: "f3ebc39f2c1ffa41660503eff25b13d1",
    version: "2.0",
    plugins: ["AMap.Driving"],
  });

  mapInstance = new AMap.Map("nav-map-container", {
    zoom: 15,
    center: [targetLng.value, targetLat.value],
  });

  driving = new AMap.Driving({
    map: mapInstance,
    panel: false, // 不显示路线面板
  });
};

const getCurrentPosition = async () => {
  return new Promise<void>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          };
          resolve();
        },
        (error) => {
          console.error('获取当前位置失败：', error);
          // 使用默认位置或提示用户
          userLocation.value = { lng: 114.3645, lat: 30.4714 }; // 华中农业大学坐标
          resolve();
        }
      );
    } else {
      userLocation.value = { lng: 114.3645, lat: 30.4714 };
      resolve();
    }
  });
};

const planRoute = async () => {
  if (!userLocation.value || !driving) return;

  const startLngLat = [userLocation.value.lng, userLocation.value.lat];
  const endLngLat = [targetLng.value, targetLat.value];

  driving.search(startLngLat, endLngLat, (status: string, result: any) => {
    if (status === 'complete') {
      const route = result.routes[0];
      if (route) {
        routeDistance.value = formatDistance(route.distance);
        routeTime.value = formatTime(route.time);
      }
    } else {
      console.error('路径规划失败：', result);
      alert('路径规划失败，请检查网络连接');
    }
  });
};

const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)} 米`;
  }
  return `${(distance / 1000).toFixed(1)} 公里`;
};

const formatTime = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);

  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }
  return `${minutes} 分钟`;
};
</script>

<style scoped>
.navigation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #4CAF50;
  cursor: pointer;
  margin-right: 16px;
}

.nav-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.nav-map-box {
  flex: 1;
  width: 100%;
  min-height: 400px;
}

.nav-info {
  padding: 16px 20px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.route-summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>