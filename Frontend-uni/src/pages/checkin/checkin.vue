<template>
  <view class="checkin">
    <md-app-bar title="发布打卡" show-back @back="goBack" />

    <view class="checkin__body">
      <md-card class="checkin__card">
        <text class="checkin__label">打卡内容</text>
        <md-text-field
          v-model="content"
          type="textarea"
          :maxlength="1000"
          show-count
          placeholder="记录你的花卉观察、花园心情或打卡心得..."
        />
      </md-card>

      <md-card class="checkin__card">
        <text class="checkin__label">照片</text>
        <view class="image-grid">
          <view v-for="(image, index) in selectedImages" :key="index" class="image-grid__item">
            <image :src="image" mode="aspectFill" />
            <view class="image-grid__remove" @click="removeImage(index)">
              <text>✕</text>
            </view>
          </view>
          <view
            v-if="selectedImages.length < 9"
            class="image-grid__add"
            hover-class="image-grid__add--hover"
            @click="chooseImage"
          >
            <text class="image-grid__add-icon">＋</text>
            <text class="image-grid__add-text">添加照片</text>
          </view>
        </view>
      </md-card>

      <md-card class="checkin__card">
        <text class="checkin__label">打卡信息</text>
        <view class="field">
          <text class="field__name">打卡地点</text>
          <picker
            mode="selector"
            :range="locationNames"
            :value="locationIndex < 0 ? 0 : locationIndex"
            @change="onLocationChange"
          >
            <view class="field__value" :class="{ 'field__value--placeholder': !selectedLocation }">
              {{ selectedLocation ? selectedLocation.name : '请选择打卡地点' }}
            </view>
          </picker>
        </view>
        <view class="field">
          <text class="field__name">花期状态（可选）</text>
          <view class="status-chips">
            <md-chip
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :selected="selectedStatus === s.value"
              @click="toggleStatus(s.value)"
            />
          </view>
        </view>
      </md-card>

      <md-button block :disabled="!canSubmit || isSubmitting" @click="submitCheckin">
        {{ isSubmitting ? '上传中...' : '发布打卡' }}
      </md-button>
      <text class="checkin__tip">图文至少填写其一，并选择打卡地点。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'
import { api } from '@/services/api'

const locationStore = useLocationStore()
const checkinStore = useCheckinStore()

const content = ref('')
const selectedImages = ref<string[]>([])
const locationIndex = ref(-1)
const selectedStatus = ref('')
const isSubmitting = ref(false)

const statusOptions = [
  { label: '含苞待放', value: 'budding' },
  { label: '盛开', value: 'blooming' },
  { label: '凋零', value: 'withering' },
]

const locationNames = computed(() => locationStore.locations.map(l => l.name))
const selectedLocation = computed(() => locationStore.locations[locationIndex.value])
const canSubmit = computed(
  () =>
    (content.value.trim().length > 0 || selectedImages.value.length > 0) &&
    !!selectedLocation.value,
)

const goBack = () => uni.navigateBack()

const onLocationChange = (e: any) => {
  locationIndex.value = Number(e.detail.value)
}

const toggleStatus = (value: string) => {
  selectedStatus.value = selectedStatus.value === value ? '' : value
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - selectedImages.value.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedImages.value.push(...res.tempFilePaths)
    },
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const uploadImages = async (): Promise<string[]> => {
  const urls: string[] = []
  for (const path of selectedImages.value) {
    const res = await api.upload(path)
    if (!res.data?.url) throw new Error('上传未返回图片地址')
    urls.push(res.data.url)
  }
  return urls
}

const submitCheckin = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  const location = selectedLocation.value
  if (!location) {
    uni.showToast({ title: '请选择打卡地点', icon: 'none' })
    return
  }
  isSubmitting.value = true
  try {
    let imageUrls: string[] = []
    if (selectedImages.value.length > 0) {
      try {
        imageUrls = await uploadImages()
      } catch (err) {
        console.error('图片上传失败', err)
        uni.showToast({ title: '图片上传失败，请重试', icon: 'none' })
        return
      }
    }
    await checkinStore.createCheckin({
      location_id: location.id,
      content: content.value.trim(),
      images: imageUrls,
      bloom_report: selectedStatus.value || undefined,
    })
    uni.reLaunch({ url: '/pages/home/home' })
  } catch (error) {
    console.error('发布失败', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!locationStore.locations.length) {
    await locationStore.loadLocations()
  }
})
</script>

<style scoped lang="scss">
.checkin {
  min-height: 100vh;
  background: $md-background;
}
.checkin__body {
  padding: $md-space-4;
}
.checkin__card {
  margin-bottom: $md-space-4;
}
.checkin__label {
  display: block;
  @include md-type('title-small');
  color: $md-on-surface;
  margin-bottom: $md-space-3;
}

/* 图片网格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $md-space-2;
}
.image-grid__item,
.image-grid__add {
  position: relative;
  height: 104px;
  border-radius: $md-shape-md;
  overflow: hidden;
}
.image-grid__item image {
  width: 100%;
  height: 100%;
}
.image-grid__remove {
  position: absolute;
  top: $md-space-1;
  right: $md-space-1;
  width: 24px;
  height: 24px;
  border-radius: $md-shape-full;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.image-grid__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $md-surface-container;
  border: 1px dashed $md-outline-variant;
  color: $md-on-surface-variant;
}
.image-grid__add--hover {
  opacity: 0.7;
}
.image-grid__add-icon {
  font-size: 26px;
  color: $md-primary;
}
.image-grid__add-text {
  margin-top: $md-space-1;
  @include md-type('body-small');
}

/* 字段 */
.field {
  margin-bottom: $md-space-4;
}
.field:last-child {
  margin-bottom: 0;
}
.field__name {
  display: block;
  margin-bottom: $md-space-2;
  @include md-type('label-medium');
  color: $md-on-surface-variant;
}
.field__value {
  background: $md-surface-container;
  border-radius: $md-shape-sm;
  padding: $md-space-3 $md-space-4;
  @include md-type('body-large');
  color: $md-on-surface;
}
.field__value--placeholder {
  color: $md-on-surface-variant;
}
.status-chips {
  display: flex;
  gap: $md-space-2;
  flex-wrap: wrap;
}
.checkin__tip {
  display: block;
  margin-top: $md-space-3;
  text-align: center;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
</style>
