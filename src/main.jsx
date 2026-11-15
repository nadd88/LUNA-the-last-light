import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GameModeProvider } from './context/GameModeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameModeProvider>
        <App />
      </GameModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
