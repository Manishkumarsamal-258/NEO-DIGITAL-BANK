import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars from .env files
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const apiBaseUrl = env.VITE_API_BASE_URL || "";

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: apiBaseUrl
        ? undefined
        : {
            "/api": {
              target: "http://localhost:8080",
              changeOrigin: true,
            },
          },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Code-splitting to avoid large chunks (> 500 kB warning)
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-router-dom",
            ],
            ui: [
              "@radix-ui/react-accordion",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toast",
              "@radix-ui/react-tooltip",
            ],
            charts: ["recharts", "chart.js"],
            forms: ["react-hook-form", "@hookform/resolvers", "zod"],
            animations: ["framer-motion"],
          },
        },
      },
      // Raise the chunk size warning limit to 1000 kB (1 MB)
      chunkSizeWarningLimit: 1000,
    },
  };
});
