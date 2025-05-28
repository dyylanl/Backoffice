import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import AppRoutes from './AppRoutes';
import { UserProvider } from './UserContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  </React.StrictMode>
);