import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: { /* ... your test config ... */ },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
          
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return '@react-core';
            }
           
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return '@ui-framework';
            }
   
            if (id.includes('socket.io-client')) {
              return '@socket';
            }
         
            return 'vendor-libs';
          }
        },
      },
    },
    
    chunkSizeWarningLimit: 800, 
  },
});
