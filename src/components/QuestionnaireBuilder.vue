<script setup>
import { ref, toRaw, reactive, watch } from "vue";
import { guid } from "@/helpers/string.js";
import Question from "@/components/Question.vue";

const props = defineProps({
  sharedQuestionsIds: {
    type: Array,
  },
});

const emit = defineEmits([
  "add-question",
  "remove-question",
  "add-answer",
  "add-to-shared",
  "remove-from-shared",
  "update-questions",
]);

const questions = defineModel("questions");

const model = {
  yourName: "",
  partnerName: "",
  questions: [
    {
      isFromYou: true,
      id: "questionId",
      text: "questionText",
      answers: [
        {
          id: "answerId",
          text: "answerText",
        },
      ],
      isAnswered: false,
    },
  ],
  isAnswersSubmitted: {
    you: false,
    partner: false,
  },
  isFinishedAddingQuestions: {
    you: false,
    partner: false,
  },
};
const sharedQuestions = ref([]);

// Methods
const addQuestion = () => {
  emit("add-question");
};

const removeQuestion = (payload) => {
  emit("remove-question", payload);
};

const updateQuestionText = ({ questionId, text }) => {
  const questionToUpdate = questions.value.find(({ id }) => id === questionId);

  questionToUpdate.question = text;
};

const updateAnswerText = ({ questionId, answerId, text }) => {
  const questionToUpdate = questions.value.find(({ id }) => id === questionId);

  if (!questionToUpdate) return;

  const answerToUpdate = questionToUpdate.answers.find(
    ({ id }) => id === answerId,
  );

  if (!answerToUpdate) return;

  answerToUpdate.text = text;
};
const updateAnswerAttitude = ({ questionId, answerId, attitude }) => {
  const questionToUpdate = questions.value.find(({ id }) => id === questionId);

  if (!questionToUpdate) return;

  const answerToUpdate = questionToUpdate.answers.find(
    ({ id }) => id === answerId,
  );

  if (!answerToUpdate) return;

  answerToUpdate.attitude = attitude;
};
const addAnswer = ({ questionId }) => {
  emit("add-answer", { questionId });
};
const deleteAnswer = ({ questionId, answerId }) => {
  const questionToUpdate = questions.value.find(({ id }) => id === questionId);

  if (!questionToUpdate) return;

  questionToUpdate.answers = questionToUpdate.answers.filter(
    ({ id }) => id !== answerId,
  );
};

const addToShared = (questionId) => {
  console.log("== QuestionnaireBuilder - addToShared() ==");
  console.log("questionId: ", questionId);
  const { id, question, answers } = questions.value.find(
    ({ id }) => id === questionId,
  );
  const questionData = {
    questionId: toRaw(id),
    questionText: toRaw(question),
    answers: toRaw(answers).map((answerItem) => {
      const answerData = toRaw(answerItem);
      return {
        id: answerData.id,
        text: answerData.text,
      };
    }),
  };
  sharedQuestions.value.push(questionData);

  console.log("questionData: ", questionData);
  emit("add-to-shared", questionData);
};

const removeFromShared = (questionIdToRemove) => {
  console.log("== removeFromShared() ==");
  console.log("questionIdToRemove: ", questionIdToRemove);
  console.log("sharedQuestions.value: ", sharedQuestions.value);
  emit("remove-from-shared", questionIdToRemove);
};
</script>

<template>
  <div class="questionnaire-builder">
    <question
      v-for="(questionData, index) in questions"
      :key="questionData.id"
      :id="questionData.id"
      :index="index"
      :question-text="questionData.question"
      :answers="questionData.answers"
      :is-added-to-shared="sharedQuestionsIds.includes(questionData.id)"
      @add-to-shared="addToShared(questionData.id)"
      @remove-from-shared="removeFromShared(questionData.id)"
      @update-question-text="updateQuestionText"
      @update-answer-text="updateAnswerText"
      @update-answer-attitude="updateAnswerAttitude"
      @add-answer="addAnswer"
      @delete-answer="deleteAnswer"
      @remove-question="removeQuestion"
    />
    <div class="questionnaire-controls">
      <button class="btn-add-question" @click="addQuestion">
        + Add another question
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.questionnaire-controls {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  .btn-save-questions {
    background: var(--c-primary-color);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s ease;
    flex: 1;
    max-width: 200px;

    &:hover {
      background: color-mix(in srgb, var(--c-primary-color) 90%, black);
    }
  }
}
</style>

<style lang="scss">
// Add buttons
.btn-add-answer,
.btn-add-question {
  background: none;
  border: 1px dashed var(--c-light-border);
  color: var(--c-primary-color);
  padding: 0.6rem 1rem;
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--c-primary-color), 0.05);
    border-color: var(--c-primary-color);
  }
}
</style>
