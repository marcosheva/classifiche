import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api-bets': {
        target: 'https://api.b365api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-bets/, ''),
      },
    },
  },
})
