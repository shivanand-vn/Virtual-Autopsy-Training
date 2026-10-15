import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const resolvedApiUrl =
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    env.VITE_RENDER_URL ||
    env.RENDER_URL ||
    env.RENDER_LINK ||
    env.BACKEND_URL ||
    env.API_URL ||
    env.SERVER_URL ||
    process.env.VITE_API_URL ||
    process.env.RENDER_URL ||
    process.env.RENDER_LINK ||
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    ''

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'RENDER_', 'BACKEND_', 'API_', 'SERVER_', 'REACT_APP_'],
    define: {
      '__INJECTED_API_URL__': JSON.stringify(resolvedApiUrl),
    },
  }
})
