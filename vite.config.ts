import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
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
            return 'vendor'; // all other dependencies
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
  }
})
