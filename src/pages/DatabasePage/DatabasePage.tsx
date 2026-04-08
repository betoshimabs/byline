import { useState, useEffect, useRef } from 'react';
import { useDatabase, DataSource } from '../../context/DatabaseContext';
import { FREE_PLAN_SEASONS } from '../../types/database';
import { Fixture } from '../../types/fixture';
import MatchCard from '../../components/editorial/MatchCard/MatchCard';
import './DatabasePage.css';

type DatabaseView = 'overview' | 'rounds' | 'teams';

const SEASON_OPTIONS = [
  { year: 2022, free: true  },
  { year: 2023, free: true  },
  { year: 2024, free: true  },
  { year: 2025, free: false },
  { year: 2026, free: false },
];

// ── Helpers ────────────────────────────────────────────────── 
function parseRoundNumber(round: string): number {
  const m = round.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 999;
}

function groupByRound(fixtures: Fixture[]): Map<string, Fixture[]> {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const r = f.league.round;
    if (!map.has(r)) map.set(r, []);
    map.get(r)!.push(f);
  }
  return new Map([...map.entries()].sort((a, b) => parseRoundNumber(a[0]) - parseRoundNumber(b[0])));
}

function getStatusColor(fixtures: Fixture[]): 'done' | 'partial' | 'pending' {
  const done = fixtures.filter(f => ['FT','AET','PEN'].includes(f.fixture.status.short)).length;
  if (done === fixtures.length) return 'done';
  if (done > 0) return 'partial';
  return 'pending';
}

function sourceLabel(source: DataSource | null): { icon: string; text: string; cls: string } {
  if (source === 'mock')  return { icon: '📁', text: 'mock local',  cls: 'source--mock'  };
  if (source === 'cache') return { icon: '💾', text: 'localStorage', cls: 'source--cache' };
  if (source === 'api')   return { icon: '🌐', text: 'API-Football', cls: 'source--api'   };
  return { icon: '', text: '', cls: '' };
}

// ── Season Selector ────────────────────────────────────────── 
interface SeasonSelectorProps {
  selected:     number;
  onChange:     (s: number) => void;
  cachedYears:  number[];
  loadingYears: number[];
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ selected, onChange, cachedYears, loadingYears }) => (
  <div className="season-selector glass">
    <span className="season-selector__label">Temporada</span>
    <div className="season-selector__options">
      {SEASON_OPTIONS.map(({ year, free }) => {
        const isCached   = cachedYears.includes(year);
        const isLoading  = loadingYears.includes(year);
        const isSelected = year === selected;
        const isPro      = !free;

        return (
          <button
            key={year}
            className={`season-btn ${isSelected ? 'season-btn--active' : ''} ${isPro ? 'season-btn--pro' : ''}`}
            onClick={() => !isPro && onChange(year)}
            title={isPro ? 'Requer plano Pro' : isCached ? 'Dados em cache' : 'Disponível — será buscado automaticamente'}
          >
            {isLoading && <span className="season-spinner" />}
            {year}
            {isPro    && <span className="season-pro-badge">Pro</span>}
            {isCached && !isLoading && <span className="season-check">✓</span>}
          </button>
        );
      })}
    </div>
    <div className="season-selector__legend">
      <span>● Free</span>
      <span className="legend-pro">● Pro</span>
      <span>✓ Em cache</span>
    </div>
  </div>
);

// ── Auto-fetch Loading State ───────────────────────────────── 
const AutoFetchingState: React.FC<{ season: number }> = ({ season }) => (
  <div className="auto-fetch-state glass-elevated animate-fade-up">
    <div className="auto-fetch-spinner-lg" />
    <div className="auto-fetch-text">
      <p className="auto-fetch-title">Carregando Brasileirão {season}...</p>
      <p className="auto-fetch-desc">
        Buscando calendário completo · <strong>1 request</strong> · salvando automaticamente
      </p>
    </div>
    <div className="auto-fetch-chips">
      <span className="meta-chip">🌐 API-Football</span>
      <span className="meta-chip">📋 ~380 partidas</span>
      <span className="meta-chip">🏟 38 rodadas</span>
    </div>
  </div>
);

// ── Pro Gate ───────────────────────────────────────────────── 
const ProGate: React.FC<{ season: number }> = ({ season }) => (
  <div className="pro-gate glass animate-fade-up">
    <div className="pro-gate__icon">🔒</div>
    <h3 className="pro-gate__title">Temporada {season} — Plano Pro</h3>
    <p className="pro-gate__desc">
      O plano Free da API-Football permite apenas temporadas 2022–2024.
      Faça upgrade para acessar dados da temporada em andamento.
    </p>
    <a
      href="https://dashboard.api-football.com"
      target="_blank"
      rel="noopener noreferrer"
      className="fetch-btn fetch-btn--upgrade"
    >
      → Ver Planos
    </a>
  </div>
);

