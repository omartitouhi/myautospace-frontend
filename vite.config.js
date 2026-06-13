import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 3D hero (three.js + drei) is intentionally code-split into its own
  // lazy chunk, so the >500kB default warning for it is expected noise.
  build: { chunkSizeWarningLimit: 1500 },
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
