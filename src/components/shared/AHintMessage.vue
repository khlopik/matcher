<script setup>
import { watch } from "vue";

const model = defineModel();
const props = defineProps({
  timeout: {
    type: Number,
    default: 5000,
  },
});

const clearModel = () => {
  console.log("== clearModel() ==");
  model.value = "";
};

watch(
  model,
  (newValue) => {
    console.log("== watch() ==");
    console.log("newValue: ", newValue);
    if (newValue && props.timeout) {
      setTimeout(clearModel, props.timeout);
    }
  },
  { immediate: true },
);
</script>

<template>
  <transition name="disappear">
    <div v-if="model" class="error-message">{{ model }}</div>
  </transition>
</template>

<style scoped lang="scss">
.error-message {
  color: var(--c-positive-color);
}

/* Add these styles to your component's <style> section */
.disappear-enter-active,
.disappear-leave-active {
  overflow: hidden;
  opacity: 1;
}

.disappear-leave-active {
  transition: opacity 3s;
}

.disappear-enter-from,
.disappear-leave-to {
  opacity: 0;
}
</style>
