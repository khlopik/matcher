<script setup>
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
  },
  questionId: {
    type: String,
  },
  questionText: {
    type: String,
  },
  answers: {
    type: Array,
  },
  isYourQuestion: {
    type: Boolean,
  },
});

const dynamicClass = computed(() => ({
  your: props.isYourQuestion,
  partner: !props.isYourQuestion,
}));
</script>

<template>
  <div class="question" :class="dynamicClass">
    <p class="name">{{ name }}</p>
    <p>{{ questionText }}</p>
    <ul v-if="!isYourQuestion" class="shared-question__answers">
      <li v-for="answer in answers" :key="answer.id" class="answer">
        <label class="rating-option">
          <input type="radio" :name="questionId" :value="answer.id" />
          <span class="rating-text">{{ answer.text }}</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.question {
  position: relative;
  padding: 10px;
  margin: 10px 0 20px;
  border-radius: 5px;

  .name {
    font-size: 12px;
    position: absolute;
    top: -10px;
    left: 10px;
    border-radius: 5px;
    background: inherit;
    padding: 0 5px;
  }

  &.your {
    background: cyan;
    margin-right: 20px;
  }

  &.partner {
    background: #ffe02d;
    margin-left: 20px;
  }

  &.partner .name {
    left: auto;
    right: 10px;
  }

  .shared-question__answers {
    margin-top: 5px;
    margin-left: 10px;
  }

  .answer {
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .rating-text {
    margin-left: 7px;
  }
}
</style>
