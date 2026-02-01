import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Allow ngrok-free.app domains to access the server
    allowedHosts: ['.ngrok-free.app'],
  },
})
