<template>
    <view class="profile">
        <md-app-bar title="学者简牍" />

        <view class="profile__body">
            <md-card class="user-card" :padding="false">
                <view class="user-card__inner">
                    <view class="user-card__header">
                        <view class="user-card__avatar" @click="openEditSheet">
                            <image
                                v-if="authStore.user?.avatar_url"
                                class="user-card__avatar-img"
                                :src="authStore.user.avatar_url"
                                mode="aspectFill"
                            />
                            <view v-else class="user-card__avatar-seal">
                                <text class="user-card__avatar-char">{{
                                    authorNameInitial(authStore.user?.nickname)
                                }}</text>
                            </view>
                        </view>
                        <view class="user-card__meta">
                            <text class="user-card__name">{{
                                authStore.user?.nickname || "佚名学者"
                            }}</text>
                            <view
                                class="user-card__badge-label"
                                :style="{
                                    background: currentTitleInfo.bg,
                                    borderColor: currentTitleInfo.border,
                                }"
                            >
                                <text
                                    class="user-card__badge-text"
                                    :style="{ color: currentTitleInfo.color }"
                                    >{{ currentTitleInfo.label }}</text
                                >
                            </view>
                        </view>
                        <view class="user-card__edit-btn" hover-class="is-hover" @click="openEditSheet">
                            <text class="user-card__edit-txt">编辑</text>
                        </view>
                    </view>

                    <view class="user-card__stats">
                        <view class="user-card__stat-item">
                            <text class="user-card__stat-num">{{
                                authStore.user?.exp || 0
                            }}</text>
                            <text class="user-card__stat-label">考察经验</text>
                        </view>
                        <view class="user-card__stat-split"></view>
                        <view class="user-card__stat-item">
                            <text class="user-card__stat-num">{{
                                checkinStore.checkins.length
                            }}</text>
                            <text class="user-card__stat-label">寻芳次数</text>
                        </view>
                        <view class="user-card__stat-split"></view>
                        <view class="user-card__stat-item">
                            <text class="user-card__stat-num">{{
                                unlockedBadgesCount
                            }}</text>
                            <text class="user-card__stat-label">收录草木</text>
                        </view>
                    </view>
                </view>
            </md-card>

            <!-- 编辑资料底部弹窗 -->
            <view class="edit-sheet" :class="{ 'edit-sheet--visible': editSheetVisible }">
                <view class="edit-sheet__mask" @click="closeEditSheet" />
                <view class="edit-sheet__panel" @click.stop>
                    <view class="edit-sheet__head">
                        <text class="edit-sheet__title">编辑资料</text>
                        <view class="edit-sheet__close" hover-class="is-hover" @click="closeEditSheet">
                            <text>✕</text>
                        </view>
                    </view>

                    <!-- 头像区 -->
                    <view class="edit-sheet__avatar-wrap" @click="chooseAvatar">
                        <image
                            v-if="editAvatarUrl"
                            class="edit-sheet__avatar-img"
                            :src="editAvatarUrl"
                            mode="aspectFill"
                        />
                        <view v-else class="edit-sheet__avatar-placeholder">
                            <text class="edit-sheet__avatar-char">{{
                                authorNameInitial(authStore.user?.nickname)
                            }}</text>
                        </view>
                        <view class="edit-sheet__avatar-hint">
                            <text>更换头像</text>
                        </view>
                    </view>

                    <!-- 昵称输入 -->
                    <view class="edit-sheet__field">
                        <text class="edit-sheet__label">昵称</text>
                        <input
                            class="edit-sheet__input"
                            :value="editNickname"
                            placeholder="输入新昵称"
                            :maxlength="20"
                            @input="(e: any) => editNickname = e.detail.value"
                        />
                    </view>

                    <view class="edit-sheet__actions">
                        <view
                            class="edit-sheet__save"
                            :class="{ 'is-disabled': isSaving }"
                            hover-class="is-hover"
                            @click="saveProfile"
                        >
                            <text>{{ isSaving ? '保存中...' : '保存' }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <md-card class="growth-card" :padding="false">
                <view class="growth-card__inner">
                    <text class="growth-card__title">草木穷理进度</text>

                    <view class="growth-card__bar-container">
                        <view class="growth-card__bar-track">
                            <view
                                class="growth-card__bar-fill"
                                :style="{ width: expPercent + '%' }"
                            ></view>
                        </view>
                        <view class="growth-card__scale-marks"></view>
                    </view>

                    <view class="growth-card__footer">
                        <text class="growth-card__level"
                            >修业品级：第 {{ currentLevel }} 卷</text
                        >
                        <text class="growth-card__percent"
                            >{{ expPercent }}%</text
                        >
                    </view>
                </view>
            </md-card>

            <view class="section">
                <view class="section__header">
                    <text class="section__title">历次考察手札录</text>
                    <text class="section__more" @click="goUserDetail"
                        >翻阅全部</text
                    >
                </view>

                <view class="my-posts">
                    <md-card
                        v-for="post in myVisiblePosts"
                        :key="post.id"
                        class="post-card"
                        :padding="false"
                    >
                        <view class="post-card__wrapper">
                            <view class="post-card__left">
                                <text class="post-card__flower"
                                    >品类 ·
                                    {{
                                        locationSpecies(post.location_id)
                                    }}</text
                                >
                                <text class="post-card__content">{{
                                    post.content
                                }}</text>
                                <view class="post-card__footer-meta">
                                    <text class="post-card__time">{{
                                        formatTime(post.created_at)
                                    }}</text>
                                    <text class="post-card__actions-count"
                                        >赞 {{ post.likes_count }} · 评
                                        {{ post.comments_count || 0 }}</text
                                    >
                                </view>
                            </view>
                            <view
                                v-if="post.images?.length"
                                class="post-card__right"
                            >
                                <image
                                    :src="post.images[0]"
                                    mode="aspectFill"
                                    class="post-card__thumb"
                                />
                            </view>
                        </view>
                    </md-card>

                    <view v-if="!myVisiblePosts.length" class="empty-holder">
                        <text class="empty-holder__text"
                            >简牍上尚无墨宝记录。</text
                        >
                    </view>
                </view>
            </view>
        </view>

        <bottom-action-bar current="profile" />
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCheckinStore } from "@/stores/checkin";
import { useLocationStore } from "@/stores/location";
import { useAchievementStore } from "@/stores/achievement";
import { useAuthStore } from "@/stores/auth";
import { getCurrentTitle, getTitleByName } from "@/utils/title";
import { mockTitles } from "@/services/mockData";
import { api } from "@/services/api";

