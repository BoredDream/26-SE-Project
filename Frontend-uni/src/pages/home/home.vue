<template>
    <view class="home">
        <md-app-bar title="狮山草木札" />

        <view class="home__body">
            <view class="gallery-block">
                <view class="gallery-block__inner">
                    <swiper
                        class="gallery-swiper"
                        :indicator-dots="true"
                        :autoplay="true"
                        :interval="5000"
                        :duration="600"
                        indicator-color="rgba(139, 134, 122, 0.3)"
                        indicator-active-color="#3A5A40"
                    >
                        <swiper-item
                            v-for="(item, i) in galleryPhotos"
                            :key="i"
                            @click="previewGallery(i)"
                        >
                            <view class="gallery-card">
                                <image
                                    class="gallery-card__img"
                                    :src="item.url"
                                    mode="aspectFill"
                                />
                                <view class="gallery-card__label">
                                    <text class="gallery-card__author"
                                        >摘录自 @{{
                                            item.author
                                        }}
                                        的采风手札</text
                                    >
                                </view>
                            </view>
                        </swiper-item>
                    </swiper>
                </view>
            </view>

            <view class="section">
                <view class="section__header">
                    <view class="section__line"></view>
                    <text class="section__title">花期物候预测</text>
                    <view class="section__line"></view>
                </view>

                <view class="prediction-grid">
                    <view
                        v-if="predictList.bloom"
                        class="pred-card pred-card--large"
                        hover-class="pred-card--hover"
                        @click="openMap(predictList.bloom)"
                    >
                        <image
                            class="pred-card__img"
                            :src="predictList.bloom.cover_image"
                            mode="aspectFill"
                        />
                        <view class="pred-card__badge pred-card__badge--bloom"
                            >繁花正盛</view
                        >
                        <view class="pred-card__mask">
                            <text class="pred-card__species">{{
                                predictList.bloom.flower_species
                            }}</text>
                            <text class="pred-card__loc"
                                >📍 {{ predictList.bloom.name }}</text
                            >
                            <view class="pred-card__countdown">
                                <text class="pred-card__countdown-txt"
                                    >最佳观赏期倒计时</text
                                >
                                <view class="pred-card__progress-bar"
                                    ><view
                                        class="pred-card__progress-fill"
                                        style="width: 75%"
                                    ></view
                                ></view>
                            </view>
                        </view>
                    </view>

                    <view class="prediction-grid__right">
                        <view
                            v-if="predictList.bud"
                            class="pred-card pred-card--small"
                            hover-class="pred-card--hover"
                            @click="openMap(predictList.bud)"
                        >
                            <image
                                class="pred-card__img"
                                :src="predictList.bud.cover_image"
                                mode="aspectFill"
                            />
                            <view class="pred-card__badge pred-card__badge--bud"
                                >预计{{
                                    predictList.bud.days || 3
                                }}天后绽萼</view
                            >
                            <view class="pred-card__mask-small">
                                <text class="pred-card__species-sm">{{
                                    predictList.bud.flower_species
                                }}</text>
                                <text class="pred-card__loc-sm">{{
                                    predictList.bud.name
                                }}</text>
                            </view>
                        </view>

                        <view
                            v-if="predictList.wither"
                            class="pred-card pred-card--small"
                            hover-class="pred-card--hover"
                            @click="openMap(predictList.wither)"
                        >
                            <image
                                class="pred-card__img"
                                :src="predictList.wither.cover_image"
                                mode="aspectFill"
                            />
                            <view
                                class="pred-card__badge pred-card__badge--wither"
                                >惜花提示 · 韶华将尽</view
                            >
                            <view class="pred-card__mask-small">
                                <text class="pred-card__species-sm">{{
                                    predictList.wither.flower_species
                                }}</text>
                                <text class="pred-card__loc-sm">{{
                                    predictList.wither.name
                                }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="section">
                <view class="posts__head">
                    <view class="posts__head-left">
                        <view class="section__line-short"></view>
                        <text class="section__title">校园采风手札流</text>
                    </view>
                    <view class="posts__sort">
                        <md-chip
                            label="按时间"
                            :selected="sortOption === 'time'"
                            @click="sortOption = 'time'"
                        />
                        <md-chip
                            label="按热度"
                            :selected="sortOption === 'hot'"
                            @click="sortOption = 'hot'"
                        />
                    </view>
                </view>

                <view class="posts">
                    <md-card
                        v-for="post in visiblePosts"
                        :key="post.id"
                        class="post"
                        :padding="false"
                    >
                        <view class="post__wrapper">
                            <view
                                class="post__author"
                                @click="openUser(post.user?.id)"
                            >
                                <view class="post__avatar">
                                    <text class="post__avatar-txt">{{
                                        authorNameInitial(post.user?.nickname)
                                    }}</text>
                                    <view class="post__avatar-seal-box"></view>
                                </view>
                                <view class="post__author-meta">
                                    <view class="post__name-row">
                                        <text class="post__author-name">{{
                                            post.user?.nickname || "佚名学者"
                                        }}</text>
                                        <view
                                            class="post__title-tag"
                                            :style="{
                                                background: postTitle(post.user?.total_checkins).bg,
                                                borderColor: postTitle(post.user?.total_checkins).border,
                                                color: postTitle(post.user?.total_checkins).color,
                                            }"
                                        >
                                            <text class="post__title-tag-txt">{{
                                                postTitle(post.user?.total_checkins).label
                                            }}</text>
                                        </view>
                                    </view>
                                    <text class="post__time"
                                        >于
                                        {{
                                            formatTime(post.created_at)
                                        }}
                                        编纂</text
                                    >
                                </view>
                            </view>

                            <text class="post__content">{{
                                post.content
                            }}</text>

                            <view
                                v-if="post.images?.length"
                                :class="[
                                    'post__images',
                                    getImageGridClass(post.images.length),
                                ]"
                            >
                                <view
                                    v-for="(img, idx) in post.images"
                                    :key="idx"
                                    class="post__image"
                                    hover-class="post__image--hover"
                                    @click.stop="
                                        previewImages(post.images, idx)
                                    "
                                >
                                    <image :src="img" mode="aspectFill" />
                                    <view
                                        v-if="
                                            post.images.length > 9 && idx === 8
                                        "
                                        class="post__image-more"
                                    >
                                        <text
                                            >+{{
                                                post.images.length - 9
                                            }}
                                            卷</text
                                        >
                                    </view>
                                </view>
                            </view>

                            <view class="post__footer">
                                <view class="post__tag" @click="openMap(post)">
                                    <image
                                        class="post__tag-svg"
                                        src="/static/icon/post-bookmark.svg"
                                        mode="aspectFit"
                                    />
                                    <text class="post__tag-text"
                                        >品类 ·
                                        {{
                                            locationSpecies(post.location_id)
                                        }}</text
                                    >
                                </view>

                                <view class="post__actions">
                                    <view
                                        class="post__action-btn"
                                        :class="{
                                            'post__action-btn--liked':
                                                post.liked,
                                        }"
                                        hover-class="post__action-btn--hover"
                                        @click="likePost(post.id)"
                                    >
                                        <image
                                            class="post__action-svg"
                                            :src="
                                                post.liked
                                                    ? '/static/icon/post-like-active.svg'
                                                    : '/static/icon/post-like.svg'
                                            "
                                            mode="aspectFit"
                                        />
                                        <text class="post__action-count">{{
                                            post.likes_count
                                        }}</text>
                                    </view>

                                    <view
                                        class="post__action-btn"
                                        hover-class="post__action-btn--hover"
                                        @click="openComments(post.id)"
                                    >
                                        <image
                                            class="post__action-svg"
                                            src="/static/icon/post-comment.svg"
                                            mode="aspectFit"
                                        />
                                        <text class="post__action-count">{{
                                            post.comments_count || 0
                                        }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </md-card>
                </view>

                <view v-if="visiblePosts.length" class="posts__footer-status">
                    <text v-if="canLoadMore" class="posts__footer-text"
                        >上拉翻阅更多手札...</text
                    >
                    <view v-else class="posts__footer-end">
                        <view class="posts__footer-line"></view>
                        <text class="posts__footer-text"
                            >简牍已尽 · 驻足闻香</text
                        >
                        <view class="posts__footer-line"></view>
                    </view>
                </view>
            </view>
        </view>

        <view
            v-if="showBackToTop"
            class="to-top"
            hover-class="to-top--hover"
            @click="scrollToTop"
        >
            <image
                class="to-top__svg"
                src="/static/icon/scroll-top.svg"
                mode="aspectFit"
            />
        </view>

        <comment-sheet
            :visible="commentSheetVisible"
            :checkin-id="activeCommentCheckinId"
            @close="commentSheetVisible = false"
        />
        <bottom-action-bar current="home" />
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import { useLocationStore } from "@/stores/location";
import { useCheckinStore } from "@/stores/checkin";
import type { Location, Checkin } from "@/services/api";
import { getTitleInfo } from "@/utils/title";

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();
const sortOption = ref<"time" | "hot">("time");
const visibleCount = ref(10);
const showBackToTop = ref(false);
const commentSheetVisible = ref(false);
const activeCommentCheckinId = ref(0);

// ① 顶部轮播精选图卷数据（带摄影者姓名）
const galleryPhotos = [
    { url: "/static/carousel/1.png", author: "林间观察员" },
    { url: "/static/carousel/2.jpg", author: "樱花径学长" },
    { url: "/static/carousel/3.jpg", author: "拾遗少女" },
];

// ② 中间物候预测数据清洗分类（分别摘取盛开、含苞、凋零各1条，喂给Bento Box）
const predictList = computed(() => {
    const locs = locationStore.locations;
    return {
        bloom:
            locs.find(
                (l) =>
                    l.bloom_status?.includes("盛开") ||
                    l.bloom_status?.includes("正盛"),
            ) || locs[0],
        bud:
            locs.find(
                (l) =>
                    l.bloom_status?.includes("含苞") ||
                    l.bloom_status?.includes("绽萼") ||
                    l.bloom_status?.includes("预计"),
            ) || locs[1],
        wither:
            locs.find(
                (l) =>
                    l.bloom_status?.includes("凋") ||
                    l.bloom_status?.includes("落") ||
                    l.bloom_status?.includes("韶华") ||
                    l.bloom_status?.includes("休眠"),
            ) || locs[2],
    };
});

// ③ 帖子流逻辑保持不变
const sortedPosts = computed<Checkin[]>(() => {
    const list = [...checkinStore.checkins];
    if (sortOption.value === "hot") {
        return list.sort(
            (a, b) =>
                b.likes_count +
                (b.comments_count || 0) -
                (a.likes_count + (a.comments_count || 0)),
        );
    }
    return list.sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
});

const visiblePosts = computed(() =>
    sortedPosts.value.slice(0, visibleCount.value),
);
const canLoadMore = computed(
    () => visibleCount.value < sortedPosts.value.length,
);

const formatStatus = (status?: string) => status || "考察中";

const locationSpecies = (locationId?: number) => {
    const item = locationStore.locations.find((l) => l.id === locationId);
    return item?.flower_species || "未知";
};

const previewGallery = (index: number) => {
    uni.previewImage({
        urls: galleryPhotos.map((p) => p.url),
        current: galleryPhotos[index].url,
    });
};

const previewImages = (urls: string[], index: number) => {
    if (!urls?.length) return;
    uni.previewImage({ urls, current: urls[index] });
};

const openMap = (item: Location | Checkin) => {
    const flowerName =
        "flower_species" in item
            ? item.flower_species
            : locationSpecies(item.location_id);
    if (flowerName) uni.setStorageSync("pending_map_filter", flowerName);
    uni.reLaunch({ url: "/pages/map/map" });
};

const openUser = (id?: number) => {
    if (!id) return;
    uni.navigateTo({ url: `/pages/user-detail/user-detail?id=${id}` });
};

const likePost = async (id: number) => {
    try {
        await checkinStore.likeCheckin(id);
    } catch (err) {
        console.error(err);
    }
};

const openComments = (id: number) => {
    activeCommentCheckinId.value = id;
    commentSheetVisible.value = true;
};

const getImageGridClass = (count: number) => {
    if (count === 1) return "one-image";
    if (count === 2) return "two-images";
    if (count === 3) return "three-images";
    return "many-images";
};

const authorNameInitial = (name?: string) => (name ? name[0] : "访");

const postTitle = (checkins?: number) => getTitleInfo(checkins);

const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
};

