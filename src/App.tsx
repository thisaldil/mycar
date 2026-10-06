import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { VehicleProvider } from './context/VehicleContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from './components/common/Toast';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <VehicleProvider>
            <AppRoutes />
            <Toaster />
          </VehicleProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>);

}