/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  envDir: ".",
  publicDir: "public",

  plugins: [
    tanstackRouter({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 75 },
      exclude: /favicon|apple-touch-icon/,
    }),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: "hidden",
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom", "scheduler"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
          "ui-libs": ["lucide-react", "clsx", "tailwind-merge"],
          i18n: [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          maps: ["@react-google-maps/api"],
          toast: ["react-hot-toast"],
          vendor: ["axios", "date-fns"],
        },
        assetFileNames: (assetInfo) => {
          const name =
            assetInfo.names?.[0] ?? assetInfo.name ?? "asset";
          const ext = name.split(".").pop() ?? "";

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return "assets/images/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },

  server: {
    port: 5173,
    host: true,
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    env: {
      VITE_API_URL: "",
    },
  },
});