const scrollToTop = () => {
    uni.pageScrollTo({ scrollTop: 0, duration: 300 });
};

onPageScroll((e) => {
    showBackToTop.value = e.scrollTop > 360;
});
onReachBottom(() => {
    if (canLoadMore.value) visibleCount.value += 10;
});
onMounted(async () => {
    await Promise.all([
        locationStore.loadLocations(),
        checkinStore.loadCheckins(),
    ]);
});
</script>

<style scoped lang="scss">
.home {
    min-height: 100vh;
    background: $md-background;
}
.home__body {
    padding: $md-space-4 $md-space-4 100px;
}

/* ── ① 顶部精选图卷轮播（科学精装书相框视觉） ── */
.gallery-block {
    background: #faf8f5;
    border: 1px solid #8b867a;
    border-radius: $md-shape-lg;
    padding: $md-space-2;
    margin-bottom: $md-space-5;
    box-shadow: 0 4px 12px rgba(58, 42, 32, 0.04);
}
.gallery-block__inner {
    border: 1px solid #d8d3c5;
    border-radius: $md-shape-md;
    overflow: hidden;
}
.gallery-swiper {
    height: 210px; /* 略微拉高，突出美图视觉 */
}
.gallery-card {
    position: relative;
    width: 100%;
    height: 100%;
}
.gallery-card__img {
    width: 100%;
    height: 100%;
}
.gallery-card__label {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(42, 44, 36, 0.75); /* 宣纸质感黑遮罩 */
    backdrop-filter: blur(2px);
    padding: 4px 10px;
    border-radius: $md-shape-sm;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
.gallery-card__author {
    font-size: 11px;
    color: #faf8f5;
    font-weight: 500;
    letter-spacing: 0.5px;
}

/* ── 区块标题线 ── */
.section {
    margin-bottom: $md-space-5;
}
.section__header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $md-space-3;
    margin-bottom: $md-space-3;
}
.section__line {
    flex: 1;
    height: 1px;
    background: #d8d3c5;
}
.section__line-short {
    width: 3px;
    height: 14px;
    background: #3a5a40;
    border-radius: $md-shape-xs;
}
.section__title {
    @include md-type("title-medium");
    color: #3a5a40;
    font-weight: 700;
}

