<template>
  <div class="flower-suggest">
    <div class="flower-header">花卉联想</div>
    <div v-if="filteredSpecies.length" class="flower-list">
      <button
        v-for="name in filteredSpecies"
        :key="name"
        class="flower-chip"
        @click="selectFlower(name)">
        {{ name }}
      </button>
    </div>
    <div v-else class="flower-empty">
      没有匹配到相关花卉，试试其他关键词。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ query: string }>();
const emit = defineEmits<{ (e: 'select', flower: string): void }>();

const flowerSpecies = [
  '玫瑰',
  '百合',
  '向日葵',
  '牡丹',
  '荷花',
  '樱花',
  '兰花',
  '郁金香',
  '紫藤',
  '康乃馨',
  '桃花',
  '茶花',
  '木槿',
  '海棠',
  '杜鹃花'
];

const filteredSpecies = computed(() => {
  const keyword = props.query.trim().toLowerCase();
  if (!keyword) {
    return flowerSpecies.slice(0, 8);
  }
  return flowerSpecies.filter(species => species.includes(keyword));
});

const selectFlower = (flower: string) => {
  emit('select', flower);
};
</script>

<style scoped>
.flower-suggest {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 20px 40px rgba(84, 131, 80, 0.08);
  border: 1px solid rgba(105, 152, 83, 0.14);
}

.flower-header {
  font-size: 1rem;
  font-weight: 700;
  color: #3d5d38;
  margin-bottom: 12px;
}

.flower-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flower-chip {
  border: none;
  border-radius: 18px;
  padding: 10px 14px;
  background: #f4fbf4;
  color: #3f6d42;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flower-chip:hover {
  transform: translateY(-1px);
  background: #e8f6e7;
}

.flower-empty {
  color: #7a8b76;
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
