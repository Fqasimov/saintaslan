import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so dist/ can be served from any path or static host.
export default defineConfig({
  base: './',
  plugins: [react()],
})
