import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      "@/i18n": path.resolve(__dirname, "./src/i18n"),
    },
    // Optimize resolve operations - be explicit!
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },

  // Dev server config
  server: {
    port: 5173,
    host: true,
    strictPort: false,

    // Proxy API requests to Django
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },

    // Warm up frequently used files
    warmup: {
      clientFiles: [
        "./src/App.tsx",
        "./src/main.tsx",
        "./src/components/layout/Navigation.tsx",
        "./src/components/home/Hero.tsx",
        "./src/lib/utils.ts",
      ],
    },
  },

  // Build optimizations
  build: {
    target: "es2022",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: "lightningcss",

    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "router-vendor": ["@tanstack/react-router"],
          "query-vendor": ["@tanstack/react-query"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "yup"],
          "i18n-vendor": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
          "ui-vendor": ["framer-motion", "lucide-react", "react-hot-toast"],
        },

        // Asset naming for better caching
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "axios",
      "react-hook-form",
      "yup",
      "i18next",
      "react-i18next",
      "date-fns",
      "framer-motion",
    ],
    exclude: ["@tanstack/react-query-devtools"],
  },

  // Performance hints
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none",
  },
});
