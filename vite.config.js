import { fileURLToPath, URL } from "node:url";
import path from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools({
      // Try to explicitly configure HMR for DevTools
      autoImportHmrPlugin: true,
    }),
  ],
  css: {
    hmr: true,
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "${fileURLToPath(new URL("./src/assets/_colors.scss", import.meta.url))}";
        `,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
});
