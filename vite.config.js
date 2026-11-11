import { defineConfig, loadEnv } from 'vite';
import { askMessy } from './api/messy.js';

function messyLocalDevPlugin() {
  return {
    name: 'messy-ai-local-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      server.middlewares.use('/api/messy', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', async () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            const liveEnv = loadEnv(server.config.mode, process.cwd(), '');
            const apiKey = liveEnv.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            const result = await askMessy({
              question: parsed.question,
              screenContext: parsed.screenContext || {},
              apiKey
            });
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.body));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Messy AI dev handler failed.' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  root: '.',
  plugins: [messyLocalDevPlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
