import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  
  test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.ts',
      clearMocks: true,
      pool: 'forks',
      coverage: {
        provider: 'v8',
        reporter: ['lcov', 'text'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/types/**', 'src/main.tsx'],
      },
    },
})