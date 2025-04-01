<script setup>
import { computed, watch } from "vue";
import Attitude from "@/components/Attitude.vue";
import AErrorMessage from "@/components/shared/AErrorMessage.vue";
import ATextInput from "@/components/shared/ATextInput.vue";

const props = defineProps({
  text: {
    type: String,
  },
  index: {
    type: Number,
  },
  questionIndex: {
    type: Number,
  },
  attitude: {
    type: Number,
  },
  errors: {
    type: Object,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["delete", "update:text", "update:attitude"]);

const answerTextName = computed(() => `answers[${props.index}].answer.text`);

// const { value: answerText } = useField(answerTextName.value);
//
// watch(answerText, (newValue) => {
//   console.log("== watch answerText() ==");
//   console.log("newValue: ", newValue);
//   emit("update:text", newValue);
// });

const answerAttitudeName = computed(
  () => `answers[${props.index}].answer.attitude`,
);

// const { value: answerAttitude } = useField(answerAttitudeName.value);

// watch(answerAttitude, (newValue) => {
//   emit("update:attitude", newValue);
// });

const deleteAnswer = () => {
  console.log("== Answer - deleteAnswer() ==");
  emit("delete");
};

const onAnswerInput = (event) => {
  const {
    target: { value },
  } = event;
  emit("update:text", value);
};

const changeAttitude = (value) => {
  console.log("== changeAttitude() ==");
  console.log("value: ", value);
  emit("update:attitude", value);
};
</script>

<template>
  <div class="answer-block">
    <div class="answer-input-container">
      <a-text-input
        :value="text"
        class="answer-input"
        :placeholder="$t('message.answerPlaceholder')"
        :disabled="disabled"
        @input="onAnswerInput"
      />
      <button type="button" class="btn-delete-answer" @click="deleteAnswer">
        ×
      </button>
    </div>
    <a-error-message :v="errors" :each-index="index" each-field="text" />
    <attitude
      :value="attitude"
      :question-index="questionIndex"
      :answer-index="index"
      :disabled="disabled"
      :errors="errors"
      @change="changeAttitude"
    />
    <a-error-message :v="errors" :each-index="index" each-field="attitude" />
  </div>
</template>

<style lang="scss" scoped>
.answer-block {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--c-section-background-color);
  border-radius: 6px;
  border-left: 3px solid var(--c-secondary-color);
}

.answer-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .answer-input {
    flex: 1;
    border: 1px solid var(--c-light-border);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: var(--c-secondary-color);
    }
  }

  .btn-delete-answer {
    background: none;
    border: none;
    color: var(--c-light-text);
    cursor: pointer;
    font-size: 1.2rem;
    margin-left: 0.5rem;
    opacity: 0.6;

    &:hover {
      opacity: 1;
      color: var(--c-negative-color);
    }
  }
}
</style>
