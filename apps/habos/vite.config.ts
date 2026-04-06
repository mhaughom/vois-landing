import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = {};
  try {
    // Load all env vars (no prefix filter) from .env files
    const loaded = loadEnv(mode, process.cwd(), '');
    Object.assign(env, loaded);
    // Also inject into process.env so API handlers can access them (e.g. ANTHROPIC_API_KEY)
    Object.assign(process.env, loaded);
  } catch (e) {
    console.warn("Could not load .env files, proceeding with empty env.");
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    publicDir: path.resolve(__dirname, '../../public'),
    plugins: [
      react(),
      // Dev-only: serve /api/* routes by dynamically importing the Vercel function handlers
      {
        name: 'api-dev-server',
        configureServer(server: any) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            const url = (req.url || '').split('?')[0];
            if (!url.startsWith('/api/')) return next();
            // Map /api/chat → ./api/chat.ts etc.
            const route = url.replace('/api/', '');
            const handlerPath = path.resolve(__dirname, 'api', `${route}.ts`);
            if (!fs.existsSync(handlerPath)) return next();
            try {
              // Collect body
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk);
              const bodyStr = Buffer.concat(chunks).toString();
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
              // Load handler via Vite's SSR module loader
              const mod = await server.ssrLoadModule(handlerPath);
              const handler = mod.default;
              // Adapt to Vercel-style req/res
              req.method = req.method || 'POST';
              const origEnd = res.end.bind(res);
              res.flushHeaders = () => res.writeHead(res.statusCode || 200, res.getHeaders());
              res.json = (data: any) => { res.setHeader('Content-Type', 'application/json'); origEnd(JSON.stringify(data)); };
              res.status = (code: number) => { res.statusCode = code; return res; };
              await handler(req, res);
            } catch (e: any) {
              console.error('API handler error:', e);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            }
          });
        },
      },
      // After build, copy app-specific public/ overrides on top of shared assets
      {
        name: 'copy-app-overrides',
        // In dev: serve app-local public/ files before shared publicDir
        configureServer(server: any) {
          
          const appPublic = path.resolve(__dirname, 'public');
          server.middlewares.use((req: any, res: any, next: any) => {
            const urlPath = (req.url || '').split('?')[0];
            const localFile = path.join(appPublic, urlPath);
            if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
              const ext = path.extname(localFile).toLowerCase();
              const types: Record<string, string> = { '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.js': 'application/javascript' };
              res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
              fs.createReadStream(localFile).pipe(res);
              return;
            }
            next();
          });
        },
        closeBundle() {
          
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
