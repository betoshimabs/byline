// Tipos para o estado interno da base de dados do BYLINE
// Sem backend: dados persistidos via localStorage

import { Fixture } from './fixture';

// ── Calendário completo da temporada (Request #1) ─────────────────────────
// Resultado de GET /fixtures?league=71&season=XXXX
// Dados básicos: IDs, times, datas, status (sem lineups/stats/events)
export interface SeasonCalendar {
  leagueId: number;
  season: number;
  fixtures: Fixture[];       // todas as partidas, dados básicos
  fetchedAt: string;         // ISO date string
  totalFixtures: number;
  totalRounds: number;
  requestsUsed: number;      // sempre 1 para este endpoint
}

export const getCalendarStorageKey = (season: number) => `byline_season_calendar_${season}`;

// Temporadas disponíveis no projeto
export const AVAILABLE_SEASONS = [2022, 2023, 2024, 2025, 2026] as const;
export type AvailableSeason = typeof AVAILABLE_SEASONS[number];

// Temporadas acessíveis no plano Free (restrição da API-Football)
export const FREE_PLAN_SEASONS: number[] = [2022, 2023, 2024];

export interface RoundData {
  roundNumber: number;
  roundName: string;        // Ex: "Regular Season - 1"
  fixtures: Fixture[];
  fetchedAt: string;         // ISO date string do momento da busca
}

export interface TeamAggregate {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface BrasileiraoDatabase {
  leagueId: number;         // 71 = Brasileirão Série A
  leagueName: string;
  season: number;           // 2026
  rounds: RoundData[];
  lastFetchedAt: string | null;
}

// Chave usada para persistência no localStorage
export const DB_STORAGE_KEY = 'byline_brasileirao_2026';

// Estrutura inicial vazia (antes da primeira busca)
export const EMPTY_DATABASE: BrasileiraoDatabase = {
  leagueId: 71,
  leagueName: 'Brasileirão Série A',
  season: 2026,
  rounds: [],
  lastFetchedAt: null,
};