/* ── ② 中间物候预测：Bento Box 网格重构 ── */
.prediction-grid {
    display: flex;
    gap: $md-space-3;
    height: 170px; /* 固定整体大网格高度，实现完美对齐 */
}
.prediction-grid__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $md-space-3;
}

/* 便当盒卡片基底 */
.pred-card {
    position: relative;
    background: #faf8f5;
    border: 1px solid #d8d3c5;
    border-radius: 4px; /* 采用标本夹微方圆角 */
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.03);
    transition: transform 0.2s $md-easing-standard;

    &--large {
        flex: 1.1;
    }
    &--small {
        flex: 1;
    }
}
.pred-card--hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(58, 42, 32, 0.08);
}
.pred-card__img {
    width: 100%;
    height: 100%;
}

/* 状态徽章标签 */
.pred-card__badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 2px;
    color: #faf8f5;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &--bloom {
        background: $md-primary;
    }
    &--bud {
        background: $md-tertiary;
    }
    &--wither {
        background: $md-secondary;
    }
}

/* 大格子暗字面（信息沉浸） */
.pred-card__mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        to top,
        rgba(42, 44, 36, 0.85) 0%,
        rgba(0, 0, 0, 0) 70%
    );
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: $md-space-3;
    color: #faf8f5;
}
.pred-card__species {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
}
.pred-card__loc {
    font-size: 10px;
    opacity: 0.85;
    margin-top: 2px;
}
/* 物候沙漏进度 */
.pred-card__countdown {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.pred-card__countdown-txt {
    font-size: 8px;
    opacity: 0.65;
}
.pred-card__progress-bar {
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $md-shape-full;
    overflow: hidden;
}
.pred-card__progress-fill {
    height: 100%;
    background: #faf8f5;
}

/* 小格子底部遮罩纸（优雅留白） */
.pred-card__mask-small {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(250, 248, 245, 0.9); /* 象牙白半透纸张，承托小字 */
    border-top: 1px solid #d8d3c5;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.pred-card__species-sm {
    font-size: 12px;
    font-weight: 700;
    color: $md-on-surface;
}
.pred-card__loc-sm {
    font-size: 9px;
    color: #6e7268;
    max-width: 55%;
    @include md-ellipsis(1);
}

/* ── ③ 底部采风手札流（线装书纸张质感） ── */
.posts__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $md-space-4;
}
.posts__head-left {
    display: flex;
    align-items: center;
    gap: $md-space-2;
}
.posts__sort {
    display: flex;
    gap: $md-space-2;
}
.posts {
    display: flex;
    flex-direction: column;
    gap: $md-space-4;
}
.post {
    background: #faf8f5 !important;
    border: 1px solid #d8d3c5 !important;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.03) !important;
    border-radius: $md-shape-lg !important;
}
.post__wrapper {
    padding: $md-space-4;
}
.post__author {
    display: flex;
    align-items: center;
    gap: $md-space-3;
    margin-bottom: $md-space-3;
}
.post__avatar {
    position: relative;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3a5a40;
    border-radius: 50%;
    color: #faf8f5;
}
.post__avatar-txt {
    font-size: 14px;
    font-weight: 700;
    z-index: 1;
}
.post__avatar-seal-box {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    border: 1px dashed rgba(250, 248, 245, 0.4);
}
.post__author-meta {
    display: flex;
    flex-direction: column;
}
.post__author-name {
    font-size: 13px;
    font-weight: 600;
    color: $md-on-surface;
}
.post__time {
    font-size: 11px;
    color: #6e7268;
    margin-top: 1px;
}
.post__name-row {
    display: flex;
    align-items: center;
    gap: 5px;
}
.post__title-tag {
    padding: 1px 5px;
    border-radius: 2px;
    border: 1px solid;
    flex-shrink: 0;
}
.post__title-tag-txt {
    font-size: 9px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.2px;
}
.post__content {
    display: block;
    font-size: 13.5px;
    line-height: 1.52;
    color: $md-on-surface;
    margin-bottom: $md-space-3;
}

