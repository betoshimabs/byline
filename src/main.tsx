import React from 'react';
import ReactDOM from 'react-dom/client';
import { DatabaseProvider } from './context/DatabaseContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DatabaseProvider>
      <App />
    </DatabaseProvider>
  </React.StrictMode>
);
