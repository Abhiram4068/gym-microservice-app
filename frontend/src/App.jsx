import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import GlobalNavigate from './components/common/GlobalNavigate';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <GlobalNavigate />
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
