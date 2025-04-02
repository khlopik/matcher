<script setup>
import { useVuelidate } from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import Answer from "@/components/Answer.vue";
import { getValidators } from "@/helpers/validators.js";
import AErrorMessage from "@/components/shared/AErrorMessage.vue";
import ATextInput from "@/components/shared/ATextInput.vue";
import AButton from "@/components/shared/AButton.vue";

const i18n = useI18n();

const { required, minAnswers } = getValidators(i18n);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
  },
  answers: {
    type: Array,
  },
  isAddedToShared: {
    type: Boolean,
    default: false,
  },
  hasYourQuestionsAdditionFinished: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  "update-question-text",
  "update-answer-text",
  "update-answer-attitude",
  "add-answer",
  "delete-answer",
  "add-to-shared",
  "remove-from-shared",
  "remove-question",
]);

const BUTTON_TEXT = {
  ADD: "button.addToTheList",
  REMOVE: "button.removeFromTheList",
};

const text = computed(() => props.questionText);
const answerNumber = computed(() => props.answers.length);
const addRemoveButtonText = computed(() =>
  props.isAddedToShared ? BUTTON_TEXT.REMOVE : BUTTON_TEXT.ADD,
);
const addRemoveButtonDynamicClass = computed(() => ({
  green: !props.isAddedToShared,
  red: props.isAddedToShared,
}));

const rules = {
  questionText: { required },
  answers: {
    $each: helpers.forEach({
      text: {
        required,
      },
      attitude: { required },
    }),
  },
  answerNumber: { minAnswers: minAnswers(2) },
};

const $v = useVuelidate(rules, {
  questionText: text,
  answers: props.answers,
  answerNumber,
});

const number = computed(() => props.index + 1);

const onQuestionInput = (event) => {
  const {
    target: { value },
  } = event;

  emit("update-question-text", { questionId: props.id, text: value });
};

const addAnswer = () => {
  emit("add-answer", { questionId: props.id });
};

const onDeleteAnswer = (answerId) => {
  emit("delete-answer", {
    questionId: props.id,
    answerId,
  });
};

const removeQuestion = () => {
  console.log("== removeQuestion() ==");
  emit("remove-question", { questionId: props.id });
};

const onSubmit = async (values) => {
  if (props.isAddedToShared) {
    emit("remove-from-shared");
    return;
  }

  const result = await $v.value.$validate();
  console.log("result: ", result);

  if (!result) return;

  console.log("values: ", values);
  emit("add-to-shared");
};

const onUpdateAttitude = (value, answerId) => {
  emit("update-answer-attitude", {
    questionId: props.id,
    answerId,
    attitude: value,
  });
};

const onUpdateText = (value, answerId) => {
  emit("update-answer-text", {
    questionId: props.id,
    answerId,
    text: value,
  });
};
</script>

<template>
  <form
    ref="form"
    novalidate
    class="question-block"
    :class="{ disabled: isAddedToShared }"
    @submit.prevent="onSubmit"
  >
    <div class="question-header">
      <div class="question-number">{{ number }}</div>
      <a-text-input
        :value="questionText"
        :placeholder="$t('message.questionPlaceholder')"
        :disabled="isAddedToShared"
        :v="$v.questionText"
        class="question-input"
        @input="onQuestionInput"
      />
    </div>

    <div class="answers-container">
      <answer
        v-for="(answerData, index) in answers"
        :key="answerData.id"
        class="answer"
        :text="answerData.text"
        :index="index"
        :question-index="props.index"
        :attitude="answerData.attitude"
        :disabled="isAddedToShared"
        :errors="$v.answers"
        @update:attitude="onUpdateAttitude($event, answerData.id)"
        @update:text="onUpdateText($event, answerData.id)"
        @delete="onDeleteAnswer(answerData.id)"
      />
      <div class="question-controls">
        <button type="button" class="btn-add-answer" @click="addAnswer">
          + Add another possible answer
        </button>
        <div class="question__right-buttons">
          <a-button
            type="button"
            text="button.removeQuestion"
            :disabled="isAddedToShared"
            class="question__remove-button red"
            @click="removeQuestion"
          />
          <a-button
            type="submit"
            :text="addRemoveButtonText"
            :disabled="hasYourQuestionsAdditionFinished"
            class="question__add-to-shared-button"
            :class="addRemoveButtonDynamicClass"
          />
        </div>
      </div>
      <a-error-message :v="$v.answerNumber" />
    </div>
  </form>
</template>

<style lang="scss" scoped>
.question-block {
  margin-bottom: 2rem;
  border: 1px solid var(--c-light-border);
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  &.disabled {
    pointer-events: none;
    background: var(--c-added-to-shared-color);
  }
}

.question-header {
  background: var(--c-section-background-color);
  padding: 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--c-light-border);

  .question-number {
    background: var(--c-primary-color);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
  }

  .input-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .question-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.5rem;
    font-size: 1rem;
    color: var(--c-dark-text);

    &:focus {
      outline: none;
      border-bottom: 2px solid var(--c-primary-color);
    }
  }

  .btn-delete-question {
    background: none;
    border: none;
    color: var(--c-light-text);
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 0.5rem;
    opacity: 0.6;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
      color: var(--c-negative-color);
    }
  }
}

// Answers container
.answers-container {
  padding: 1rem;
}

.question-controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.question__add-to-shared-button,
.question__remove-button {
  color: white;
  border: none;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
  flex: 1;
  width: 160px;
  max-width: 160px;
  pointer-events: auto;

  &.green {
    background: var(--c-positive-color);
  }

  &.red:not(:disabled) {
    background: var(--c-negative-color);
  }

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--c-primary-color) 90%, black);
  }
}

.question__add-to-shared-button {
  &[disabled] {
    background: gray;
  }
}

.question__remove-button {
  &[disabled] {
    background: var(--c-background-color);
  }
}
</style>
