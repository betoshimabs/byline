import { Fixture, FixtureEvent } from '../../../types/fixture';
import './MatchCard.css';

interface MatchCardProps {
  fixture: Fixture;
}

const STATUS_LABELS: Record<string, string> = {
  FT: 'FINALIZADO', AET: 'PRORROGAÇÃO', PEN: 'PÊNALTIS',
  '1H': 'AO VIVO', HT: 'INTERVALO', '2H': 'AO VIVO',
  NS: 'A JOGAR', PST: 'ADIADO', CANC: 'CANCELADO', TBD: 'A DEFINIR',
  SUSP: 'SUSPENSO', ET: 'PRORROGAÇÃO', P: 'PÊNALTIS',
};

const isLive = (short: string) => ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(short);
const isFinished = (short: string) => ['FT', 'AET', 'PEN'].includes(short);

function getGoals(events: FixtureEvent[], teamId: number) {
  return events.filter(
    e => e.type === 'Goal' && e.team.id === teamId && e.detail !== 'Missed Penalty'
  );
}

const MatchCard: React.FC<MatchCardProps> = ({ fixture }) => {
  const { fixture: info, league, teams, goals, events = [] } = fixture;
  const statusShort = info.status.short;
  const live = isLive(statusShort);
  const finished = isFinished(statusShort);

  const homeGoals = events.length ? getGoals(events, teams.home.id) : [];
  const awayGoals = events.length ? getGoals(events, teams.away.id) : [];

  const matchDate = new Date(info.date);
  const dateStr = matchDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeStr = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="match-card-brutal block-outline">
      
      {/* Heavy Header */}
      <div className={`match-header ${live ? 'bg-accent' : finished ? 'bg-black' : 'bg-white'}`}>
        <span className="match-round title-display">{league.round.replace('Regular Season - ', 'RD ')}</span>
        <span className="match-status title-display">
          {live && info.status.elapsed ? `${info.status.elapsed}'` : STATUS_LABELS[statusShort] ?? statusShort}
        </span>
      </div>

      {/* Main Score Block */}
      <div className="match-body">
        
        {/* Home Team */}
        <div className="match-team">
          <img src={teams.home.logo} alt={teams.home.name} className="team-logo-brutal" loading="lazy" />
          <span className="team-name title-display">{teams.home.name}</span>
        </div>

        {/* Score */}
        <div className="match-score-block">
          {finished || live ? (
            <div className="score-wrapper">
              <span className={`score-number title-display ${teams.home.winner ? 'winner-text' : ''}`}>{goals.home ?? 0}</span>
              <span className="score-div title-display">VS</span>
              <span className={`score-number title-display ${teams.away.winner ? 'winner-text' : ''}`}>{goals.away ?? 0}</span>
            </div>
          ) : (
            <div className="time-wrapper">
              <span className="time-text title-display">{timeStr}</span>
              <span className="date-text">{dateStr}</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="match-team match-team--reverse">
          <img src={teams.away.logo} alt={teams.away.name} className="team-logo-brutal" loading="lazy" />
          <span className="team-name title-display">{teams.away.name}</span>
        </div>

      </div>

      {/* Goal Scorers Block (Only if goals exist) */}
      {(homeGoals.length > 0 || awayGoals.length > 0) && (
        <div className="match-events">
          <div className="events-col">
            {homeGoals.map((e, i) => (
              <div key={i} className="goal-row">
                 <span className="goal-min">{e.time.elapsed}'</span>
                 <span className="goal-player">{e.player.name.split(' ').pop()}</span>
              </div>
            ))}
          </div>
          <div className="events-col events-col--away">
            {awayGoals.map((e, i) => (
               <div key={i} className="goal-row">
                 <span className="goal-player">{e.player.name.split(' ').pop()}</span>
                 <span className="goal-min">{e.time.elapsed}'</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="match-footer block-solid">
        <button className="btn-brutal btn-brutal--primary w-full">
          {live ? 'ACOMPANHAR AO VIVO' : finished ? 'LER PÓS-JOGO (IA)' : 'PRÉ-JOGO'}
        </button>
      </div>

    </article>
  );
};

export default MatchCard;
