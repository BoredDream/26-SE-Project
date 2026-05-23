<template>
    <view class="garden">
        <md-app-bar title="百草本纪" />

        <view class="garden__body">
            <view class="hero">
                <view class="hero__inner-border">
                    <view class="hero__content">
                        <text class="hero__title">狮山草木志</text>
                        <text class="hero__sub"
                            >格物穷理 · 用手札封存每一次花开的律动</text
                        >
                        <view class="hero__stats">
                            <view class="hero__progress">
                                <view
                                    class="hero__progress-fill"
                                    :style="{ width: progressPercent + '%' }"
                                ></view>
                            </view>
                            <text class="hero__progress-text"
                                >{{ unlockedCount }} / {{ totalCount }} 卷</text
                            >
                        </view>
                    </view>
                </view>
            </view>

            <view class="flowers">
                <view
                    v-for="flower in flowerCollection"
                    :key="flower.name"
                    class="flower-card"
                    :class="
                        flower.unlocked
                            ? 'flower-card--unlocked'
                            : 'flower-card--locked'
                    "
                    hover-class="flower-card--hover"
                    @click="openFlower(flower)"
                >
                    <view class="flower-card__img-wrap">
                        <image
                            class="flower-card__img"
                            :src="flower.image"
                            mode="aspectFill"
                        />

                        <view v-if="!flower.unlocked" class="flower-card__lock">
                            <view class="flower-card__lock-shield">
                                <svg
                                    viewBox="0 0 24 24"
                                    class="flower-card__lock-svg"
                                >
                                    <path
                                        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </view>
                        </view>

                        <view v-else class="flower-card__seal">
                            <text class="flower-card__seal-num">{{
                                flower.checkinCount
                            }}</text>
                            <text class="flower-card__seal-txt">阅</text>
                        </view>
                    </view>

                    <view class="flower-card__body">
                        <text class="flower-card__status">
                            {{
                                flower.unlocked
                                    ? "已收录于手札"
                                    : "未知品类 · 待寻芳"
                            }}
                        </text>
                    </view>
                </view>
            </view>

            <text class="garden__hint"
                >「 花开知春来 · 审度韶华 · 存录纸砚 」</text
            >
        </view>

        <view class="dialog" v-if="selectedFlower">
            <view class="dialog__scrim" @click="closeDetail"></view>
            <view class="dialog__card">
                <view class="dialog__inner-border">
                    <view class="dialog__header">
                        <image
                            class="dialog__thumb"
                            :src="selectedFlower.image"
                            mode="aspectFill"
                        />
                        <view class="dialog__meta">
                            <text class="dialog__title">{{
                                selectedFlower.name
                            }}</text>
                            <text class="dialog__sub">
                                {{
                                    selectedFlower.unlocked
                                        ? `档案记录：已累计考察该植株 ${selectedFlower.checkinCount} 次`
                                        : "暂未收录入库"
                                }}
                            </text>
                        </view>
                    </view>

                    <view class="dialog__posts">
                        <template v-if="selectedFlower.checkins.length">
                            <view
                                v-for="post in selectedFlower.checkins"
                                :key="post.id"
                                class="dialog__post"
                            >
                                <view class="dialog__post-meta">
                                    <text class="dialog__post-user"
                                        >🔍
                                        {{
                                            post.user?.nickname || "佚名学者"
                                        }}</text
                                    >
                                    <text class="dialog__post-time">{{
                                        formatTime(post.created_at)
                                    }}</text>
                                </view>
                                <text class="dialog__post-content">{{
                                    post.content
                                }}</text>
                            </view>
                        </template>
                        <view v-else class="dialog__empty">
                            {{
                                selectedFlower.unlocked
                                    ? "该标本档案暂无详细描述"
                                    : "🔒 需寻得此花拍照鉴别后，方可解锁前人记述"
                            }}
                        </view>
                    </view>

                    <view class="dialog__actions">
                        <button class="dialog__btn-close" @click="closeDetail">
                            合上卷轴
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <bottom-action-bar current="garden" />
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLocationStore } from "@/stores/location";
import { useCheckinStore } from "@/stores/checkin";
import type { Checkin } from "@/services/api";

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();

