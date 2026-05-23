<template>
    <view class="home">
        <md-app-bar title="狮山草木札" />

        <view class="home__body">
            <!-- ── Hero Banner：重构为“草木纪事卷卷首语” ── -->
            <view class="hero">
                <view class="hero__inner-border">
                    <view class="hero__wrapper">
                        <view class="hero__left">
                            <text class="hero__title-en">HERBARIUM</text>
                            <text class="hero__title-zh">狮山见花纪</text>
                            <text class="hero__motto"
                                >“审度韶华，存录纸砚。记录校园草木的每一次呼吸。”</text
                            >
                        </view>
                        <view class="hero__right">
                            <!-- 精巧的古典镜框视窗，承载原本的图片轮播逻辑 -->
                            <view class="hero__lens">
                                <swiper
                                    class="hero__carousel"
                                    :indicator-dots="false"
                                    :autoplay="true"
                                    :interval="4500"
                                    :duration="500"
                                >
                                    <swiper-item
                                        v-for="(photo, i) in carouselPhotos"
                                        :key="i"
                                    >
                                        <image
                                            class="hero__slide"
                                            :src="photo"
                                            mode="aspectFill"
                                        />
                                    </swiper-item>
                                </swiper>
                                <!-- 遮罩框，营造陈旧手稿铜板画质感 -->
                                <view class="hero__lens-overlay"></view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- ── 花卉推荐：Bento Box 精致边框网格 ── -->
            <view class="section">
                <view class="section__header">
                    <view class="section__line"></view>
                    <text class="section__title">时令寻芳推荐</text>
                    <view class="section__line"></view>
                </view>

                <scroll-view class="recommend" scroll-x show-scrollbar="false">
                    <view class="recommend__list">
                        <view
                            v-for="item in recommendationList"
                            :key="item.id"
                            class="recommend__card"
                            hover-class="recommend__card--hover"
                            @click="openMap(item)"
                        >
                            <view class="recommend__img-wrap">
                                <image
                                    class="recommend__img"
                                    :src="item.cover_image"
                                    mode="aspectFill"
                                />
                                <!-- 根据状态派发不同阶段色徽章 -->
                                <view
                                    :class="[
                                        'recommend__badge',
                                        'recommend__badge--' +
                                            (item.bloom_status || 'default'),
                                    ]"
                                >
                                    {{ formatStatus(item.bloom_status) }}
                                </view>
                            </view>
                            <view class="recommend__body">
                                <text class="recommend__species">{{
                                    item.flower_species || "未知品类"
                                }}</text>
                                <view class="recommend__meta">
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="recommend__meta-svg"
                                    >
                                        <path
                                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <text class="recommend__name">{{
                                        item.name
                                    }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- ── 花园帖子：重塑为学者学术辩难手札流 ── -->
            <view class="section">
                <view class="posts__head">
                    <view class="posts__head-left">
                        <view class="section__line-short"></view>
                        <text class="section__title">考察采风手札</text>
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
                            <!-- 作者区块：重构为金石印章及学者档案卡 -->
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
                                    <text class="post__author-name">{{
                                        post.user?.nickname || "佚名学者"
                                    }}</text>
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

                            <!-- 图片网格：保持原 1-9 张切分架构，完美嵌入标本夹画框 -->
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

                            <!-- 底部操作：Emoji 剥离，全面改为线条 SVG 图表 -->
                            <view class="post__footer">
                                <view class="post__tag" @click="openMap(post)">
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="post__tag-svg"
                                    >
                                        <path
                                            d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <text class="post__tag-text"
                                        >品类 ·
                                        {{
                                            locationSpecies(post.location_id)
                                        }}</text
                                    >
                                </view>

                                <view class="post__actions">
                                    <!-- 点赞：改用纤细线条爱心 SVG -->
                                    <view
                                        class="post__action-btn"
                                        :class="{
                                            'post__action-btn--liked':
                                                post.liked,
                                        }"
                                        hover-class="post__action-btn--hover"
                                        @click="likePost(post.id)"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            class="post__action-svg"
                                        >
                                            <path
                                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.5 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                                :fill="
                                                    post.liked
                                                        ? 'currentColor'
                                                        : 'none'
                                                "
                                                stroke="currentColor"
                                                stroke-width="2"
                                            />
                                        </svg>
                                        <text class="post__action-count">{{
                                            post.likes_count
                                        }}</text>
                                    </view>

                                    <!-- 评论：改用学者羊皮纸信笺 SVG -->
                                    <view
                                        class="post__action-btn"
                                        hover-class="post__action-btn--hover"
                                        @click="openComments(post.id)"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            class="post__action-svg"
                                        >
                                            <path
                                                d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                            />
                                        </svg>
                                        <text class="post__action-count">{{
                                            post.comments_count || 0
                                        }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </md-card>
                </view>

                <!-- 加载更多提示 -->
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

                <!-- 空状态 -->
                <view v-if="!visiblePosts.length" class="empty">
                    <view class="empty__box">
                        <svg viewBox="0 0 24 24" class="empty__svg">
                            <path
                                d="M13 14h-2v-2h2v2zm0-4h-2V6h2v4zm1 10H6V4h7v5h5v4.1l2 2V8l-6-6H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.1l-2 2V20z"
                                fill="currentColor"
                            />
                        </svg>
                        <text class="empty__text"
                            >此书卷尚为空白，正待阁下秉笔手札。</text
                        >
                    </view>
                </view>
            </view>
        </view>

        <!-- 回到顶部按钮：重构为复古羽毛笔回执箭簇 -->
        <view
            v-if="showBackToTop"
            class="to-top"
            hover-class="to-top--hover"
            @click="scrollToTop"
        >
            <svg viewBox="0 0 24 24" class="to-top__svg">
                <path
                    d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"
                    fill="currentColor"
                />
            </svg>
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

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();
const sortOption = ref<"time" | "hot">("time");
const visibleCount = ref(10);
const showBackToTop = ref(false);
const commentSheetVisible = ref(false);
const activeCommentCheckinId = ref(0);

const carouselPhotos = [
    "/static/carousel/1.jpg",
    "/static/carousel/2.jpg",
    "/static/carousel/3.jpg",
];

const recommendationList = computed(() => locationStore.locations.slice(0, 3));

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

const formatStatus = (status?: string) => {
    if (!status) return "考察中";
    if (status.includes("含苞")) return "含苞绽萼";
    if (status.includes("盛开")) return "繁花正盛";
    if (status.includes("凋")) return "落红委地";
    return status;
};

const locationSpecies = (locationId?: number) => {
    const item = locationStore.locations.find((l) => l.id === locationId);
    return item?.flower_species || "未知";
};

const loadMore = () => {
    if (canLoadMore.value) visibleCount.value += 10;
};

const scrollToTop = () => {
    uni.pageScrollTo({ scrollTop: 0, duration: 300 });
};

const authorNameInitial = (name?: string) => (name ? name[0] : "访");

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
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
        console.error("点赞失败", err);
    }
};

