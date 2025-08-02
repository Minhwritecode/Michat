import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "MiChat Application",
        short_name: "MiChat",
        description: "Real-time chat application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg}"],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          vendors: ["axios", "socket.io-client"],
          ui: ["@mui/material", "@mui/icons-material"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: import.meta.env.MODE === "production",
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: import.meta.env.VITE_API_URL || "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/socket.io": {
        target: import.meta.env.VITE_API_URL || "http://localhost:5001",
        ws: true,
      },
    },
    headers: {
      "Content-Security-Policy": 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https://res.cloudinary.com; " +
        "worker-src 'self' blob:; " +
        "connect-src 'self' ws://localhost:5173 " + 
        (import.meta.env.VITE_API_URL || "http://localhost:5001") + " " +
        "https://api.mapbox.com;",
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});