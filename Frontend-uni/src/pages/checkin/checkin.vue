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
                <view class="checkin__label-row">
                    <text class="checkin__label checkin__label--inline"
                        >照片</text
                    >
                    <text class="checkin__counter"
                        >{{ selectedImages.length }}/9</text
                    >
                </view>
                <view class="image-grid">
                    <view
                        v-for="(image, index) in selectedImages"
                        :key="index"
                        class="image-grid__item"
                    >
                        <image
                            :src="image"
                            mode="aspectFill"
                            @click="previewSelected(index)"
                        />
                        <view
                            class="image-grid__remove"
                            @click.stop="removeImage(index)"
                        >
                            <text>✕</text>
                        </view>
                    </view>
                    <view
                        v-if="selectedImages.length < 9"
                        class="image-grid__add"
                        hover-class="image-grid__add--hover"
                        @click="chooseFromAlbum"
                    >
                        <text class="image-grid__add-icon">＋</text>
                        <text class="image-grid__add-text">相册选择</text>
                        <text class="image-grid__add-hint">可一次选多张</text>
                    </view>
                    <view
                        v-if="selectedImages.length < 9"
                        class="image-grid__add image-grid__add--camera"
                        hover-class="image-grid__add--hover"
                        @click="takePhoto"
                    >
                        <text class="image-grid__camera-icon">📷</text>
                        <text class="image-grid__add-text">拍照</text>
                        <text class="image-grid__add-hint">直接调起相机</text>
                    </view>
                </view>
            </md-card>

            <!-- AI 识别状态条 -->
            <view v-if="isIdentifying || identifyAttempted" class="ai-bar">
                <!-- 识别中 -->
                <view v-if="isIdentifying" class="ai-bar__row">
                    <text class="ai-bar__icon">🔍</text>
                    <text class="ai-bar__text">正在识别花卉...</text>
                </view>
                <!-- 识别成功 + 有匹配地点 -->
                <view
                    v-else-if="recognizedSpecies && matchedLocationName"
                    class="ai-bar__row ai-bar__row--ok"
                >
                    <text class="ai-bar__icon">✅</text>
                    <text class="ai-bar__text"
                        >已识别为「<text class="ai-bar__species">{{
                            recognizedSpecies
                        }}</text
                        >」· 已匹配「{{ matchedLocationName }}」</text
                    >
                </view>
                <!-- 识别成功 + 无匹配地点 -->
                <view
                    v-else-if="recognizedSpecies && !matchedLocationName"
                    class="ai-bar__row ai-bar__row--warn"
                >
                    <text class="ai-bar__icon">🌸</text>
                    <text class="ai-bar__text"
                        >已识别为「<text class="ai-bar__species">{{
                            recognizedSpecies
                        }}</text
                        >」，暂无对应地点记录，请手动选择</text
                    >
                </view>
                <!-- 识别失败 -->
                <view v-else class="ai-bar__row ai-bar__row--fail">
                    <text class="ai-bar__icon">❓</text>
                    <text class="ai-bar__text"
                        >未能识别花种，请手动选择地点</text
                    >
                </view>
            </view>

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
                        <view
                            class="field__value"
                            :class="{
                                'field__value--placeholder': !selectedLocation,
                            }"
                        >
                            {{
                                selectedLocation
                                    ? selectedLocation.name
                                    : "请选择打卡地点"
                            }}
                        </view>
                    </picker>
                </view>
                <view class="field">
                    <text class="field__name">花期状态</text>
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

            <md-button
                block
                :disabled="!canSubmit || isSubmitting"
                @click="submitCheckin"
            >
                {{ isSubmitting ? "上传中..." : "发布打卡" }}
            </md-button>
            <text class="checkin__tip">图文至少填写其一，并选择打卡地点。</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLocationStore } from "@/stores/location";
import { useCheckinStore } from "@/stores/checkin";
import { api } from "@/services/api";
import { identifyFlower } from "@/services/flowerAI";

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();

const content = ref("");
const selectedImages = ref<string[]>([]);
const locationIndex = ref(-1);
const selectedStatus = ref("");
const isSubmitting = ref(false);
const isIdentifying = ref(false);
const identifyAttempted = ref(false);
const recognizedSpecies = ref<string | null>(null);
const matchedLocationName = ref<string | null>(null);

const statusOptions = [
    { label: "含苞待放", value: "budding" },
    { label: "盛开", value: "blooming" },
    { label: "凋零", value: "withering" },
];

const locationNames = computed(() =>
    locationStore.locations.map((l) => l.name),
);
const selectedLocation = computed(
    () => locationStore.locations[locationIndex.value],
);
const canSubmit = computed(
    () =>
        (content.value.trim().length > 0 || selectedImages.value.length > 0) &&
        !!selectedLocation.value,
);

const goBack = () => uni.navigateBack();

const onLocationChange = (e: any) => {
    locationIndex.value = Number(e.detail.value);
};

const toggleStatus = (value: string) => {
    selectedStatus.value = selectedStatus.value === value ? "" : value;
};

const chooseFromAlbum = () => {
    const remaining = 9 - selectedImages.value.length;
    if (remaining <= 0) {
        uni.showToast({ title: "最多 9 张", icon: "none" });
        return;
    }
    uni.chooseImage({
        count: remaining,
        sizeType: ["original", "compressed"],
        sourceType: ["album"],
        success: (res) => {
            const before = selectedImages.value.length;
            selectedImages.value.push(...res.tempFilePaths);
            if (before === 0 && res.tempFilePaths.length > 0) {
                runIdentify(res.tempFilePaths[0]);
            }
        },
    });
};

