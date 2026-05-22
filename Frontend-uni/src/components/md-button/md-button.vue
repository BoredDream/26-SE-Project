<template>
  <view
    class="md-button"
    :class="[`md-button--${variant}`, { 'is-disabled': disabled, 'is-block': block }]"
    :hover-class="disabled ? '' : 'is-hover'"
    :hover-stay-time="60"
    @click="onClick"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'filled' | 'tonal' | 'outlined' | 'text'
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'filled',
  disabled: false,
  block: false,
})

const emit = defineEmits<{ (e: 'click'): void }>()

function onClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<style scoped lang="scss">
.md-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 44px;
  padding: 0 $md-space-6;
  border-radius: $md-shape-full;
  @include md-type('label-large');
  transition: opacity $md-duration-short $md-easing-standard;
}
.is-block { display: flex; width: 100%; }
.is-hover { opacity: 0.86; }
.is-disabled {
  background: rgba(25, 29, 23, 0.1) !important;
  color: rgba(25, 29, 23, 0.38) !important;
  border-color: transparent !important;
}

.md-button--filled {
  background: $md-primary;
  color: $md-on-primary;
}
.md-button--tonal {
  background: $md-secondary-container;
  color: $md-on-secondary-container;
}
.md-button--outlined {
  background: transparent;
  color: $md-primary;
  border: 1px solid $md-outline;
}
.md-button--text {
  background: transparent;
  color: $md-primary;
  padding: 0 $md-space-3;
}
</style>
