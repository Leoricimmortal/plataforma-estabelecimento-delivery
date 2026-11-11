import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite abrir a pasta dist em qualquer caminho (inclusive em subpastas do servidor).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        // bibliotecas grandes em arquivos separados (melhor cache no navegador)
        manualChunks: { react: ['react', 'react-dom'], mapa: ['leaflet', 'react-leaflet'], planilhas: ['xlsx'] },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
