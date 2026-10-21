import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Las pruebas de tests/e2e las ejecuta Playwright, no Vitest.
    include: ['src/**/*.test.{js,jsx}'],
  },
})