const checkinStore = useCheckinStore();
const locationStore = useLocationStore();
const achievementStore = useAchievementStore();
const authStore = useAuthStore();

// 编辑资料底部弹窗状态
const editSheetVisible = ref(false);
const editNickname = ref('');
const editAvatarUrl = ref('');
const isSaving = ref(false);

const openEditSheet = () => {
    editNickname.value = authStore.user?.nickname || '';
    editAvatarUrl.value = authStore.user?.avatar_url || '';
    editSheetVisible.value = true;
};

const closeEditSheet = () => {
    editSheetVisible.value = false;
};

const chooseAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const filePath = res.tempFilePaths[0];
            try {
                const uploadRes = await api.users.uploadAvatar(filePath);
                editAvatarUrl.value = uploadRes.data?.url || filePath;
            } catch {
                editAvatarUrl.value = filePath;
            }
        },
    });
};

const saveProfile = async () => {
    if (isSaving.value) return;
    isSaving.value = true;
    try {
        await authStore.updateProfile({
            nickname: editNickname.value || undefined,
            avatar_url: editAvatarUrl.value || undefined,
        });
        uni.showToast({ title: '保存成功', icon: 'success', duration: 1500 });
        closeEditSheet();
        checkinStore.loadCheckins();
    } finally {
        isSaving.value = false;
    }
};

// 动态计算成就与进化称号系统
const unlockedBadgesCount = computed(() => {
    const uniqueSpecies = new Set(
        checkinStore.checkins.map((c) => locationSpecies(c.location_id)),
    );
    uniqueSpecies.delete("未知");
    return uniqueSpecies.size;
});

const exp = computed(() => (authStore.user as any)?.exp ?? 0);
const currentLevel = computed(() => Math.floor(exp.value / 100) + 1);
const expPercent = computed(() => exp.value % 100);

// 优先用后端颁发的称号；后端不可用时基于本地不同花种数推算
const currentTitleInfo = computed(() => {
    if (achievementStore.titles.length > 0) {
        return getCurrentTitle(achievementStore.titles);
    }
    const localBest = mockTitles
        .filter((t) => t.requirement <= unlockedBadgesCount.value)
        .sort((a, b) => b.requirement - a.requirement)[0];
    return getTitleByName(localBest);
});

const myVisiblePosts = computed(() => {
    return checkinStore.checkins.slice(0, 3);
});

const authorNameInitial = (name?: string) => (name ? name[0] : "访");

const locationSpecies = (locationId?: number) => {
    const item = locationStore.locations.find((l) => l.id === locationId);
    return item?.flower_species || "未知";
};

const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
};

