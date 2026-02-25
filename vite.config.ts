import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    proxy: {
      "/api": {
        target: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8052", // server Laravel
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },

  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
