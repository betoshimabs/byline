// Arquivo de mock para o Brasileirão 2026 — Rodadas 1 e 2
// Este arquivo receberá a resposta real da API-Football após o primeiro teste
//
// League ID: 71  (Brasileirão Série A)
// Season: 2026
// Estratégia de busca:
//   1. GET /fixtures?league=71&season=2026&round=Regular Season - 1  → IDs da Rodada 1
//   2. GET /fixtures?league=71&season=2026&round=Regular Season - 2  → IDs da Rodada 2
//   3. GET /fixtures?ids=<id1>-<id2>-...-<id20>                     → Dados completos dos 20 jogos
//
// Custo total: 3 requests (dentro do limite free de 100/dia)

import { APIFootballResponse } from '../../types/fixture';

// Será preenchido com a resposta real da API após o teste de integração
// Substitua 'null' pelo objeto JSON retornado pela API
export const BRASILEIRAO_2026_RODADAS_1_2_RAW: APIFootballResponse | null = null;

// IDs das fixtures das Rodadas 1 e 2 (a preencher após as buscas auxiliares)
export const ROUND_1_FIXTURE_IDS: number[] = [];
export const ROUND_2_FIXTURE_IDS: number[] = [];

// Metadados para referência
export const MOCK_METADATA = {
  leagueId: 71,
  leagueName: 'Brasileirão Série A',
  season: 2026,
  roundsIncluded: [1, 2],
  expectedFixtures: 20,
  fetchedAt: null as string | null,
  notes: 'Aguardando primeira requisição de teste.',
};
