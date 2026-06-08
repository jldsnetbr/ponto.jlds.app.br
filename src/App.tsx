import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { Layout } from '@/components/layout/Layout';
import { RotaProtegida } from '@/components/RotaProtegida';
import { PunchPage } from '@/pages/PunchPage';
import { BankPage } from '@/pages/BankPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LimiteDeErro } from '@/components/LimiteDeErro';
import { ROTAS } from '@/lib/rotas';

export default function App() {
  return (
    <LimiteDeErro>
      <BrowserRouter>
      <Routes>
        <Route path={ROTAS.LOGIN} element={<AuthPage />} />
        <Route
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route path="/" element={<Navigate to={ROTAS.PONTO} replace />} />
          <Route path={ROTAS.PONTO} element={<PunchPage />} />
          <Route path={ROTAS.BANCO} element={<BankPage />} />
          <Route path={ROTAS.HISTORICO} element={<HistoryPage />} />
          <Route path={ROTAS.CONFIGURACOES} element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LimiteDeErro>
  );
}