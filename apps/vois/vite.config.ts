import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = {};
  try {
    const loaded = loadEnv(mode, process.cwd(), '');
    Object.assign(env, loaded);
  } catch (e) {
    console.warn("Could not load .env files, proceeding with empty env.");
  }

  return {
    server: {
      port: 3100,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3101',
          changeOrigin: true,
        },
      },
    },
    publicDir: path.resolve(__dirname, '../../public'),
    plugins: [
      react(),
      // After build, copy app-specific public/ overrides on top of shared assets
      {
        name: 'copy-app-overrides',
        closeBundle() {
          const fs = require('fs');
          const appPublic = path.resolve(__dirname, 'public');
          if (!fs.existsSync(appPublic)) return;
          function copyRecursive(src: string, dest: string) {
            for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
              const srcPath = path.join(src, entry.name);
              const destPath = path.join(dest, entry.name);
              if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                copyRecursive(srcPath, destPath);
              } else {
                fs.copyFileSync(srcPath, destPath);
              }
            }
          }
          copyRecursive(appPublic, path.resolve(__dirname, 'dist'));
        },
      },
    ],
    define: {
      'process.env': JSON.stringify(env)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@li/shared': path.resolve(__dirname, '../../packages/shared'),
      }
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
            'framer-motion': ['framer-motion'],
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
