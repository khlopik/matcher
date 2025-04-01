import { reactive, computed } from "vue";

export function useSharedStore() {
  // Create reactive state
  const state = reactive({
    _isHost: true,
    _scope: {
      name: {
        peer1: "",
        peer2: "",
      },
      questions: [
        // {
        //   id: "questionId",
        //   text: "questionText",
        //   answers: [
        //     {
        //       id: "answerId",
        //       text: "answerText",
        //     },
        //   ],
        //   isAnswered: false,
        // },
      ],
      isFinishedAddingQuestions: {
        you: false,
        partner: false,
      },
      isAnswersSubmitted: {
        you: false,
        partner: false,
      },
    },
  });

  // Computed properties (getters)
  const isHost = computed(() => state._isHost);

  const allQuestionsAnswered = computed(() => {
    return state._scope.questions.every((question) => question.isAnswered);
  });

  const bothFinishedAddingQuestions = computed(() => {
    return (
      state._scope.isFinishedAddingQuestions.you &&
      state._scope.isFinishedAddingQuestions.partner
    );
  });

  const bothSubmittedAnswers = computed(() => {
    return (
      state._scope.isAnswersSubmitted.you &&
      state._scope.isAnswersSubmitted.partner
    );
  });

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

  function answerQuestion(questionId, answerId) {
    const question = state._scope.questions.find((q) => q.id === questionId);
    if (question) {
      question.isAnswered = true;
      // Add additional logic if needed to mark which answer was selected
    }
  }

  function setFinishedAddingQuestions(who, value) {
    state._scope.isFinishedAddingQuestions[who] = value;
  }

  function setAnswersSubmitted(who, value) {
    state._scope.isAnswersSubmitted[who] = value;
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

    // Expose methods
    setIsHost,
    addQuestion,
    removeQuestion,
    answerQuestion,
    setFinishedAddingQuestions,
    setAnswersSubmitted,
    setYourName,
    setPartnerName,
  };
}
