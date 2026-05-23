<template>
    <view class="checkin">
        <md-app-bar title="撰写采风手札" />

        <view class="checkin__body">
            <md-card class="form-card" :padding="false">
                <view class="form-card__inner">
                    <text class="form-card__title">物候考察纪要</text>
                    <view class="form-card__input-wrapper">
                        <textarea
                            class="form-card__textarea"
                            placeholder="请在此记述阁下的花卉物候观察、校园采风心情或踏青心得..."
                            placeholder-style="color: #6E7268;"
                            maxlength="1000"
                            :value="content"
                            @input="onContentInput"
                        />
                        <view class="form-card__counter">
                            <text class="form-card__counter-num">{{
                                content.length
                            }}</text>
                            / 1000 卷
                        </view>
                    </view>
                </view>
            </md-card>

            <md-card class="form-card" :padding="false">
                <view class="form-card__inner">
                    <view class="form-card__header">
                        <text class="form-card__title">标本影像采集</text>
                        <text class="form-card__sub-count"
                            >{{ images.length }} / 9 卷</text
                        >
                    </view>

                    <view class="upload-grid">
                        <view
                            v-for="(img, idx) in images"
                            :key="idx"
                            class="upload-grid__item"
                        >
                            <image
                                :src="img"
                                mode="aspectFill"
                                class="upload-grid__img"
                                @click="previewImage(idx)"
                            />
                            <view
                                class="upload-grid__remove"
                                @click.stop="removeImage(idx)"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="upload-grid__remove-svg"
                                >
                                    <path
                                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </view>
                        </view>

                        <view
                            v-if="images.length < 9"
                            class="upload-grid__btn"
                            hover-class="upload-grid__btn--hover"
                            @click="chooseMedia"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                class="upload-grid__camera-svg"
                            >
                                <path
                                    d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                    fill="currentColor"
                                />
                            </svg>
                            <text class="upload-grid__btn-txt">拓印影像</text>
                        </view>
                    </view>
                </view>
            </md-card>

            <md-card class="form-card" :padding="false">
                <view class="form-card__inner">
                    <text class="form-card__title">物候归档校对</text>

                    <view class="meta-field">
                        <text class="meta-field__label">寻芳驻足地点</text>
                        <view
                            class="meta-field__picker-box"
                            @click="chooseLocation"
                        >
                            <svg viewBox="0 0 24 24" class="meta-field__icon">
                                <path
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                    fill="currentColor"
                                />
                            </svg>
                            <text
                                class="meta-field__value"
                                :class="{
                                    'meta-field__value--placeholder':
                                        !selectedLocationName,
                                }"
                            >
                                {{
                                    selectedLocationName ||
                                    "请在地图简牍上选定草木方位..."
                                }}
                            </text>
                        </view>
                    </view>

                    <view class="meta-field" style="margin-top: 16px">
                        <text class="meta-field__label"
                            >目击草木状态（可多选校正）</text
                        >
                        <view class="status-group">
                            <view
                                class="status-chip status-chip--bud"
                                :class="{
                                    'status-chip--bud-active':
                                        bloomStatus === 'bud',
                                }"
                                @click="bloomStatus = 'bud'"
                                >含苞绽萼</view
                            >
                            <view
                                class="status-chip status-chip--bloom"
                                :class="{
                                    'status-chip--bloom-active':
                                        bloomStatus === 'bloom',
                                }"
                                @click="bloomStatus = 'bloom'"
                                >繁花正盛</view
                            >
                            <view
                                class="status-chip status-chip--wither"
                                :class="{
                                    'status-chip--wither-active':
                                        bloomStatus === 'wither',
                                }"
                                @click="bloomStatus = 'wither'"
                                >落红委地</view
                            >
                        </view>
                    </view>
                </view>
            </md-card>

            <view class="actions-area">
                <button
                    class="btn-submit"
                    hover-class="btn-submit--hover"
                    @click="submitCheckin"
                >
                    秉笔编纂 · 发布手札
                </button>
                <text class="actions-area__tip"
                    >※
                    编纂发布即代表阁下同意将影像收录入本校草木公开手札库。</text
                >
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const content = ref("");
const images = ref<string[]>([]);
const selectedLocationName = ref("");
const bloomStatus = ref<"bud" | "bloom" | "wither" | "">("");

const onContentInput = (e: any) => {
    content.value = e.detail.value;
};

const chooseMedia = () => {
    uni.chooseImage({
        count: 9 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
            images.value = [...images.value, ...res.tempFilePaths];
        },
    });
};

const removeImage = (index: number) => {
    images.value.splice(index, 1);
};

const previewImage = (index: number) => {
    uni.previewImage({
        urls: images.value,
        current: images.value[index],
    });
};

const chooseLocation = () => {
    // 原生定位或跳转选点页面逻辑，此处暂作mock演示表现
    uni.showToast({ title: "已读取最新草木坐标", icon: "none" });
    selectedLocationName.value = "狮山樱花径 · 3号观测点";
};

const submitCheckin = () => {
    if (!content.value.trim()) {
        uni.showToast({ title: "请多少写两句考证纪要吧", icon: "none" });
        return;
    }
    uni.showLoading({ title: "刻印入库中..." });
    setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: "手札收录成功", icon: "success" });
        setTimeout(() => uni.reLaunch({ url: "/pages/home/home" }), 800);
    }, 1000);
};
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

