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
</style>
