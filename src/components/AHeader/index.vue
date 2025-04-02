<script setup>
import Localization from "@/components/Localization.vue";
import AButton from "@/components/shared/AButton.vue";
import { computed } from "vue";

const props = defineProps({
  yourName: {
    type: String,
  },
  partnerName: {
    type: String,
  },
  isConnected: {
    type: Boolean,
  },
  isDataChanged: {
    type: Boolean,
  },
  isDataExist: {
    type: Boolean,
    default: false,
  },
  isDataJustLoaded: {
    type: Boolean,
    default: false,
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save-data", "load-data", "change-name"]);

const saveData = () => {
  emit("save-data");
};

const loadData = () => {
  emit("load-data");
};

const connectionIndicatorClass = computed(() => ({
  offline: !props.isConnected,
  online: props.isConnected,
}));
</script>

<template>
  <header class="header">
    <localization />
    <i class="delimiter" />
    <template v-if="yourName">
      <div class="header__name-section">
        Вітаю, <span class="header__name">{{ yourName }}</span
        >!
        <a-button
          type="submit"
          text="button.change"
          class="header__small-gap"
          @click="emit('change-name')"
        />
      </div>
      <i class="delimiter" />
    </template>
    <div class="header__data-section">
      Дані:
      <a-button
        type="button"
        text="button.save"
        :disabled="!isDataChanged"
        tooltip="hint.save"
        disabled-tooltip="hint.disabledSave"
        @click="saveData"
      />
      <a-button
        type="button"
        text="button.load"
        :disabled="!isDataExist || isDataJustLoaded"
        class="header__small-gap"
        @click="loadData"
      />
    </div>
    <i class="delimiter" />
    <div class="header__connection-section">
      З'єднання:
      <i
        class="header__connection-indicator"
        :class="connectionIndicatorClass"
      />
      <p v-if="isConnected" class="header__small-gap">({{ partnerName }})</p>
    </div>
  </header>
</template>

<style scoped lang="scss">
header.header {
  position: sticky;
  top: 0;
  left: 0;
  margin-left: -1rem;
  padding: 0 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: calc(100% + 2rem);
  height: 48px;
  background: var(--c-header);
  box-shadow: 0px 10px 5px 0px rgba(44, 62, 80, 0.3);

  .delimiter {
    display: inline-block;
    width: 1px;
    height: calc(100% - 12px);
    margin: 6px 10px;
    background: var(--c-light-text);
    content: "";
    box-shadow: 0px 0px 2px 0px rgba(44, 62, 80, 0.5);
  }

  .header__name {
    font-weight: bold;
  }

  .header__small-gap {
    margin-left: 10px;
  }

  .header__connection-section {
    display: flex;
    align-items: center;
  }

  .header__connection-indicator {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 10px;
    border-radius: 50px;
    overflow: hidden;
    content: "";

    &.offline {
      background-color: #f00;
      box-shadow:
        rgba(0, 0, 0, 0.2) 0 -1px 7px 1px,
        inset #441313 0 -1px 9px,
        rgba(255, 0, 0, 0.5) 0 2px 12px;
    }

    &.online {
      background-color: #abff00;
      box-shadow:
        rgba(0, 0, 0, 0.2) 0 -1px 7px 1px,
        inset #304701 0 -1px 9px,
        #89ff00 0 2px 12px;
    }
  }
}
</style>