/* ── 博物表单卡片基底 ── */
.form-card {
    background: #faf8f5 !important;
    border: 1px solid #d8d3c5 !important;
    border-radius: $md-shape-lg !important;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.03) !important;
}
.form-card__inner {
    padding: $md-space-4;
}
.form-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $md-space-3;
}
.form-card__title {
    font-size: 14px;
    font-weight: 600;
    color: #3a5a40;
    display: flex;
    align-items: center;
    gap: 6px;

    &::before {
        content: "";
        width: 3px;
        height: 12px;
        background: #a3704c;
        border-radius: 1px;
    }
}
.form-card__sub-count {
    font-family: "Georgia", serif;
    font-size: 12px;
    color: #6e7268;
    font-weight: 600;
}

/* ── 修正点：手写本信笺Textarea区域 ── */
.form-card__input-wrapper {
    position: relative;
    background: #faf8f5;
    border: 1px solid #d8d3c5;
    border-radius: $md-shape-sm;
    padding: $md-space-3;
}
.form-card__textarea {
    width: 100%;
    height: 140px;
    font-size: 13.5px;
    line-height: 24px; /* 严格对齐底纹横线 */
    color: $md-on-surface;
    /* 纯CSS绘制手写横格纸底纹 */
    background-image: linear-gradient(#d8d3c5 1px, transparent 1px);
    background-size: 100% 24px;
    background-attachment: local;
}
.form-card__counter {
    text-align: right;
    font-size: 11px;
    color: #6e7268;
    margin-top: $md-space-2;
}
.form-card__counter-num {
    font-family: "Georgia", serif;
    font-weight: 600;
    color: #a3704c;
}

/* ── 影像采集网格（古风虚线框线） ── */
.upload-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $md-space-3;
}
.upload-grid__item {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: $md-shape-sm;
    border: 1px solid #d8d3c5;
    overflow: hidden;
    background: #efece4;
}
.upload-grid__img {
    width: 100%;
    height: 100%;
}
.upload-grid__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    background: rgba(188, 71, 73, 0.85);
    color: #faf8f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.upload-grid__remove-svg {
    width: 10px;
    height: 10px;
}
/* 修正点：抹杀📷Emoji，重塑为单色罗盘/镜头极细框 */
.upload-grid__btn {
    aspect-ratio: 1 / 1;
    border: 1px dashed #8b867a; /* 复古墨灰细虚线 */
    background: #efece4;
    border-radius: $md-shape-sm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6e7268;
    gap: 4px;
    transition: background 0.2s;

    &--hover {
        background: #d8d3c5;
    }
}
.upload-grid__camera-svg {
    width: 20px;
    height: 20px;
}
.upload-grid__btn-txt {
    font-size: 11px;
    font-weight: 600;
}

/* ── 物候属性校准区域 ── */
.meta-field {
    display: flex;
    flex-direction: column;
    gap: $md-space-2;
}
.meta-field__label {
    font-size: 12px;
    font-weight: 600;
    color: #6e7268;
}
.meta-field__picker-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #faf8f5;
    border: 1px solid #d8d3c5;
    border-radius: $md-shape-sm;
    height: 40px;
    padding: 0 $md-space-3;
    color: #3a5a40;
}
.meta-field__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}
.meta-field__value {
    font-size: 13px;
    font-weight: 500;
    color: $md-on-surface;
    @include md-ellipsis(1);

    &--placeholder {
        color: #8b867a;
        font-style: italic;
    }
}

/* ── 修正点：花期选择器高颜值演色重构 ── */
.status-group {
    display: flex;
    gap: $md-space-3;
}
.status-chip {
    flex: 1;
    height: 36px;
    line-height: 34px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    background: #faf8f5;
    color: #6e7268;
    border: 1px solid #d8d3c5;
    border-radius: $md-shape-sm;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

    /* 激活含苞：唤醒调性玫红 */
    &--bud-active {
        background: $md-tertiary-container !important;
        border-color: $md-tertiary !important;
        color: $md-on-tertiary-container !important;
        box-shadow: 0 2px 5px rgba(188, 71, 73, 0.15);
    }

    /* 激活盛开：唤醒标本深绿 */
    &--bloom-active {
        background: $md-primary-container !important;
        border-color: $md-primary !important;
        color: $md-on-primary-container !important;
        box-shadow: 0 2px 5px rgba(58, 90, 64, 0.15);
    }

    /* 激活凋零：唤醒胡桃木褐 */
    &--wither-active {
        background: $md-secondary-container !important;
        border-color: $md-secondary !important;
        color: $md-on-secondary-container !important;
        box-shadow: 0 2px 5px rgba(163, 112, 76, 0.15);
    }
}

/* ── 底部托举大按钮 ── */
.actions-area {
    margin-top: $md-space-3;
    padding-bottom: calc(
        env(safe-area-inset-bottom) + 32rpx
    ); /* 注入多重环境安全托举 */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $md-space-3;
}
.btn-submit {
    width: 100%;
    height: 46px;
    line-height: 46px;
    background: #3a5a40; /* 标本深绿 */
    color: #faf8f5;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    border-radius: $md-shape-full;
    box-shadow:
        0 4px 12px rgba(58, 90, 64, 0.25),
        inset 0 -2px 0 rgba(0, 0, 0, 0.15);
    border: none;

    &--hover {
        opacity: 0.92;
        transform: translateY(1px);
        box-shadow: 0 2px 6px rgba(58, 90, 64, 0.2);
    }
}
.actions-area__tip {
    font-size: 11px;
    color: #8b867a;
    text-align: center;
    line-height: 1.4;
}
</style>
