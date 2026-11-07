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
  server: {
    watch: {
      // nothing in these folders is imported by the app; watching them only costs CPU
      ignored: ['**/.claude/**', '**/dist/**', '**/coverage/**', '**/*.log'],
    },
  },
  build: {
    // three.js alone is ~700 kB minified; it is split out, cached on its own
    // and loaded lazily after the first paint
    chunkSizeWarningLimit: 1100,
    reportCompressedSize: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React must win over the three.js group, or React itself lands in the lazy 3D chunk
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 40 },
            // state libraries used by both the app and react-three: groups pull in their
            // dependencies, so without this the three.js group would claim them
            { name: 'state', test: /node_modules[\\/](zustand|use-sync-external-store)[\\/]/, priority: 35 },
            { name: 'react-flow', test: /node_modules[\\/](@xyflow|d3-.*)[\\/]/, priority: 30 },
            { name: 'ui', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion|@animate-ui|radix-ui|@radix-ui|@floating-ui|sonner)[\\/]/, priority: 20 },
            // three.js, react-three and the helpers only they use
            {
              name: 'three',
              test: /node_modules[\\/](three|three-.*|@react-three|troika-.*|camera-controls|maath|meshline|@monogrid|stats-gl|stats\.js|tunnel-rat|its-fine|react-use-measure|suspend-react|@use-gesture|detect-gpu|glsl-noise|hls\.js|@mediapipe|base64-js|buffer|@babel[\\/]runtime|bidi-js|webgl-sdf-generator)[\\/]/,
              priority: 10,
            },
            // small libraries shared by the 3D code and the app (zustand, …) get their own
            // chunk; otherwise they land in the three.js chunk and force it to load up front
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
})