const takePhoto = () => {
    if (selectedImages.value.length >= 9) {
        uni.showToast({ title: "最多 9 张", icon: "none" });
        return;
    }
    uni.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["camera"],
        success: (res) => {
            const before = selectedImages.value.length;
            selectedImages.value.push(...res.tempFilePaths);
            if (before === 0 && res.tempFilePaths.length > 0) {
                runIdentify(res.tempFilePaths[0]);
            }
        },
    });
};

const removeImage = (index: number) => {
    selectedImages.value.splice(index, 1);
    if (selectedImages.value.length === 0) {
        recognizedSpecies.value = null;
        matchedLocationName.value = null;
        identifyAttempted.value = false;
    }
};

/** 识别第一张图片并自动匹配地点 */
const runIdentify = async (firstPath: string) => {
    isIdentifying.value = true;
    recognizedSpecies.value = null;
    matchedLocationName.value = null;
    try {
        const species = await identifyFlower(firstPath);
        recognizedSpecies.value = species;
        if (species) {
            const idx = locationStore.locations.findIndex(
                (l) => l.flower_species === species,
            );
            if (idx >= 0) {
                // 有匹配地点：自动选中，但用户仍可通过 picker 手动修改
                locationIndex.value = idx;
                matchedLocationName.value = locationStore.locations[idx].name;
            }
            // 无匹配地点时保持 locationIndex 不变，提示用户手动选择
        }
    } catch (err) {
        console.error("[花卉识别] 失败:", err);
        uni.showToast({ title: "识别失败，请稍后重试", icon: "none" });
    } finally {
        isIdentifying.value = false;
        identifyAttempted.value = true;
    }
};

const previewSelected = (index: number) => {
    uni.previewImage({
        urls: [...selectedImages.value],
        current: selectedImages.value[index],
    });
};

const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const path of selectedImages.value) {
        const res = await api.upload(path);
        if (!res.data?.url) throw new Error("上传未返回图片地址");
        urls.push(res.data.url);
    }
    return urls;
};

const submitCheckin = async () => {
    if (!canSubmit.value || isSubmitting.value) return;
    const location = selectedLocation.value;
    if (!location) {
        uni.showToast({ title: "请选择打卡地点", icon: "none" });
        return;
    }
    isSubmitting.value = true;
    try {
        let imageUrls: string[] = [];
        if (selectedImages.value.length > 0) {
            try {
                imageUrls = await uploadImages();
            } catch (err) {
                console.error("图片上传失败", err);
                uni.showToast({ title: "图片上传失败，请重试", icon: "none" });
                return;
            }
        }
        await checkinStore.createCheckin({
            location_id: location.id,
            content: content.value.trim(),
            images: imageUrls,
            bloom_report: selectedStatus.value || undefined,
        });
        uni.reLaunch({ url: "/pages/home/home" });
    } catch (error) {
        console.error("发布失败", error);
        uni.showToast({ title: "发布失败", icon: "none" });
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(async () => {
    if (!locationStore.locations.length) {
        await locationStore.loadLocations();
    }
});
</script>

<style scoped lang="scss">
.checkin {
    min-height: 100vh;
    background: $md-background;
}
.checkin__body {
    padding: $md-space-4;
    display: flex;
    flex-direction: column;
    gap: $md-space-4;
}
.checkin__card {
    /* 间距由父容器 gap 统一管理，参考主页 .posts 布局 */
}

/* textarea / input 容器去灰底，避免与白色 card 形成"白底套灰底"层叠 */
:deep(.md-field__box) {
    background: transparent;
    padding-left: 0;
    padding-right: 0;
}
.checkin__label {
    display: block;
    @include md-type("title-small");
    color: $md-on-surface;
    margin-bottom: $md-space-3;
    padding-bottom: $md-space-2;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.checkin__label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: $md-space-3;
    padding-bottom: $md-space-2;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.checkin__label--inline {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}
.checkin__counter {
    @include md-type("body-small");
    color: $md-on-surface-variant;
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
.image-grid__camera-icon {
    font-size: 22px;
    line-height: 1;
}
.image-grid__add--camera {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.3);
}
.image-grid__add-text {
    margin-top: $md-space-1;
    @include md-type("body-small");
}
.image-grid__add-hint {
    margin-top: 2px;
    font-size: 10px;
    color: $md-on-surface-variant;
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
    @include md-type("label-medium");
    color: $md-on-surface-variant;
}
.field__value {
    background: $md-surface-container;
    border-radius: $md-shape-sm;
    padding: $md-space-3 $md-space-4;
    @include md-type("body-large");
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
    @include md-type("body-small");
    color: $md-on-surface-variant;
}

/* AI 识别状态条 */
.ai-bar {
    background: #f0f7f0;
    border: 1px solid #c8dfc8;
    border-radius: $md-shape-md;
    padding: $md-space-3 $md-space-4;
}
.ai-bar__row {
    display: flex;
    align-items: center;
    gap: $md-space-2;
}
.ai-bar__row--ok {
    color: #3a5a40;
}
.ai-bar__row--warn {
    color: #7a6a40;
}
.ai-bar__row--fail {
    color: #7a6a40;
}
.ai-bar__icon {
    font-size: 16px;
    flex-shrink: 0;
}
.ai-bar__text {
    font-size: 13px;
    line-height: 1.4;
}
.ai-bar__species {
    font-weight: 700;
    color: #2b5130;
}
</style>
