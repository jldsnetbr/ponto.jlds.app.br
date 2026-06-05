import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PunchPage } from '@/pages/PunchPage';
import { BankPage } from '@/pages/BankPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useNotificacoes } from '@/hooks/useNotifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  useNotificacoes();

  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/ponto" replace />} />
          <Route path="/ponto" element={<PunchPage />} />
          <Route path="/banco" element={<BankPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
