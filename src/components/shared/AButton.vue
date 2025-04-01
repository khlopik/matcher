<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  tooltip: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disabledTooltip: {
    type: String,
  },
});

const emit = defineEmits(["click"]);

const dynamicClasses = computed(() => ({
  disabled: props.disabled,
}));

const title = computed(() =>
  props.disabled ? props.disabledTooltip : props.tooltip,
);

const onClick = () => {
  if (props.disabled) return;

  emit("click");
};
</script>

<template>
  <button
    class="button__wrapper"
    :class="dynamicClasses"
    :title="title ? $t(title) : null"
    :disabled="disabled"
    @click="onClick"
  >
    <span class="button__text">{{ $t(text) }}</span>
  </button>
</template>

<style scoped lang="scss">
.button__wrapper {
  all: unset;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--c-light-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--c-button-general);

  .button__text {
    transition: all 0.2s ease;
  }

  &:disabled {
    cursor: default;
  }

  &:disabled .button__text {
    color: var(--c-light-text);
  }

  &:hover:not(:disabled) {
    background: var(--c-button-general-hover);
    border-color: var(--c-button-general-border-hover);
  }
}
</style>
