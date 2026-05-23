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
                    <!-- 主页内联 SVG 线条图标 -->
                    <svg
                        v-if="tab.key === 'home'"
                        viewBox="0 0 24 24"
                        class="bab__svg"
                    >
                        <path
                            d="M4 21V9l8-6 8 6v12H4zm2-2h12v-9l-6-4.5L6 10v9zm3-1h6v-6H9v6z"
                            fill="currentColor"
                        />
                    </svg>
                    <!-- 地图内联 SVG 线条罗盘图标 -->
                    <svg
                        v-if="tab.key === 'map'"
                        viewBox="0 0 24 24"
                        class="bab__svg"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13l-4 4 1 5 5-3-2-6zm-.5 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 0.67 1.5 1.5-.67 1.5-1.5 1.5z"
                            fill="currentColor"
                        />
                    </svg>
                </view>
                <text
                    class="bab__label"
                    :class="{ 'bab__label--active': current === tab.key }"
                    >{{ tab.text }}</text
                >
            </view>

            <!-- 中间发布槽（重构为火漆印章视觉） -->
            <view class="bab__publish-wrap" @click="goPublish">
                <view class="bab__publish" hover-class="bab__publish--hover">
                    <!-- 内联羽毛笔线条 SVG 图标 -->
                    <svg viewBox="0 0 24 24" class="bab__publish-svg">
                        <path
                            d="M2.5 19.5L16 6l2.5 2.5L5 22H2.5v-2.5zM17.5 4.5L19.5 2.5c.8-.8 2-.8 2.8 0s.8 2 0 2.8L20.3 7.3l-2.8-2.8z"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </view>
                <text class="bab__publish-label">采集</text>
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
                    <!-- 花园内联 SVG 线条标本框图标 -->
                    <svg
                        v-if="tab.key === 'garden'"
                        viewBox="0 0 24 24"
                        class="bab__svg"
                    >
                        <path
                            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2l-3-4 1.4-1.4 1.6 2.1 3.6-4.7L17 11l-5 6z"
                            fill="currentColor"
                        />
                    </svg>
                    <!-- 我的内联 SVG 线条学者帽/用户图标 -->
                    <svg
                        v-if="tab.key === 'profile'"
                        viewBox="0 0 24 24"
                        class="bab__svg"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                            fill="currentColor"
                        />
                    </svg>
                </view>
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
interface TabItem {
    key: "home" | "map" | "garden" | "profile";
    text: string;
    url: string;
}

defineProps<{ current: "home" | "map" | "garden" | "profile" }>();

const leftTabs: TabItem[] = [
    { key: "home", text: "手札", url: "/pages/home/home" },
    { key: "map", text: "寻芳", url: "/pages/map/map" },
];

const rightTabs: TabItem[] = [
    { key: "garden", text: "百草园", url: "/pages/garden/garden" },
    { key: "profile", text: "简牍", url: "/pages/profile/profile" },
];

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
    background: #faf8f5; /* 沿用复古纸张亮白色 */
    border-top: 1px solid #d8d3c5; /* 复古弱分隔线 */
    padding-bottom: env(safe-area-inset-bottom);
}
.bab__row {
    display: flex;
    align-items: flex-end;
    height: 62px;
}
.bab__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 4px;
    padding-bottom: 6px;
}
.bab__tab--hover {
    opacity: 0.7;
}
.bab__icon-box {
    width: 24px;
    height: 24px;
    color: #6e7268; /* 标本灰 */
    display: flex;
    align-items: center;
    justify-content: center;
}
.bab__icon-box--active {
    color: #3a5a40; /* 激活换为标本深墨绿 */
}
.bab__svg {
    width: 22px;
    height: 22px;
}
.bab__label {
    font-family: "Georgia", sans-serif;
    font-size: 11px;
    color: #6e7268;
    line-height: 1;
    font-weight: 500;
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
    top: -16px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #bc4749; /* 火漆红 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 4px 10px rgba(188, 71, 73, 0.35),
        inset 0 -3px 0px rgba(0, 0, 0, 0.15); /* 内外双向立体感阴影 */
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #faf8f5;
    transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}
.bab__publish--hover {
    transform: scale(0.92) rotate(-10deg); /* 模拟印章按下并轻微转动 */
    opacity: 0.95;
}
.bab__publish-svg {
    width: 20px;
    height: 20px;
}
.bab__publish-label {
    font-size: 11px;
    color: #bc4749;
    margin-bottom: 6px;
    font-weight: 600;
}
</style>
