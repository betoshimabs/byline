import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BrasileiraoDatabase,
  SeasonCalendar,
  DB_STORAGE_KEY,
  EMPTY_DATABASE,
  AVAILABLE_SEASONS,
  FREE_PLAN_SEASONS,
  getCalendarStorageKey,
} from '../types/database';
import { getMockCalendar, hasMock } from '../services/api-football/mockLoader';
import { fetchSeasonCalendar as apiFetchSeasonCalendar } from '../services/api-football/endpoints/fixtures';

// ── Tipos ──────────────────────────────────────────────────── 
export type DataSource = 'mock' | 'cache' | 'api';

interface CalendarEntry {
  data: SeasonCalendar;
  source: DataSource;
}

interface DatabaseContextType {
  // Calendários por temporada (com rastreio de fonte)
  calendars:  Record<number, CalendarEntry>;
  getCalendar: (season: number) => SeasonCalendar | null;
  getSource:  (season: number) => DataSource | null;

  // Busca automática (mock → cache → api) com auto-save
  fetchCalendar: (season: number) => Promise<void>;
  isFetching:    (season: number) => boolean;
  fetchError:    (season: number) => string | null;
  lastSaved:     Record<number, { source: DataSource; at: string }>;

  // Dados enriquecidos (request #2)
  database: BrasileiraoDatabase | null;
  hasData:  boolean;
  setDatabase: (data: BrasileiraoDatabase) => void;

  clearAll: () => void;
  isLoaded: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  calendars:  {},
  getCalendar: () => null,
  getSource:   () => null,
  fetchCalendar: async () => {},
  isFetching:    () => false,
  fetchError:    () => null,
  lastSaved:  {},
  database:   null,
  hasData:    false,
  setDatabase: () => {},
  clearAll:    () => {},
  isLoaded:    false,
});

