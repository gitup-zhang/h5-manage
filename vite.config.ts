import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局注入 SCSS 变量和 mixin
        additionalData: `@use "@/assets/styles/variables.scss" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://47.113.194.28:8080',
        changeOrigin: true,
        // 不 rewrite，后端路径本身就带 /api 前缀
        // 前端 /api/auth/login → 后端 http://47.113.194.28:8080/api/auth/login
      },
    },
  },
})
