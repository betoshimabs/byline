import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <main className="home-page">

      {/* Hero */}
      <section className="home-hero animate-fade-up">
        <div className="hero-badge">
          <span className="tag tag--accent">✦ Inteligência Editorial</span>
        </div>
        <h1 className="hero-title">
          Jornalismo esportivo<br />
          <span className="hero-title--accent">orquestrado por IA</span>
        </h1>
        <p className="hero-subtitle">
          BYLINE transforma dados reais do futebol em narrativas editoriais precisas e envolventes.
          Cada matéria gerada a partir de estatísticas, escalações e eventos ao vivo.
        </p>
      </section>

      {/* Cards de preview */}
      <section className="home-grid">
        <div className="preview-card preview-card--featured glass-elevated">
          <div className="preview-card__label tag tag--live">⬤ Em construção</div>
          <h2 className="preview-card__title">Brasileirão 2026</h2>
          <p className="preview-card__desc">
            Dados das rodadas 1 e 2 serão carregados na aba{' '}
            <strong>Base de Dados</strong> para análise e geração de conteúdo editorial.
          </p>
          <div className="preview-card__meta">
            <span>🏟 20 partidas</span>
            <span>📊 Estatísticas completas</span>
            <span>🤖 Geração via IA</span>
          </div>
        </div>

        <div className="preview-card glass">
          <div className="preview-card__icon">📰</div>
          <h3 className="preview-card__title preview-card__title--sm">Pós-Jogo</h3>
          <p className="preview-card__desc">Análise automática de cada partida com gols, estatísticas e destaques individuais.</p>
        </div>

        <div className="preview-card glass">
          <div className="preview-card__icon">📋</div>
          <h3 className="preview-card__title preview-card__title--sm">Escalações</h3>
          <p className="preview-card__desc">Análise tática de formações e comparativo entre os onze titulares de cada equipe.</p>
        </div>

        <div className="preview-card glass">
          <div className="preview-card__icon">⚽</div>
          <h3 className="preview-card__title preview-card__title--sm">Narração de Gols</h3>
          <p className="preview-card__desc">Cada gol transformado em uma narrativa editorial com contexto, jogadora e minuto exatos.</p>
        </div>
      </section>

      {/* Status pipeline */}
      <section className="home-pipeline glass">
        <h3 className="pipeline-title">Pipeline Editorial</h3>
        <div className="pipeline-steps">
          <div className="pipeline-step pipeline-step--done">
            <div className="step-dot step-dot--done" />
            <div>
              <div className="step-name">Estrutura base</div>
              <div className="step-desc">React + TypeScript + Design System</div>
            </div>
          </div>
          <div className="pipeline-step pipeline-step--active">
            <div className="step-dot step-dot--active" />
            <div>
              <div className="step-name">Integração API-Football</div>
              <div className="step-desc">Busca de dados reais do Brasileirão 2026</div>
            </div>
          </div>
          <div className="pipeline-step">
            <div className="step-dot" />
            <div>
              <div className="step-name">Geração via IA</div>
              <div className="step-desc">Transformar dados em texto editorial</div>
            </div>
          </div>
          <div className="pipeline-step">
            <div className="step-dot" />
            <div>
              <div className="step-name">Publicação</div>
              <div className="step-desc">Interface de leitura final</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
