<template>
  <view
    class="md-chip"
    :class="{ 'is-selected': selected, 'is-disabled': disabled }"
    :hover-class="disabled ? '' : 'is-hover'"
    @click="onClick"
  >
    <slot>{{ label }}</slot>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  selected?: boolean
  disabled?: boolean
}>(), {
  selected: false,
  disabled: false,
})

const emit = defineEmits<{ (e: 'click'): void }>()

function onClick() {
  if (!props.disabled) emit('click')
}
</script>

<style scoped lang="scss">
.md-chip {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 34px;
  padding: 0 $md-space-3;
  border-radius: $md-shape-sm;
  border: 1px solid $md-outline-variant;
  background: transparent;
  color: $md-on-surface-variant;
  @include md-type('label-large');
  transition: background-color $md-duration-short $md-easing-standard;
}
.is-hover { opacity: 0.8; }
.is-selected {
  background: $md-secondary-container;
  color: $md-on-secondary-container;
  border-color: transparent;
}
.is-disabled { opacity: 0.4; }
</style>
