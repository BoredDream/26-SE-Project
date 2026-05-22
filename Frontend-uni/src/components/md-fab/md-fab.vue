<template>
  <view
    class="md-fab"
    :class="{ 'is-extended': extended }"
    hover-class="is-hover"
    @click="$emit('click')"
  >
    <text class="md-fab__icon"><slot name="icon">+</slot></text>
    <text v-if="extended" class="md-fab__label"><slot /></text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ extended?: boolean }>(), { extended: false })
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped lang="scss">
.md-fab {
  position: fixed;
  right: $md-space-4;
  bottom: 96px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 56px;
  height: 56px;
  border-radius: $md-shape-lg;
  background: $md-primary-container;
  color: $md-on-primary-container;
  @include md-elevation(3);
  transition: opacity $md-duration-short $md-easing-standard;
}
.is-hover { opacity: 0.9; }
.is-extended { padding: 0 $md-space-5; }
.md-fab__icon {
  font-size: 28px;
  line-height: 1;
}
.md-fab__label {
  margin-left: $md-space-2;
  @include md-type('label-large');
}
</style>
