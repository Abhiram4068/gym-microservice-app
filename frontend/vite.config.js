import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api/members': {
        target: 'http://localhost:5295',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:5256',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
