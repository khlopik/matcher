// main.js
import "./assets/main.scss";

import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import validationMessages from "@/enums/i18n.js";

const i18n = createI18n({
  locale: "ua",
  legacy: false,
  fallbackLocale: "en",
  messages: validationMessages,
});
console.log("i18n: ", i18n);
createApp(App).use(i18n).mount("#app");
