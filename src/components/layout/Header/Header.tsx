import './Header.css';

type AppTab = 'principal' | 'database';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hasData?: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, hasData = false }) => {
  return (
    <header className="header">
      <div className="header-inner">

        {/* Logo */}
        <div className="header-logo" onClick={() => onTabChange('principal')} role="button">
          <span className="logo-by">BY</span>
          <span className="logo-line">LINE</span>
        </div>

        {/* Nav Tabs */}
        <nav className="header-nav" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'principal'}
            className={`nav-tab ${activeTab === 'principal' ? 'nav-tab--active' : ''}`}
            onClick={() => onTabChange('principal')}
          >
            Principal
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'database'}
            className={`nav-tab ${activeTab === 'database' ? 'nav-tab--active' : ''}`}
            onClick={() => onTabChange('database')}
          >
            Base de Dados
            {hasData && <span className="nav-tab-badge" />}
          </button>
        </nav>

        {/* Status indicator */}
        <div className="header-status">
          <span className="status-dot" />
          <span className="status-label">Protótipo</span>
        </div>

      </div>
    </header>
  );
};

export default Header;
