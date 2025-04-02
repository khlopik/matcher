import { reactive, computed, watch } from "vue";

export function useSharedStore() {
  // Create reactive state
  const state = reactive({
    _isHost: true,
    _userId: null,
    _partnerUserId: null,
    _hostUserId: null,
    _scope: {
      name: {
        peer1: "",
        peer2: "",
      },
      questions: [
        // {
        //   id: "questionId",
        //   userId: "userId",
        //   text: "questionText",
        //   answers: [
        //     {
        //       id: "answerId",
        //       text: "answerText",
        //     },
        //   ],
        // },
      ],
      isFinishedAddingQuestions: {},
      isAnswersSubmitted: {},
      results: {},
    },
  });

  // Computed properties (getters)
  const isHost = computed(() => state._isHost);

  const allQuestionsAnswered = computed(() => {
    return state._scope.questions.every((question) => question.isAnswered);
  });

  const isYouFinishedAddingQuestions = computed(
    () => state._scope.isFinishedAddingQuestions[state._userId],
  );
  const isPartnerFinishedAddingQuestions = computed(
    () => state._scope.isFinishedAddingQuestions[state._partnerUserId],
  );

  const bothFinishedAddingQuestions = computed(() => {
    return isYouFinishedAddingQuestionsu && isPartnerFinishedAddingQuestions;
  });

  const hasYouSubmitAnswers = computed(() => {
    return state._scope.isAnswersSubmitted[state._userId];
  });

  const hasPartnerSubmitAnswers = computed(() => {
    return state._scope.isAnswersSubmitted[state._partnerUserId];
  });

  const bothSubmittedAnswers = computed(() => {
    return hasYouSubmitAnswers && hasPartnerSubmitAnswers;
  });

  function setUserId(userId) {
    state._userId = userId;
  }

  function setPartnerUserId(userId) {
    state._partnerUserId = userId;
  }

  function setIsHost(isHost) {
    state._isHost = isHost;
  }

  // Methods to update state
  function addQuestion(questionData) {
    state._scope.questions.push(questionData);
  }

  function removeQuestion(questionIdToRemove) {
    console.log("== removeQuestion() ==");
    console.log("questionIdToRemove: ", questionIdToRemove);
    console.log("state._scope.questions: ", state._scope.questions);
    state._scope.questions = state._scope.questions.filter(
      ({ questionId }) => questionId !== questionIdToRemove,
    );
  }

  // function answerQuestion(questionId, answerId) {
  //   const question = state._scope.questions.find((q) => q.id === questionId);
  //   if (question) {
  //     question.isAnswered = true;
  //     // Add additional logic if needed to mark which answer was selected
  //   }
  // }

  function setFinishedAddingQuestions(userId, value) {
    state._scope.isFinishedAddingQuestions[userId] = value;
  }

  function setAnswersSubmitted(userId, value) {
    state._scope.isAnswersSubmitted[userId] = value;
  }

  function setPeerName(peerNumber, name) {
    if (peerNumber === 1 || peerNumber === 2) {
      state._scope.name[`peer${peerNumber}`] = name;
    }
  }

  const yourName = computed(() =>
    state._isHost ? state._scope.name.peer1 : state._scope.name.peer2,
  );
  const partnerName = computed(() =>
    state._isHost ? state._scope.name.peer2 : state._scope.name.peer1,
  );
  const questions = computed(() => state._scope.questions);
  function setYourName(newName) {
    const handler = state._isHost ? setPeer1Name : setPeer2Name;
    handler(newName);
  }
  function setPartnerName(newName) {
    const handler = state._isHost ? setPeer2Name : setPeer1Name;
    handler(newName);
  }
  function setPeer1Name(newName) {
    console.log("== setPeer1Name() ==");
    console.log("newName: ", newName);
    state._scope.name.peer1 = newName;
  }
  function setPeer2Name(newName) {
    console.log("== setPeer2Name() ==");
    console.log("newName: ", newName);
    state._scope.name.peer2 = newName;
  }

  function saveResults(userId, results) {
    state._scope.results[userId] = results;
  }

  const results = computed(() => {
    if (!state._userId || !state._partnerUserId) return null;

    const yourAnswers = state._scope.results[state._userId];
    const partnerAnswers = state._scope.results[state._partnerUserId];

    if (!yourAnswers || !partnerAnswers) return null;

    const {
      answerResults: yourAnswerResults,
      questionsData: yourQuestionsData,
    } = yourAnswers;
    const {
      answerResults: partnerAnswerResults,
      questionsData: partnerQuestionsData,
    } = partnerAnswers;

    const yourResults = Object.entries(yourAnswerResults).reduce(
      (acc, [questionId, answerId]) => {
        const questionData = partnerQuestionsData.find(
          ({ id }) => id === questionId,
        );
        console.log("questionData: ", questionData);

        if (!questionData) return acc;

        const answerData = questionData.answers.find(
          ({ id }) => id === answerId,
        );
        console.log("answerData: ", answerData);

        if (!answerData) return acc;

        acc.push({
          questionText: questionData.question,
          answerText: answerData.text,
          attitude: answerData.attitude,
        });
        return acc;
      },
      [],
    );

    const partnerResults = Object.entries(partnerAnswerResults).reduce(
      (acc, [questionId, answerId]) => {
        const questionData = yourQuestionsData.find(
          ({ id }) => id === questionId,
        );
        console.log("questionData: ", questionData);

        if (!questionData) return acc;

        const answerData = questionData.answers.find(
          ({ id }) => id === answerId,
        );
        console.log("answerData: ", answerData);

        if (!answerData) return acc;

        acc.push({
          questionText: questionData.question,
          answerText: answerData.text,
          attitude: answerData.attitude,
        });
        return acc;
      },
      [],
    );

    return [...yourResults, ...partnerResults];
  });

  return {
    // Expose state (readonly if needed)
    state,

    // Expose computed properties
    isHost,
    allQuestionsAnswered,
    bothFinishedAddingQuestions,
    bothSubmittedAnswers,
    yourName,
    partnerName,
    questions,
    isYouFinishedAddingQuestions,
    isPartnerFinishedAddingQuestions,
    hasYouSubmitAnswers,
    hasPartnerSubmitAnswers,
    results,
    // Expose methods
    setIsHost,
    addQuestion,
    removeQuestion,
    // answerQuestion,
    setFinishedAddingQuestions,
    setAnswersSubmitted,
    setYourName,
    setUserId,
    setPartnerName,
    setPartnerUserId,
    saveResults,
  };
}
