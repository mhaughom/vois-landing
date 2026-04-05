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
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    publicDir: path.resolve(__dirname, '../../public'),
    plugins: [react()],
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
