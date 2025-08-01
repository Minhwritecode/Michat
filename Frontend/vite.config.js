import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Thêm cấu hình JSX runtime tự động
      jsxRuntime: 'automatic',
      // Babel plugins nếu cần
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  
  // Cấu hình build
  build: {
    // Tăng giới hạn cảnh báo kích thước chunk
    chunkSizeWarningLimit: 1500, // 1.5MB
    
    // Tách các thư viện lớn thành vendor chunk
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('mongoose') || id.includes('mongodb')) {
              return 'vendor-db';
            }
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            return 'vendor'; // Các thư viện khác
          }
        }
      }
    },
    
    // Tối ưu hóa cho production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Xóa console.log trong production
        drop_debugger: true
      }
    }
  },
  
  // Cấu hình server dev
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Trỏ đến backend
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Xác định rõ đây là ES module
  esbuild: {
    jsxInject: `import React from 'react'` // Đảm bảo React được import
  },
  
  // Xử lý các cảnh báo asset lớn
  assetsInlineLimit: 4096 // 4KB
});