<template>
    <view class="home">
        <md-app-bar title="狮山草木札" />

        <view class="home__body">
            <!-- ── ① 顶部区块：精选寻芳图卷（宽幅科学精装书相框轮播） ── -->
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

            <!-- ── ② 中间区块：花期物候预测（重塑为圆形星环物候横列） ── -->
            <view class="section">
                <view class="section__header">
                    <view class="section__line"></view>
                    <text class="section__title">花期物候预测</text>
                    <view class="section__line"></view>
                </view>

                <!-- 橫向滚动的物候印章星环流 -->
                <scroll-view
                    class="predict-scroll"
                    scroll-x
                    show-scrollbar="false"
                >
                    <view class="predict-list">
                        <view
                            v-for="item in sortedPredictionList"
                            :key="item.id"
                            class="predict-item"
                            hover-class="predict-item--hover"
                            @click="openMap(item)"
                        >
                            <!-- 进度环容器 (使用 WXSS 完美支持的 conic-gradient 动态计算角度) -->
                            <view
                                class="predict-ring-container"
                                :style="{
                                    background: `conic-gradient(${getProgressColor(item.bloom_status)} ${getProgressValue(item.bloom_status) * 360}deg, #E8E2D3 0deg)`,
                                }"
                            >
                                <!-- 空心遮罩层，其底色与卡片背景 #FAF8F5 保持一致 -->
                                <view class="predict-ring-inner">
                                    <!-- 中心花卉高颜值微缩图 -->
                                    <image
                                        class="predict-avatar"
                                        :src="item.cover_image"
                                        mode="aspectFill"
                                    />
                                </view>
                            </view>

                            <!-- 下属两行清爽小字 -->
                            <text class="predict-name">{{
                                item.flower_species
                            }}</text>
                            <text
                                class="predict-status-txt"
                                :style="{
                                    color: getProgressColor(item.bloom_status),
                                }"
                            >
                                {{ getStatusText(item.bloom_status) }}
                            </text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- ── ③ 底部区块：考察采风手札流 ── -->
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
                                                background: postTitle(
                                                    post.user?.current_title,
                                                ).bg,
                                                borderColor: postTitle(
                                                    post.user?.current_title,
                                                ).border,
                                                color: postTitle(
                                                    post.user?.current_title,
                                                ).color,
                                            }"
                                        >
                                            <text class="post__title-tag-txt">{{
                                                postTitle(
                                                    post.user?.current_title,
                                                ).label
                                            }}</text>
                                        </view>
                                    </view>
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
                                <text class="post__time">{{ formatTime(post.created_at) }}</text>
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
import { getTitleByName } from "@/utils/title";
import type { Title } from "@/services/api";

const locationStore = useLocationStore();
const checkinStore = useCheckinStore();
const sortOption = ref<"time" | "hot">("time");
const visibleCount = ref(10);
const showBackToTop = ref(false);
const commentSheetVisible = ref(false);
const activeCommentCheckinId = ref(0);

// ① 顶部轮播精选图卷数据（优化为宽幅相框，长宽比大约在16:10左右）
const galleryPhotos = [
    { url: "/static/carousel/1.png", author: "林间观察员" },
    { url: "/static/carousel/2.jpg", author: "樱花径学长" },
    { url: "/static/carousel/3.jpg", author: "拾遗少女" },
];

// 🎨 辅助函数：根据状态动态换算外围进度圈百分比
const getProgressValue = (status?: string) => {
    if (!status) return 0.15;
    const s = status.toLowerCase();
    if (s.includes("盛开") || s.includes("正盛") || s.includes("繁花"))
        return 1.0; // 满弧
    if (s.includes("绽萼") || s.includes("绽放")) return 0.85;
    if (s.includes("含苞")) return 0.6;
    if (s.includes("预计") || s.includes("天后")) {
        const match = status.match(/\d+/);
        if (match) {
            const days = parseInt(match[0]);
            // 距离盛开时间越短，光圈进度越饱满
            return Math.max(0.3, Math.min(0.9, 1 - days / 10));
        }
    }
    if (s.includes("凋") || s.includes("落") || s.includes("休眠")) return 0.15;
    return 0.5;
};

