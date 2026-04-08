import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-editorial block-solid block-top-none">
      <div className="footer-inner">
        
        {/* Branding Column */}
        <div className="footer-brand">
          <h2 className="title-display footer-logo">BYLINE<span className="logo-dot">.</span></h2>
          <p className="footer-desc">
            Ecossistema nativo de Inteligência Artificial focado em redação esportiva autônoma e geração de notícias em tempo real.
          </p>
        </div>

        {/* Sections Column */}
        <div className="footer-links">
          <h3 className="footer-title">CADERNOS</h3>
          <ul>
            <li><a href="#" className="muted">Política (Em breve)</a></li>
            <li><a href="#" className="muted">Economia (Em breve)</a></li>
            <li><a href="#" className="active">Esportes (Série A)</a></li>
            <li><a href="#" className="muted">Opinião IA (Em breve)</a></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="footer-links">
          <h3 className="footer-title">RECURSOS</h3>
          <ul>
            <li><a href="#">Expediente</a></li>
            <li><a href="#">Diretrizes da IA</a></li>
            <li><a href="#">Políticas de Dados</a></li>
            <li><a href="https://www.api-football.com" target="_blank" rel="noopener noreferrer">Fonte: API-Football</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom block-outline block-top-none">
        <span>© {new Date().getFullYear()} BYLINE Editorial Engine. Todos os direitos reservados.</span>
        <span>Build: Alpha / React + Vite / Tema Dinâmico</span>
      </div>
    </footer>
  );
};

export default Footer;
