// Types baseados na resposta real da API-Football v3
// Documentação: https://www.api-football.com/documentation-v3
// Endpoint principal: GET /fixtures?ids=id1-id2-...-id20

export interface FixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export type FixtureStatusShort =
  | 'TBD' | 'NS' | '1H' | 'HT' | '2H' | 'ET' | 'BT'
  | 'P' | 'SUSP' | 'INT' | 'FT' | 'AET' | 'PEN'
  | 'PST' | 'CANC' | 'ABD' | 'AWD' | 'WO' | 'LIVE';

export interface FixtureStatus {
  long: string;
  short: FixtureStatusShort;
  elapsed: number | null;
  extra: number | null;
}

export interface FixtureInfo {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;      // ISO 8601
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: FixtureVenue;
  status: FixtureStatus;
}

export interface LeagueInfo {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;     // Ex: "Regular Season - 1"
}

export interface TeamBasic {
  id: number;
  name: string;
  logo: string;      // URL para media.api-sports.io — não consome cota
  winner: boolean | null;
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface Score {
  halftime: Goals;
  fulltime: Goals;
  extratime: Goals;
  penalty: Goals;
}

export type EventType = 'Goal' | 'Card' | 'subst' | 'Var';

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: EventType;
  detail: string;   // Ex: "Normal Goal", "Yellow Card", "Substitution 1"
  comments: string | null;
}

export interface LineupPlayerInfo {
  id: number;
  name: string;
  number: number;
  pos: string;      // "G", "D", "M", "F"
  grid: string | null; // Ex: "1:1" (posição no grid)
}

export interface TeamColors {
  player: { primary: string; number: string; border: string };
  goalkeeper: { primary: string; number: string; border: string };
}

export interface Lineup {
  team: { id: number; name: string; logo: string; colors: TeamColors | null };
  coach: { id: number; name: string; photo: string };
  formation: string; // Ex: "4-3-3"
  startXI: Array<{ player: LineupPlayerInfo }>;
  substitutes: Array<{ player: LineupPlayerInfo }>;
}

export interface Statistic {
  type: string;
  value: string | number | null;
}

export interface TeamStatistics {
  team: { id: number; name: string; logo: string };
  statistics: Statistic[];
  // Estatísticas disponíveis:
  // "Shots on Goal", "Shots off Goal", "Total Shots", "Blocked Shots"
  // "Shots insidebox", "Shots outsidebox", "Fouls", "Corner Kicks"
  // "Offsides", "Ball Possession", "Yellow Cards", "Red Cards"
  // "Goalkeeper Saves", "Total passes", "Passes accurate", "Passes %"
}

export interface PlayerMatchStatistics {
  games: {
    minutes: number | null;
    number: number;
    position: string;
    rating: string | null;
    captain: boolean;
    substitute: boolean;
  };
  offsides: number | null;
  shots: { total: number | null; on: number | null };
  goals: { total: number | null; conceded: number; assists: number | null; saves: number | null };
  passes: { total: number | null; key: number | null; accuracy: string | null };
  tackles: { total: number | null; blocks: number | null; interceptions: number | null };
  duels: { total: number | null; won: number | null };
  dribbles: { attempts: number | null; success: number | null; past: number | null };
  fouls: { drawn: number | null; committed: number | null };
  cards: { yellow: number; red: number };
  penalty: {
    won: number | null;
    commited: number | null;
    scored: number;
    missed: number;
    saved: number | null;
  };
}

export interface PlayerMatchEntry {
  player: { id: number; name: string; photo: string };
  statistics: PlayerMatchStatistics[];
}

export interface TeamPlayers {
  team: { id: number; name: string; logo: string };
  players: PlayerMatchEntry[];
}

// Objeto completo de uma partida retornado pelo endpoint /fixtures
export interface Fixture {
  fixture: FixtureInfo;
  league: LeagueInfo;
  teams: {
    home: TeamBasic;
    away: TeamBasic;
  };
  goals: Goals;
  score: Score;
  // Os campos abaixo estão presentes ao usar /fixtures?id= ou /fixtures?ids=
  events?: FixtureEvent[];
  lineups?: Lineup[];
  statistics?: TeamStatistics[];
  players?: TeamPlayers[];
}

// Wrapper da resposta completa da API-Football
export interface APIFootballResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  paging: { current: number; total: number };
  response: Fixture[];
}
