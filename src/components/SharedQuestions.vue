<script setup>
import { computed, reactive, watch } from "vue";
import SharedQuestion from "@/components/SharedQuestion.vue";
import AButton from "@/components/shared/AButton.vue";
import { useVuelidate } from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import { useI18n } from "vue-i18n";
import { getValidators } from "@/helpers/validators.js";
import AErrorMessage from "@/components/shared/AErrorMessage.vue";

const i18n = useI18n();

const { required } = getValidators(i18n);

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
  hasYourQuestionsAdditionFinished: {
    type: Boolean,
    default: false,
  },
  hasPartnerQuestionsAdditionFinished: {
    type: Boolean,
    default: false,
  },
  hasYouSubmitAnswers: {
    type: Boolean,
    default: false,
  },
  hasPartnerSubmitAnswers: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "finish-adding-questions",
  "submit-answers",
  "save-results",
]);

const answersToPartnerQuestions = reactive({});

const questionAnswersForValidation = computed(() => {
  console.log("props.questions: ", props.questions);
  return props.questions.map((question) => {
    console.log("question: ", question);
    try {
      console.log(
        "answersToPartnerQuestions.value[question.questionId]: ",
        answersToPartnerQuestions[question.questionId],
      );
      const temp =
        question.userId === props.userId
          ? { answerId: true }
          : { answerId: answersToPartnerQuestions[question.questionId] };
      console.log("temp: ", temp);
    } catch (err) {
      console.log("err: ", err);
    }
    return question.userId === props.userId
      ? { answerId: true }
      : { answerId: answersToPartnerQuestions[question.questionId] };
  });
});

const bothSubmittedAnswers = computed(
  () => props.hasYouSubmitAnswers && props.hasPartnerSubmitAnswers,
);

const rules = {
  answerIds: {
    $each: helpers.forEach({ answerId: { required } }),
  },
};

const $v = useVuelidate(rules, {
  answerIds: questionAnswersForValidation,
});

const isYourQuestion = (questionData) => questionData.userId === props.userId;
const messageName = (questionData) =>
  isYourQuestion(questionData) ? props.yourName : props.partnerName;

const isAcceptButtonDisabled = computed(
  () =>
    props.questions.length === 0 ||
    !props.hasPartnerQuestionsAdditionFinished ||
    props.hasYouSubmitAnswers,
);

const answerToQuestion = ({ questionId, answerId }) => {
  console.log("== answerToQuestion() ==");
  answersToPartnerQuestions[questionId] = answerId;
  console.log("answersToPartnerQuestions: ", answersToPartnerQuestions);
};

const onFinishAddingQuestions = () => {
  emit("finish-adding-questions", { userId: props.userId });
};

const onSubmit = async (event) => {
  console.log("== onSubmit() ==");
  console.log("event: ", event);
  const result = await $v.value.$validate();
  console.log("result: ", result);

  if (!result) return;

  emit("submit-answers", answersToPartnerQuestions);
};

watch(bothSubmittedAnswers, (newVal) => {
  if (!newVal) return;

  emit("save-results", answersToPartnerQuestions);
});
</script>

<template>
  <form
    class="shared-questions__wrapper bordered-section"
    @submit.prevent="onSubmit"
  >
    <h1>{{ $t("message.sharedQuestions") }}</h1>

    <shared-question
      v-for="(questionData, index) in questions"
      :key="questionData.questionId"
      :name="messageName(questionData)"
      :question-id="questionData.questionId"
      :question-text="questionData.questionText"
      :answers="questionData.answers"
      :is-your-question="isYourQuestion(questionData)"
      :disabled="hasYouSubmitAnswers"
      @answer="answerToQuestion"
    >
      <template v-slot:error>
        <a-error-message
          :v="$v.answerIds"
          :each-index="index"
          each-field="answerId"
        />
      </template>
    </shared-question>

    <div class="shared-questions__buttons">
      <i
        class="checkmark"
        :class="{ inactive: !hasYourQuestionsAdditionFinished }"
      />
      <a-button
        type="button"
        text="button.finishAddingQuestions"
        :disabled="hasYourQuestionsAdditionFinished"
        @click="onFinishAddingQuestions"
      />
      <i
        class="checkmark"
        :class="{ inactive: !hasPartnerQuestionsAdditionFinished }"
      />
      <i class="checkmark" :class="{ inactive: !hasYouSubmitAnswers }" />
      <a-button
        type="submit"
        text="button.acceptQuestionsAndAnswers"
        :disabled="isAcceptButtonDisabled"
      />
      <i class="checkmark" :class="{ inactive: !hasPartnerSubmitAnswers }" />
      <transition name="collapse">
        <a-button
          v-if="hasYouSubmitAnswers && hasPartnerSubmitAnswers"
          type="button"
          text="button.showResults"
          class="shared-questions__show-results-button"
        />
      </transition>
    </div>
  </form>
</template>

<style scoped lang="scss">
.shared-questions__wrapper {
  padding: 1rem;

  h1 {
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
    color: var(--c-primary-color);
  }

  .shared-questions__buttons {
    display: grid;
    grid-template-columns: 20px minmax(0, 100%) 20px;
    align-items: center;
    column-gap: 10px;
    row-gap: 10px;
  }

  .shared-questions__show-results-button {
    grid-column: 2 / 3;
  }
}
</style>
