import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { Layout } from '@/components/layout/Layout';
import { RotaProtegida } from '@/components/RotaProtegida';
import { Spinner } from '@/components/ui';
import { LimiteDeErro } from '@/components/LimiteDeErro';
import { ROTAS } from '@/lib/rotas';

const PunchPage = lazy(() => import('@/pages/PunchPage').then(m => ({ default: m.PunchPage })));
const BankPage = lazy(() => import('@/pages/BankPage').then(m => ({ default: m.BankPage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

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
          <Route path={ROTAS.PONTO} element={
            <Suspense fallback={<Spinner />}><PunchPage /></Suspense>
          } />
          <Route path={ROTAS.BANCO} element={
            <Suspense fallback={<Spinner />}><BankPage /></Suspense>
          } />
          <Route path={ROTAS.HISTORICO} element={
            <Suspense fallback={<Spinner />}><HistoryPage /></Suspense>
          } />
          <Route path={ROTAS.CONFIGURACOES} element={
            <Suspense fallback={<Spinner />}><SettingsPage /></Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
    </LimiteDeErro>
  );
}