/* 标本夹图片网格 */
.post__images {
    display: grid;
    gap: 6px;
    margin-bottom: $md-space-3;
}
.post__images.one-image {
    grid-template-columns: 1fr;
}
.post__images.one-image .post__image {
    aspect-ratio: 4 / 3;
    max-height: 180px;
}
.post__images.two-images {
    grid-template-columns: repeat(2, 1fr);
}
.post__images.two-images .post__image {
    aspect-ratio: 1 / 1;
}
.post__images.three-images {
    grid-template-columns: 1.4fr 1fr;
    grid-template-rows: repeat(2, 85px);
}
.post__images.three-images .post__image:first-child {
    grid-row: span 2;
}
.post__images.many-images {
    grid-template-columns: repeat(3, 1fr);
}
.post__images.many-images .post__image {
    aspect-ratio: 1 / 1;
}

.post__image {
    position: relative;
    overflow: hidden;
    border-radius: $md-shape-sm;
    border: 1px solid #d8d3c5;
    background: #efece4;
}
.post__image image {
    width: 100%;
    height: 100%;
}
.post__image-more {
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

.post__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px dashed #efece4;
    padding-top: $md-space-3;
}
.post__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #e6eddf;
    padding: 3px 8px;
    border-radius: $md-shape-sm;
    color: #3a5a40;
}
.post__tag-svg {
    width: 12px;
    height: 12px;
}
.post__tag-text {
    font-size: 11px;
    font-weight: 600;
}
.post__actions {
    display: flex;
    align-items: center;
    gap: $md-space-4;
}
.post__action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #6e7268;
}
.post__action-svg {
    width: 14px;
    height: 14px;
}
.post__action-btn--liked {
    color: #bc4749;
}
.post__action-btn--liked .post__action-svg {
    animation: like-pop 0.35s ease-out;
}
@keyframes like-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.55); }
    70%  { transform: scale(0.88); }
    100% { transform: scale(1); }
}
.post__action-btn--hover {
    opacity: 0.65;
}
.post__action-count {
    font-family: "Georgia", serif;
    font-size: 12px;
    font-weight: 600;
}

.posts__footer-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $md-space-4;
}
.posts__footer-end {
    display: flex;
    align-items: center;
    gap: $md-space-3;
}
.posts__footer-line {
    width: 24px;
    height: 1px;
    background: #d8d3c5;
}
.posts__footer-text {
    font-size: 11px;
    color: #6e7268;
}

/* 回到顶部 */
.to-top {
    position: fixed;
    right: $md-space-4;
    bottom: 110px;
    z-index: 50;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #faf8f5;
    border: 1px solid #8b867a;
    box-shadow: 0 4px 10px rgba(58, 42, 32, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3a5a40;
}
.to-top__svg {
    width: 18px;
    height: 18px;
}
</style>
