import { Fixture, FixtureEvent } from '../../../types/fixture';
import './MatchCard.css';

interface MatchCardProps {
  fixture: Fixture;
}

const STATUS_LABELS: Record<string, string> = {
  FT: 'Encerrado', AET: 'Prorrogação', PEN: 'Pênaltis',
  '1H': 'Ao vivo', HT: 'Intervalo', '2H': 'Ao vivo',
  NS: 'Não iniciado', PST: 'Adiado', CANC: 'Cancelado', TBD: 'A definir',
  SUSP: 'Suspenso', ET: 'Prorrogação', P: 'Pênaltis',
};

const isLive = (short: string) => ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(short);
const isFinished = (short: string) => ['FT', 'AET', 'PEN'].includes(short);

function getGoals(events: FixtureEvent[], teamId: number) {
  return events.filter(
    e => e.type === 'Goal' && e.team.id === teamId && e.detail !== 'Missed Penalty'
  );
}

function getStat(stats: NonNullable<Fixture['statistics']>, teamId: number, type: string) {
  const teamStats = stats.find(s => s.team.id === teamId);
  const stat = teamStats?.statistics.find(s => s.type === type);
  return stat?.value ?? '—';
}

const MatchCard: React.FC<MatchCardProps> = ({ fixture }) => {
  const { fixture: info, league, teams, goals, score, events = [], statistics = [] } = fixture;
  const statusShort = info.status.short;
  const live = isLive(statusShort);
  const finished = isFinished(statusShort);
  const pending = !live && !finished;

  const homeGoals = events.length ? getGoals(events, teams.home.id) : [];
  const awayGoals = events.length ? getGoals(events, teams.away.id) : [];

  const matchDate = new Date(info.date);
  const dateStr = matchDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeStr = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className={`match-card ${live ? 'match-card--live' : ''} ${finished ? 'match-card--finished' : ''} ${pending ? 'match-card--pending' : ''}`}>

      {/* Header */}
      <div className="match-card__header">
        <span className="match-card__round">{league.round.replace('Regular Season - ', 'Rodada ')}</span>
        <span className={`match-status ${live ? 'match-status--live' : finished ? 'match-status--done' : 'match-status--pending'}`}>
          {live && <span className="live-dot" />}
          {live && info.status.elapsed ? `${info.status.elapsed}'` : STATUS_LABELS[statusShort] ?? statusShort}
        </span>
      </div>

      {/* Scoreline */}
      <div className="match-card__body">
        <div className="match-team match-team--home">
          <img className="team-logo" src={teams.home.logo} alt={teams.home.name} loading="lazy" />
          <span className="team-name">{teams.home.name}</span>
        </div>

        <div className="match-score">
          {finished || live ? (
            <>
              <span className={`score ${teams.home.winner ? 'score--winner' : ''}`}>{goals.home ?? 0}</span>
              <span className="score-sep">—</span>
              <span className={`score ${teams.away.winner ? 'score--winner' : ''}`}>{goals.away ?? 0}</span>
            </>
          ) : (
            <span className="score-time">{timeStr}</span>
          )}
        </div>

        <div className="match-team match-team--away">
          <img className="team-logo" src={teams.away.logo} alt={teams.away.name} loading="lazy" />
          <span className="team-name">{teams.away.name}</span>
        </div>
      </div>

      {/* Gols */}
      {(homeGoals.length > 0 || awayGoals.length > 0) && (
        <div className="match-card__events">
          <div className="events-col events-col--home">
            {homeGoals.map((e, i) => (
              <span key={i} className="goal-event">
                ⚽ {e.player.name.split(' ').pop()} <span className="goal-min">{e.time.elapsed}'</span>
              </span>
            ))}
          </div>
          <div className="events-col events-col--away">
            {awayGoals.map((e, i) => (
              <span key={i} className="goal-event">
                <span className="goal-min">{e.time.elapsed}'</span> {e.player.name.split(' ').pop()} ⚽
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {statistics.length > 0 && (
        <div className="match-card__stats">
          <div className="stat-row">
            <span className="stat-val">{getStat(statistics, teams.home.id, 'Ball Possession')}</span>
            <span className="stat-label">Posse</span>
            <span className="stat-val">{getStat(statistics, teams.away.id, 'Ball Possession')}</span>
          </div>
          <div className="stat-row">
            <span className="stat-val">{getStat(statistics, teams.home.id, 'Shots on Goal')}</span>
            <span className="stat-label">Chutes no gol</span>
            <span className="stat-val">{getStat(statistics, teams.away.id, 'Shots on Goal')}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="match-card__footer">
        {pending && <span className="match-venue">{info.venue.name ?? 'A definir'}</span>}
        {pending && <span className="match-date">{dateStr} · {timeStr}</span>}
        {!pending && info.venue.name && <span className="match-venue">{info.venue.name}</span>}
      </div>

    </article>
  );
};

export default MatchCard;