// ── Salva mock via plugin Vite (só em dev) ─────────────────── 
async function persistMockToRepo(data: SeasonCalendar): Promise<{ committed: boolean }> {
  if (!import.meta.env.DEV) return { committed: false };

  try {
    const res = await fetch('/__save_mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season: data.season, data }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { committed: json.committed ?? false };
  } catch (e) {
    console.warn('[BYLINE] Não foi possível salvar mock no repo:', e);
    return { committed: false };
  }
}

// ── Provider ───────────────────────────────────────────────── 
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calendars,   setCalendarsState] = useState<Record<number, CalendarEntry>>({});
  const [database,    setDatabaseState]  = useState<BrasileiraoDatabase | null>(null);
  const [isLoaded,    setIsLoaded]       = useState(false);
  const [fetching,    setFetching]       = useState<Record<number, boolean>>({});
  const [errors,      setErrors]         = useState<Record<number, string | null>>({});
  const [lastSaved,   setLastSaved]      = useState<Record<number, { source: DataSource; at: string }>>({});

  // ── Hidratação inicial ─────────────────────────────────────
  useEffect(() => {
    const loaded: Record<number, CalendarEntry> = {};

    for (const season of AVAILABLE_SEASONS) {
      // 1. Mock local (mais confiável, zero custo)
      if (hasMock(season)) {
        const mock = getMockCalendar(season);
        if (mock) {
          loaded[season] = { data: mock, source: 'mock' };
          console.info(`[BYLINE] 📁 Mock local carregado: temporada ${season}`);
          continue;
        }
      }

      // 2. localStorage
      try {
        const stored = localStorage.getItem(getCalendarStorageKey(season));
        if (stored) {
          loaded[season] = { data: JSON.parse(stored), source: 'cache' };
          console.info(`[BYLINE] 💾 Cache carregado: temporada ${season}`);
        }
      } catch (e) {
        console.warn(`[BYLINE] Erro ao ler cache ${season}:`, e);
      }
    }

    setCalendarsState(loaded);

    // Dados enriquecidos
    try {
      const db = localStorage.getItem(DB_STORAGE_KEY);
      if (db) setDatabaseState(JSON.parse(db));
    } catch {}

    setIsLoaded(true);
  }, []);

  // ── Seletores ──────────────────────────────────────────────
  const getCalendar = useCallback((season: number) => {
    return calendars[season]?.data ?? null;
  }, [calendars]);

  const getSource = useCallback((season: number): DataSource | null => {
    return calendars[season]?.source ?? null;
  }, [calendars]);

  const isFetching = useCallback((season: number) => fetching[season] ?? false, [fetching]);
  const fetchError = useCallback((season: number) => errors[season] ?? null,    [errors]);

  // ── Cascata de fetch: mock → cache → API ───────────────────
  const fetchCalendar = useCallback(async (season: number) => {
    // Já tem mock local? Não precisa de nada.
    if (calendars[season]?.source === 'mock') return;

    // Já está em loading?
    if (fetching[season]) return;

    // Plano free: só 2022-2024
    if (!FREE_PLAN_SEASONS.includes(season)) {
      setErrors(prev => ({ ...prev, [season]: `Temporada ${season} requer plano Pro.` }));
      return;
    }

    setFetching(prev => ({ ...prev, [season]: true }));
    setErrors(prev => ({ ...prev, [season]: null }));

    try {
      console.info(`[BYLINE] 🌐 Buscando calendário ${season} via API-Football...`);
      const response = await apiFetchSeasonCalendar(season);

      if (response.errors && Object.keys(response.errors).length > 0) {
        throw new Error(JSON.stringify(response.errors));
      }
      if (!response.response?.length) {
        throw new Error(`Nenhuma partida encontrada para ${season}.`);
      }

      const rounds = new Set(response.response.map(f => f.league.round));
      const calendarData: SeasonCalendar = {
        leagueId: 71,
        season,
        fixtures: response.response,
        fetchedAt: new Date().toISOString(),
        totalFixtures: response.results,
        totalRounds: rounds.size,
        requestsUsed: 1,
      };

      // Salva no state + localStorage
      setCalendarsState(prev => ({ ...prev, [season]: { data: calendarData, source: 'api' } }));
      try {
        localStorage.setItem(getCalendarStorageKey(season), JSON.stringify(calendarData));
      } catch {}

      setLastSaved(prev => ({ ...prev, [season]: { source: 'api', at: new Date().toISOString() } }));
      console.info(`[BYLINE] ✅ ${calendarData.totalFixtures} partidas salvas.`);

      // Auto-persiste mock no repo via plugin Vite
      const { committed } = await persistMockToRepo(calendarData);
      if (committed) {
        console.info(`[BYLINE] 🎉 Mock commitado automaticamente ao repositório!`);
        // Atualiza a fonte para 'mock' (comportamento após commit)
        setCalendarsState(prev => ({
          ...prev,
          [season]: { data: calendarData, source: 'mock' },
        }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrors(prev => ({ ...prev, [season]: msg }));
      console.error(`[BYLINE] ❌ Erro ao buscar ${season}:`, e);
    } finally {
      setFetching(prev => ({ ...prev, [season]: false }));
    }
  }, [calendars, fetching]);

  // ── Dados enriquecidos (request #2) ───────────────────────
  const setDatabase = useCallback((data: BrasileiraoDatabase) => {
    setDatabaseState(data);
    try { localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const clearAll = useCallback(() => {
    setCalendarsState({});
    setDatabaseState(null);
    for (const s of AVAILABLE_SEASONS) localStorage.removeItem(getCalendarStorageKey(s));
    localStorage.removeItem(DB_STORAGE_KEY);
  }, []);

  const hasData = (database?.rounds?.length ?? 0) > 0;

  return (
    <DatabaseContext.Provider value={{
      calendars, getCalendar, getSource,
      fetchCalendar, isFetching, fetchError, lastSaved,
      database, hasData, setDatabase,
      clearAll, isLoaded,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
