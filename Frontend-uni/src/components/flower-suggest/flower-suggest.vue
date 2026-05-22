<template>
  <view class="flower-suggest">
    <text class="flower-suggest__title">花卉联想</text>
    <view v-if="filteredSpecies.length" class="flower-suggest__list">
      <md-chip
        v-for="name in filteredSpecies"
        :key="name"
        :label="name"
        @click="selectFlower(name)"
      />
    </view>
    <view v-else class="flower-suggest__empty">
      <text>没有匹配到相关花卉，试试其他关键词。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ query: string }>()
const emit = defineEmits<{ (e: 'select', flower: string): void }>()

const flowerSpecies = [
  '玫瑰', '百合', '向日葵', '牡丹', '荷花', '樱花', '兰花', '郁金香', '紫藤',
  '康乃馨', '桃花', '茶花', '木槿', '海棠', '杜鹃花',
]

const filteredSpecies = computed(() => {
  const keyword = props.query.trim().toLowerCase()
  if (!keyword) return flowerSpecies.slice(0, 8)
  return flowerSpecies.filter(species => species.includes(keyword))
})

const selectFlower = (flower: string) => {
  emit('select', flower)
}
</script>

<style scoped lang="scss">
.flower-suggest {
  background: $md-surface;
  border-radius: $md-shape-lg;
  padding: $md-space-4;
  @include md-elevation(1);
}
.flower-suggest__title {
  display: block;
  margin-bottom: $md-space-3;
  @include md-type('title-small');
  color: $md-on-surface;
}
.flower-suggest__list {
  display: flex;
  flex-wrap: wrap;
  gap: $md-space-2;
}
.flower-suggest__empty {
  @include md-type('body-medium');
  color: $md-on-surface-variant;
}
</style>
