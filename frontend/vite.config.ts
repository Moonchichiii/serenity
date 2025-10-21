import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  envDir: '..',

  plugins: [
    react(),
    tailwindcss(),

    // Brotli compression (better than gzip, widely supported)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),

    // Gzip fallback
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    // Image optimization (runs at build time)
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 75 }, // Best compression but slower
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/i18n': path.resolve(__dirname, './src/i18n'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/api': path.resolve(__dirname, './src/api'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    legalComments: 'none',
    // Production-only: drop console & debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  build: {
    // Modern target for smaller bundles (ES2020+ is widely supported)
    target: 'es2020',

    // Minify with esbuild (faster than terser, good results)
    minify: 'esbuild',

    // CSS code splitting for better caching
    cssCodeSplit: true,

    // Generate sourcemaps for production debugging (remove if not needed)
    sourcemap: false,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // React core + router
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/@tanstack/react-router')) {
            return 'react-vendor'
          }

          // TanStack Query (data fetching)
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query'
          }

          // Form libraries
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/yup')) {
            return 'forms'
          }

          // Animation libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'animations'
          }

          // i18n
          if (id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')) {
            return 'i18n'
          }

          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils'
          }

          // Calendar component (heavy, separate chunk)
          if (id.includes('node_modules/react-calendar')) {
            return 'calendar'
          }

          // Icons (lucide-react)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }

          // Other node_modules → general vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },

        // Consistent chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
          return `assets/${facadeModuleId}-[hash].js`
        },

        // Asset naming
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Optimize deps
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'axios',
      'framer-motion',
      'i18next',
      'react-i18next',
      'date-fns',
    ],
    force: false,
  },

  // Preview server config (for testing production build)
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },

  // Dev server (unchanged but optimized)
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    // Optional: proxy API in dev
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //   },
    // },
  },
})
