<script setup>
import { computed, ref, useTemplateRef, watch, nextTick, reactive } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { getValidators } from "@/helpers/validators.js";
import WebRtcConnection from "@/components/WebRtcConnection.vue";
import QuestionnaireBuilder from "@/components/QuestionnaireBuilder.vue";
import SharedQuestions from "@/components/SharedQuestions.vue";
import ATextInput from "@/components/shared/ATextInput.vue";
import AButton from "@/components/shared/AButton.vue";
import { ACTION } from "@/enums/web-rtc.js";
import { useSharedStore } from "@/helpers/shared-scope.js";
import { useI18n } from "vue-i18n";
import AHeader from "@/components/AHeader/index.vue";
import { guid } from "@/helpers/string.js";

const i18n = useI18n();

const { required } = getValidators(i18n);

const savedName = ref("");
const userId = guid();

function generateEmptyAnswer() {
  return {
    id: guid(),
    text: "",
    attitude: null,
  };
}

const yourQuestions = ref([
  {
    id: guid(),
    question: "",
    answers: [generateEmptyAnswer(), generateEmptyAnswer()],
  },
]);
const name = ref("");
const isConnected = ref(false);

const nameRules = {
  name: { required },
};

const $v = useVuelidate(nameRules, { name }, { $scope: false });

const rtc = useTemplateRef("rtc");

const {
  addQuestion,
  removeQuestion,
  setYourName,
  setUserId,
  setPartnerName,
  setPartnerUserId,
  setIsHost,
  setFinishedAddingQuestions,
  setAnswersSubmitted,
  saveResults,
  state,
  questions,
  yourName,
  partnerName,
  isYouFinishedAddingQuestions,
  isPartnerFinishedAddingQuestions,
  hasYouSubmitAnswers,
  hasPartnerSubmitAnswers,
  results,
} = useSharedStore();

const sharedQuestionsIds = computed(() =>
  (questions.value || []).map(({ questionId }) => questionId),
);

const setUserDetails = () => {
  const payload = {
    action: ACTION.SET_USER_DETAILS,
    data: {
      name: savedName.value,
      userId,
    },
  };
  sendData(payload);
};

const onConnect = ({ isPeer1 }) => {
  console.log("== onConnect() ==");
  console.log("isPeer1: ", isPeer1);
  setIsHost(isPeer1);
  setYourName(savedName.value);
  setUserId(userId);
  isConnected.value = true;
  setUserDetails();
};

const onDisconnect = () => {
  isConnected.value = false;
};

const addNewQuestion = () => {
  yourQuestions.value.push({
    id: guid(),
    question: "",
    answers: [generateEmptyAnswer(), generateEmptyAnswer()],
  });
};

const removeYourQuestion = ({ questionId: questionIdToRemove }) => {
  yourQuestions.value = yourQuestions.value.filter(
    ({ id }) => id !== questionIdToRemove,
  );
};

const addNewAnswer = ({ questionId }) => {
  const questionToUpdate = yourQuestions.value.find(
    ({ id }) => id === questionId,
  );

  if (!questionToUpdate) return;

  questionToUpdate.answers.push(generateEmptyAnswer());
};

const addToShared = (questionData) => {
  console.log("== addToShared() ==");
  questionData.userId = userId;
  const data = {
    action: ACTION.ADD_QUESTION,
    data: questionData,
  };

  addQuestion(questionData);
  sendData(data);
};

const removeFromShared = (questionIdToRemove) => {
  const data = {
    action: ACTION.REMOVE_QUESTION,
    data: { questionId: questionIdToRemove },
  };

  removeQuestion(questionIdToRemove);
  sendData(data);
};

const sendData = (data) => {
  console.log("== sendData() ==");
  console.log("data: ", data);
  try {
    if (!rtc || !rtc.value) return;

    const stringifiedData = JSON.stringify(data);
    console.log("stringifiedData: ", stringifiedData);
    rtc.value.sendMessage(stringifiedData);
  } catch (err) {
    console.log("err: ", err);
  }
};

const submitName = async () => {
  if (!(await $v.value.$validate())) return;

  savedName.value = name.value.trim();
  isNameChangeRequested.value = false;
};

const LOCAL_STORAGE_KEY = "InterestMatcher";

const dataToSave = computed(() => ({
  name: savedName.value,
  questions: yourQuestions.value,
}));

const isDataChanged = ref(false);
const dataChangesUnwatch = ref(null);
const isDataExist = ref(false);
const isDataJustLoaded = ref(false);

const isLocalStorageDataExist = () => {
  isDataExist.value = !!localStorage.getItem(LOCAL_STORAGE_KEY);
};
isLocalStorageDataExist();

const startWatchingDataChanges = () => {
  // console.log("== startWatchingDataChanges() ==");
  dataChangesUnwatch.value = watch(
    dataToSave,
    (newValue, oldValue) => {
      isDataChanged.value = true;
      isDataJustLoaded.value = false;
      stopWatchingDataChanges();
    },
    { deep: true },
  );
};

const stopWatchingDataChanges = () => {
  // console.log("== stopWatchingDataChanges() ==");
  if (!dataChangesUnwatch.value) return;

  dataChangesUnwatch.value();
  dataChangesUnwatch.value = null;
};

startWatchingDataChanges();

const saveDataToLocalStorage = () => {
  console.log("== saveDataToLocalStorage() ==");
  try {
    console.log("dataToSave: ", dataToSave.value);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave.value));
    isDataChanged.value = false;
    isDataJustLoaded.value = true;
    startWatchingDataChanges();
  } catch (err) {
    console.log("err: ", err);
  }
};

