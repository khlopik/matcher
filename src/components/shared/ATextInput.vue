<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AErrorMessage from "@/components/shared/AErrorMessage.vue";

const props = defineProps({
  value: { type: String },
  placeholder: { type: String },
  v: { type: Object },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:value"]);

const { t } = useI18n();
const localizedPlaceholder = computed(() =>
  props.placeholder ? t(props.placeholder) : null,
);

const onInput = (event) => {
  console.log("== onInput() ==");
  emit("update:value", event.target.value);
};
</script>

<template>
  <div class="input-wrapper">
    <input
      type="text"
      :value="value"
      :placeholder="localizedPlaceholder"
      :disabled="disabled"
      class="text-input"
      @input="onInput"
    />
    <a-error-message :v="v" />
  </div>
</template>

<style scoped lang="scss">
.input-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;

  .text-input {
    flex: 1;
    border: none;
    border-radius: 5px;
    background: transparent;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--c-dark-text);
    border-bottom: 2px solid var(--c-light-border);

    &:focus {
      outline: none;
      border-bottom: 2px solid var(--c-primary-color);
    }

    &:disabled {
      background: var(--c-light-border);
      color: var(--c-light-text);
    }
  }
}
</style>
