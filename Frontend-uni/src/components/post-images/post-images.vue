<template>
    <view v-if="images?.length" class="post-images" :class="gridClass">
        <view
            v-for="(img, idx) in visibleImages"
            :key="idx"
            class="post-images__cell"
            :class="{ 'post-images__cell--single': isSingle }"
            :style="isSingle ? singleStyle : undefined"
            hover-class="post-images__cell--hover"
            @click.stop="preview(idx)"
        >
            <image :src="img" mode="aspectFill" @load="onLoad" />
            <view
                v-if="overflowCount > 0 && idx === 8"
                class="post-images__more"
            >
                <text>+{{ overflowCount }} 卷</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ images: string[] }>();

const count = computed(() => props.images?.length ?? 0);
const isSingle = computed(() => count.value === 1);

const gridClass = computed(() => {
    if (count.value === 1) return "post-images--one";
    if (count.value === 2) return "post-images--two";
    if (count.value === 3) return "post-images--three";
    return "post-images--many";
});

// 最多铺 9 格，第 9 格在超出时叠加 +N 遮罩
const visibleImages = computed(() => props.images.slice(0, 9));
const overflowCount = computed(() => Math.max(0, count.value - 9));

// 单图自适应：渲染时读真实宽高，比例夹在 [3:4 纵, 16:9 横] 区间内不裁切
const DEFAULT_RATIO = 4 / 3;
const MAX_LANDSCAPE = 16 / 9;
const MIN_PORTRAIT = 3 / 4;
const PORTRAIT_MAX_H = 360;
const singleRatio = ref(DEFAULT_RATIO);

const onLoad = (e: any) => {
    if (!isSingle.value) return;
    const w = e?.detail?.width;
    const h = e?.detail?.height;
    if (w && h) singleRatio.value = w / h;
};

const singleStyle = computed(() => {
    const r = singleRatio.value;
    if (r >= 1) {
        // 横幅/方形：满宽，高度由比例推出
        return { width: "100%", aspectRatio: String(Math.min(r, MAX_LANDSCAPE)) };
    }
    // 纵幅：限高，宽度由比例推出（不占满宽）
    return {
        height: PORTRAIT_MAX_H + "px",
        aspectRatio: String(Math.max(r, MIN_PORTRAIT)),
    };
});

const preview = (idx: number) => {
    if (!props.images?.length) return;
    uni.previewImage({ urls: props.images, current: props.images[idx] });
};
</script>

<style scoped lang="scss">
.post-images {
    display: grid;
    gap: 6px;
    margin-bottom: $md-space-3;
}
.post-images--one {
    display: block;
}
.post-images--two {
    grid-template-columns: repeat(2, 1fr);
}
.post-images--two .post-images__cell {
    aspect-ratio: 1 / 1;
}
.post-images--three {
    grid-template-columns: 1.4fr 1fr;
    grid-template-rows: repeat(2, 85px);
}
.post-images--three .post-images__cell:first-child {
    grid-row: span 2;
}
.post-images--many {
    grid-template-columns: repeat(3, 1fr);
}
.post-images--many .post-images__cell {
    aspect-ratio: 1 / 1;
}

.post-images__cell {
    position: relative;
    overflow: hidden;
    border-radius: $md-shape-sm;
    border: 1px solid #d8d3c5;
    background: #efece4;
}
/* 单图：宽/高/比例由内联 singleStyle 控制；inline-block 才能让纵幅按比例收窄 */
.post-images__cell--single {
    display: inline-block;
    vertical-align: top;
    max-width: 100%;
}
.post-images__cell--hover {
    opacity: 0.85;
}
.post-images__cell image {
    display: block;
    width: 100%;
    height: 100%;
}
.post-images__more {
    position: absolute;
    inset: 0;
    background: rgba(42, 44, 36, 0.5);
    color: #faf8f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Georgia", serif;
    font-size: 14px;
    font-weight: 600;
}
</style>
