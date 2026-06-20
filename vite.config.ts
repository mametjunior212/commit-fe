import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8053,
    proxy: {
      "/api": {
        target: "https://gateway.commit-id.org",
        changeOrigin: true,
        secure: false,
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
});