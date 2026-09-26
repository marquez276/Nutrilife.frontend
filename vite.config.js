import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Prefixos que pertencem ao backend. Vários coincidem com rotas de página do React (/admin, /anamnese,
// /nutricionistas, /consultas...), então navegação/F5 do navegador (Accept: text/html) volta para o SPA.
const backend = {
  target: 'http://localhost:8080',
  changeOrigin: true,
  bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
}

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
    proxy: Object.fromEntries(
      ['/auth', '/usuarios', '/anamnese', '/registros', '/clientes', '/consultas', '/plano', '/alimentos',
       '/nutricionistas', '/avaliacoes', '/admin', '/prontuario'].map((p) => [p, backend])
    ),
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