const FLOWER_LIST = [
    "樱花",
    "梨花",
    "梅花",
    "桃花",
    "玉兰花",
    "油菜花",
    "格桑花",
    "大金鸡菊",
    "蔷薇花",
    "紫藤花",
    "杜鹃花",
    "夹桃",
];

interface FlowerEntry {
    name: string;
    image: string;
    unlocked: boolean;
    checkinCount: number;
    checkins: Checkin[];
}

const flowerCollection = computed<FlowerEntry[]>(() => {
    return FLOWER_LIST.map((name) => {
        const relatedCheckins = checkinStore.checkins.filter((c) => {
            const loc = locationStore.locations.find(
                (l) => l.id === c.location_id,
            );
            return loc?.flower_species === name;
        });
        return {
            name,
            image: `/static/flowers/${name}.png`,
            unlocked: relatedCheckins.length > 0,
            checkinCount: relatedCheckins.length,
            checkins: relatedCheckins,
        };
    });
});

const totalCount = computed(() => FLOWER_LIST.length);
const unlockedCount = computed(
    () => flowerCollection.value.filter((f) => f.unlocked).length,
);
const progressPercent = computed(() =>
    Math.round((unlockedCount.value / totalCount.value) * 100),
);

const selectedFlower = ref<FlowerEntry | null>(null);
const openFlower = (flower: FlowerEntry) => {
    selectedFlower.value = flower;
};
const closeDetail = () => {
    selectedFlower.value = null;
};

const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
};

onMounted(async () => {
    await Promise.all([
        locationStore.loadLocations(),
        checkinStore.loadCheckins(),
    ]);
});
</script>

<style scoped lang="scss">
.garden {
    min-height: 100vh;
    background: $md-background;
}
.garden__body {
    padding: 0 0 100px;
    display: flex;
    flex-direction: column;
    gap: $md-space-4;
}

/* ── Hero Banner ── */
.hero {
    position: relative;
    margin: $md-space-4 $md-space-4 0;
    padding: $md-space-2;
    background: #3a5a40;
    border-radius: $md-shape-lg;
    box-shadow: 0 4px 12px rgba(58, 90, 64, 0.15);
}
.hero__inner-border {
    border: 1px dashed rgba(230, 237, 223, 0.4);
    padding: $md-space-4 $md-space-4 $md-space-5;
    border-radius: $md-shape-md;
}
.hero__content {
    position: relative;
    z-index: 1;
}
.hero__title {
    display: block;
    font-family: "Georgia", serif;
    font-size: 24px;
    font-weight: 700;
    color: #faf8f5;
    margin-bottom: 4px;
    letter-spacing: 1px;
}
.hero__sub {
    display: block;
    font-size: 12px;
    color: #e6eddf;
    opacity: 0.85;
    margin-bottom: $md-space-4;
}
.hero__stats {
    display: flex;
    align-items: center;
    gap: $md-space-3;
}
/* 修正点：加粗加硬度进度条轨道 */
.hero__progress {
    flex: 1;
    height: 10px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: $md-shape-full;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
.hero__progress-fill {
    height: 100%;
    background: #faf8f5; /* 象牙卡片白填充 */
    border-radius: $md-shape-full;
    transition: width 0.6s cubic-bezier(0.2, 0, 0, 1);
}
.hero__progress-text {
    font-family: "Georgia", serif;
    font-size: 13px;
    font-weight: 600;
    color: #faf8f5;
    white-space: nowrap;
}

/* ── 花卉收录网格 ── */
.flowers {
    padding: 0 $md-space-4;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $md-space-3;
}
.flower-card {
    background: #faf8f5;
    border-radius: $md-shape-lg;
    overflow: hidden;
    border: 1px solid #d8d3c5;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.04);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}
.flower-card--hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 14px rgba(58, 42, 32, 0.08);
}
.flower-card__img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: #efece4;
    overflow: hidden;
    border-bottom: 1px solid #d8d3c5;
}
.flower-card__img {
    width: 100%;
    height: 100%;
}

