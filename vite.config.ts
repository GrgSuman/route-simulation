import { defineConfig } from 'vite'
import tailwindcss from "tailwindcss";
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Disable all warnings
        if (warning.code) return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Disable type checking and warnings
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
