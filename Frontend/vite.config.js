import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const frontendUrl = process.env.VITE_FRONTEND_URL?.replace(/https?:\/\//, "") || "localhost:5173";
  const apiUrl = process.env.VITE_API_URL || "http://localhost:5001";

  return {
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
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],

    // ======================
    // Build Configuration
    // ======================
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            vendors: ["axios", "socket.io-client"],
            ui: ["@mui/material", "@mui/icons-material"],
            utils: ["date-fns", "lodash", "validator"],
          },
        },
      },
      minify: isProduction ? "terser" : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : {},
    },

    // ======================
    // Server Configuration
    // ======================
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/socket.io": {
          target: apiUrl,
          ws: true,
        },
      },
      headers: {
        "Content-Security-Policy": 
          `default-src 'self'; ` +
          `script-src 'self' ${!isProduction ? "'unsafe-inline' 'unsafe-eval'" : ""} blob:; ` +
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ` +
          `font-src 'self' data: https://fonts.gstatic.com; ` +
          `img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com; ` +
          `worker-src 'self' blob:; ` +
          `connect-src 'self' ${apiUrl} ws://${frontendUrl} wss://${frontendUrl}; ` +
          `frame-src 'self'; ` +
          `media-src 'self' data: blob:`
      },
    },

    // ======================
    // Preview Configuration
    // ======================
    preview: {
      port: 5173,
      strictPort: true,
      headers: {
        "Access-Control-Allow-Origin": `https://${frontendUrl}`,
        "Access-Control-Allow-Credentials": "true",
      },
    },

    // ======================
    // Environment Variables
    // ======================
    define: {
      'process.env': process.env,
      '__APP_ENV__': JSON.stringify(mode),
    },
  };
});