/* 🔒 未解锁卡片视觉机制修正 */
.flower-card--locked .flower-card__img {
    filter: grayscale(1) contrast(1.1) brightness(0.85);
    opacity: 0.3; /* 渲染淡淡的纸上墨线感 */
}
.flower-card__lock {
    position: absolute;
    inset: 0;
    background: rgba(58, 42, 32, 0.02);
    display: flex;
    align-items: center;
    justify-content: center;
}
/* 修正点：消灭高亮纯白大圆圈，改用极具宣纸融合度的精致小盾牌 */
.flower-card__lock-shield {
    width: 32px;
    height: 32px;
    border-radius: 4px; /* 抛弃无趣大圆形 */
    background: rgba(250, 248, 245, 0.85); /* 柔和半透明象牙宣纸色 */
    border: 1px solid #8b867a; /* 古董灰线勾边 */
    color: #6e7268;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.06);
}
.flower-card__lock-svg {
    width: 15px;
    height: 15px;
}

/* 💮 已解锁卡片：红底火漆签章 */
.flower-card__seal {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #bc4749;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow:
        0 2px 5px rgba(188, 71, 73, 0.3),
        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.flower-card__seal-num {
    font-family: "Georgia", serif;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
}
.flower-card__seal-txt {
    font-size: 8px;
    line-height: 1;
    transform: scale(0.85);
}

.flower-card__body {
    padding: $md-space-2 $md-space-3;
    text-align: center; /* 居中编排 */
    background: #faf8f5;
}
.flower-card__status {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #6e7268;
}
.flower-card--unlocked .flower-card__status {
    color: #a3704c; /* 已解锁采用古典胡桃褐 */
    font-weight: 600;
}
.garden__hint {
    display: block;
    text-align: center;
    margin: $md-space-3 $md-space-4 0;
    font-size: 11px;
    color: #6e7268;
    letter-spacing: 0.5px;
}

/* ── 详情弹窗 ── */
.dialog {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $md-space-4;
}
.dialog__scrim {
    position: absolute;
    inset: 0;
    background: rgba(42, 44, 36, 0.4);
    backdrop-filter: blur(1px);
}
.dialog__card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    max-height: 75vh;
    overflow-y: auto;
    background: #faf8f5;
    border-radius: $md-shape-lg;
    padding: $md-space-2;
    border: 1px solid #8b867a;
    box-shadow: 0 12px 30px rgba(58, 42, 32, 0.15);
}
.dialog__inner-border {
    border: 1px solid #d8d3c5;
    padding: $md-space-4;
    border-radius: $md-shape-md;
}
.dialog__header {
    display: flex;
    gap: $md-space-3;
    margin-bottom: $md-space-4;
    border-bottom: 1px dashed #d8d3c5;
    padding-bottom: $md-space-3;
}
.dialog__thumb {
    width: 72px;
    height: 72px;
    border-radius: $md-shape-sm;
    flex-shrink: 0;
    background: #efece4;
    border: 1px solid #d8d3c5;
}
.dialog__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.dialog__title {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: $md-on-surface;
}
.dialog__sub {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #a3704c;
    font-weight: 500;
}
.dialog__posts {
    display: flex;
    flex-direction: column;
    gap: $md-space-3;
    margin-bottom: $md-space-4;
}
.dialog__post {
    background: #faf8f5;
    border-left: 2px solid #3a5a40;
    padding: $md-space-2 0 $md-space-2 $md-space-3;
    border-bottom: 1px solid #efece4;
}
.dialog__post-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}
.dialog__post-user {
    font-size: 12px;
    font-weight: 600;
    color: #3a5a40;
}
.dialog__post-time {
    font-size: 11px;
    color: #6e7268;
}
.dialog__post-content {
    font-size: 13px;
    line-height: 1.5;
    color: $md-on-surface;
}
.dialog__empty {
    text-align: center;
    padding: $md-space-5 0;
    font-size: 12px;
    color: #6e7268;
    line-height: 1.6;
}
.dialog__actions {
    display: flex;
    justify-content: flex-end;
}
.dialog__btn-close {
    background: #faf8f5;
    color: #3a5a40;
    border: 1px solid #3a5a40;
    font-size: 12px;
    font-weight: 600;
    padding: 0 $md-space-4;
    height: 32px;
    line-height: 30px;
    border-radius: $md-shape-sm;
    margin: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: background 0.15s;
}
.dialog__btn-close:active {
    background: #e6eddf;
}
</style>
