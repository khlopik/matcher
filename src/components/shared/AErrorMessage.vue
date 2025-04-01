<script setup>
import { computed } from "vue";

const props = defineProps({
  v: {
    type: Object,
  },
  eachIndex: {
    type: Number,
  },
  eachField: {
    type: String,
  },
});

const errorMessage = computed(() => {
  if (!props.v) return null;

  if (props.v.$dirty === false) return null;

  if (Number.isInteger(props.eachIndex)) {
    const message =
      props.v.$each.$response.$errors[props.eachIndex][props.eachField]?.[0]
        ?.$message;
    return message || null;
  }

  if (props.v.$errors) {
    return props.v?.$errors?.[0]?.$message || null;
  }

  return props.v.$message || null;
});
</script>

<template>
  <transition name="collapse">
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </transition>
</template>

<style scoped lang="scss">
.error-message {
  color: var(--c-negative-color);
}

/* Add these styles to your component's <style> section */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.5s;
  max-height: 50px; /* Adjust based on your error message height */
  overflow: hidden;
  opacity: 1;
  transform-origin: top;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0);
}
</style>
