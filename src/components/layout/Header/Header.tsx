import { useTheme, Theme } from '../../../context/ThemeContext';
import './Header.css';

type AppTab = 'principal' | 'database';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hasData?: boolean;
}

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: 'default', color: '#111111', label: 'Classic Editorial' },
  { id: 'midnight', color: '#121212', label: 'Dark News' },
  { id: 'sepia', color: '#D84315', label: 'Sepia Vintage' },
  { id: 'cyber', color: '#10B981', label: 'Cyber IA' },
  { id: 'minimal', color: '#7C3AED', label: 'Minimalist' },
];

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, hasData = false }) => {
  const { theme, setTheme } = useTheme();

  // Format today's date in Portuguese
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <header className="header-editorial block-solid">
        <div className="header-editorial-inner">

          {/* Left: Date & Menu */}
          <div className="header-left">
            <button className="menu-btn" aria-label="Menu" title="Menu de Seções">
              <span className="menu-icon">≡</span>
            </button>
            <span className="header-date hidden-mobile">{today}</span>
          </div>

          {/* Center: Logotype */}
          <div className="header-center" onClick={() => onTabChange('principal')} role="button" aria-label="Home">
            <h1 className="header-logotype title-display">BYLINE<span className="logo-dot">.</span></h1>
            <span className="logotype-subtitle">INTELIGÊNCIA EDITORIAL</span>
          </div>

          {/* Right: Theme Switcher */}
          <div className="header-right">
            <div className="theme-switcher">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  className={`theme-dot ${theme === t.id ? 'theme-dot--active' : ''}`}
                  style={{ backgroundColor: t.color }}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  aria-label={`Mudar para o tema ${t.label}`}
                />
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* Editorial Section Nav (Sticky below header) */}
      <nav className="header-sections block-solid block-top-none">
         <div className="header-sections-inner">
           <span className="fake-section fake-section--muted hidden-mobile">Política</span>
           <span className="fake-section fake-section--muted hidden-mobile">Economia</span>
           <button
             className={`nav-section-btn ${activeTab === 'principal' ? 'nav-section-btn--active' : ''}`}
             onClick={() => onTabChange('principal')}
           >
             Capa (Feed)
           </button>
           <button
             className={`nav-section-btn ${activeTab === 'database' ? 'nav-section-btn--active' : ''}`}
             onClick={() => onTabChange('database')}
           >
             Esportes (Mercado)
             {hasData && <span className="nav-badge" />}
           </button>
           <span className="fake-section fake-section--muted hidden-mobile">Opinião IA</span>
         </div>
      </nav>
    </>
  );
};

export default Header;
