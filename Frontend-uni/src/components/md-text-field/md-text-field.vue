<template>
  <view class="md-field" :class="{ 'is-focused': focused, 'is-disabled': disabled }">
    <text v-if="label" class="md-field__label">{{ label }}</text>
    <view class="md-field__box">
      <textarea
        v-if="type === 'textarea'"
        class="md-field__control md-field__control--area"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        placeholder-class="md-field__placeholder"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      />
      <input
        v-else
        class="md-field__control"
        :value="modelValue"
        :type="inputType"
        :password="type === 'password'"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        placeholder-class="md-field__placeholder"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      />
    </view>
    <text v-if="showCount && maxlength > 0" class="md-field__count">{{ valueLength }}/{{ maxlength }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  type?: 'text' | 'password' | 'number' | 'textarea'
  maxlength?: number
  disabled?: boolean
  showCount?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  maxlength: -1,
  disabled: false,
  showCount: false,
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const focused = ref(false)
const inputType = computed(() => (props.type === 'number' ? 'number' : 'text'))
const valueLength = computed(() => (props.modelValue || '').length)

function onInput(e: any) {
  emit('update:modelValue', e.detail.value)
}
</script>

<style scoped lang="scss">
.md-field {
  display: flex;
  flex-direction: column;
}
.md-field__label {
  @include md-type('label-medium');
  color: $md-on-surface-variant;
  margin-bottom: $md-space-2;
}
.md-field__box {
  background: $md-surface-container;
  border-radius: $md-shape-sm;
  border-bottom: 2px solid $md-outline-variant;
  padding: $md-space-3 $md-space-4;
  transition: border-color $md-duration-short $md-easing-standard;
}
.is-focused .md-field__box { border-bottom-color: $md-primary; }
.is-disabled .md-field__box { opacity: 0.5; }
.md-field__control {
  width: 100%;
  box-sizing: border-box;
  @include md-type('body-large');
  color: $md-on-surface;
  background: transparent;
}
.md-field__control--area { height: 120px; }
.md-field__placeholder { color: $md-on-surface-variant; }
.md-field__count {
  align-self: flex-end;
  margin-top: $md-space-1;
  @include md-type('body-small');
  color: $md-on-surface-variant;
}
</style>