const openComments = (id: number) => {
    activeCommentCheckinId.value = id;
    commentSheetVisible.value = true;
};

const previewImages = (urls: string[], index: number) => {
    if (!urls?.length) return;
    uni.previewImage({
        urls,
        current: urls[index],
    });
};

const getImageGridClass = (count: number) => {
    if (count === 1) return "one-image";
    if (count === 2) return "two-images";
    if (count === 3) return "three-images";
    return "many-images";
};

onPageScroll((e) => {
    showBackToTop.value = e.scrollTop > 360;
});

onReachBottom(() => {
    loadMore();
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

/* ── Hero Banner（博物卷轴版面） ── */
.hero {
    background: #faf8f5;
    border-radius: $md-shape-lg;
    border: 1px solid #8b867a;
    padding: $md-space-2;
    margin-bottom: $md-space-5;
    box-shadow: 0 4px 12px rgba(58, 42, 32, 0.05);
}
.hero__inner-border {
    border: 1px solid #d8d3c5;
    padding: $md-space-4;
    border-radius: $md-shape-md;
}
.hero__wrapper {
    display: flex;
    align-items: center;
    gap: $md-space-3;
}
.hero__left {
    flex: 1.3;
    display: flex;
    flex-direction: column;
}
.hero__title-en {
    font-family: "Georgia", serif;
    font-size: 11px;
    color: #a3704c;
    font-weight: 700;
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 2px;
}
.hero__title-zh {
    font-size: 24px;
    font-weight: 700;
    color: #3a5a40;
    letter-spacing: 1px;
    line-height: 1.2;
}
.hero__motto {
    font-size: 11px;
    color: #6e7268;
    line-height: 1.5;
    margin-top: $md-space-3;
    font-style: italic;
}
.hero__right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}
.hero__lens {
    position: relative;
    width: 105px;
    height: 105px;
    border-radius: 50%;
    border: 1px solid #8b867a;
    padding: 4px;
    background: #faf8f5;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}
.hero__carousel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
}
.hero__slide {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}
.hero__lens-overlay {
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    box-shadow: inset 0 4px 8px rgba(58, 42, 32, 0.2);
    pointer-events: none;
}

/* ── 通用区块划分线 ── */
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
    letter-spacing: 0.5px;
}

