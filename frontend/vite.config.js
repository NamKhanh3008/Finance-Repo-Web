import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import topLevelAwait from "vite-plugin-top-level-await"; // <--- 1. Import this

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Add the Top Level Await plugin config
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: i => `__tla_${i}`
    }),
  ],
  // 3. Exclude this dependency to prevent Vite optimization errors
  optimizeDeps: {
    exclude: ['js-big-decimal']
  }
})