const goUserDetail = () => {
    // 跳往完整列表页逻辑
    uni.navigateTo({ url: "/pages/user-detail/user-detail" });
};

onMounted(async () => {
    await Promise.all([
        locationStore.loadLocations(),
        checkinStore.loadCheckins(),
        achievementStore.loadTitles(),
    ]);
});
</script>

<style scoped lang="scss">
.profile {
    min-height: 100vh;
    background: $md-background;
}
.profile__body {
    padding: $md-space-4 $md-space-4 100px;
    display: flex;
    flex-direction: column;
    gap: $md-space-4;
}

/* ── 个人卡片（古典文书印章质感） ── */
.user-card {
    background: #faf8f5 !important;
    border: 1px solid #d8d3c5 !important;
    border-radius: $md-shape-lg !important;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.03) !important;
}
.user-card__inner {
    padding: $md-space-4;
}
.user-card__header {
    display: flex;
    align-items: center;
    gap: $md-space-4;
    margin-bottom: $md-space-4;
}
/* 修正点：将现代圆形改成边缘带dashed圈线、富有金石阳刻感的盖章默认头像 */
.user-card__avatar {
    width: 54px;
    height: 54px;
    border-radius: 4px;
    border: 1px solid #bc4749; /* 火漆红边框 */
    padding: 2px;
    background: #faf8f5;
}
.user-card__avatar-seal {
    width: 100%;
    height: 100%;
    border: 1px dashed rgba(188, 71, 73, 0.5);
    background: #fadad6; /* 淡淡的朱砂红底 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bc4749;
}
.user-card__avatar-char {
    font-size: 22px;
    font-weight: 700;
}
.user-card__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.user-card__name {
    font-size: 18px;
    font-weight: 700;
    color: $md-on-surface;
}
/* 称号配饰：彩色等级标签 */
.user-card__badge-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;
    padding: 0 10px;
    border-radius: $md-shape-full;
    height: 20px;
    flex-shrink: 0;
}
.user-card__badge-text {
    font-size: 11px;
    font-weight: 700;
}
/* 修正点：博古架栅格编排 */
.user-card__stats {
    display: flex;
    align-items: center;
    border-top: 1px dashed #d8d3c5;
    padding-top: $md-space-3;
}
.user-card__stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.user-card__stat-num {
    font-family: "Georgia", serif;
    font-size: 20px;
    font-weight: 700;
    color: #3a5a40;
}
.user-card__stat-label {
    font-size: 11px;
    color: #6e7268;
    margin-top: 2px;
}
.user-card__stat-split {
    width: 1px;
    height: 20px;
    background: #d8d3c5;
}

/* ── 成长测绘量尺卡片 ── */
.growth-card {
    background: #faf8f5 !important;
    border: 1px solid #d8d3c5 !important;
    border-radius: $md-shape-lg !important;
    box-shadow: 0 2px 6px rgba(58, 42, 32, 0.03) !important;
}
.growth-card__inner {
    padding: $md-space-4;
}
.growth-card__title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #3a5a40;
    margin-bottom: $md-space-3;
}
/* 修正点：重构水泥色进度条为极细考工测绘刻度尺 */
.growth-card__bar-container {
    position: relative;
    padding-bottom: 6px;
}
.growth-card__bar-track {
    height: 8px;
    background: #efece4;
    border-radius: $md-shape-xs;
    border: 1px solid #d8d3c5;
    overflow: hidden;
}
.growth-card__bar-fill {
    height: 100%;
    background: #a3704c; /* 胡桃褐成长填充 */
    border-radius: $md-shape-xs;
}
.growth-card__scale-marks {
    height: 4px;
    margin-top: 2px;
    background-image: linear-gradient(to right, #8b867a 1px, transparent 1px);
    background-size: 10% 100%; /* 模拟十等分复古刻度尺脚线 */
    opacity: 0.4;
}
.growth-card__footer {
    display: flex;
    justify-content: space-between;
    margin-top: $md-space-2;
    font-size: 11px;
    color: #6e7268;
}
.growth-card__level {
    font-weight: 500;
}
.growth-card__percent {
    font-family: "Georgia", serif;
    font-weight: 600;
}

/* ── 手札历史卡片流（大厂错题本 ➔ 杂志式图文排版） ── */
.section {
    margin-top: $md-space-2;
}
.section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $md-space-3;
}
.section__title {
    font-size: 14px;
    font-weight: 600;
    color: #3a5a40;
}
.section__more {
    font-size: 12px;
    color: #a3704c;
    font-weight: 600;
}
.my-posts {
    display: flex;
    flex-direction: column;
    gap: $md-space-3;
}
.post-card {
    background: #faf8f5 !important;
    border: 1px solid #d8d3c5 !important;
    border-radius: $md-shape-lg !important;
}
.post-card__wrapper {
    padding: $md-space-3 $md-space-4;
    display: flex;
    gap: $md-space-4;
}
.post-card__left {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.post-card__flower {
    font-size: 11px;
    font-weight: 600;
    color: #3a5a40;
    background: #e6eddf;
    padding: 1px 6px;
    border-radius: $md-shape-sm;
    align-self: flex-start;
    margin-bottom: 6px;
}
.post-card__content {
    font-size: 13px;
    line-height: 1.48;
    color: $md-on-surface;
    @include md-ellipsis(2); /* 限制2行，保证杂志化图文排版对齐 */
}
.post-card__footer-meta {
    display: flex;
    justify-content: space-between;
    margin-top: $md-space-3;
    font-size: 11px;
    color: #6e7268;
}
.post-card__right {
    width: 75px;
    height: 56px;
    flex-shrink: 0;
    border: 1px solid #d8d3c5;
    border-radius: $md-shape-sm;
    overflow: hidden;
    background: #efece4;
}
.post-card__thumb {
    width: 100%;
    height: 100%;
}
.empty-holder {
    text-align: center;
    padding: $md-space-6 0;
}
.empty-holder__text {
    font-size: 12px;
    color: #6e7268;
}

/* ── 头像图片（自定义头像时替换字符占位） ── */
.user-card__avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 2px;
}

