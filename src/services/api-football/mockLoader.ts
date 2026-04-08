/**
 * Mock Loader — carrega calendários de temporada de arquivos JSON locais.
 *
 * Vite resolve os mocks em tempo de build com import.meta.glob:
 * - Em DEV:  lê os arquivos diretamente do disco
 * - Em PROD (GitHub Pages): embute os JSONs no bundle
 *
 * A cascata de leitura de dados é:
 *   1. Mock local (este arquivo)  ← mais rápido, zero custo de API
 *   2. localStorage               ← persiste entre sessões
 *   3. API-Football               ← chamada real (consome cota)
 */

import type { SeasonCalendar } from '../../types/database';

// Importa todos os arquivos brasileirao-YYYY.json do diretório mocks/
// O `{ eager: true }` carrega tudo em tempo de build (sem lazy-loading)
const mockFiles = import.meta.glob<{ default: SeasonCalendar }>(
  './mocks/brasileirao-*.json',
  { eager: true }
);

/**
 * Retorna o mock de calendário para a temporada solicitada, ou null se não existir.
 */
export function getMockCalendar(season: number): SeasonCalendar | null {
  const key = `./mocks/brasileirao-${season}.json`;
  const mod  = mockFiles[key];
  if (!mod) return null;

  console.info(`[BYLINE MOCK] ✅ Usando mock local para temporada ${season}.`);
  return mod.default;
}

/**
 * Retorna true se existe um mock para a temporada.
 */
export function hasMock(season: number): boolean {
  return `./mocks/brasileirao-${season}.json` in mockFiles;
}

/**
 * Lista todas as temporadas que possuem mock local.
 */
export function availableMockSeasons(): number[] {
  return Object.keys(mockFiles)
    .map(key => {
      const match = key.match(/brasileirao-(\d{4})\.json$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((y): y is number => y !== null)
    .sort();
}
