import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '@/hooks/useAutenticacao';
import { Spinner } from '@/components/ui';

export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return <Spinner />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}