// 🎨 辅助函数：为不同进度圆环派发生命周期演色
const getProgressColor = (status?: string) => {
    if (!status) return "#6E7268"; // 默认标本灰
    const s = status.toLowerCase();
    if (s.includes("盛开") || s.includes("正盛") || s.includes("繁花"))
        return "#3A5A40"; // 标本深绿
    if (s.includes("含苞") || s.includes("绽") || s.includes("预计"))
        return "#BC4749"; // 花苞玫红
    if (s.includes("凋") || s.includes("落") || s.includes("休眠"))
        return "#A3704C"; // 胡桃枯褐
    return "#6E7268";
};

// 🎨 辅助函数：格式化输出極简的两行文字注释底栏
const getStatusText = (status?: string) => {
    if (!status) return "考察中";
    const s = status.toLowerCase();
    if (s.includes("盛开") || s.includes("正盛")) return "繁花正盛";
    if (s.includes("含苞")) return "含苞待放";
    if (s.includes("凋") || s.includes("落")) return "落红委地";
    if (s.includes("预计") || s.includes("天")) {
        const match = status.match(/\d+/);
        return match ? `距盛开 ${match[0]} 天` : status;
    }
    return status;
};

// ② 关键排序逻辑：根据花朵当前开放进度（离盛开越近，排得越靠前）进行横向降序排序
const sortedPredictionList = computed(() => {
    const list = [...locationStore.locations];
    return list.sort((a, b) => {
        const progressA = getProgressValue(a.bloom_status);
        const progressB = getProgressValue(b.bloom_status);
        return progressB - progressA; // 降序：100% ➔ 80% ➔ 10%
    });
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

const postTitle = (title?: Title | null) => getTitleByName(title);

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
    padding: $md-space-4 $md-space-4 88px;
}

/* ── ① 顶部精选图卷轮播（微调为 16:10 左右的宽幅横幅，与下方圆环拉开反差） ── */
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
    height: 160px; /* 略微收窄高度，形成宽幅横长画幅 */
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
    background: rgba(42, 44, 36, 0.75);
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

/* ── 区块标题 ── */
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

/* ── ② 中间物候预测：重塑为极致清爽的横向进度星环流（CSS3 锥形渐变实现） ── */
.predict-scroll {
    width: 100%;
    white-space: nowrap;
    padding: $md-space-1 0;
}
.predict-list {
    display: inline-flex;
    gap: $md-space-4; /* 拉开间距 */
    padding: 4px $md-space-4;
}
.predict-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 64px;
    transition: opacity 0.2s;
}
.predict-item--hover {
    opacity: 0.75;
}

/* 进度环容器：使用 conic-gradient 绘制超细进度色圈（约 1.5px stroke） */
.predict-ring-container {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.04);
}

/* 内缩空心遮罩：仅留 ~1.5px 可见环线 */
.predict-ring-inner {
    width: 49px;
    height: 49px;
    border-radius: 50%;
    background: #faf8f5;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 核心花卉头像（占据圆盘大部分面积） */
.predict-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #efece4;
}

/* 两行极简注释样式 */
.predict-name {
    font-size: 12px;
    font-weight: 700;
    color: $md-on-surface;
    margin-top: 6px;
    line-height: 1.2;
    width: 100%;
    text-align: center;
    @include md-ellipsis(1);
}
.predict-status-txt {
    font-size: 10px;
    font-weight: 600;
    margin-top: 2px;
    line-height: 1.1;
    width: 100%;
    text-align: center;
    @include md-ellipsis(1);
}

/* ── ③ 底部采风手札流 ── */
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
    flex-shrink: 0;
    white-space: nowrap;
}
.post__name-row {
    display: flex;
    align-items: center;
    gap: 5px;
}
.post__title-tag {
    display: inline-block;
    padding: 0 8px;
    border-radius: $md-shape-full;
    border: 1px solid;
    flex-shrink: 0;
    height: 18px;
    line-height: 18px;
    text-align: center;
}
.post__title-tag-txt {
    font-size: 10px;
    font-weight: 700;
    vertical-align: middle;
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
    gap: $md-space-3;
    border-top: 1px dashed #efece4;
    padding-top: $md-space-3;
}
.post__footer .post__tag {
    flex: 1;
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
    0% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.55);
    }
    70% {
        transform: scale(0.88);
    }
    100% {
        transform: scale(1);
    }
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
