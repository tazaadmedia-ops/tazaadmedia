import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'window',
  },
  optimizeDeps: {
    include: ['react-twitter-embed'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@tiptap')) {
              return 'vendor-editor';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-twitter-embed')) {
              return 'vendor-twitter';
            }
            return 'vendor'; // all other dependencies
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    sourcemap: true,
  }
})
