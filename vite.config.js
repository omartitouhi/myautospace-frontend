import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Merge .env files (incl. .env.local) with process.env so VITE_API_PROXY can
  // be set either way. Default targets `dotnet run` (launchSettings port); set
  // VITE_API_PROXY to http://localhost:5050 when the backend runs via docker compose.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY || 'http://localhost:5256'

  return {
    plugins: [react()],
    // The 3D hero (three.js + drei) is intentionally code-split into its own
    // lazy chunk, so the >500kB default warning for it is expected noise.
    build: { chunkSizeWarningLimit: 1500 },
    server: {
      // Dev: forward API calls to the YARP gateway so the SPA stays same-origin.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // Forward WebSocket upgrades too — the SignalR chat hub lives under /api.
          ws: true,
        },
      },
    },
  }
})
