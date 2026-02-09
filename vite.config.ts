import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const calendarBackendTarget = process.env.CALENDAR_BACKEND_URL ?? "http://localhost:3001";
const ngrokDomain =
  process.env.NGROK_DOMAIN ?? "clement-absolutory-emmett.ngrok-free.dev";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [ngrokDomain],
    proxy: {
      "/api": {
        target: calendarBackendTarget,
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: calendarBackendTarget,
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
}));
