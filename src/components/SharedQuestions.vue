<script setup>
import SharedQuestion from "@/components/SharedQuestion.vue";
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
  },
  yourName: {
    type: String,
  },
  partnerName: {
    type: String,
  },
  questions: {
    type: Array,
  },
  userId: {
    type: String,
    required: true,
  },
});

const isYourQuestion = (questionData) => questionData.userId === props.userId;
const messageName = (questionData) =>
  isYourQuestion(questionData) ? props.yourName : props.partnerName;
</script>

<template>
  <div class="shared-questions__wrapper bordered-section">
    <h1>Shared questions</h1>

    <shared-question
      v-for="questionData in questions"
      :key="questionData.questionId"
      :name="messageName(questionData)"
      :question-id="questionData.questionId"
      :question-text="questionData.questionText"
      :answers="questionData.answers"
      :is-your-question="isYourQuestion(questionData)"
    />

    <div class="buttons">
      <button>Завершити додавати свої питання</button>
      <button>Прийняти питання та відповіді</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.shared-questions__wrapper {
  padding: 1rem;
}
</style>
