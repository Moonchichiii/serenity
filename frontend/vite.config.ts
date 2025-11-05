import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  envDir: '..',

  publicDir: 'public',

  plugins: [
    react(),
    tailwindcss(),

    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 75 },
      exclude: /favicon|apple-touch-icon/,
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
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,

    // Ensure assets are copied
    copyPublicDir: true,

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'router': ['@tanstack/react-router'],
          'query': ['@tanstack/react-query'],
          'motion': ['framer-motion'],
          'i18n': ['i18next', 'react-i18next'],
        },

        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep specific assets in root
          const rootAssets = ['favicon.ico', 'robots.txt', 'site.webmanifest',
                             'apple-touch-icon.png', 'lotus-light.svg', 'lotus-dark.svg',
                             'og-image-1200x630.jpg'];

          if (assetInfo.name && rootAssets.includes(assetInfo.name)) {
            return '[name][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

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
      'lucide-react'
    ],
    force: false,
  },

  preview: {
    port: 5173,
    strictPort: false,
    host: true,
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
})