/* ── 时令寻芳卡片（横滑 Bento Box） ── */
.recommend {
    margin: 0 -$md-space-4;
    white-space: nowrap;
}
.recommend__list {
    display: inline-flex;
    gap: $md-space-4;
    padding: 4px $md-space-4 $md-space-3;
}
.recommend__card {
    display: inline-flex;
    flex-direction: column;
    width: 180px;
    background: #faf8f5;
    border-radius: $md-shape-lg;
    overflow: hidden;
    border: 1px solid #d8d3c5;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.04);
    transition:
        transform 0.2s $md-easing-standard,
        box-shadow 0.2s $md-easing-standard;
}
.recommend__card--hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(58, 42, 32, 0.08);
}
.recommend__img-wrap {
    position: relative;
    width: 100%;
    height: 120px;
    background: #efece4;
    border-bottom: 1px solid #d8d3c5;
}
.recommend__img {
    width: 100%;
    height: 100%;
}
.recommend__badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: $md-shape-xs;
    color: #faf8f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &--default,
    &--dormant {
        background: #6e7268;
    }
    &--budding {
        background: $md-tertiary;
    }
    &--blooming {
        background: $md-primary;
    }
    &--withering {
        background: $md-secondary;
    }
}
.recommend__body {
    padding: $md-space-2 $md-space-3;
}
.recommend__species {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: $md-on-surface;
    @include md-ellipsis(1);
}
.recommend__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    color: #6e7268;
}
.recommend__meta-svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
}
.recommend__name {
    font-size: 11px;
    @include md-ellipsis(1);
}

/* ── 考察采风手札流 ── */
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
    line-height: 1.3;
}
.post__time {
    font-size: 11px;
    color: #6e7268;
    margin-top: 1px;
}
.post__content {
    display: block;
    font-size: 13.5px;
    line-height: 1.52;
    color: $md-on-surface;
    margin-bottom: $md-space-3;
    text-align: justify;
}

/* ── 帖子内嵌标本夹网格 ── */
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
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.post__image--hover {
    opacity: 0.9;
    transform: scale(0.98);
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

/* ── 线条化页脚操作 ── */
.post__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px dashed #efece4;
    padding-top: $md-space-3;
    margin-top: $md-space-2;
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
    padding: 2px 6px;
    color: #6e7268;
    border-radius: $md-shape-sm;
    transition:
        color 0.15s,
        background 0.15s;

    &--hover {
        background: #efece4;
    }
}
.post__action-svg {
    width: 14px;
    height: 14px;
}
.post__action-btn--liked {
    color: #bc4749; /* 激活换为火漆红 */
}
.post__action-count {
    font-family: "Georgia", serif;
    font-size: 12px;
    font-weight: 600;
}

/* ── 底部加载态与空状态 ── */
.posts__footer-status {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $md-space-4;
    padding: $md-space-2 0;
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
    letter-spacing: 0.5px;
}
.empty {
    display: flex;
    justify-content: center;
    padding: $md-space-8 $md-space-4;
}
.empty__box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $md-space-2;
    color: #8b867a;
}
.empty__svg {
    width: 32px;
    height: 32px;
}
.empty__text {
    font-size: 12px;
}

/* ── 回到顶部箭簇 ── */
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
    transition: transform 0.2s;
}
.to-top--hover {
    transform: scale(0.92) translateY(-2px);
    background: #e6eddf;
}
.to-top__svg {
    width: 18px;
    height: 18px;
}
</style>
