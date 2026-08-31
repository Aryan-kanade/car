import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Polling avoids missed/reordered file-change events on Windows,
      // which previously served stale mixed module transforms (blank page).
      usePolling: true,
    },
  },
})
