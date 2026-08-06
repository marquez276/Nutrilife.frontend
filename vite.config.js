import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/usuarios': { target: 'http://localhost:8080', changeOrigin: true },
      '/anamnese': { target: 'http://localhost:8080', changeOrigin: true },
      '/registros': { target: 'http://localhost:8080', changeOrigin: true },
      '/consultas': { target: 'http://localhost:8080', changeOrigin: true },
      '/plano': { target: 'http://localhost:8080', changeOrigin: true },
      '/nutricionistas': { target: 'http://localhost:8080', changeOrigin: true },
      '/avaliacoes': { target: 'http://localhost:8080', changeOrigin: true },
      '/admin': { target: 'http://localhost:8080', changeOrigin: true },
      '/prontuario': { target: 'http://localhost:8080', changeOrigin: true },
      '/pagamentos': { target: 'http://localhost:8080', changeOrigin: true },
    }
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
