import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export function Layout() {
  useNotificacoes();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
      <OfflineBanner />
    </div>
  );
}