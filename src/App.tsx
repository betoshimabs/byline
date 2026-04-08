import { useState } from 'react';
import { useDatabase } from './context/DatabaseContext';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import DatabasePage from './pages/DatabasePage/DatabasePage';

type AppTab = 'principal' | 'database';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('principal');
  const { hasData } = useDatabase();

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasData={hasData}
      />
      {activeTab === 'principal' && <HomePage onAccessDatabase={() => setActiveTab('database')} />}
      {activeTab === 'database'  && <DatabasePage />}
      <Footer />
    </>
  );
}

export default App;
