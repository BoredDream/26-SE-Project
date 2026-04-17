<template>
  <div class="checkin-page">
    <div class="checkin-header">
      <button class="back-button" @click="goBack">返回</button>
    </div>

    <main class="checkin-body">
      <section class="card-box">
        <label class="input-label">内容输入</label>
        <textarea
          v-model="content"
          :maxlength="1000"
          placeholder="记录你的花卉观察、花园心情或打卡心得..."
        />
        <div class="text-info">已输入 {{ content.length }}/1000 字</div>
      </section>

      <section class="card-box">
        <div class="section-title">照片上传</div>
        <div class="image-grid">
          <div
            class="image-add"
            v-if="selectedImages.length < 9"
            @click="triggerGallery"
          >
            <div class="image-add-icon"></div>
            <div class="image-add-text">添加照片</div>
          </div>
          <div
            class="image-preview"
            v-for="(image, index) in selectedImages"
            :key="index"
          >
            <img :src="image.preview" alt="上传图片" />
            <button class="image-remove" @click="removeImage(index)">删除</button>
          </div>
        </div>
        <div class="image-actions">
          <button class="action-button" @click="triggerGallery">从相册选择</button>
          <button class="action-button" @click="triggerCamera">调用相机拍照</button>
        </div>
      </section>

      <section class="card-box optional-box">
        <div class="section-title">可选信息</div>

        <div class="field-row">
          <label>选择花的种类</label>
          <select v-model="selectedSpecies">
            <option value="">未选择</option>
            <option v-for="species in availableSpecies" :key="species" :value="species">
              {{ species }}
            </option>
          </select>
        </div>

        <div class="field-row">
          <label>选择花的状态</label>
          <div class="status-options">
            <button
              type="button"
              :class="{ active: selectedStatus === '含苞待放' }"
              @click="selectedStatus = '含苞待放'"
            >含苞待放</button>
            <button
              type="button"
              :class="{ active: selectedStatus === '盛开' }"
              @click="selectedStatus = '盛开'"
            >盛开</button>
            <button
              type="button"
              :class="{ active: selectedStatus === '凋零' }"
              @click="selectedStatus = '凋零'"
            >凋零</button>
          </div>
        </div>
      </section>

      <section class="action-panel">
        <button
          class="submit-button"
          :disabled="!canUpload || isSubmitting"
          @click="submitCheckin"
        >
          {{ isSubmitting ? '上传中...' : '上传打卡' }}
        </button>
        <p class="tip-text">图文均为空时无法上传，花的种类与状态为可选项。</p>
      </section>
    </main>

    <input
      ref="galleryInput"
      type="file"
      accept="image/*"
      multiple
      style="display:none"
      @change="handleImageSelect"
    />
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      style="display:none"
      @change="handleImageSelect"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocationStore } from '@/stores/location'
import { useCheckinStore } from '@/stores/checkin'

