import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'איחוד הצלה — זמינות סופ״ש',
        short_name: 'זמינות סופ״ש',
        description: 'רישום זמינות מתנדבים לסופי שבוע',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#FF6600',
        background_color: '#1A1A1A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallbackDenylist: [/^\/__/, /^\/api/],
      },
    }),
  ],
  server: { host: true, port: 8874 },
});
