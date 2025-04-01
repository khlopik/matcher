<script setup>
import { useI18n } from "vue-i18n";

const { locale, t } = useI18n();

const setUa = () => {
  locale.value = "ua";
};

const setEn = () => {
  locale.value = "en";
};
</script>

<template>
  <div class="languages">
    <button @click="setUa">UA</button>
    <button @click="setEn">EN</button>
  </div>
</template>

<style scoped lang="scss"></style>
