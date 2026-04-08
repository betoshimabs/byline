// Endpoint: /fixtures
// Referência: https://www.api-football.com/documentation-v3#tag/Fixtures

import { apiGet } from '../client';
import { APIFootballResponse } from '../../../types/fixture';

// ID do Brasileirão Série A na API-Football
export const BRASILEIRAO_LEAGUE_ID = 71;

/**
 * Busca o calendário completo de uma temporada.
 * Retorna dados básicos (sem lineups/statistics/events) de TODAS as partidas.
 * Custo: 1 request.
 *
 * Exemplo: GET /fixtures?league=71&season=2026
 */
export async function fetchSeasonCalendar(season: number): Promise<APIFootballResponse> {
  return apiGet<APIFootballResponse>('fixtures', {
    league: BRASILEIRAO_LEAGUE_ID,
    season,
  });
}

/**
 * Busca dados COMPLETOS (lineups, statistics, events, players) de até 20 partidas.
 * Usar os IDs obtidos via fetchSeasonCalendar.
 * Custo: 1 request.
 *
 * Exemplo: GET /fixtures?ids=id1-id2-...-id20
 */
export async function fetchFixturesBatch(fixtureIds: number[]): Promise<APIFootballResponse> {
  if (fixtureIds.length === 0) throw new Error('fetchFixturesBatch: nenhum ID fornecido');
  if (fixtureIds.length > 20) throw new Error('fetchFixturesBatch: máximo de 20 IDs por request');

  return apiGet<APIFootballResponse>('fixtures', {
    ids: fixtureIds.join('-'),
  });
}
