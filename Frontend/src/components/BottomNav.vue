<template>
  <div>
    <div class="bottom-nav" :class="{ hidden: showClockIn }">
      <div class="nav-item" @click="navigateTo('home')" :class="{ active: currentRoute === 'home' }">
        <img src="/src/icon/主页.svg" alt="主页" class="nav-icon"><br>主页
      </div>
      <div class="nav-item" @click="navigateTo('map')" :class="{ active: currentRoute === 'map' }">
        <img src="/src/icon/地图.svg" alt="地图" class="nav-icon"><br>地图
      </div>
      <div class="add-btn" @click="handleAdd"></div>
      <div class="nav-item" @click="navigateTo('garden')" :class="{ active: currentRoute === 'garden' }">
        <img src="/src/icon/花园.svg" alt="花园" class="nav-icon"><br>花园
      </div>
      <div class="nav-item" @click="navigateTo('profile')" :class="{ active: currentRoute === 'profile' }">
        <img src="/src/icon/我的.svg" alt="我的" class="nav-icon"><br>我的
      </div>
    </div>

    <div class="clockin-sheet" v-if="showClockIn">
      <div class="sheet-backdrop" @click="closeSheet"></div>
      <div class="sheet-panel" @click.stop>
        <div class="sheet-handle"></div>
        <div class="sheet-title">花园打卡</div>
        <p class="sheet-desc">请选择一种方式，记录花卉瞬间。</p>
        <div class="sheet-actions">
          <button class="sheet-action sheet-gallery" @click="openGallery">从相册选择</button>
          <button class="sheet-action sheet-camera" @click="openCamera">拍照上传</button>
        </div>
        <button class="sheet-cancel" @click="closeSheet">取消</button>
      </div>
    </div>

    <input ref="galleryInput" type="file" accept="image/*" style="display:none" @change="handleFile" />
    <input ref="cameraInput" type="file" accept="image/*" capture="environment" style="display:none" @change="handleFile" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const showClockIn = ref(false);
const galleryInput = ref<HTMLInputElement | null>(null);
const cameraInput = ref<HTMLInputElement | null>(null);

const currentRoute = computed(() => route.name?.toString().toLowerCase());

const navigateTo = (page: string) => {
  router.push(`/${page}`);
};

const handleAdd = () => {
  showClockIn.value = true;
};

const closeSheet = () => {
  showClockIn.value = false;
};

const openGallery = () => {
  galleryInput.value?.click();
};

const openCamera = () => {
  cameraInput.value?.click();
};

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }
  console.log('已选中文件：', file);
  closeSheet();
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0 !important;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  display: flex;
  transform: translateY(0) !important;
  transition: transform 0.15s ease;
  z-index: 1300;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.96);
}


.nav-item {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
  position: relative;
}

.nav-item:hover {
  color: #4CAF50;
}

.nav-item:hover .nav-icon {
  filter: none;
}

.nav-item:active {
  transform: none;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: -10px;
  filter: grayscale(100%) brightness(0.6);
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #4CAF50;
}

.nav-item.active .nav-icon {
  filter: none;
}

.add-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 10px;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid #4CAF50;
  top: -15px;
}

.add-btn::before,
.add-btn::after {
  content: '';
  position: absolute;
  background-color: #4CAF50;
  transition: all 0.3s ease;
}

.add-btn::before {
  width: 24px;
  height: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-btn::after {
  width: 4px;
  height: 24px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-btn:hover {
  background-color: #4CAF50;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
  top: -20px;
}

.add-btn:hover::before,
.add-btn:hover::after {
  background-color: white;
}

.add-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.bottom-nav.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(100%);
}

.clockin-sheet {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(3px);
}

.sheet-panel {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: linear-gradient(180deg, #fbfbfb 0%, #f7fff6 100%);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px 20px 30px;
  box-shadow: 0 -18px 40px rgba(77, 109, 57, 0.18);
  transform: translateY(100%);
  animation: sheetUp 320ms ease forwards;
}

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-handle {
  width: 42px;
  height: 5px;
  border-radius: 999px;
  background: rgba(76, 175, 80, 0.35);
  margin: 0 auto 18px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  color: #346531;
  text-align: center;
  margin-bottom: 10px;
}

.sheet-desc {
  color: #5d7a55;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 24px;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sheet-action {
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.sheet-gallery {
  background: #ffffff;
  color: #4a6a43;
  box-shadow: 0 8px 18px rgba(90, 140, 80, 0.12);
  border: 1px solid rgba(74, 106, 67, 0.14);
}

.sheet-camera {
  background: #e9f7ea;
  color: #39743f;
  box-shadow: 0 10px 22px rgba(71, 135, 79, 0.16);
}

.sheet-action:hover {
  transform: translateY(-1px);
}

.sheet-cancel {
  width: 100%;
  margin-top: 18px;
  border: none;
  background: transparent;
  color: #7a8b72;
  font-size: 15px;
}

.sheet-cancel:hover {
  color: #4c6f4a;
}

.sheet-panel::before,
.sheet-panel::after {
  content: '';
  position: absolute;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(108, 176, 92, 0.12);
  z-index: -1;
}

.sheet-panel::before {
  top: -34px;
  left: 18px;
}

.sheet-panel::after {
  top: -28px;
  right: 22px;
}

</style>