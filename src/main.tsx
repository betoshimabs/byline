import React from 'react';
import ReactDOM from 'react-dom/client';
import { DatabaseProvider } from './context/DatabaseContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </ThemeProvider>
  </React.StrictMode>
);