export default defineComponent({
  setup() {
    const router = useRouter()
    const locationStore = useLocationStore()
    const checkinStore = useCheckinStore()
    const content = ref('')
    const selectedSpecies = ref('')
    const selectedStatus = ref('')
    const selectedImages = ref<Array<{ file: File; preview: string }>>([])
    const isSubmitting = ref(false)
    const galleryInput = ref<HTMLInputElement | null>(null)
    const cameraInput = ref<HTMLInputElement | null>(null)

    const availableSpecies = computed(() => {
      const species = locationStore.locations.map(item => item.flower_species)
      return Array.from(new Set(species)).filter(Boolean) as string[]
    })

    const canUpload = computed(() => {
      return content.value.trim().length > 0 || selectedImages.value.length > 0
    })

    const goBack = () => {
      router.back()
    }

    const triggerGallery = () => {
      galleryInput.value?.click()
    }

    const triggerCamera = () => {
      cameraInput.value?.click()
    }

    const handleImageSelect = (event: Event) => {
      const input = event.target as HTMLInputElement
      const files = input.files
      if (!files) return

      const nextImages: Array<{ file: File; preview: string }> = []
      for (let i = 0; i < files.length && selectedImages.value.length + nextImages.length < 9; i += 1) {
        const file = files[i]
        if (!file) continue
        const preview = URL.createObjectURL(file)
        nextImages.push({ file, preview })
      }

      selectedImages.value = [...selectedImages.value, ...nextImages]
      input.value = ''
    }

    const removeImage = (index: number) => {
      selectedImages.value.splice(index, 1)
    }

    const submitCheckin = async () => {
      if (!canUpload.value) return
      isSubmitting.value = true

      try {
        const images = selectedImages.value.map(item => item.preview)
        await checkinStore.createCheckin({
          location_id: 1,
          content: content.value.trim(),
          images,
          flower_species: selectedSpecies.value || undefined,
        })
        router.push('/home')
      } catch (error) {
        console.error('上传失败', error)
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(async () => {
      if (!locationStore.locations.length) {
        await locationStore.loadLocations()
      }
    })

    return {
      goBack,
      content,
      selectedSpecies,
      selectedStatus,
      selectedImages,
      isSubmitting,
      galleryInput,
      cameraInput,
      availableSpecies,
      canUpload,
      triggerGallery,
      triggerCamera,
      handleImageSelect,
      removeImage,
      submitCheckin,
    }
  }
})
</script>

<style scoped>
.checkin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f4fbf3 0%, #e8f3e8 100%);
}

.checkin-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 20px 14px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.back-button {
  border: none;
  background: none;
  color: #4caf50;
  font-size: 14px;
  cursor: pointer;
}

.checkin-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2b4d2f;
  font-weight: 700;
}

.checkin-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card-box {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 14px 30px rgba(52, 93, 53, 0.08);
  margin-bottom: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #2f5e31;
  margin-bottom: 14px;
}

.input-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #3d633e;
}

textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 16px;
  padding: 14px;
  background: #f8fff5;
  color: #33422f;
  font-size: 14px;
}

.text-info {
  text-align: right;
  color: #789172;
  margin-top: 10px;
  font-size: 12px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.image-add {
  border: 2px dashed #c6dbb3;
  border-radius: 18px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #5f7a55;
  cursor: pointer;
}

.image-add-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #4caf50;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-add-icon::before,
.image-add-icon::after {
  content: '';
  position: absolute;
  background: #4caf50;
}

.image-add-icon::before {
  width: 20px;
  height: 3px;
}

.image-add-icon::after {
  height: 20px;
  width: 3px;
}

.image-add-text {
  margin-top: 10px;
  font-size: 13px;
}

.image-preview {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  min-height: 110px;
  background: #f2f8ef;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  right: 8px;
  top: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #5f7a55;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}

.image-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-button {
  flex: 1;
  border: 1px solid #b7d7b0;
  border-radius: 14px;
  background: #f6fff4;
  color: #3d683a;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
}

.optional-box .field-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.optional-box select {
  width: 100%;
  border: 1px solid rgba(76, 175, 80, 0.18);
  border-radius: 14px;
  padding: 12px;
  background: #f6fff5;
  color: #34482d;
}

.status-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-options button {
  flex: 1;
  min-width: 90px;
  border: 1px solid #c7dfb4;
  border-radius: 14px;
  padding: 10px 12px;
  background: #f9fff8;
  color: #4b6f47;
  cursor: pointer;
}

.status-options button.active {
  background: #d6f1ce;
  border-color: #91c777;
}

.action-panel {
  padding: 0 20px 32px;
}

.submit-button {
  width: 100%;
  border: none;
  border-radius: 18px;
  background: #4caf50;
  color: white;
  padding: 15px 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.submit-button:disabled {
  background: #a7c5a1;
  cursor: not-allowed;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-2px);
}

.tip-text {
  margin-top: 12px;
  font-size: 13px;
  color: #6e7a60;
}
</style>
