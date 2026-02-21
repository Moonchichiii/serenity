import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  envDir: "..",
  publicDir: "public",

  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    viteCompression({ algorithm: "gzip", threshold: 10_240 }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10_240,
    }),
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
    sourcemap: false,
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          motion: ["framer-motion"],
          "ui-libs": ["lucide-react", "clsx", "tailwind-merge"],
        },
        assetFileNames: (assetInfo) => {
          // Rollup 4: .names is string[], .name is deprecated
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
});
