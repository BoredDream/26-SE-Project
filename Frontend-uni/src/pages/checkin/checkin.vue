<template>
  <view class="checkin-page">
    <view class="checkin-header">
      <button class="back-button" @click="goBack">返回</button>
    </view>

    <view class="checkin-body">
      <view class="card-box">
        <text class="input-label">内容输入</text>
        <textarea v-model="content" :maxlength="1000" placeholder="记录你的花卉观察、花园心情或打卡心得..." />
        <text class="text-info">已输入 {{ content.length }}/1000 字</text>
      </view>

      <view class="card-box">
        <text class="section-title">照片上传</text>
        <view class="image-grid">
          <view class="image-add" v-if="selectedImages.length < 9" @click="chooseImage">
            <view class="image-add-icon"></view>
            <text class="image-add-text">添加照片</text>
          </view>
          <view class="image-preview" v-for="(image, index) in selectedImages" :key="index">
            <image :src="image" mode="aspectFill" />
            <button class="image-remove" @click="removeImage(index)">删除</button>
          </view>
        </view>
      </view>

      <view class="card-box optional-box">
        <text class="section-title">可选信息</text>
        <view class="field-row">
          <text>选择花的种类</text>
          <picker mode="selector" :range="availableSpecies" :value="speciesIndex" @change="onSpeciesChange">
            <view class="picker">{{ selectedSpecies || '未选择' }}</view>
          </picker>
        </view>
        <view class="field-row">
          <text>选择花的状态</text>
          <view class="status-options">
            <button :class="{ active: selectedStatus === '含苞待放' }" @click="selectedStatus = '含苞待放'">含苞待放</button>
            <button :class="{ active: selectedStatus === '盛开' }" @click="selectedStatus = '盛开'">盛开</button>
            <button :class="{ active: selectedStatus === '凋零' }" @click="selectedStatus = '凋零'">凋零</button>
          </view>
        </view>
      </view>

      <view class="action-panel">
        <button class="submit-button" :disabled="!canUpload || isSubmitting" @click="submitCheckin">
          {{ isSubmitting ? '上传中...' : '上传打卡' }}
        </button>
        <text class="tip-text">图文均为空时无法上传，花的种类与状态为可选项。</text>
      </view>
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
const selectedSpecies = ref('')
const selectedStatus = ref('')
const selectedImages = ref<string[]>([])
const isSubmitting = ref(false)

const availableSpecies = computed(() => {
  const species = locationStore.locations.map(item => item.flower_species).filter(Boolean) as string[]
  return Array.from(new Set(species))
})

const speciesIndex = computed(() => {
  if (!selectedSpecies.value) return 0
  return availableSpecies.value.indexOf(selectedSpecies.value)
})

const canUpload = computed(() => content.value.trim().length > 0 || selectedImages.value.length > 0)

const goBack = () => {
  uni.navigateBack()
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - selectedImages.value.length,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedImages.value.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1)
}

const onSpeciesChange = (e: any) => {
  selectedSpecies.value = availableSpecies.value[e.detail.value] || ''
}

const uploadImages = async (): Promise<string[]> => {
  const urls: string[] = []
  for (const path of selectedImages.value) {
    try {
      const res = await api.upload(path)
      if (res.data?.url) urls.push(res.data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }
  return urls
}

const submitCheckin = async () => {
  if (!canUpload.value) return
  isSubmitting.value = true
  try {
    const imageUrls = await uploadImages()
    await checkinStore.createCheckin({
      location_id: 1,
      content: content.value.trim(),
      images: imageUrls,
      flower_species: selectedSpecies.value || undefined,
    })
    uni.switchTab({ url: '/pages/home/home' })
  } catch (error) {
    console.error('上传失败', error)
    uni.showToast({ title: '上传失败', icon: 'none' })
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

<style scoped>
.checkin-page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(180deg, #f4fbf3 0%, #e8f3e8 100%); }
.checkin-header { display: flex; align-items: center; gap: 8px; padding: 18px 20px 14px; background: white; border-bottom: 1px solid rgba(0,0,0,0.06); }
.back-button { border: none; background: none; color: #4caf50; font-size: 14px; }
.checkin-body { flex: 1; padding: 20px; }
.card-box { background: white; border-radius: 18px; padding: 20px; box-shadow: 0 14px 30px rgba(52,93,53,0.08); margin-bottom: 18px; }
.section-title { display: block; font-size: 16px; font-weight: 700; color: #2f5e31; margin-bottom: 14px; }
.input-label { display: block; margin-bottom: 10px; font-weight: 600; color: #3d633e; }
textarea { width: 100%; min-height: 140px; resize: vertical; border: 1px solid rgba(76,175,80,0.2); border-radius: 16px; padding: 14px; background: #f8fff5; color: #33422f; font-size: 14px; }
.text-info { display: block; text-align: right; color: #789172; margin-top: 10px; font-size: 12px; }
.image-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.image-add { border: 2px dashed #c6dbb3; border-radius: 18px; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #5f7a55; }
.image-add-icon { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #4caf50; display: flex; align-items: center; justify-content: center; position: relative; }
.image-add-icon::before, .image-add-icon::after { content: ''; position: absolute; background: #4caf50; }
.image-add-icon::before { width: 20px; height: 3px; }
.image-add-icon::after { height: 20px; width: 3px; }
.image-add-text { margin-top: 10px; font-size: 13px; }
.image-preview { position: relative; border-radius: 18px; overflow: hidden; min-height: 110px; background: #f2f8ef; }
.image-preview image { width: 100%; height: 100%; }
.image-remove { position: absolute; right: 8px; top: 8px; border: none; background: rgba(255,255,255,0.9); color: #5f7a55; padding: 4px 8px; border-radius: 999px; font-size: 12px; }
.optional-box .field-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.picker { width: 100%; border: 1px solid rgba(76,175,80,0.18); border-radius: 14px; padding: 12px; background: #f6fff5; color: #34482d; }
.status-options { display: flex; gap: 10px; flex-wrap: wrap; }
.status-options button { flex: 1; min-width: 90px; border: 1px solid #c7dfb4; border-radius: 14px; padding: 10px 12px; background: #f9fff8; color: #4b6f47; }
.status-options button.active { background: #d6f1ce; border-color: #91c777; }
.action-panel { padding: 0 20px 32px; }
.submit-button { width: 100%; border: none; border-radius: 18px; background: #4caf50; color: white; padding: 15px 0; font-size: 16px; font-weight: 700; }
.submit-button:disabled { background: #a7c5a1; }
.tip-text { display: block; margin-top: 12px; font-size: 13px; color: #6e7a60; }
</style>
