import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: forward API calls to the YARP gateway so the SPA stays same-origin.
    // Default targets `dotnet run` (launchSettings port); set VITE_API_PROXY to
    // e.g. http://localhost:5050 when the backend runs via docker compose.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:5256',
        changeOrigin: true,
      },
    },
  },
})
