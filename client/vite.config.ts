import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      '/polls': {
          target: process.env.VITE_API_BASE_URL,
          changeOrigin: true,
      },
  },
  },
  preview: {
    port: 8080,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  optimizeDeps:{
    force: true
  }
})
