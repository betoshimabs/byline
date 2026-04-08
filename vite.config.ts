import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Plugin Vite: expõe o endpoint POST /__save_mock no dev server.
 * Recebe o JSON da temporada, salva em /mocks/ e faz commit automático.
 * Funciona SOMENTE em desenvolvimento (nunca em produção/Pages).
 */
function mockSaverPlugin() {
  return {
    name: 'byline-mock-saver',
    configureServer(server: any) {
      server.middlewares.use('/__save_mock', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
          return;
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { season, data } = JSON.parse(body);

            const mocksDir = join(process.cwd(), 'src', 'services', 'api-football', 'mocks');
            mkdirSync(mocksDir, { recursive: true });

            const filepath = join(mocksDir, `brasileirao-${season}.json`);
            writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

            console.log(`\n[BYLINE] ✅ Mock salvo: ${filepath}`);

            // Tenta fazer commit automático via git
            let committed = false;
            let commitMessage = '';
            try {
              execSync(`git add "${filepath}"`, { cwd: process.cwd(), stdio: 'pipe' });
              const msg = `feat(mocks): add brasileirao ${season} calendar — ${data.totalFixtures} fixtures, ${data.totalRounds} rounds`;
              execSync(`git commit -m "${msg}"`, { cwd: process.cwd(), stdio: 'pipe' });
              committed = true;
              commitMessage = msg;
              console.log(`[BYLINE] ✅ Commitado automaticamente: "${msg}"`);
            } catch (gitErr: any) {
              console.warn(`[BYLINE] ⚠️  Git commit falhou (possivelmente nada a commitar): ${gitErr.message}`);
            }

            res.end(JSON.stringify({ ok: true, committed, commitMessage, filepath }));
          } catch (e: any) {
            console.error('[BYLINE] ❌ Erro no mock saver:', e.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: e.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  // Base para GitHub Pages: https://betoshimabs.github.io/byline/
  base: '/byline/',

  plugins: [
    react(),
    mockSaverPlugin(),
  ],

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
