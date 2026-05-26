<template>
    <view class="bab">
        <view class="bab__row">
            <!-- 左侧两个 Tab 槽 -->
            <view
                v-for="tab in leftTabs"
                :key="tab.key"
                class="bab__tab"
                hover-class="bab__tab--hover"
                @click="goTab(tab)"
            >
                <view
                    class="bab__icon-box"
                    :class="{ 'bab__icon-box--active': current === tab.key }"
                >
                    <image
                        class="bab__icon"
                        :src="iconSrc(tab.key, current === tab.key)"
                        mode="aspectFit"
                    />
                </view>
                <view class="bab__active-bar" v-if="current === tab.key" />
                <text
                    class="bab__label"
                    :class="{ 'bab__label--active': current === tab.key }"
                    >{{ tab.text }}</text
                >
            </view>

            <!-- 中间发布槽（火漆印章 + 呼吸光晕） -->
            <view class="bab__publish-wrap" @click="goPublish">
                <view class="bab__publish-halo" />
                <view class="bab__publish" hover-class="bab__publish--hover">
                    <image
                        class="bab__publish-icon"
                        src="/static/icon/nav-publish.svg"
                        mode="aspectFit"
                    />
                </view>
                <text class="bab__publish-label">打卡</text>
            </view>

            <!-- 右侧两个 Tab 槽 -->
            <view
                v-for="tab in rightTabs"
                :key="tab.key"
                class="bab__tab"
                hover-class="bab__tab--hover"
                @click="goTab(tab)"
            >
                <view
                    class="bab__icon-box"
                    :class="{ 'bab__icon-box--active': current === tab.key }"
                >
                    <image
                        class="bab__icon"
                        :src="iconSrc(tab.key, current === tab.key)"
                        mode="aspectFit"
                    />
                </view>
                <view class="bab__active-bar" v-if="current === tab.key" />
                <text
                    class="bab__label"
                    :class="{ 'bab__label--active': current === tab.key }"
                    >{{ tab.text }}</text
                >
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
type TabKey = "home" | "map" | "garden" | "profile";

interface TabItem {
    key: TabKey;
    text: string;
    url: string;
}

defineProps<{ current: TabKey }>();

const leftTabs: TabItem[] = [
    { key: "home", text: "首页", url: "/pages/home/home" },
    { key: "map", text: "地图", url: "/pages/map/map" },
];

const rightTabs: TabItem[] = [
    { key: "garden", text: "花园", url: "/pages/garden/garden" },
    { key: "profile", text: "我的", url: "/pages/profile/profile" },
];

const iconSrc = (key: TabKey, active: boolean) =>
    `/static/icon/nav-${key}${active ? "-active" : ""}.svg`;

const goTab = (tab: TabItem) => {
    uni.reLaunch({ url: tab.url });
};

const goPublish = () => {
    uni.navigateTo({ url: "/pages/checkin/checkin" });
};
</script>

<style scoped lang="scss">
.bab {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    background: #faf8f5;
    border-top: 1rpx solid #d8d3c5;
    box-shadow: 0 -4px 12px rgba(58, 42, 32, 0.04);
    padding-bottom: env(safe-area-inset-bottom);
    animation: bab-slide-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
@keyframes bab-slide-in {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
}

.bab__row {
    display: flex;
    align-items: flex-end;
    height: 64px;
}

.bab__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 5px;
    padding-bottom: 6px;
    transition: transform 0.2s ease;
    position: relative;
}
.bab__tab--hover {
    transform: translateY(-1px);
    opacity: 0.78;
}

.bab__icon-box {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bab__icon-box--active {
    transform: scale(1.08);
}
.bab__icon {
    width: 24px;
    height: 24px;
}

/* 激活态短下划线（书签视觉） */
.bab__active-bar {
    position: absolute;
    bottom: 1px;
    left: 50%;
    width: 14px;
    height: 2px;
    background: #3a5a40;
    border-radius: 1px;
    transform: translateX(-50%);
    animation: bab-bar-grow 0.2s ease-out both;
}
@keyframes bab-bar-grow {
    from { width: 0; opacity: 0; }
    to   { width: 14px; opacity: 1; }
}

.bab__label {
    font-family: "Georgia", "Songti SC", serif;
    font-size: 10.5px;
    color: #6e7268;
    line-height: 1;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: color 0.2s ease;
}
.bab__label--active {
    color: #3a5a40;
    font-weight: 600;
}

/* ── 中间火漆印章发布槽 ── */
.bab__publish-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    position: relative;
}
.bab__publish {
    position: absolute;
    top: -20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #bc4749;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 6px 14px rgba(188, 71, 73, 0.38),
        inset 0 -3px 0 rgba(0, 0, 0, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 2;
}
.bab__publish--hover {
    transform: scale(0.88) rotate(-8deg);
}
.bab__publish-icon {
    width: 26px;
    height: 26px;
}

.bab__publish-halo {
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(188, 71, 73, 0.18);
    z-index: 1;
    pointer-events: none;
    animation: bab-breathe 4s ease-in-out infinite;
}
@keyframes bab-breathe {
    0%, 100% { opacity: 0.35; transform: translateX(-50%) scale(0.92); }
    50%      { opacity: 0.75; transform: translateX(-50%) scale(1.12); }
}

.bab__publish-label {
    font-family: "Georgia", "Songti SC", serif;
    font-size: 10.5px;
    color: #bc4749;
    margin-bottom: 6px;
    font-weight: 600;
    letter-spacing: 0.3px;
    z-index: 2;
}
</style>
