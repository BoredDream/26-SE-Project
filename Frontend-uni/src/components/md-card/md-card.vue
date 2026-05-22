<template>
  <view
    class="md-card"
    :class="[`md-card--${variant}`, { 'is-padded': padding }]"
    :hover-class="clickable ? 'is-hover' : ''"
    @click="onClick"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'elevated' | 'filled' | 'outlined'
  clickable?: boolean
  padding?: boolean
}>(), {
  variant: 'elevated',
  clickable: false,
  padding: true,
})

const emit = defineEmits<{ (e: 'click'): void }>()

function onClick() {
  if (props.clickable) emit('click')
}
</script>

<style scoped lang="scss">
.md-card {
  box-sizing: border-box;
  border-radius: $md-shape-lg;
  overflow: hidden;
  transition: opacity $md-duration-short $md-easing-standard;
}
.is-padded { padding: $md-space-4; }
.is-hover { opacity: 0.92; }

.md-card--elevated {
  background: $md-surface;
  @include md-elevation(1);
}
.md-card--filled {
  background: $md-surface-container;
}
.md-card--outlined {
  background: $md-surface;
  border: 1px solid $md-outline-variant;
}
</style>