const loadDataFromLocalStorage = () => {
  console.log("== loadDataFromLocalStorage() ==");
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedData = JSON.parse(data);
    console.log("parsedData: ", parsedData);
    stopWatchingDataChanges();
    savedName.value = parsedData.name;
    name.value = parsedData.name;
    console.log("parsedData.questions: ", parsedData.questions);
    if (parsedData.questions?.length) {
      console.log("save to yourQuestions");
      yourQuestions.value = parsedData.questions;
    }
    isDataChanged.value = false;
    isDataJustLoaded.value = true;
    startWatchingDataChanges();
    // nextTick(startWatchingDataChanges);
  } catch (err) {
    console.log("err: ", err);
  }
};

const isNameChangeRequested = ref(false);
const isNameFormVisible = computed(
  () => !savedName.value || isNameChangeRequested.value,
);

const onChangeName = () => {
  isNameChangeRequested.value = true;
};

const onFinishAddingQuestions = ({ userId }) => {
  console.log("== onFinishAddingQuestions() ==");
  console.log("userId: ", userId);
  setFinishedAddingQuestions(userId, true);
  console.log("isYouFinishedAddingQuestions: ", isYouFinishedAddingQuestions);
  console.log("state: ", state);
  const data = {
    action: ACTION.FINISH_ADDING_QUESTIONS,
    data: { userId, value: true },
  };

  sendData(data);
};

const onSubmitAnswers = (answerData) => {
  console.log("== onSubmitAnswers() ==");
  console.log("answerData: ", answerData);
  setAnswersSubmitted(userId, true);
  const data = {
    action: ACTION.APPROVE_ANSWERS,
    data: { userId, value: true },
  };

  sendData(data);
};

const onSaveResults = (answerResults) => {
  console.log("== onSaveResults() ==");
  console.log("answerResults: ", answerResults);

  const data = { answerResults, questionsData: yourQuestions.value };

  saveResults(userId, data);

  const dataToSend = {
    action: ACTION.SEND_RESULTS,
    data: { userId, ...data },
  };
  sendData(dataToSend);
};

const handlerByAction = {
  [ACTION.SET_USER_DETAILS]: ({ name, userId }) => {
    setPartnerName(name);
    setPartnerUserId(userId);
  },
  [ACTION.ADD_QUESTION]: (questionData) => {
    addQuestion(questionData);
  },
  [ACTION.REMOVE_QUESTION]: ({ questionId }) => {
    removeQuestion(questionId);
  },
  [ACTION.FINISH_ADDING_QUESTIONS]: ({ userId, value }) => {
    setFinishedAddingQuestions(userId, value);
  },
  [ACTION.APPROVE_ANSWERS]: ({ userId, value }) => {
    setAnswersSubmitted(userId, value);
  },
  [ACTION.SEND_RESULTS]: ({ userId, answerResults, questionsData }) => {
    saveResults(userId, { answerResults, questionsData });
  },
};

const onReceiveMessage = (stringMessage) => {
  console.log("== onReceiveMessage() ==");
  console.log("stringMessage: ", stringMessage);
  const { action, data } = JSON.parse(stringMessage);
  const handler = handlerByAction[action];
  if (!handler) return;

  handler(data);
};
</script>

<template>
  <a-header
    :is-data-changed="isDataChanged"
    :is-data-exist="isDataExist"
    :is-data-just-loaded="isDataJustLoaded"
    :your-name="savedName"
    :partner-name="partnerName"
    :is-connected="isConnected"
    @save-data="saveDataToLocalStorage"
    @load-data="loadDataFromLocalStorage"
    @change-name="onChangeName"
  />
  <main>
    <form
      v-if="isNameFormVisible"
      novalidate
      class="name__wrapper bordered-section"
      @submit.prevent="submitName"
    >
      <a-text-input
        v-model:value="name"
        name="name"
        placeholder="placeholder.name"
        :v="$v.name"
        class="name"
      />
      <a-button type="submit" text="button.set" class="name-button" />
    </form>
    <questionnaire-builder
      v-if="savedName"
      v-model:questions="yourQuestions"
      :shared-questions-ids="sharedQuestionsIds"
      :has-your-questions-addition-finished="isYouFinishedAddingQuestions"
      @add-question="addNewQuestion"
      @remove-question="removeYourQuestion"
      @add-answer="addNewAnswer"
      @add-to-shared="addToShared"
      @remove-from-shared="removeFromShared"
    />
  </main>
  <aside>
    <shared-questions
      v-if="isConnected"
      :your-name="yourName"
      :partner-name="partnerName"
      :questions="questions"
      :user-id="userId"
      :has-your-questions-addition-finished="isYouFinishedAddingQuestions"
      :has-partner-questions-addition-finished="
        isPartnerFinishedAddingQuestions
      "
      :has-you-submit-answers="hasYouSubmitAnswers"
      :has-partner-submit-answers="hasPartnerSubmitAnswers"
      @finish-adding-questions="onFinishAddingQuestions"
      @submit-answers="onSubmitAnswers"
      @save-results="onSaveResults"
    />
    <p v-else class="connection-required-hint">
      {{ $t("message.connectionRequired") }}
    </p>
    <web-rtc-connection
      v-show="!isConnected"
      ref="rtc"
      :name="savedName"
      @connected="onConnect"
      @disconnected="onDisconnect"
      @receive-message="onReceiveMessage"
    />
    {{ results }}
    <div v-if="isConnected" class="chat">Chat</div>
  </aside>
</template>

<style lang="scss">
.name__wrapper {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin-bottom: 20px;
  background: rgba(var(--c-primary-color-rgb), 0.1);

  .name {
    margin-left: 20px;
    width: 300px;
  }

  .name-button {
    margin-left: 20px;
  }
}

.connection-required-hint {
  padding: 0 20px 20px;
  text-align: center;
  color: var(--c-primary-color);
}
</style>
