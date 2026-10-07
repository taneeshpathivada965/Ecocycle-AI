import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { DeviceOverviewPage } from './pages/DeviceOverviewPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { DecisionPage } from './pages/DecisionPage';
import { ResalePage } from './pages/ResalePage';
import { RecyclingPage } from './pages/RecyclingPage';
import { SanitizePage } from './pages/SanitizePage';
import { CertificatePage } from './pages/CertificatePage';
import { EcoWalletPage } from './pages/EcoWalletPage';
import { HistoryPage } from './pages/HistoryPage';
import { PartnersPage } from './pages/PartnersPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoPage } from './pages/DemoPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/device/:id" element={<DeviceOverviewPage />} />
          <Route path="/device/:id/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/device/:id/decision" element={<DecisionPage />} />
          <Route path="/device/:id/resale" element={<ResalePage />} />
          <Route path="/device/:id/recycling" element={<RecyclingPage />} />
          <Route path="/device/:id/sanitize" element={<SanitizePage />} />
          <Route path="/certificates/:id" element={<CertificatePage />} />
          <Route path="/eco-wallet" element={<EcoWalletPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
