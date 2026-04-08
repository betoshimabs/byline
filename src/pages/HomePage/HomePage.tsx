import './HomePage.css';

interface HomePageProps {
  onAccessDatabase: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onAccessDatabase }) => {
  return (
    <main className="home-editorial">

      {/* Hero: Newspaper Cover Style */}
      <section className="hero-editorial">
        <div className="hero-editorial-top">
          <span className="tag block-outline">EDIÇÃO NACIONAL</span>
          <span className="hero-meta">ATUALIZADO EM TEMPO REAL</span>
        </div>

        <h1 className="hero-headline title-display">
          SÍNTESE<br />
          ESPORTIVA
        </h1>

        <div className="hero-grid">
          <div className="hero-main-col">
            <h2 className="hero-subheadline">
              Transforme cada partida do Brasileirão na sua redação autônoma.
            </h2>
            <p className="hero-lead">
              A BYLINE utiliza inteligência artificial avançada para transformar dados brutos e eventos 
              ao vivo em jornais editoriais completos. Sem drafts manuais. Cobertura ininterrupta de estatísticas, 
              escalações e lances a cada 90 minutos.
            </p>
            <div className="hero-actions">
               <button className="btn-brutal btn-brutal--primary" onClick={onAccessDatabase}>
                 ACESSAR DADOS (MERCADO)
               </button>
            </div>
          </div>
          
          <div className="hero-side-col">
            <div className="side-piece">
              <span className="side-label">PIPELINE ATIVO</span>
              <ul className="side-list">
                <li>● Coleta API-Football</li>
                <li>● Formatação de Escalações</li>
                <li>● Narrativas Pós-Jogo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker / Divider */}
      <div className="editorial-divider">
        <span className="ticker-text title-display">+++ TEMPORADA 2024 (SÉRIE A) DISPONÍVEL NO DATA CENTER +++ ESTATÍSTICAS COMPLETAS E MOCK LOCAIS +++</span>
      </div>

      {/* Magazine Block Layout */}
      <section className="editorial-features">
        <div className="feature-block block-outline feature-span">
          <div className="feat-header">
            <span className="feat-label">01 // AUTOMATIZAÇÃO PÓS-JOGO</span>
          </div>
          <h3 className="feat-title title-display">RESENHAS<br/>INSTANTÂNEAS</h3>
          <p className="feat-desc">
            Assim que o juiz apita o final da partida, o motor da BYLINE cruza dados de gols, 
            posse de bola e cartões para gerar um artigo opinativo profundo, simulando os melhores 
            colunistas esportivos.
          </p>
        </div>

        <div className="feature-block block-outline">
          <div className="feat-header">
            <span className="feat-label">02 // TÁTICA E ONSIDE</span>
          </div>
          <h3 className="feat-title title-display">ANÁLISE DE<br/>ESCALAÇÕES</h3>
        </div>

        <div className="feature-block block-solid">
          <div className="feat-header">
            <span className="feat-label" style={{color: 'var(--accent)'}}>03 // LANCES AO VIVO</span>
          </div>
          <h3 className="feat-title title-display">NARRATIVA<br/>EM TEMPO REAL</h3>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
