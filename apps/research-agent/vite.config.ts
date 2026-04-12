import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env: Record<string, string> = {};
  try {
    // Load root .env files so SUPABASE_URL, ANTHROPIC_API_KEY etc are available
    const loaded = loadEnv(mode, path.resolve(__dirname, '../..'), '');
    Object.assign(env, loaded);
    Object.assign(process.env, loaded);
  } catch {
    /* no .env */
  }

  return {
    server: {
      port: 3002,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // Dev-only: serve /api/* routes by dynamically importing the Vercel handlers.
      // Same pattern habos uses — see apps/habos/vite.config.ts
      {
        name: 'api-dev-server',
        configureServer(server: any) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            const urlPath = (req.url || '').split('?')[0];
            if (!urlPath.startsWith('/api/')) return next();
            const route = urlPath.replace('/api/', '');
            const handlerPath = path.resolve(__dirname, 'api', `${route}.ts`);
            if (!fs.existsSync(handlerPath)) return next();
            try {
              // Collect body
              const chunks: Buffer[] = [];
              for await (const chunk of req) chunks.push(chunk);
              const bodyStr = Buffer.concat(chunks).toString();
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
              // Parse query params
              const urlObj = new URL(req.url || '', 'http://localhost');
              req.query = Object.fromEntries(urlObj.searchParams);
              // Load handler via Vite SSR
              const mod = await server.ssrLoadModule(handlerPath);
              const handler = mod.default;
              req.method = req.method || 'POST';
              // Adapt node res to Vercel-style res
              const origEnd = res.end.bind(res);
              res.flushHeaders = () => res.writeHead(res.statusCode || 200, res.getHeaders());
              res.json = (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                origEnd(JSON.stringify(data));
              };
              res.status = (code: number) => {
                res.statusCode = code;
                return res;
              };
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
    ],
    define: {
      'process.env': JSON.stringify(env),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@li/shared': path.resolve(__dirname, '../../packages/shared'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
