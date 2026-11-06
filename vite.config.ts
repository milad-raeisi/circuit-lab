import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // three.js alone is ~700 kB minified; it is split out and cached on its own
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|three-stdlib|@react-three|troika-.*|camera-controls|maath|meshline|@monogrid|stats-gl|tunnel-rat)[\\/]/ },
            { name: 'react-flow', test: /node_modules[\\/](@xyflow|d3-.*)[\\/]/ },
            { name: 'ui', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion|@animate-ui|radix-ui|@radix-ui|@floating-ui|sonner)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