// ── Error State ────────────────────────────────────────────── 
const ErrorState: React.FC<{ season: number; error: string; onRetry: () => void }> = ({ season, error, onRetry }) => (
  <div className="error-state glass animate-fade-up">
    <span className="error-state__icon">⚠️</span>
    <div>
      <p className="error-state__title">Erro ao carregar temporada {season}</p>
      <p className="error-state__msg">{error}</p>
    </div>
    <button className="retry-btn" onClick={onRetry}>↻ Tentar novamente</button>
  </div>
);

// ── Calendar View (Visão Geral) ────────────────────────────── 
const CalendarView: React.FC<{ season: number }> = ({ season }) => {
  const { getCalendar, getSource, fetchCalendar, lastSaved } = useDatabase();
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

  const calendar = getCalendar(season)!;
  const source   = getSource(season);
  const src      = sourceLabel(source);

  const roundMap    = groupByRound(calendar.fixtures);
  const finishedCount = calendar.fixtures.filter(f => ['FT','AET','PEN'].includes(f.fixture.status.short)).length;

  return (
    <div className="calendar-view animate-fade-up">

      {/* Stats */}
      <div className="calendar-stats">
        {[
          { num: calendar.totalFixtures,                label: 'Partidas'         },
          { num: calendar.totalRounds,                  label: 'Rodadas'          },
          { num: finishedCount,                         label: 'Encerradas'       },
          { num: calendar.totalFixtures - finishedCount,label: 'Pendentes'        },
        ].map(({ num, label }) => (
          <div key={label} className="cal-stat glass-elevated">
            <span className="cal-stat__num">{num}</span>
            <span className="cal-stat__label">{label}</span>
          </div>
        ))}

        {/* Fonte dos dados */}
        <div className={`cal-stat glass-elevated cal-stat--source ${src.cls}`}>
          <span className="cal-stat__num" style={{ fontSize: '1.4rem' }}>{src.icon}</span>
          <span className="cal-stat__label">{src.text}</span>
        </div>
      </div>

      <div className="calendar-meta-row">
        <span className="calendar-fetched">
          Temporada {calendar.season} · capturado em {new Date(calendar.fetchedAt).toLocaleString('pt-BR')}
        </span>
        <button
          className="refetch-btn"
          onClick={() => fetchCalendar(season)}
          title="Forçar nova requisição à API"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Rounds list */}
      <div className="rounds-list glass">
        <div className="rounds-list__header">
          <span>Rodada</span><span>Partidas</span><span>Status</span><span>IDs das Fixtures</span>
        </div>
        {[...roundMap.entries()].map(([roundName, fixtures]) => {
          const status     = getStatusColor(fixtures);
          const isExpanded = expandedRound === roundName;
          const roundNum   = parseRoundNumber(roundName);

          return (
            <div key={roundName} className={`round-row ${isExpanded ? 'round-row--expanded' : ''}`}>
              <div
                className="round-row__summary"
                onClick={() => setExpandedRound(isExpanded ? null : roundName)}
                role="button"
              >
                <span className="round-row__name">
                  <span className={`round-dot round-dot--${status}`} />
                  Rodada {roundNum}
                </span>
                <span className="round-row__count">{fixtures.length}</span>
                <span className={`round-row__status status--${status}`}>
                  {status === 'done'    && '✅ Encerrada'}
                  {status === 'partial' && '⏳ Parcial'}
                  {status === 'pending' && '🕐 Pendente'}
                </span>
                <span className="round-row__ids">
                  {fixtures.map(f => f.fixture.id).join(' · ')}
                </span>
                <span className="round-row__chevron">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="round-row__matches">
                  {fixtures.map(f => (
                    <div key={f.fixture.id} className="mini-fixture glass">
                      <span className="mini-id">#{f.fixture.id}</span>
                      <img src={f.teams.home.logo} className="mini-logo" alt="" />
                      <span className="mini-team">{f.teams.home.name}</span>
                      <span className="mini-vs">vs</span>
                      <span className="mini-team">{f.teams.away.name}</span>
                      <img src={f.teams.away.logo} className="mini-logo" alt="" />
                      <span className={`mini-status mini-status--${f.fixture.status.short.toLowerCase()}`}>
                        {['FT','AET','PEN'].includes(f.fixture.status.short)
                          ? `${f.goals?.home ?? 0}–${f.goals?.away ?? 0}`
                          : f.fixture.status.short === 'NS'
                            ? new Date(f.fixture.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
                            : f.fixture.status.short}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Overview: orquestra auto-fetch ─────────────────────────── 
// Controle de tentativas de auto-fetch (persiste enquanto o módulo viver)
const _autoFetchAttempted = new Set<number>();

const OverviewView: React.FC<{ season: number }> = ({ season }) => {
  const { getCalendar, isFetching, fetchError, fetchCalendar, isLoaded } = useDatabase();
  const calendar = getCalendar(season);
  const loading  = isFetching(season);
  const error    = fetchError(season);
  const isFree   = FREE_PLAN_SEASONS.includes(season);

  // Auto-fetch ao montar / trocar temporada
  useEffect(() => {
    if (!isLoaded) return;
    if (calendar !== null) return;           // já tem dados
    if (!isFree) return;                     // plano pago → não tenta
    if (_autoFetchAttempted.has(season)) return; // já tentou nesta sessão

    _autoFetchAttempted.add(season);
    fetchCalendar(season);
  }, [season, isLoaded, calendar, isFree]);

  if (!isFree) return <ProGate season={season} />;

  if (loading && !calendar) return <AutoFetchingState season={season} />;

  if (error && !calendar) return (
    <ErrorState
      season={season}
      error={error}
      onRetry={() => { _autoFetchAttempted.delete(season); fetchCalendar(season); }}
    />
  );

  if (!calendar) return null; // ainda não carregou (raro)

  return <CalendarView season={season} />;
};

// ── Rounds View ────────────────────────────────────────────── 
const RoundsView: React.FC<{ season: number }> = ({ season }) => {
  const { getCalendar, isFetching, database } = useDatabase();
  const [activeRound, setActiveRound] = useState(1);
  const calendar = getCalendar(season);
  const loading  = isFetching(season);

  if (loading) return <AutoFetchingState season={season} />;

  if (!calendar) return (
    <div className="db-empty animate-fade-up">
      <div className="db-empty__icon">📅</div>
      <p className="db-empty__title">Calendário não disponível</p>
      <p className="db-empty__desc">Acesse <strong>Visão Geral</strong> para carregar a temporada {season}.</p>
    </div>
  );

  const roundMap        = groupByRound(calendar.fixtures);
  const rounds          = [...roundMap.entries()];
  const roundName       = `Regular Season - ${activeRound}`;
  const currentFixtures = roundMap.get(roundName) ?? rounds[0]?.[1] ?? [];
  const enrichedRound   = database?.rounds.find(r => r.roundNumber === activeRound);

  return (
    <div className="rounds-view animate-fade-up">
      <div className="round-tabs">
        {rounds.map(([rName, fixtures]) => {
          const num    = parseRoundNumber(rName);
          const status = getStatusColor(fixtures);
          return (
            <button
              key={rName}
              className={`round-tab ${activeRound === num ? 'round-tab--active' : ''}`}
              onClick={() => setActiveRound(num)}
            >
              {num} <span className={`round-tab__dot round-dot--${status}`} />
            </button>
          );
        })}
      </div>

      {enrichedRound ? (
        <div className="matches-grid">
          {enrichedRound.fixtures.map(f => <MatchCard key={f.fixture.id} fixture={f} />)}
        </div>
      ) : (
        <div className="basic-fixtures-grid">
          {currentFixtures.map(f => (
            <div key={f.fixture.id} className="basic-fixture-card glass">
              <div className="bfc-header">
                <span className="bfc-id">#{f.fixture.id}</span>
                <span className="bfc-status">{f.fixture.status.short}</span>
              </div>
              <div className="bfc-teams">
                <div className="bfc-team">
                  <img src={f.teams.home.logo} alt="" className="bfc-logo" />
                  <span>{f.teams.home.name}</span>
                </div>
                <span className="bfc-sep">
                  {['FT','AET','PEN'].includes(f.fixture.status.short)
                    ? `${f.goals?.home ?? 0} — ${f.goals?.away ?? 0}`
                    : new Date(f.fixture.date).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
                </span>
                <div className="bfc-team bfc-team--right">
                  <span>{f.teams.away.name}</span>
                  <img src={f.teams.away.logo} alt="" className="bfc-logo" />
                </div>
              </div>
              <div className="bfc-footer">
                {f.fixture.venue.name && <span>🏟 {f.fixture.venue.name}</span>}
                <span>📅 {new Date(f.fixture.date).toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Teams View ─────────────────────────────────────────────── 
const TeamsView: React.FC<{ season: number }> = ({ season }) => {
  const { getCalendar, isFetching } = useDatabase();
  const calendar = getCalendar(season);
  const loading  = isFetching(season);

  if (loading) return <AutoFetchingState season={season} />;

  if (!calendar) return (
    <div className="db-empty animate-fade-up">
      <div className="db-empty__icon">🏟</div>
      <p className="db-empty__title">Calendário não disponível</p>
      <p className="db-empty__desc">Carregue a temporada na aba Visão Geral.</p>
    </div>
  );

  const teamsMap = new Map<number, { id: number; name: string; logo: string; played: number }>();
  for (const f of calendar.fixtures) {
    const done = ['FT','AET','PEN'].includes(f.fixture.status.short);
    for (const side of ['home','away'] as const) {
      const t = f.teams[side];
      if (!teamsMap.has(t.id)) teamsMap.set(t.id, { ...t, played: 0 });
      if (done) teamsMap.get(t.id)!.played++;
    }
  }

  const teams = [...teamsMap.values()].sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="teams-list animate-fade-up">
      <p className="teams-note">{teams.length} equipes · Brasileirão Série A {season}</p>
      <div className="teams-grid">
        {teams.map(t => (
          <div key={t.id} className="team-chip glass">
            <img src={t.logo} alt={t.name} className="team-chip-logo" />
            <span className="team-chip-name">{t.name}</span>
            <span className="team-chip-played">{t.played}J</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── DatabasePage ───────────────────────────────────────────── 
const DatabasePage: React.FC = () => {
  const { calendars, isLoaded, clearAll, isFetching } = useDatabase();
  const [activeView,     setActiveView]     = useState<DatabaseView>('overview');
  const [selectedSeason, setSelectedSeason] = useState<number>(2024);
  const [showClear,      setShowClear]      = useState(false);

  const cachedYears  = Object.keys(calendars).map(Number);
  const loadingYears = SEASON_OPTIONS.map(s => s.year).filter(y => isFetching(y));
  const calendar     = calendars[selectedSeason];

  return (
    <main className="database-page">

      {/* Header */}
      <div className="database-header animate-fade-up">
        <div>
          <h1 className="database-title">Base de Dados</h1>
          <p className="database-subtitle">
            {cachedYears.length > 0
              ? `${cachedYears.length} temporada${cachedYears.length > 1 ? 's' : ''} carregada${cachedYears.length > 1 ? 's' : ''} · Brasileirão Série A`
              : 'Aguardando dados...'}
          </p>
        </div>
        <div className="database-meta">
          {cachedYears.length > 0 && (
            <>
              <span className="tag tag--accent">✦ {cachedYears.length} temporada{cachedYears.length > 1 ? 's' : ''}</span>
              {!showClear ? (
                <button className="clear-btn" onClick={() => setShowClear(true)}>🗑 Limpar</button>
              ) : (
                <div className="clear-confirm">
                  <span>Confirmar?</span>
                  <button className="clear-confirm-yes" onClick={() => { clearAll(); setShowClear(false); }}>Sim</button>
                  <button className="clear-confirm-no"  onClick={() => setShowClear(false)}>Não</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Seletor de temporada */}
      <SeasonSelector
        selected={selectedSeason}
        onChange={s => { setSelectedSeason(s); setActiveView('overview'); }}
        cachedYears={cachedYears}
        loadingYears={loadingYears}
      />

      {/* Sub-nav */}
      <nav className="db-subnav glass">
        {(['overview','rounds','teams'] as DatabaseView[]).map(view => (
          <button
            key={view}
            className={`db-subnav__btn ${activeView === view ? 'db-subnav__btn--active' : ''}`}
            onClick={() => setActiveView(view)}
          >
            {view === 'overview' && '📊 Visão Geral'}
            {view === 'rounds'   && '📅 Por Rodada'}
            {view === 'teams'    && '🏟 Equipes'}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      {!isLoaded ? (
        <div className="db-loading">
          <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        </div>
      ) : (
        <>
          {activeView === 'overview' && <OverviewView season={selectedSeason} />}
          {activeView === 'rounds'   && <RoundsView   season={selectedSeason} />}
          {activeView === 'teams'    && <TeamsView     season={selectedSeason} />}
        </>
      )}
    </main>
  );
};

export default DatabasePage;