/* ── 编辑按钮 ── */
.user-card__edit-btn {
    margin-left: auto;
    padding: 4px 10px;
    border-radius: $md-shape-full;
    border: 1px solid #d8d3c5;
    background: #faf8f5;
}
.user-card__edit-txt {
    font-size: 11px;
    font-weight: 600;
    color: #6e7268;
}

/* ── 编辑资料底部弹窗（与 comment-sheet 同结构） ── */
.edit-sheet {
    position: fixed;
    left: 0; right: 0; top: 0; bottom: 0;
    z-index: 200;
    pointer-events: none;
}
.edit-sheet--visible {
    pointer-events: auto;
}
.edit-sheet__mask {
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity $md-duration-medium $md-easing-standard;
}
.edit-sheet--visible .edit-sheet__mask {
    opacity: 1;
}
.edit-sheet__panel {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    background: $md-surface;
    border-radius: $md-shape-lg $md-shape-lg 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    transform: translateY(100%);
    transition: transform $md-duration-medium $md-easing-standard;
}
.edit-sheet--visible .edit-sheet__panel {
    transform: translateY(0);
}
.edit-sheet__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $md-space-4;
    border-bottom: 1px solid $md-outline-variant;
}
.edit-sheet__title {
    @include md-type('title-medium');
    color: $md-on-surface;
}
.edit-sheet__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $md-shape-full;
    color: $md-on-surface-variant;
}

/* 头像区 */
.edit-sheet__avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $md-space-2;
    padding: $md-space-5 0 $md-space-4;
}
.edit-sheet__avatar-img {
    width: 72px;
    height: 72px;
    border-radius: 4px;
    border: 1px solid #bc4749;
}
.edit-sheet__avatar-placeholder {
    width: 72px;
    height: 72px;
    border-radius: 4px;
    border: 1px solid #bc4749;
    background: #fadad6;
    display: flex;
    align-items: center;
    justify-content: center;
}
.edit-sheet__avatar-char {
    font-size: 28px;
    font-weight: 700;
    color: #bc4749;
}
.edit-sheet__avatar-hint {
    font-size: 12px;
    color: #6e7268;
}

/* 昵称输入区 */
.edit-sheet__field {
    padding: $md-space-3 $md-space-4;
    border-top: 1px solid $md-outline-variant;
}
.edit-sheet__label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: $md-on-surface-variant;
    margin-bottom: $md-space-2;
    letter-spacing: 0.3px;
}
.edit-sheet__input {
    width: 100%;
    height: 44px;
    padding: 0 $md-space-4;
    background: $md-surface-container;
    border-radius: $md-shape-sm;
    @include md-type('body-medium');
    color: $md-on-surface;
    box-sizing: border-box;
}

/* 操作按钮区 */
.edit-sheet__actions {
    padding: $md-space-4;
}
.edit-sheet__save {
    height: 44px;
    border-radius: $md-shape-full;
    background: $md-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    @include md-type('label-large');
    color: $md-on-primary;
}
.edit-sheet__save.is-disabled {
    opacity: 0.5;
}
.is-hover {
    opacity: 0.7;
}
</style>
