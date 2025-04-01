<script setup>
import { computed } from "vue";

const props = defineProps({
  value: {
    type: Number,
  },
  questionIndex: {
    type: Number,
  },
  answerIndex: {
    type: Number,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change"]);

const STRING_VALUE = {
  NEGATIVE: "negative",
  MOSTLY_NEGATIVE: "mostly-negative",
  NEUTRAL: "neutral",
  MOSTLY_POSITIVE: "mostly-positive",
  POSITIVE: "positive",
};

const VALUE_BY_STRING_VALUE = {
  [STRING_VALUE.NEGATIVE]: -2,
  [STRING_VALUE.MOSTLY_NEGATIVE]: -1,
  [STRING_VALUE.NEUTRAL]: 0,
  [STRING_VALUE.MOSTLY_POSITIVE]: 1,
  [STRING_VALUE.POSITIVE]: 2,
};

const isChecked = computed(() => ({
  [STRING_VALUE.NEGATIVE]:
    props.value === VALUE_BY_STRING_VALUE[STRING_VALUE.NEGATIVE],
  [STRING_VALUE.MOSTLY_NEGATIVE]:
    props.value === VALUE_BY_STRING_VALUE[STRING_VALUE.MOSTLY_NEGATIVE],
  [STRING_VALUE.NEUTRAL]:
    props.value === VALUE_BY_STRING_VALUE[STRING_VALUE.NEUTRAL],
  [STRING_VALUE.MOSTLY_POSITIVE]:
    props.value === VALUE_BY_STRING_VALUE[STRING_VALUE.MOSTLY_POSITIVE],
  [STRING_VALUE.POSITIVE]:
    props.value === VALUE_BY_STRING_VALUE[STRING_VALUE.POSITIVE],
}));

const radioName = computed(
  () => `q-${props.questionIndex}-a-${props.answerIndex}-attitude`,
);

const onInput = (event) => {
  console.log("== onInput() ==");
  const { value } = event.target;
  // const value = VALUE_BY_STRING_VALUE[stringValue];
  console.log("value: ", value);
  emit("change", +value);
};
</script>

<template>
  <div class="rating-selector">
    <span class="rating-label">{{ $t("message.attitudeLabel") }}</span>
    <div class="rating-options">
      <label class="rating-option">
        <input
          type="radio"
          :name="radioName"
          :value="VALUE_BY_STRING_VALUE[STRING_VALUE.NEGATIVE]"
          :checked="isChecked[STRING_VALUE.NEGATIVE]"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="rating-text">{{ $t("button.negative") }}</span>
      </label>
      <label class="rating-option">
        <input
          type="radio"
          :name="radioName"
          :value="VALUE_BY_STRING_VALUE[STRING_VALUE.MOSTLY_NEGATIVE]"
          :checked="isChecked[STRING_VALUE.MOSTLY_NEGATIVE]"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="rating-text">{{ $t("button.mostlyNegative") }}</span>
      </label>
      <label class="rating-option">
        <input
          type="radio"
          :name="radioName"
          :value="VALUE_BY_STRING_VALUE[STRING_VALUE.NEUTRAL]"
          :checked="isChecked[STRING_VALUE.NEUTRAL]"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="rating-text">{{ $t("button.neutral") }}</span>
      </label>
      <label class="rating-option">
        <input
          type="radio"
          :name="radioName"
          :value="VALUE_BY_STRING_VALUE[STRING_VALUE.MOSTLY_POSITIVE]"
          :checked="isChecked[STRING_VALUE.MOSTLY_POSITIVE]"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="rating-text">{{ $t("button.mostlyPositive") }}</span>
      </label>
      <label class="rating-option">
        <input
          type="radio"
          :name="radioName"
          :value="VALUE_BY_STRING_VALUE[STRING_VALUE.POSITIVE]"
          :checked="isChecked[STRING_VALUE.POSITIVE]"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="rating-text">{{ $t("button.positive") }}</span>
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Rating section
.rating-selector {
  margin-top: 0.5rem;

  .rating-label {
    display: block;
    font-size: 0.85rem;
    color: var(--c-light-text);
    margin-bottom: 0.5rem;
  }
}

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rating-option {
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  input[type="radio"] {
    display: none;
  }

  .rating-text {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    background: var(--c-background-color);
    border: 1px solid var(--c-light-border);
    transition: all 0.2s ease;
  }

  // Styling for the different rating options
  input[type="radio"]:checked + .rating-text {
    color: var(--color-text);
    font-weight: 500;
  }

  input[type="radio"]:disabled + .rating-text {
    opacity: 0.6;
  }

  input[value="-2"]:checked + .rating-text {
    background: var(--c-negative-color);
    border-color: var(--c-negative-color);
  }

  input[value="-1"]:checked + .rating-text {
    background: var(--c-mostly-negative-color);
    border-color: var(--c-mostly-negative-color);
  }

  input[value="0"]:checked + .rating-text {
    background: var(--c-neutral-color);
    border-color: var(--c-neutral-color);
  }

  input[value="1"]:checked + .rating-text {
    background: var(--c-mostly-positive-color);
    border-color: var(--c-mostly-positive-color);
  }

  input[value="2"]:checked + .rating-text {
    background: var(--c-positive-color);
    border-color: var(--c-positive-color);
  }

  &:hover .rating-text {
    border-color: var(--c-secondary-color);
  }
}
</style>
