// validators.js
import { useI18n } from "vue-i18n";
import * as validators from "@vuelidate/validators";
import { helpers, minLength } from "@vuelidate/validators";

let validatorsCache = null;

export function getValidators(i18n) {
  if (validatorsCache) {
    return validatorsCache;
  }

  const customValidators = {
    minAnswers: (param) =>
      helpers.withParams(
        { type: "minAnswers", value: param },
        (value) => Number.isInteger(value) && value >= param,
      ),
  };

  const withI18nMessage = validators.createI18nMessage({
    t: i18n.t,
  });
  validatorsCache = {
    required: withI18nMessage(validators.required, {
      messagePath: () => i18n.t(`validation.required`),
    }),
    minAnswers: withI18nMessage(customValidators.minAnswers, {
      withArguments: true,
      messagePath: () => i18n.t(`validation.minAnswers`),
    }),
  };

  return validatorsCache;
}
