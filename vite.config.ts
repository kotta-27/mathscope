import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages（https://kotta-27.github.io/mathscope/）で配信するため
  base: '/mathscope/',
  plugins: [react()],
})
