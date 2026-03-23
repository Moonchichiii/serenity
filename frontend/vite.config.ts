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
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/")) {
              return "react-core";
            }
            if (id.includes("@tanstack/react-router")) return "router";
            if (id.includes("@tanstack/react-query")) return "query";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@react-google-maps")) return "maps";
            if (
              id.includes("react-hook-form") ||
              id.includes("@hookform") ||
              id.includes("/zod/")
            ) {
              return "forms";
            }
            if (
              id.includes("i18next") ||
              id.includes("react-i18next") ||
              id.includes("i18next-browser-languagedetector")
            ) {
              return "i18n";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("/clsx/") ||
              id.includes("tailwind-merge")
            ) {
              return "ui-libs";
            }
            if (id.includes("react-hot-toast")) return "toast";
            if (id.includes("/axios/") || id.includes("date-fns")) {
              return "vendor";
            }
          }
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
