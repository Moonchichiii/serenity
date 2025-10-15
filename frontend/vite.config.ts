import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Explicitly configure JSX transformation
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
      // Enable Fast Refresh
      fastRefresh: true,
    }),
    tailwindcss(),
  ],

  // Path aliases
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
    // Optimize resolve operations - be explicit!
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  // Dev server config
  server: {
    port: 5173,
    host: true,
    strictPort: false,

    // Proxy API requests to Django
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },

    // Warm up frequently used files (FIXED PATHS)
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/components/layout/Header.tsx',
        './src/components/layout/Footer.tsx',
        './src/pages/hero.tsx',
        './src/pages/about.tsx',
        './src/pages/services.tsx',
        './src/lib/utils.ts',
      ],
    },
  },

  // Build optimizations
  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: 'lightningcss',

    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['@tanstack/react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast'],
        },

        // Asset naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'axios',
      'react-hook-form',
      'yup',
      'i18next',
      'i18next-browser-languagedetector',
      'react-i18next',
      'date-fns',
      'framer-motion',
    ],
    exclude: ['@tanstack/react-query-devtools'],
    // Force optimize React and JSX
    esbuildOptions: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
  },

  // Performance hints - ALSO configure esbuild JSX here!
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    legalComments: 'none',
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})