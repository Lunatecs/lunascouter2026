import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'LUNA SCOUTER 2026',
        short_name: 'LunaScouter',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: 'LunaScouter-LogoV2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'LunaScouter-LogoV2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      }
    })
  ],
  server: {
    // Allow ngrok-free.app domains to access the server
    allowedHosts: ['.ngrok-free.app'],
  },
})
